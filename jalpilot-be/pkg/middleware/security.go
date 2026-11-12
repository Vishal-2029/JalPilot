package middleware

import (
	"crypto/subtle"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/requestid"
	"github.com/jalpilot/jalpilot-be/configs"
	"github.com/jalpilot/jalpilot-be/pkg/response"
)

// RegisterGlobal attaches standard security, CORS, compression, and rate-limiting middleware.
func RegisterGlobal(app *fiber.App, cfg *configs.Config) {
	app.Use(recover.New())
	app.Use(requestid.New())
	app.Use(compress.New(compress.Config{Level: compress.LevelBestSpeed}))

	app.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.CORSAllowedOrigins,
		AllowCredentials: true,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, X-CSRF-Token",
		AllowMethods:     "GET, POST, PUT, PATCH, DELETE, OPTIONS",
	}))

	app.Use(limiter.New(limiter.Config{
		Max:        120,
		Expiration: 1 * time.Minute,
		LimitReached: func(c *fiber.Ctx) error {
			return response.Fail(c, fiber.StatusTooManyRequests, "RATE_LIMITED", "too many requests, please try again later", nil)
		},
	}))
}

// CSRFProtect enforces double-submit cookie validation on state-changing requests.
func CSRFProtect() fiber.Handler {
	return func(c *fiber.Ctx) error {
		method := c.Method()
		if method == fiber.MethodGet || method == fiber.MethodHead || method == fiber.MethodOptions {
			return c.Next()
		}
		// Webhooks are authenticated via provider HMAC signatures, not CSRF cookies.
		if strings.HasPrefix(c.Path(), "/api/v1/webhooks/") {
			return c.Next()
		}

		cookieToken := c.Cookies("jp_csrf_token")
		headerToken := c.Get("X-CSRF-Token")
		if cookieToken == "" || headerToken == "" || subtle.ConstantTimeCompare([]byte(cookieToken), []byte(headerToken)) != 1 {
			return response.Fail(c, fiber.StatusForbidden, "CSRF_INVALID", "invalid or missing CSRF token", nil)
		}
		return c.Next()
	}
}

