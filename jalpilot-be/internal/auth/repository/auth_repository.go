package repository

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jalpilot/jalpilot-be/internal/auth/model"
)

var (
	ErrNotFound      = errors.New("record not found")
	ErrAlreadyExists = errors.New("record already exists")
)

type AuthRepository struct {
	pool *pgxpool.Pool
}

func NewAuthRepository(pool *pgxpool.Pool) *AuthRepository {
	return &AuthRepository{pool: pool}
}

func (r *AuthRepository) FindUserByIdentifier(ctx context.Context, identifier string) (*model.User, error) {
	norm := strings.ToLower(strings.TrimSpace(identifier))
	var u model.User
	err := r.pool.QueryRow(ctx, `
		SELECT id, full_name, email, normalized_email, phone, normalized_phone, password_hash, account_status, created_at
		FROM users
		WHERE normalized_email = $1 OR normalized_phone = $1
		LIMIT 1
	`, norm).Scan(&u.ID, &u.FullName, &u.Email, &u.NormalizedEmail, &u.Phone, &u.NormalizedPhone, &u.PasswordHash, &u.AccountStatus, &u.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("query user: %w", err)
	}
	return &u, nil
}

func (r *AuthRepository) GetUserContext(ctx context.Context, userID uuid.UUID) (tenantID *uuid.UUID, platformRole string, err error) {
	err = r.pool.QueryRow(ctx, `
		SELECT role_key FROM platform_user_roles WHERE user_id = $1 LIMIT 1
	`, userID).Scan(&platformRole)
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return nil, "", fmt.Errorf("query platform role: %w", err)
	}

	var tid uuid.UUID
	err = r.pool.QueryRow(ctx, `
		SELECT tenant_id FROM tenant_memberships
		WHERE user_id = $1 AND membership_status = 'ACTIVE'
		ORDER BY created_at ASC LIMIT 1
	`, userID).Scan(&tid)
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return nil, "", fmt.Errorf("query tenant membership: %w", err)
	}
	if err == nil {
		tenantID = &tid
	}
	return tenantID, platformRole, nil
}

func (r *AuthRepository) CreateSession(ctx context.Context, userID uuid.UUID, tokenHash string, expiresAt time.Time) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO sessions (user_id, refresh_token_hash, expires_at)
		VALUES ($1, $2, $3)
	`, userID, tokenHash, expiresAt)
	return err
}

func (r *AuthRepository) RotateSession(ctx context.Context, oldHash, newHash string, newExpiresAt time.Time) (uuid.UUID, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return uuid.Nil, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var userID uuid.UUID
	var expiresAt time.Time
	var revokedAt *time.Time
	err = tx.QueryRow(ctx, `
		SELECT user_id, expires_at, revoked_at
		FROM sessions
		WHERE refresh_token_hash = $1
		FOR UPDATE
	`, oldHash).Scan(&userID, &expiresAt, &revokedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return uuid.Nil, ErrNotFound
	}
	if err != nil {
		return uuid.Nil, err
	}
	if revokedAt != nil || time.Now().UTC().After(expiresAt) {
		return uuid.Nil, fmt.Errorf("session expired or revoked")
	}

	if _, err := tx.Exec(ctx, `UPDATE sessions SET revoked_at = NOW() WHERE refresh_token_hash = $1`, oldHash); err != nil {
		return uuid.Nil, err
	}
	if _, err := tx.Exec(ctx, `INSERT INTO sessions (user_id, refresh_token_hash, expires_at) VALUES ($1, $2, $3)`, userID, newHash, newExpiresAt); err != nil {
		return uuid.Nil, err
	}
	if err := tx.Commit(ctx); err != nil {
		return uuid.Nil, err
	}
	return userID, nil
}

func (r *AuthRepository) RevokeSession(ctx context.Context, tokenHash string) error {
	_, err := r.pool.Exec(ctx, `UPDATE sessions SET revoked_at = NOW() WHERE refresh_token_hash = $1 AND revoked_at IS NULL`, tokenHash)
	return err
}

// RegisterCompanyWorkspace creates tenant, admin user, membership, COMPANY_ADMIN role, and trial subscription atomically.
func (r *AuthRepository) RegisterCompanyWorkspace(ctx context.Context, companyName, slug, fullName, email, phone, passwordHash, planCode string) (uuid.UUID, uuid.UUID, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return uuid.Nil, uuid.Nil, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if _, err := tx.Exec(ctx, "SELECT set_config('app.is_platform_admin', 'true', true)"); err != nil {
		return uuid.Nil, uuid.Nil, err
	}

	var tenantID uuid.UUID
	err = tx.QueryRow(ctx, `
		INSERT INTO tenants (company_name, slug, email, phone, status)
		VALUES ($1, $2, $3, $4, 'TRIAL')
		RETURNING id
	`, companyName, strings.ToLower(slug), email, phone).Scan(&tenantID)
	if err != nil {
		return uuid.Nil, uuid.Nil, fmt.Errorf("insert tenant: %w", err)
	}

	normEmail := strings.ToLower(strings.TrimSpace(email))
	normPhone := strings.TrimSpace(phone)
	var userID uuid.UUID
	err = tx.QueryRow(ctx, `
		INSERT INTO users (full_name, email, normalized_email, phone, normalized_phone, password_hash, account_status)
		VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE')
		RETURNING id
	`, fullName, email, normEmail, phone, normPhone, passwordHash).Scan(&userID)
	if err != nil {
		return uuid.Nil, uuid.Nil, fmt.Errorf("insert admin user: %w", err)
	}

	var membershipID uuid.UUID
	err = tx.QueryRow(ctx, `
		INSERT INTO tenant_memberships (tenant_id, user_id, membership_status)
		VALUES ($1, $2, 'ACTIVE')
		RETURNING id
	`, tenantID, userID).Scan(&membershipID)
	if err != nil {
		return uuid.Nil, uuid.Nil, fmt.Errorf("insert membership: %w", err)
	}

	var roleID uuid.UUID
	err = tx.QueryRow(ctx, `
		INSERT INTO tenant_roles (tenant_id, name, role_key, description)
		VALUES ($1, 'Company Admin', 'COMPANY_ADMIN', 'Full company workspace administrator')
		RETURNING id
	`, tenantID).Scan(&roleID)
	if err != nil {
		return uuid.Nil, uuid.Nil, fmt.Errorf("insert company admin role: %w", err)
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO membership_roles (tenant_id, membership_id, tenant_role_id)
		VALUES ($1, $2, $3)
	`, tenantID, membershipID, roleID); err != nil {
		return uuid.Nil, uuid.Nil, fmt.Errorf("assign admin role: %w", err)
	}

	if planCode == "" {
		planCode = "starter"
	}
	var planID uuid.UUID
	err = tx.QueryRow(ctx, `SELECT id FROM subscription_plans WHERE plan_code = $1 AND is_active = TRUE LIMIT 1`, planCode).Scan(&planID)
	if err == nil {
		trialEnd := time.Now().UTC().Add(14 * 24 * time.Hour)
		_, err = tx.Exec(ctx, `
			INSERT INTO subscriptions (tenant_id, plan_id, subscription_status, billing_interval, trial_end_date, next_billing_date)
			VALUES ($1, $2, 'TRIAL', 'MONTHLY', $3, $3)
		`, tenantID, planID, trialEnd)
		if err != nil {
			return uuid.Nil, uuid.Nil, fmt.Errorf("insert trial subscription: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return uuid.Nil, uuid.Nil, err
	}
	return tenantID, userID, nil
}

