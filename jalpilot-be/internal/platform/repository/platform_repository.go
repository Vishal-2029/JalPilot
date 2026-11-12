package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jalpilot/jalpilot-be/internal/platform/dto"
	"github.com/jalpilot/jalpilot-be/pkg/database"
)

type PlatformRepository struct {
	txm *database.TxManager
}

func NewPlatformRepository(txm *database.TxManager) *PlatformRepository {
	return &PlatformRepository{txm: txm}
}

func (r *PlatformRepository) GetDashboard(ctx context.Context) (*dto.PlatformDashboard, error) {
	var d dto.PlatformDashboard
	err := r.txm.WithPlatformAdmin(ctx, func(tx pgx.Tx) error {
		if err := tx.QueryRow(ctx, `
			SELECT
				COUNT(*),
				COUNT(*) FILTER (WHERE status = 'ACTIVE'),
				COUNT(*) FILTER (WHERE status = 'TRIAL'),
				COUNT(*) FILTER (WHERE status = 'SUSPENDED')
			FROM tenants
		`).Scan(&d.TotalCompanies, &d.ActiveCompanies, &d.TrialCompanies, &d.SuspendedCompanies); err != nil {
			return err
		}
		if err := tx.QueryRow(ctx, `SELECT COUNT(*) FROM customers`).Scan(&d.TotalCustomers); err != nil {
			return err
		}
		if err := tx.QueryRow(ctx, `SELECT COALESCE(SUM(amount), 0)::float8 FROM platform_transactions WHERE payment_status = 'COMPLETED'`).Scan(&d.TotalRevenue); err != nil {
			return err
		}
		return nil
	})
	return &d, err
}

func (r *PlatformRepository) ListTenants(ctx context.Context, limit, offset int) ([]dto.TenantSummary, int64, error) {
	var items []dto.TenantSummary
	var total int64
	err := r.txm.WithPlatformAdmin(ctx, func(tx pgx.Tx) error {
		if err := tx.QueryRow(ctx, `SELECT COUNT(*) FROM tenants`).Scan(&total); err != nil {
			return err
		}
		rows, err := tx.Query(ctx, `
			SELECT id, company_name, slug, email, phone, COALESCE(city, ''), status, created_at::text
			FROM tenants
			ORDER BY created_at DESC
			LIMIT $1 OFFSET $2
		`, limit, offset)
		if err != nil {
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var t dto.TenantSummary
			if err := rows.Scan(&t.ID, &t.CompanyName, &t.Slug, &t.Email, &t.Phone, &t.City, &t.Status, &t.CreatedAt); err != nil {
				return err
			}
			items = append(items, t)
		}
		return rows.Err()
	})
	return items, total, err
}

func (r *PlatformRepository) UpdateTenantStatus(ctx context.Context, tenantID uuid.UUID, status string) error {
	return r.txm.WithPlatformAdmin(ctx, func(tx pgx.Tx) error {
		tag, err := tx.Exec(ctx, `UPDATE tenants SET status = $2, updated_at = NOW() WHERE id = $1`, tenantID, status)
		if err != nil {
			return err
		}
		if tag.RowsAffected() == 0 {
			return fmt.Errorf("tenant not found")
		}
		return nil
	})
}

func (r *PlatformRepository) ListAuditLogs(ctx context.Context, limit, offset int) ([]map[string]any, error) {
	var out []map[string]any
	err := r.txm.WithPlatformAdmin(ctx, func(tx pgx.Tx) error {
		rows, err := tx.Query(ctx, `
			SELECT id, tenant_id, user_id, action, module, COALESCE(entity_type,''), entity_id, created_at::text
			FROM audit_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2
		`, limit, offset)
		if err != nil {
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var id uuid.UUID
			var tid, uid, eid *uuid.UUID
			var action, module, etype, created string
			if err := rows.Scan(&id, &tid, &uid, &action, &module, &etype, &eid, &created); err != nil {
				return err
			}
			out = append(out, map[string]any{
				"id": id, "tenant_id": tid, "user_id": uid,
				"action": action, "module": module, "entity_type": etype, "entity_id": eid, "created_at": created,
			})
		}
		return rows.Err()
	})
	return out, err
}

func (r *PlatformRepository) ListSupportTickets(ctx context.Context, limit, offset int) ([]map[string]any, error) {
	var out []map[string]any
	err := r.txm.WithPlatformAdmin(ctx, func(tx pgx.Tx) error {
		rows, err := tx.Query(ctx, `
			SELECT id, tenant_id, subject, priority, status, created_at::text
			FROM support_tickets ORDER BY created_at DESC LIMIT $1 OFFSET $2
		`, limit, offset)
		if err != nil {
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var id, tid uuid.UUID
			var subject, priority, status, created string
			if err := rows.Scan(&id, &tid, &subject, &priority, &status, &created); err != nil {
				return err
			}
			out = append(out, map[string]any{
				"id": id, "tenant_id": tid, "subject": subject,
				"priority": priority, "status": status, "created_at": created,
			})
		}
		return rows.Err()
	})
	return out, err
}

