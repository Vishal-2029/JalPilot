package service

import (
	"context"
	"encoding/json"
	"net/netip"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// AuditService records immutable platform and tenant audit events.
type AuditService struct {
	pool *pgxpool.Pool
}

func NewAuditService(pool *pgxpool.Pool) *AuditService {
	return &AuditService{pool: pool}
}

type Entry struct {
	TenantID   *uuid.UUID
	UserID     *uuid.UUID
	Action     string
	Module     string
	EntityType string
	EntityID   *uuid.UUID
	OldValues  any
	NewValues  any
	IPAddress  string
}

func (s *AuditService) Log(ctx context.Context, e Entry) error {
	oldJSON, _ := json.Marshal(e.OldValues)
	newJSON, _ := json.Marshal(e.NewValues)
	var ipPtr *netip.Addr
	if addr, err := netip.ParseAddr(e.IPAddress); err == nil {
		ipPtr = &addr
	}
	_, err := s.pool.Exec(ctx, `
		INSERT INTO audit_logs (tenant_id, user_id, action, module, entity_type, entity_id, old_values_json, new_values_json, ip_address)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`, e.TenantID, e.UserID, e.Action, e.Module, e.EntityType, e.EntityID, oldJSON, newJSON, ipPtr)
	return err
}

