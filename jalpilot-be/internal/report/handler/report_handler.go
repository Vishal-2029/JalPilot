package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5"
	tenantmw "github.com/jalpilot/jalpilot-be/internal/tenant/middleware"
	"github.com/jalpilot/jalpilot-be/pkg/database"
	"github.com/jalpilot/jalpilot-be/pkg/response"
)

type ReportHandler struct {
	txm *database.TxManager
}

func NewReportHandler(txm *database.TxManager) *ReportHandler {
	return &ReportHandler{txm: txm}
}

func (h *ReportHandler) RegisterRoutes(admin fiber.Router) {
	admin.Get("/reports/summary", h.Summary)
}

func (h *ReportHandler) Summary(c *fiber.Ctx) error {
	tid, _ := tenantmw.TenantIDFromCtx(c)
	var monthlySupply int64
	var monthlyRevenue, monthlyExpenses, totalOutstanding float64

	err := h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		_ = tx.QueryRow(c.Context(), `
			SELECT COALESCE(SUM(di.quantity_delivered),0)
			FROM delivery_items di JOIN deliveries d ON d.id = di.delivery_id
			WHERE date_trunc('month', d.delivery_date) = date_trunc('month', CURRENT_DATE)
		`).Scan(&monthlySupply)
		_ = tx.QueryRow(c.Context(), `
			SELECT COALESCE(SUM(amount),0)::float8 FROM payments
			WHERE payment_status = 'COMPLETED' AND date_trunc('month', payment_date) = date_trunc('month', CURRENT_DATE)
		`).Scan(&monthlyRevenue)
		_ = tx.QueryRow(c.Context(), `
			SELECT COALESCE(SUM(amount),0)::float8 FROM company_expenses
			WHERE date_trunc('month', expense_date) = date_trunc('month', CURRENT_DATE)
		`).Scan(&monthlyExpenses)
		_ = tx.QueryRow(c.Context(), `
			SELECT COALESCE(SUM(debit_amount - credit_amount),0)::float8 FROM customer_ledger_entries
		`).Scan(&totalOutstanding)
		return nil
	})
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "DB_ERROR", err.Error(), nil)
	}
	return response.OK(c, "report summary", fiber.Map{
		"monthly_bottles_supplied": monthlySupply,
		"monthly_collections":      monthlyRevenue,
		"monthly_expenses":         monthlyExpenses,
		"total_outstanding":        totalOutstanding,
	})
}

