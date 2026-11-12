package tenantisolation

import (
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	authmw "github.com/jalpilot/jalpilot-be/internal/auth/middleware"
	authsvc "github.com/jalpilot/jalpilot-be/internal/auth/service"
)

func TestUnauthenticatedAdminRouteRejected(t *testing.T) {
	tm := authsvc.NewTokenManager("test-secret-32-chars-minimum-len", 15*time.Minute)
	app := fiber.New()
	app.Get("/api/v1/admin/customers", authmw.Authenticate(tm), func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

	req := httptest.NewRequest("GET", "/api/v1/admin/customers", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("app.Test error: %v", err)
	}
	if resp.StatusCode != fiber.StatusUnauthorized {
		t.Fatalf("expected 401 Unauthorized, got %d", resp.StatusCode)
	}
}

func TestSuperAdminRouteRejectsTenantUser(t *testing.T) {
	tm := authsvc.NewTokenManager("test-secret-32-chars-minimum-len", 15*time.Minute)
	tid := uuid.New()
	tok, err := tm.GenerateAccessToken(uuid.New(), &tid, "") // No platform role
	if err != nil {
		t.Fatalf("GenerateAccessToken failed: %v", err)
	}

	app := fiber.New()
	app.Get("/api/v1/super-admin/tenants", authmw.Authenticate(tm), authmw.RequirePlatformRole("SUPER_ADMIN"), func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

	req := httptest.NewRequest("GET", "/api/v1/super-admin/tenants", nil)
	req.Header.Set("Authorization", "Bearer "+tok)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("app.Test error: %v", err)
	}
	if resp.StatusCode != fiber.StatusForbidden {
		t.Fatalf("expected 403 Forbidden for non-super-admin, got %d", resp.StatusCode)
	}
}

