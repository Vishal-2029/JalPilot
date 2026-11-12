package repository

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	authsvc "github.com/jalpilot/jalpilot-be/internal/auth/service"
	"github.com/jalpilot/jalpilot-be/internal/customer/dto"
	"github.com/jalpilot/jalpilot-be/pkg/database"
)

type CustomerRepository struct {
	txm *database.TxManager
}

func NewCustomerRepository(txm *database.TxManager) *CustomerRepository {
	return &CustomerRepository{txm: txm}
}

// CreateCustomer creates the customer profile, primary address, and optional invitation atomically.
func (r *CustomerRepository) CreateCustomer(ctx context.Context, tenantID, createdBy uuid.UUID, req dto.CreateCustomerRequest) (uuid.UUID, string, error) {
	var customerID uuid.UUID
	var rawInviteToken string

	err := r.txm.WithTenant(ctx, tenantID, func(tx pgx.Tx) error {
		code := fmt.Sprintf("CUST-%s", strings.ToUpper(uuid.NewString()[:6]))
		cType := req.CustomerType
		if cType == "" {
			cType = "RESIDENTIAL"
		}
		pType := req.PricingType
		if pType == "" {
			pType = "PER_BOTTLE"
		}
		actStatus := "NOT_INVITED"
		if req.SendInvite {
			actStatus = "INVITED"
		}

		var emailPtr *string
		if strings.TrimSpace(req.Email) != "" {
			e := strings.TrimSpace(req.Email)
			emailPtr = &e
		}
		var altPtr *string
		if strings.TrimSpace(req.AlternatePhone) != "" {
			a := strings.TrimSpace(req.AlternatePhone)
			altPtr = &a
		}

		err := tx.QueryRow(ctx, `
			INSERT INTO customers (
				tenant_id, customer_code, full_name, email, phone, alternate_phone,
				customer_type, status, account_activation_status, pricing_type, default_price, notes, created_by
			) VALUES ($1,$2,$3,$4,$5,$6,$7,'ACTIVE',$8,$9,$10,$11,$12)
			RETURNING id
		`, tenantID, code, req.FullName, emailPtr, req.Phone, altPtr, cType, actStatus, pType, req.DefaultPrice, req.Notes, createdBy).Scan(&customerID)
		if err != nil {
			return fmt.Errorf("insert customer: %w", err)
		}

		_, err = tx.Exec(ctx, `
			INSERT INTO customer_addresses (
				tenant_id, customer_id, building_name, flat_or_office_number, address_line, area, city, state, postal_code, is_primary
			) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,TRUE)
		`, tenantID, customerID, req.BuildingName, req.FlatOrOfficeNumber, req.AddressLine, req.Area, req.City, req.State, req.PostalCode)
		if err != nil {
			return fmt.Errorf("insert customer address: %w", err)
		}

		if req.SendInvite {
			raw, hash, err := authsvc.GenerateSecureToken(32)
			if err != nil {
				return err
			}
			rawInviteToken = raw
			_, err = tx.Exec(ctx, `
				INSERT INTO invitations (tenant_id, customer_id, email, phone, token_hash, expires_at, invitation_status)
				VALUES ($1,$2,$3,$4,$5,$6,'PENDING')
			`, tenantID, customerID, emailPtr, req.Phone, hash, time.Now().UTC().Add(72*time.Hour))
			if err != nil {
				return fmt.Errorf("insert invitation: %w", err)
			}
		}
		return nil
	})

	return customerID, rawInviteToken, err
}

func (r *CustomerRepository) ListCustomers(ctx context.Context, tenantID uuid.UUID, search string, limit, offset int) ([]dto.CustomerListItem, int64, error) {
	var items []dto.CustomerListItem
	var total int64

	err := r.txm.WithTenant(ctx, tenantID, func(tx pgx.Tx) error {
		like := "%" + strings.TrimSpace(search) + "%"
		if err := tx.QueryRow(ctx, `
			SELECT COUNT(*) FROM customers
			WHERE ($1 = '%%' OR full_name ILIKE $1 OR phone ILIKE $1 OR customer_code ILIKE $1)
		`, like).Scan(&total); err != nil {
			return err
		}

		rows, err := tx.Query(ctx, `
			SELECT id, customer_code, full_name, email, phone, customer_type, status,
			       account_activation_status, pricing_type, default_price::float8, user_id, created_at::text
			FROM customers
			WHERE ($1 = '%%' OR full_name ILIKE $1 OR phone ILIKE $1 OR customer_code ILIKE $1)
			ORDER BY created_at DESC
			LIMIT $2 OFFSET $3
		`, like, limit, offset)
		if err != nil {
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var it dto.CustomerListItem
			if err := rows.Scan(
				&it.ID, &it.CustomerCode, &it.FullName, &it.Email, &it.Phone,
				&it.CustomerType, &it.Status, &it.AccountActivationStatus,
				&it.PricingType, &it.DefaultPrice, &it.UserID, &it.CreatedAt,
			); err != nil {
				return err
			}
			items = append(items, it)
		}
		return rows.Err()
	})
	return items, total, err
}

func (r *CustomerRepository) ResendInvitation(ctx context.Context, tenantID, customerID uuid.UUID) (string, error) {
	var raw string
	err := r.txm.WithTenant(ctx, tenantID, func(tx pgx.Tx) error {
		var email *string
		var phone string
		var actStatus string
		err := tx.QueryRow(ctx, `
			SELECT email, phone, account_activation_status FROM customers WHERE id = $1
		`, customerID).Scan(&email, &phone, &actStatus)
		if err != nil {
			return fmt.Errorf("customer not found")
		}
		if actStatus == "ACTIVATED" {
			return fmt.Errorf("customer account is already activated")
		}

		_, _ = tx.Exec(ctx, `UPDATE invitations SET invitation_status = 'REVOKED' WHERE customer_id = $1 AND invitation_status = 'PENDING'`, customerID)

		var hash string
		raw, hash, err = authsvc.GenerateSecureToken(32)
		if err != nil {
			return err
		}
		_, err = tx.Exec(ctx, `
			INSERT INTO invitations (tenant_id, customer_id, email, phone, token_hash, expires_at, invitation_status)
			VALUES ($1,$2,$3,$4,$5,$6,'PENDING')
		`, tenantID, customerID, email, phone, hash, time.Now().UTC().Add(72*time.Hour))
		if err != nil {
			return err
		}
		_, err = tx.Exec(ctx, `UPDATE customers SET account_activation_status = 'INVITED', updated_at = NOW() WHERE id = $1`, customerID)
		return err
	})
	return raw, err
}

// AcceptInvitation verifies the hashed invitation token and links the existing customer record to a verified user without duplicating customers.
func (r *CustomerRepository) AcceptInvitation(ctx context.Context, rawToken, passwordHash string) (uuid.UUID, uuid.UUID, error) {
	var tenantID, userID uuid.UUID
	tokenHash := authsvc.HashToken(rawToken)

	err := r.txm.WithPlatformAdmin(ctx, func(tx pgx.Tx) error {
		var invID, customerID uuid.UUID
		var invStatus string
		var expiresAt time.Time
		err := tx.QueryRow(ctx, `
			SELECT id, tenant_id, customer_id, invitation_status, expires_at
			FROM invitations
			WHERE token_hash = $1
			FOR UPDATE
		`, tokenHash).Scan(&invID, &tenantID, &customerID, &invStatus, &expiresAt)
		if err != nil {
			return fmt.Errorf("invalid invitation token")
		}
		if invStatus != "PENDING" || time.Now().UTC().After(expiresAt) {
			return fmt.Errorf("invitation expired or already used")
		}

		var fullName, phone string
		var email *string
		var existingUserID *uuid.UUID
		err = tx.QueryRow(ctx, `
			SELECT full_name, email, phone, user_id FROM customers WHERE id = $1 FOR UPDATE
		`, customerID).Scan(&fullName, &email, &phone, &existingUserID)
		if err != nil {
			return fmt.Errorf("customer record not found")
		}
		if existingUserID != nil {
			return fmt.Errorf("customer already linked to a user")
		}

		var normEmail *string
		if email != nil && *email != "" {
			ne := strings.ToLower(strings.TrimSpace(*email))
			normEmail = &ne
		}
		normPhone := strings.TrimSpace(phone)

		// Reuse existing global user if verified identity matches, else create one
		err = tx.QueryRow(ctx, `
			SELECT id FROM users WHERE (normalized_email = $1 AND $1 IS NOT NULL) OR normalized_phone = $2 LIMIT 1
		`, normEmail, normPhone).Scan(&userID)
		if err != nil {
			err = tx.QueryRow(ctx, `
				INSERT INTO users (full_name, email, normalized_email, phone, normalized_phone, password_hash, account_status, phone_verified_at)
				VALUES ($1,$2,$3,$4,$5,$6,'ACTIVE',NOW())
				RETURNING id
			`, fullName, email, normEmail, phone, normPhone, passwordHash).Scan(&userID)
			if err != nil {
				return fmt.Errorf("create user account: %w", err)
			}
		}

		if _, err := tx.Exec(ctx, `
			UPDATE customers SET user_id = $1, account_activation_status = 'ACTIVATED', updated_at = NOW()
			WHERE id = $2
		`, userID, customerID); err != nil {
			return err
		}

		if _, err := tx.Exec(ctx, `
			INSERT INTO tenant_memberships (tenant_id, user_id, membership_status)
			VALUES ($1, $2, 'ACTIVE')
			ON CONFLICT (tenant_id, user_id) DO NOTHING
		`, tenantID, userID); err != nil {
			return err
		}

		if _, err := tx.Exec(ctx, `
			UPDATE invitations SET invitation_status = 'ACCEPTED', accepted_at = NOW() WHERE id = $1
		`, invID); err != nil {
			return err
		}
		return nil
	})
	return tenantID, userID, err
}

func (r *CustomerRepository) GetCustomerPortalDashboard(ctx context.Context, tenantID, userID uuid.UUID) (map[string]any, error) {
	var res map[string]any
	err := r.txm.WithTenant(ctx, tenantID, func(tx pgx.Tx) error {
		var custID uuid.UUID
		var fullName, code string
		err := tx.QueryRow(ctx, `
			SELECT id, full_name, customer_code FROM customers WHERE user_id = $1 LIMIT 1
		`, userID).Scan(&custID, &fullName, &code)
		if err != nil {
			return fmt.Errorf("customer profile not found")
		}

		var monthBottles int64
		var bottleBalance int64
		var outstanding float64

		_ = tx.QueryRow(ctx, `
			SELECT COALESCE(SUM(di.quantity_delivered),0)
			FROM delivery_items di
			JOIN deliveries d ON d.id = di.delivery_id
			WHERE d.customer_id = $1 AND date_trunc('month', d.delivery_date) = date_trunc('month', CURRENT_DATE)
		`, custID).Scan(&monthBottles)

		_ = tx.QueryRow(ctx, `
			SELECT COALESCE(SUM(CASE WHEN transaction_type = 'DELIVERED_FULL' THEN quantity WHEN transaction_type IN ('RETURNED_EMPTY','LOST') THEN -quantity ELSE 0 END), 0)
			FROM bottle_transactions WHERE customer_id = $1
		`, custID).Scan(&bottleBalance)

		_ = tx.QueryRow(ctx, `
			SELECT COALESCE(SUM(debit_amount - credit_amount),0)::float8
			FROM customer_ledger_entries WHERE customer_id = $1
		`, custID).Scan(&outstanding)

		res = map[string]any{
			"customer_id":         custID,
			"customer_code":       code,
			"full_name":           fullName,
			"month_bottles":       monthBottles,
			"bottle_balance":      bottleBalance,
			"outstanding_balance": outstanding,
		}
		return nil
	})
	return res, err
}

