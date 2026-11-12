package middleware

import (
	"context"
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	authmw "github.com/jalpilot/jalpilot-be/internal/auth/middleware"
	"github.com/jalpilot/jalpilot-be/pkg/response"
)

const CtxValidatedTenantIDKey = "validated_tenant_id"

// RequireTenant validates that the authenticated user has an ACTIVE membership in their token's tenant
// and that the tenant itself is not suspended/cancelled. Never trusts client-supplied tenant_id.
func RequireTenant(pool *pgxpool.Pool) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, ok := authmw.UserIDFromCtx(c)
		if !ok {
			return response.Fail(c, fiber.StatusUnauthorized, "UNAUTHORIZED", "authentication required", nil)
		}

		tenantID, ok := c.Locals(authmw.CtxTenantIDKey).(uuid.UUID)
		if !ok || tenantID == uuid.Nil {
			return response.Fail(c, fiber.StatusForbidden, "NO_TENANT_CONTEXT", "no active company workspace in session", nil)
		}

		var membershipStatus, tenantStatus string
		err := pool.QueryRow(context.Background(), `
			SELECT tm.membership_status, t.status
			FROM tenant_memberships tm
			JOIN tenants t ON t.id = tm.tenant_id
			WHERE tm.tenant_id = $1 AND tm.user_id = $2
			LIMIT 1
		`, tenantID, userID).Scan(&membershipStatus, &tenantStatus)

		if errors.Is(err, pgx.ErrNoRows) || membershipStatus != "ACTIVE" {
			return response.Fail(c, fiber.StatusForbidden, "TENANT_ACCESS_DENIED", "not an active member of this workspace", nil)
		}
		if err != nil {
			return response.Fail(c, fiber.StatusInternalServerError, "TENANT_CHECK_FAILED", "failed to verify workspace access", nil)
		}
		if tenantStatus == "SUSPENDED" || tenantStatus == "CANCELLED" {
			return response.Fail(c, fiber.StatusForbidden, "TENANT_SUSPENDED", "company workspace is suspended", nil)
		}

		c.Locals(CtxValidatedTenantIDKey, tenantID)
		return c.Next()
	}
}

// TenantIDFromCtx extracts the validated tenant UUID from fiber.Ctx.
func TenantIDFromCtx(c *fiber.Ctx) (uuid.UUID, bool) {
	tid, ok := c.Locals(CtxValidatedTenantIDKey).(uuid.UUID)
	return tid, ok && tid != uuid.Nil
}

