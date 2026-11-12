package handler

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	authsvc "github.com/jalpilot/jalpilot-be/internal/auth/service"
	"github.com/jalpilot/jalpilot-be/internal/platform/dto"
	"github.com/jalpilot/jalpilot-be/internal/platform/repository"
	"github.com/jalpilot/jalpilot-be/pkg/response"
	"github.com/jalpilot/jalpilot-be/pkg/validator"
)

type PlatformHandler struct {
	repo    *repository.PlatformRepository
	authSvc *authsvc.AuthService
	val     *validator.Validator
}

func NewPlatformHandler(repo *repository.PlatformRepository, authSvc *authsvc.AuthService, val *validator.Validator) *PlatformHandler {
	return &PlatformHandler{repo: repo, authSvc: authSvc, val: val}
}

func (h *PlatformHandler) RegisterRoutes(sa fiber.Router) {
	sa.Get("/dashboard", h.Dashboard)
	sa.Get("/tenants", h.ListTenants)
	sa.Post("/tenants/:id/suspend", h.SuspendTenant)
	sa.Post("/tenants/:id/activate", h.ActivateTenant)
	sa.Get("/audit-logs", h.AuditLogs)
	sa.Get("/support-tickets", h.SupportTickets)
}

func (h *PlatformHandler) Dashboard(c *fiber.Ctx) error {
	d, err := h.repo.GetDashboard(c.Context())
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "DB_ERROR", err.Error(), nil)
	}
	return response.OK(c, "platform dashboard", d)
}

func (h *PlatformHandler) ListTenants(c *fiber.Ctx) error {
	page, limit := parsePagination(c)
	items, total, err := h.repo.ListTenants(c.Context(), limit, (page-1)*limit)
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "DB_ERROR", err.Error(), nil)
	}
	return response.Paginated(c, "tenants", items, response.Meta{Page: page, Limit: limit, Total: total})
}

func (h *PlatformHandler) SuspendTenant(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "INVALID_ID", "invalid tenant id", nil)
	}
	if err := h.repo.UpdateTenantStatus(c.Context(), id, "SUSPENDED"); err != nil {
		return response.Fail(c, fiber.StatusNotFound, "NOT_FOUND", err.Error(), nil)
	}
	return response.OK(c, "tenant suspended", nil)
}

func (h *PlatformHandler) ActivateTenant(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "INVALID_ID", "invalid tenant id", nil)
	}
	if err := h.repo.UpdateTenantStatus(c.Context(), id, "ACTIVE"); err != nil {
		return response.Fail(c, fiber.StatusNotFound, "NOT_FOUND", err.Error(), nil)
	}
	return response.OK(c, "tenant activated", nil)
}

func (h *PlatformHandler) AuditLogs(c *fiber.Ctx) error {
	page, limit := parsePagination(c)
	items, err := h.repo.ListAuditLogs(c.Context(), limit, (page-1)*limit)
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "DB_ERROR", err.Error(), nil)
	}
	return response.OK(c, "audit logs", items)
}

func (h *PlatformHandler) SupportTickets(c *fiber.Ctx) error {
	page, limit := parsePagination(c)
	items, err := h.repo.ListSupportTickets(c.Context(), limit, (page-1)*limit)
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "DB_ERROR", err.Error(), nil)
	}
	return response.OK(c, "support tickets", items)
}

func parsePagination(c *fiber.Ctx) (int, int) {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	return page, limit
}

var _ = dto.CreateTenantRequest{}

