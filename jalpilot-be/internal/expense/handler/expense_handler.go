package handler

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	authmw "github.com/jalpilot/jalpilot-be/internal/auth/middleware"
	tenantmw "github.com/jalpilot/jalpilot-be/internal/tenant/middleware"
	"github.com/jalpilot/jalpilot-be/pkg/database"
	"github.com/jalpilot/jalpilot-be/pkg/response"
)

type ExpenseHandler struct {
	txm *database.TxManager
}

func NewExpenseHandler(txm *database.TxManager) *ExpenseHandler {
	return &ExpenseHandler{txm: txm}
}

func (h *ExpenseHandler) RegisterRoutes(admin fiber.Router) {
	admin.Get("/expense-categories", h.ListCategories)
	admin.Post("/expense-categories", h.CreateCategory)
	admin.Get("/expenses", h.ListExpenses)
	admin.Post("/expenses", h.CreateExpense)
}

func (h *ExpenseHandler) ListCategories(c *fiber.Ctx) error {
	tid, _ := tenantmw.TenantIDFromCtx(c)
	var items []map[string]any
	err := h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		rows, err := tx.Query(c.Context(), `SELECT id, name, COALESCE(description,'') FROM expense_categories ORDER BY name ASC`)
		if err != nil {
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var id uuid.UUID
			var name, desc string
			if err := rows.Scan(&id, &name, &desc); err != nil {
				return err
			}
			items = append(items, map[string]any{"id": id, "name": name, "description": desc})
		}
		return rows.Err()
	})
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "DB_ERROR", err.Error(), nil)
	}
	return response.OK(c, "expense categories", items)
}

func (h *ExpenseHandler) CreateCategory(c *fiber.Ctx) error {
	tid, _ := tenantmw.TenantIDFromCtx(c)
	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}
	if err := c.BodyParser(&req); err != nil || req.Name == "" {
		return response.Fail(c, fiber.StatusBadRequest, "INVALID_BODY", "name required", nil)
	}
	var id uuid.UUID
	err := h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		return tx.QueryRow(c.Context(), `INSERT INTO expense_categories (tenant_id, name, description) VALUES ($1,$2,$3) RETURNING id`, tid, req.Name, req.Description).Scan(&id)
	})
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "CREATE_FAILED", err.Error(), nil)
	}
	return response.Created(c, "expense category created", fiber.Map{"id": id})
}

func (h *ExpenseHandler) ListExpenses(c *fiber.Ctx) error {
	tid, _ := tenantmw.TenantIDFromCtx(c)
	var items []map[string]any
	err := h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		rows, err := tx.Query(c.Context(), `
			SELECT e.id, ec.name, e.description, e.amount::float8, e.expense_date::text, COALESCE(e.payment_method,'CASH')
			FROM company_expenses e
			JOIN expense_categories ec ON ec.tenant_id = e.tenant_id AND ec.id = e.category_id
			ORDER BY e.expense_date DESC LIMIT 50
		`)
		if err != nil {
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var id uuid.UUID
			var cat, desc, edate, method string
			var amt float64
			if err := rows.Scan(&id, &cat, &desc, &amt, &edate, &method); err != nil {
				return err
			}
			items = append(items, map[string]any{
				"id": id, "category": cat, "description": desc, "amount": amt, "expense_date": edate, "payment_method": method,
			})
		}
		return rows.Err()
	})
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "DB_ERROR", err.Error(), nil)
	}
	return response.OK(c, "company expenses", items)
}

func (h *ExpenseHandler) CreateExpense(c *fiber.Ctx) error {
	tid, _ := tenantmw.TenantIDFromCtx(c)
	uid, _ := authmw.UserIDFromCtx(c)
	var req struct {
		CategoryID    uuid.UUID `json:"category_id"`
		Description   string    `json:"description"`
		Amount        float64   `json:"amount"`
		ExpenseDate   string    `json:"expense_date"`
		PaymentMethod string    `json:"payment_method"`
	}
	if err := c.BodyParser(&req); err != nil || req.CategoryID == uuid.Nil || req.Amount <= 0 || req.Description == "" {
		return response.Fail(c, fiber.StatusBadRequest, "INVALID_BODY", "category_id, description, and amount > 0 required", nil)
	}
	if req.ExpenseDate == "" {
		req.ExpenseDate = time.Now().UTC().Format("2006-01-02")
	}
	var id uuid.UUID
	err := h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		return tx.QueryRow(c.Context(), `
			INSERT INTO company_expenses (tenant_id, category_id, description, amount, expense_date, payment_method, created_by)
			VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id
		`, tid, req.CategoryID, req.Description, req.Amount, req.ExpenseDate, req.PaymentMethod, uid).Scan(&id)
	})
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "CREATE_FAILED", err.Error(), nil)
	}
	return response.Created(c, "expense recorded", fiber.Map{"id": id})
}

