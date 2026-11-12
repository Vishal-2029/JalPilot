package database

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jalpilot/jalpilot-be/configs"
)

// NewPool creates a configured pgxpool.Pool for PostgreSQL.
func NewPool(ctx context.Context, cfg *configs.Config) (*pgxpool.Pool, error) {
	poolCfg, err := pgxpool.ParseConfig(cfg.DSN())
	if err != nil {
		return nil, fmt.Errorf("parse db dsn: %w", err)
	}
	poolCfg.MaxConns = cfg.DBMaxConns
	poolCfg.MinConns = cfg.DBMinConns
	poolCfg.MaxConnLifetime = 30 * time.Minute
	poolCfg.MaxConnIdleTime = 5 * time.Minute

	pool, err := pgxpool.NewWithConfig(ctx, poolCfg)
	if err != nil {
		return nil, fmt.Errorf("create pgx pool: %w", err)
	}
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("ping postgres: %w", err)
	}
	return pool, nil
}

// TxManager executes database transactions with strict PostgreSQL RLS context.
type TxManager struct {
	pool *pgxpool.Pool
}

// NewTxManager creates a new TxManager.
func NewTxManager(pool *pgxpool.Pool) *TxManager {
	return &TxManager{pool: pool}
}

// WithTenant runs fn inside a transaction with SET LOCAL app.current_tenant_id.
// Using SET LOCAL guarantees connection-pool safety: settings are scoped to the transaction only.
func (m *TxManager) WithTenant(ctx context.Context, tenantID uuid.UUID, fn func(tx pgx.Tx) error) error {
	if tenantID == uuid.Nil {
		return fmt.Errorf("tenant_id cannot be nil")
	}
	tx, err := m.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin tenant tx: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if _, err := tx.Exec(ctx, "SELECT set_config('app.current_tenant_id', $1, true)", tenantID.String()); err != nil {
		return fmt.Errorf("set local tenant context: %w", err)
	}
	if _, err := tx.Exec(ctx, "SELECT set_config('app.is_platform_admin', 'false', true)"); err != nil {
		return fmt.Errorf("reset platform admin context: %w", err)
	}

	if err := fn(tx); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

// WithPlatformAdmin runs fn inside a transaction with platform admin RLS bypass enabled.
func (m *TxManager) WithPlatformAdmin(ctx context.Context, fn func(tx pgx.Tx) error) error {
	tx, err := m.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin platform tx: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if _, err := tx.Exec(ctx, "SELECT set_config('app.is_platform_admin', 'true', true)"); err != nil {
		return fmt.Errorf("set local platform admin context: %w", err)
	}

	if err := fn(tx); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

