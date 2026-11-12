package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jalpilot/jalpilot-be/internal/auth/service"
	"github.com/jalpilot/jalpilot-be/pkg/response"
)

const (
	CtxUserIDKey       = "auth_user_id"
	CtxTenantIDKey     = "auth_tenant_id"
	CtxPlatformRoleKey = "auth_platform_role"
)

// Authenticate validates the short-lived JWT access token from the HTTP-only cookie (or Bearer header).
func Authenticate(tokens *service.TokenManager) fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenStr := c.Cookies("jp_access_token")
		if tokenStr == "" {
			authHeader := c.Get("Authorization")
			if strings.HasPrefix(authHeader, "Bearer ") {
				tokenStr = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}
		if tokenStr == "" {
			return response.Fail(c, fiber.StatusUnauthorized, "UNAUTHORIZED", "authentication required", nil)
		}

		claims, err := tokens.ParseAccessToken(tokenStr)
		if err != nil {
			return response.Fail(c, fiber.StatusUnauthorized, "TOKEN_INVALID", "invalid or expired access token", nil)
		}

		c.Locals(CtxUserIDKey, claims.UserID)
		if claims.TenantID != nil {
			c.Locals(CtxTenantIDKey, *claims.TenantID)
		}
		if claims.PlatformRole != "" {
			c.Locals(CtxPlatformRoleKey, claims.PlatformRole)
		}
		return c.Next()
	}
}

// RequirePlatformRole restricts access to Super Admin / Platform Support users.
func RequirePlatformRole(allowedRoles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		role, _ := c.Locals(CtxPlatformRoleKey).(string)
		for _, allowed := range allowedRoles {
			if role == allowed {
				return c.Next()
			}
		}
		return response.Fail(c, fiber.StatusForbidden, "FORBIDDEN", "platform role required", nil)
	}
}

// UserIDFromCtx retrieves the authenticated user UUID from fiber.Ctx.
func UserIDFromCtx(c *fiber.Ctx) (uuid.UUID, bool) {
	uid, ok := c.Locals(CtxUserIDKey).(uuid.UUID)
	return uid, ok && uid != uuid.Nil
}

