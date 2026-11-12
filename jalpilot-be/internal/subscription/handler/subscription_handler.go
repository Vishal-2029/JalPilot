package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	tenantmw "github.com/jalpilot/jalpilot-be/internal/tenant/middleware"
	"github.com/jalpilot/jalpilot-be/pkg/database"
	"github.com/jalpilot/jalpilot-be/pkg/response"
)

type SubscriptionHandler struct {
	txm *database.TxManager
}

func NewSubscriptionHandler(txm *database.TxManager) *SubscriptionHandler {
	return &SubscriptionHandler{txm: txm}
}

func (h *SubscriptionHandler) RegisterPublicRoutes(pub fiber.Router) {
	pub.Get("/plans", h.ListPlans)
}

func (h *SubscriptionHandler) RegisterAdminRoutes(admin fiber.Router) {
	admin.Get("/subscription", h.GetCurrentSubscription)
}

func (h *SubscriptionHandler) ListPlans(c *fiber.Ctx) error {
	var plans []map[string]any
	err := h.txm.WithPlatformAdmin(c.Context(), func(tx pgx.Tx) error {
		rows, err := tx.Query(c.Context(), `
			SELECT id, plan_name, plan_code, monthly_price::float8, annual_price::float8, currency, customer_limit, staff_limit, order_limit, features_json
			FROM subscription_plans WHERE is_active = TRUE ORDER BY monthly_price ASC
		`)
		if err != nil {
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var id uuid.UUID
			var name, code, currency string
			var monthly, annual float64
			var cl, sl, ol int
			var feats any
			if err := rows.Scan(&id, &name, &code, &monthly, &annual, &currency, &cl, &sl, &ol, &feats); err != nil {
				return err
			}
			plans = append(plans, map[string]any{
				"id": id, "plan_name": name, "plan_code": code,
				"monthly_price": monthly, "annual_price": annual, "currency": currency,
				"customer_limit": cl, "staff_limit": sl, "order_limit": ol, "features": feats,
			})
		}
		return rows.Err()
	})
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "DB_ERROR", err.Error(), nil)
	}
	return response.OK(c, "subscription plans", plans)
}

func (h *SubscriptionHandler) GetCurrentSubscription(c *fiber.Ctx) error {
	tid, ok := tenantmw.TenantIDFromCtx(c)
	if !ok {
		return response.Fail(c, fiber.StatusForbidden, "NO_TENANT", "tenant context required", nil)
	}
	var sub map[string]any
	err := h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		var id uuid.UUID
		var status, interval, planName, planCode string
		var trialEnd, nextBill *string
		err := tx.QueryRow(c.Context(), `
			SELECT s.id, s.subscription_status, s.billing_interval, p.plan_name, p.plan_code, s.trial_end_date::text, s.next_billing_date::text
			FROM subscriptions s
			JOIN subscription_plans p ON p.id = s.plan_id
			ORDER BY s.created_at DESC LIMIT 1
		`).Scan(&id, &status, &interval, &planName, &planCode, &trialEnd, &nextBill)
		if err != nil {
			return err
		}
		sub = map[string]any{
			"id": id, "status": status, "billing_interval": interval,
			"plan_name": planName, "plan_code": planCode,
			"trial_end_date": trialEnd, "next_billing_date": nextBill,
		}
		return nil
	})
	if err != nil {
		return response.Fail(c, fiber.StatusNotFound, "NOT_FOUND", "no subscription found", nil)
	}
	return response.OK(c, "current subscription", sub)
}

