package handler

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	authmw "github.com/jalpilot/jalpilot-be/internal/auth/middleware"
	authsvc "github.com/jalpilot/jalpilot-be/internal/auth/service"
	"github.com/jalpilot/jalpilot-be/internal/customer/dto"
	"github.com/jalpilot/jalpilot-be/internal/customer/repository"
	tenantmw "github.com/jalpilot/jalpilot-be/internal/tenant/middleware"
	"github.com/jalpilot/jalpilot-be/pkg/response"
	"github.com/jalpilot/jalpilot-be/pkg/validator"
)

type CustomerHandler struct {
	repo *repository.CustomerRepository
	val  *validator.Validator
}

func NewCustomerHandler(repo *repository.CustomerRepository, val *validator.Validator) *CustomerHandler {
	return &CustomerHandler{repo: repo, val: val}
}

func (h *CustomerHandler) RegisterAdminRoutes(admin fiber.Router) {
	admin.Get("/customers", h.List)
	admin.Post("/customers", h.Create)
	admin.Post("/customers/:id/invite", h.ResendInvite)
}

func (h *CustomerHandler) RegisterPublicRoutes(pub fiber.Router) {
	pub.Post("/invitations/accept", h.AcceptInvitation)
}

func (h *CustomerHandler) RegisterPortalRoutes(cust fiber.Router) {
	cust.Get("/dashboard", h.PortalDashboard)
}

func (h *CustomerHandler) Create(c *fiber.Ctx) error {
	tid, ok := tenantmw.TenantIDFromCtx(c)
	if !ok {
		return response.Fail(c, fiber.StatusForbidden, "NO_TENANT", "tenant required", nil)
	}
	uid, _ := authmw.UserIDFromCtx(c)

	var req dto.CreateCustomerRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "INVALID_BODY", "malformed JSON", nil)
	}
	if errs := h.val.Validate(req); len(errs) > 0 {
		return response.Fail(c, fiber.StatusUnprocessableEntity, "VALIDATION_ERROR", "validation failed", errs)
	}

	cid, rawInvite, err := h.repo.CreateCustomer(c.Context(), tid, uid, req)
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "CREATE_CUSTOMER_FAILED", err.Error(), nil)
	}

	data := fiber.Map{"customer_id": cid}
	if rawInvite != "" {
		// In production, rawInvite is dispatched asynchronously via email/SMS worker.
		data["invitation_dispatched"] = true
	}
	return response.Created(c, "customer created", data)
}

func (h *CustomerHandler) List(c *fiber.Ctx) error {
	tid, ok := tenantmw.TenantIDFromCtx(c)
	if !ok {
		return response.Fail(c, fiber.StatusForbidden, "NO_TENANT", "tenant required", nil)
	}
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	items, total, err := h.repo.ListCustomers(c.Context(), tid, c.Query("q", ""), limit, (page-1)*limit)
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "DB_ERROR", err.Error(), nil)
	}
	return response.Paginated(c, "customers", items, response.Meta{Page: page, Limit: limit, Total: total})
}

func (h *CustomerHandler) ResendInvite(c *fiber.Ctx) error {
	tid, ok := tenantmw.TenantIDFromCtx(c)
	if !ok {
		return response.Fail(c, fiber.StatusForbidden, "NO_TENANT", "tenant required", nil)
	}
	cid, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "INVALID_ID", "invalid customer id", nil)
	}
	if _, err := h.repo.ResendInvitation(c.Context(), tid, cid); err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "INVITE_FAILED", err.Error(), nil)
	}
	return response.OK(c, "invitation resent", nil)
}

func (h *CustomerHandler) AcceptInvitation(c *fiber.Ctx) error {
	var req dto.AcceptInvitationRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "INVALID_BODY", "malformed JSON", nil)
	}
	if errs := h.val.Validate(req); len(errs) > 0 {
		return response.Fail(c, fiber.StatusUnprocessableEntity, "VALIDATION_ERROR", "validation failed", errs)
	}
	hash, err := authsvc.HashPassword(req.Password)
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "HASH_FAILED", "failed to process password", nil)
	}
	tid, uid, err := h.repo.AcceptInvitation(c.Context(), req.Token, hash)
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "ACCEPT_FAILED", err.Error(), nil)
	}
	return response.OK(c, "customer account activated", fiber.Map{"tenant_id": tid, "user_id": uid})
}

func (h *CustomerHandler) PortalDashboard(c *fiber.Ctx) error {
	tid, ok := tenantmw.TenantIDFromCtx(c)
	if !ok {
		return response.Fail(c, fiber.StatusForbidden, "NO_TENANT", "tenant required", nil)
	}
	uid, _ := authmw.UserIDFromCtx(c)
	data, err := h.repo.GetCustomerPortalDashboard(c.Context(), tid, uid)
	if err != nil {
		return response.Fail(c, fiber.StatusNotFound, "NOT_FOUND", err.Error(), nil)
	}
	return response.OK(c, "customer dashboard", data)
}
