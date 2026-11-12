package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5"
	tenantmw "github.com/jalpilot/jalpilot-be/internal/tenant/middleware"
	"github.com/jalpilot/jalpilot-be/pkg/database"
	"github.com/jalpilot/jalpilot-be/pkg/response"
)

type CompanyHandler struct {
	txm *database.TxManager
}

func NewCompanyHandler(txm *database.TxManager) *CompanyHandler {
	return &CompanyHandler{txm: txm}
}

func (h *CompanyHandler) RegisterRoutes(admin fiber.Router) {
	admin.Get("/dashboard", h.Dashboard)
	admin.Get("/company", h.GetProfile)
	admin.Patch("/company", h.UpdateProfile)
}

func (h *CompanyHandler) Dashboard(c *fiber.Ctx) error {
	tid, ok := tenantmw.TenantIDFromCtx(c)
	if !ok {
		return response.Fail(c, fiber.StatusForbidden, "NO_TENANT", "tenant context required", nil)
	}
	var totalCustomers, todayDeliveries, pendingDeliveries, pendingLeaves int64
	var todayCollection, outstandingBalance float64

	err := h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		_ = tx.QueryRow(c.Context(), `SELECT COUNT(*) FROM customers WHERE status = 'ACTIVE'`).Scan(&totalCustomers)
		_ = tx.QueryRow(c.Context(), `SELECT COUNT(*) FROM deliveries WHERE delivery_date = CURRENT_DATE`).Scan(&todayDeliveries)
		_ = tx.QueryRow(c.Context(), `SELECT COUNT(*) FROM deliveries WHERE delivery_date = CURRENT_DATE AND delivery_status IN ('PENDING','OUT_FOR_DELIVERY')`).Scan(&pendingDeliveries)
		_ = tx.QueryRow(c.Context(), `SELECT COALESCE(SUM(amount),0)::float8 FROM payments WHERE payment_date::date = CURRENT_DATE AND payment_status = 'COMPLETED'`).Scan(&todayCollection)
		_ = tx.QueryRow(c.Context(), `SELECT COALESCE(SUM(debit_amount - credit_amount),0)::float8 FROM customer_ledger_entries`).Scan(&outstandingBalance)
		_ = tx.QueryRow(c.Context(), `SELECT COUNT(*) FROM leave_requests WHERE request_status = 'PENDING'`).Scan(&pendingLeaves)
		return nil
	})
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "DB_ERROR", err.Error(), nil)
	}

	return response.OK(c, "company dashboard", fiber.Map{
		"total_customers":     totalCustomers,
		"today_deliveries":    todayDeliveries,
		"pending_deliveries":  pendingDeliveries,
		"today_collection":    todayCollection,
		"outstanding_balance": outstandingBalance,
		"pending_leaves":      pendingLeaves,
	})
}

func (h *CompanyHandler) GetProfile(c *fiber.Ctx) error {
	tid, ok := tenantmw.TenantIDFromCtx(c)
	if !ok {
		return response.Fail(c, fiber.StatusForbidden, "NO_TENANT", "tenant context required", nil)
	}
	var res map[string]any
	err := h.txm.WithPlatformAdmin(c.Context(), func(tx pgx.Tx) error {
		var name, slug, email, phone, status, currency, tz string
		var city, state, addr, logo *string
		err := tx.QueryRow(c.Context(), `
			SELECT company_name, slug, email, phone, status, currency, timezone, city, state, address, logo_url
			FROM tenants WHERE id = $1
		`, tid).Scan(&name, &slug, &email, &phone, &status, &currency, &tz, &city, &state, &addr, &logo)
		if err != nil {
			return err
		}
		res = map[string]any{
			"id": tid, "company_name": name, "slug": slug, "email": email, "phone": phone,
			"status": status, "currency": currency, "timezone": tz,
			"city": city, "state": state, "address": addr, "logo_url": logo,
		}
		return nil
	})
	if err != nil {
		return response.Fail(c, fiber.StatusNotFound, "NOT_FOUND", "company not found", nil)
	}
	return response.OK(c, "company profile", res)
}

func (h *CompanyHandler) UpdateProfile(c *fiber.Ctx) error {
	tid, ok := tenantmw.TenantIDFromCtx(c)
	if !ok {
		return response.Fail(c, fiber.StatusForbidden, "NO_TENANT", "tenant context required", nil)
	}
	var body struct {
		CompanyName *string `json:"company_name"`
		Phone       *string `json:"phone"`
		Address     *string `json:"address"`
		City        *string `json:"city"`
		State       *string `json:"state"`
		LogoURL     *string `json:"logo_url"`
	}
	if err := c.BodyParser(&body); err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "INVALID_BODY", "malformed JSON", nil)
	}
	err := h.txm.WithPlatformAdmin(c.Context(), func(tx pgx.Tx) error {
		_, err := tx.Exec(c.Context(), `
			UPDATE tenants SET
				company_name = COALESCE($2, company_name),
				phone = COALESCE($3, phone),
				address = COALESCE($4, address),
				city = COALESCE($5, city),
				state = COALESCE($6, state),
				logo_url = COALESCE($7, logo_url),
				updated_at = NOW()
			WHERE id = $1
		`, tid, body.CompanyName, body.Phone, body.Address, body.City, body.State, body.LogoURL)
		return err
	})
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "UPDATE_FAILED", err.Error(), nil)
	}
	return response.OK(c, "company profile updated", nil)
}

