package database

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"

	"github.com/jackc/pgx/v5/pgxpool"
)

// AutoMigrate applies SQL schema migrations and initial seeds if not already applied.
func AutoMigrate(ctx context.Context, pool *pgxpool.Pool, log *slog.Logger) error {
	var tableExists bool
	err := pool.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT FROM information_schema.tables 
			WHERE table_schema = 'public' AND table_name = 'users'
		)
	`).Scan(&tableExists)
	if err != nil {
		return fmt.Errorf("check users table: %w", err)
	}

	baseDir := findProjectRoot()

	if !tableExists {
		log.Info("initializing database tables from schema migrations...")
		schemaFiles := []string{
			"migrations/schema/000001_platform_and_auth.up.sql",
			"migrations/schema/000002_customers_and_staff.up.sql",
			"migrations/schema/000003_products_inventory_orders_deliveries.up.sql",
			"migrations/schema/000004_billing_expenses_leave.up.sql",
			"migrations/schema/000005_themes_subscriptions_notifications_audit.up.sql",
			"migrations/schema/000006_row_level_security.up.sql",
		}
		for _, f := range schemaFiles {
			path := filepath.Join(baseDir, f)
			content, err := os.ReadFile(path)
			if err != nil {
				return fmt.Errorf("read migration file %s: %w", path, err)
			}
			if _, err := pool.Exec(ctx, string(content)); err != nil {
				return fmt.Errorf("execute migration %s: %w", f, err)
			}
			log.Info("applied migration", "file", f)
		}
	}

	// Always execute seed data idempotently
	seedPath := filepath.Join(baseDir, "migrations/seeds/001_initial_seed.sql")
	if content, err := os.ReadFile(seedPath); err == nil {
		if _, err := pool.Exec(ctx, string(content)); err != nil {
			log.Warn("seed execution notice", "error", err)
		} else {
			log.Info("applied initial seeds", "file", "001_initial_seed.sql")
		}
	}

	return nil
}

func findProjectRoot() string {
	candidates := []string{".", "jalpilot-be", "..", "../.."}
	for _, c := range candidates {
		if _, err := os.Stat(filepath.Join(c, "migrations/seeds/001_initial_seed.sql")); err == nil {
			return c
		}
	}
	return "."
}

