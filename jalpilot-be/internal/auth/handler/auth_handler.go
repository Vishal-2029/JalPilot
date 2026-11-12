package handler

import (
	"errors"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jalpilot/jalpilot-be/configs"
	"github.com/jalpilot/jalpilot-be/internal/auth/dto"
	"github.com/jalpilot/jalpilot-be/internal/auth/service"
	"github.com/jalpilot/jalpilot-be/pkg/response"
	"github.com/jalpilot/jalpilot-be/pkg/validator"
)

type AuthHandler struct {
	svc *service.AuthService
	val *validator.Validator
	cfg *configs.Config
}

func NewAuthHandler(svc *service.AuthService, val *validator.Validator, cfg *configs.Config) *AuthHandler {
	return &AuthHandler{svc: svc, val: val, cfg: cfg}
}

func (h *AuthHandler) RegisterRoutes(router fiber.Router) {
	auth := router.Group("/auth")
	auth.Post("/register", h.RegisterCompany)
	auth.Post("/login", h.Login)
	auth.Post("/refresh", h.Refresh)
	auth.Post("/logout", h.Logout)
}

func (h *AuthHandler) RegisterCompany(c *fiber.Ctx) error {
	var req dto.RegisterCompanyRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "INVALID_BODY", "malformed JSON request", nil)
	}
	if errs := h.val.Validate(req); len(errs) > 0 {
		return response.Fail(c, fiber.StatusUnprocessableEntity, "VALIDATION_ERROR", "validation failed", errs)
	}

	res, err := h.svc.RegisterCompany(c.Context(), req)
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "REGISTRATION_FAILED", err.Error(), nil)
	}

	h.setAuthCookies(c, res.AccessToken, res.RefreshToken)
	return response.Created(c, "company workspace created", res.User)
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req dto.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "INVALID_BODY", "malformed JSON request", nil)
	}
	if errs := h.val.Validate(req); len(errs) > 0 {
		return response.Fail(c, fiber.StatusUnprocessableEntity, "VALIDATION_ERROR", "validation failed", errs)
	}

	res, err := h.svc.Login(c.Context(), req)
	if err != nil {
		if errors.Is(err, service.ErrAccountSuspended) {
			return response.Fail(c, fiber.StatusForbidden, "ACCOUNT_SUSPENDED", err.Error(), nil)
		}
		return response.Fail(c, fiber.StatusUnauthorized, "INVALID_CREDENTIALS", "invalid email/phone or password", nil)
	}

	h.setAuthCookies(c, res.AccessToken, res.RefreshToken)
	return response.OK(c, "login successful", res.User)
}

func (h *AuthHandler) Refresh(c *fiber.Ctx) error {
	rawRefresh := c.Cookies("jp_refresh_token")
	if rawRefresh == "" {
		return response.Fail(c, fiber.StatusUnauthorized, "NO_REFRESH_TOKEN", "refresh token missing", nil)
	}
	res, err := h.svc.Refresh(c.Context(), rawRefresh)
	if err != nil {
		h.clearAuthCookies(c)
		return response.Fail(c, fiber.StatusUnauthorized, "REFRESH_FAILED", "session expired or revoked", nil)
	}

	h.setAuthCookies(c, res.AccessToken, res.RefreshToken)
	return response.OK(c, "token refreshed", res.User)
}

func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	rawRefresh := c.Cookies("jp_refresh_token")
	_ = h.svc.Logout(c.Context(), rawRefresh)
	h.clearAuthCookies(c)
	return response.OK(c, "logged out", nil)
}

func (h *AuthHandler) setAuthCookies(c *fiber.Ctx, accessToken, refreshToken string) {
	csrfRaw, _, _ := service.GenerateSecureToken(24)

	c.Cookie(&fiber.Cookie{
		Name:     "jp_access_token",
		Value:    accessToken,
		Path:     "/",
		Domain:   h.cfg.CookieDomain,
		HTTPOnly: true,
		Secure:   h.cfg.CookieSecure,
		SameSite: h.cfg.CookieSameSite,
		Expires:  time.Now().UTC().Add(h.cfg.JWTAccessTTL),
	})
	c.Cookie(&fiber.Cookie{
		Name:     "jp_refresh_token",
		Value:    refreshToken,
		Path:     "/api/v1/auth",
		Domain:   h.cfg.CookieDomain,
		HTTPOnly: true,
		Secure:   h.cfg.CookieSecure,
		SameSite: h.cfg.CookieSameSite,
		Expires:  time.Now().UTC().Add(h.cfg.JWTRefreshTTL),
	})
	c.Cookie(&fiber.Cookie{
		Name:     "jp_csrf_token",
		Value:    csrfRaw,
		Path:     "/",
		Domain:   h.cfg.CookieDomain,
		HTTPOnly: false, // Readable by frontend JS to echo in X-CSRF-Token header
		Secure:   h.cfg.CookieSecure,
		SameSite: h.cfg.CookieSameSite,
		Expires:  time.Now().UTC().Add(h.cfg.JWTRefreshTTL),
	})
}

func (h *AuthHandler) clearAuthCookies(c *fiber.Ctx) {
	for _, name := range []string{"jp_access_token", "jp_refresh_token", "jp_csrf_token"} {
		path := "/"
		if name == "jp_refresh_token" {
			path = "/api/v1/auth"
		}
		c.Cookie(&fiber.Cookie{
			Name:     name,
			Value:    "",
			Path:     path,
			Domain:   h.cfg.CookieDomain,
			HTTPOnly: name != "jp_csrf_token",
			Expires:  time.Now().UTC().Add(-1 * time.Hour),
		})
	}
}

