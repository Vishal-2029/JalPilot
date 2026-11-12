package handler

import (
	"fmt"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	authmw "github.com/jalpilot/jalpilot-be/internal/auth/middleware"
	tenantmw "github.com/jalpilot/jalpilot-be/internal/tenant/middleware"
	"github.com/jalpilot/jalpilot-be/pkg/database"
	"github.com/jalpilot/jalpilot-be/pkg/response"
)

type PaymentHandler struct {
	txm *database.TxManager
}

func NewPaymentHandler(txm *database.TxManager) *PaymentHandler {
	return &PaymentHandler{txm: txm}
}

func (h *PaymentHandler) RegisterAdminRoutes(admin fiber.Router) {
	admin.Get("/payments", h.ListPayments)
	admin.Post("/payments", h.RecordPayment)
	admin.Get("/customers/:id/ledger", h.CustomerLedger)
}

func (h *PaymentHandler) RegisterCustomerRoutes(cust fiber.Router) {
	cust.Get("/payments", h.CustomerPayments)
	cust.Get("/expenses", h.CustomerExpenses)
}

func (h *PaymentHandler) ListPayments(c *fiber.Ctx) error {
	tid, _ := tenantmw.TenantIDFromCtx(c)
	var items []map[string]any
	err := h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		rows, err := tx.Query(c.Context(), `
			SELECT p.id, p.payment_number, p.customer_id, c.full_name, p.amount::float8, p.payment_method, p.payment_status, p.payment_date::text
			FROM payments p
			JOIN customers c ON c.tenant_id = p.tenant_id AND c.id = p.customer_id
			ORDER BY p.payment_date DESC LIMIT 50
		`)
		if err != nil {
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var id, cid uuid.UUID
			var pnum, cname, method, status, pdate string
			var amt float64
			if err := rows.Scan(&id, &pnum, &cid, &cname, &amt, &method, &status, &pdate); err != nil {
				return err
			}
			items = append(items, map[string]any{
				"id": id, "payment_number": pnum, "customer_id": cid, "customer_name": cname,
				"amount": amt, "payment_method": method, "payment_status": status, "payment_date": pdate,
			})
		}
		return rows.Err()
	})
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "DB_ERROR", err.Error(), nil)
	}
	return response.OK(c, "payments", items)
}

// RecordPayment creates a payment and posts an immutable credit entry in customer_ledger_entries.
func (h *PaymentHandler) RecordPayment(c *fiber.Ctx) error {
	tid, _ := tenantmw.TenantIDFromCtx(c)
	uid, _ := authmw.UserIDFromCtx(c)
	var req struct {
		CustomerID    uuid.UUID `json:"customer_id"`
		Amount        float64   `json:"amount"`
		PaymentMethod string    `json:"payment_method"`
		Reference     string    `json:"transaction_reference"`
		Notes         string    `json:"notes"`
	}
	if err := c.BodyParser(&req); err != nil || req.CustomerID == uuid.Nil || req.Amount <= 0 {
		return response.Fail(c, fiber.StatusBadRequest, "INVALID_BODY", "valid customer_id and amount > 0 required", nil)
	}
	if req.PaymentMethod == "" {
		req.PaymentMethod = "CASH"
	}
	pnum := fmt.Sprintf("PAY-%s", strings.ToUpper(uuid.NewString()[:6]))

	var pid uuid.UUID
	err := h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		if err := tx.QueryRow(c.Context(), `
			INSERT INTO payments (tenant_id, customer_id, payment_number, amount, payment_method, payment_status, transaction_reference, collected_by, notes)
			VALUES ($1,$2,$3,$4,$5,'COMPLETED',$6,$7,$8) RETURNING id
		`, tid, req.CustomerID, pnum, req.Amount, req.PaymentMethod, req.Reference, uid, req.Notes).Scan(&pid); err != nil {
			return err
		}
		_, err := tx.Exec(c.Context(), `
			INSERT INTO customer_ledger_entries (tenant_id, customer_id, entry_type, reference_type, reference_id, credit_amount, description, created_by)
			VALUES ($1,$2,'PAYMENT','PAYMENT',$3,$4,$5,$6)
		`, tid, req.CustomerID, pid, req.Amount, fmt.Sprintf("Payment received (%s)", req.PaymentMethod), uid)
		return err
	})
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "PAYMENT_FAILED", err.Error(), nil)
	}
	return response.Created(c, "payment recorded", fiber.Map{"id": pid, "payment_number": pnum})
}

func (h *PaymentHandler) CustomerLedger(c *fiber.Ctx) error {
	tid, _ := tenantmw.TenantIDFromCtx(c)
	cid, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "INVALID_ID", "invalid customer id", nil)
	}
	var entries []map[string]any
	var balance float64
	err = h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		_ = tx.QueryRow(c.Context(), `SELECT COALESCE(SUM(debit_amount - credit_amount),0)::float8 FROM customer_ledger_entries WHERE customer_id = $1`, cid).Scan(&balance)
		rows, err := tx.Query(c.Context(), `
			SELECT id, entry_type, debit_amount::float8, credit_amount::float8, COALESCE(description,''), transaction_date::text
			FROM customer_ledger_entries WHERE customer_id = $1
			ORDER BY transaction_date DESC, id DESC LIMIT 100
		`, cid)
		if err != nil {
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var id uuid.UUID
			var etype, desc, tdate string
			var deb, cred float64
			if err := rows.Scan(&id, &etype, &deb, &cred, &desc, &tdate); err != nil {
				return err
			}
			entries = append(entries, map[string]any{
				"id": id, "entry_type": etype, "debit_amount": deb, "credit_amount": cred, "description": desc, "transaction_date": tdate,
			})
		}
		return rows.Err()
	})
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "DB_ERROR", err.Error(), nil)
	}
	return response.OK(c, "customer ledger", fiber.Map{"closing_balance": balance, "entries": entries})
}

func (h *PaymentHandler) CustomerPayments(c *fiber.Ctx) error {
	tid, _ := tenantmw.TenantIDFromCtx(c)
	uid, _ := authmw.UserIDFromCtx(c)
	var items []map[string]any
	err := h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		rows, err := tx.Query(c.Context(), `
			SELECT p.id, p.payment_number, p.amount::float8, p.payment_method, p.payment_status, p.payment_date::text
			FROM payments p
			JOIN customers c ON c.tenant_id = p.tenant_id AND c.id = p.customer_id
			WHERE c.user_id = $1 ORDER BY p.payment_date DESC LIMIT 50
		`, uid)
		if err != nil {
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var id uuid.UUID
			var pnum, method, status, pdate string
			var amt float64
			if err := rows.Scan(&id, &pnum, &amt, &method, &status, &pdate); err != nil {
				return err
			}
			items = append(items, map[string]any{
				"id": id, "payment_number": pnum, "amount": amt, "payment_method": method, "payment_status": status, "payment_date": pdate,
			})
		}
		return rows.Err()
	})
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "DB_ERROR", err.Error(), nil)
	}
	return response.OK(c, "customer payments", items)
}

func (h *PaymentHandler) CustomerExpenses(c *fiber.Ctx) error {
	tid, _ := tenantmw.TenantIDFromCtx(c)
	uid, _ := authmw.UserIDFromCtx(c)
	var items []map[string]any
	err := h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		rows, err := tx.Query(c.Context(), `
			SELECT cle.id, cle.entry_type, cle.debit_amount::float8, cle.credit_amount::float8, COALESCE(cle.description,''), cle.transaction_date::text
			FROM customer_ledger_entries cle
			JOIN customers c ON c.tenant_id = cle.tenant_id AND c.id = cle.customer_id
			WHERE c.user_id = $1 ORDER BY cle.transaction_date DESC LIMIT 50
		`, uid)
		if err != nil {
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var id uuid.UUID
			var etype, desc, tdate string
			var deb, cred float64
			if err := rows.Scan(&id, &etype, &deb, &cred, &desc, &tdate); err != nil {
				return err
			}
			items = append(items, map[string]any{
				"id": id, "entry_type": etype, "debit_amount": deb, "credit_amount": cred, "description": desc, "transaction_date": tdate,
			})
		}
		return rows.Err()
	})
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "DB_ERROR", err.Error(), nil)
	}
	return response.OK(c, "customer expenses", items)
}

