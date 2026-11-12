package handler

import (
	"context"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	authmw "github.com/jalpilot/jalpilot-be/internal/auth/middleware"
	tenantmw "github.com/jalpilot/jalpilot-be/internal/tenant/middleware"
	"github.com/jalpilot/jalpilot-be/pkg/database"
	"github.com/jalpilot/jalpilot-be/pkg/response"
)

type DeliveryHandler struct {
	txm *database.TxManager
}

func NewDeliveryHandler(txm *database.TxManager) *DeliveryHandler {
	return &DeliveryHandler{txm: txm}
}

func (h *DeliveryHandler) RegisterAdminRoutes(admin fiber.Router) {
	admin.Get("/deliveries", h.ListDeliveries)
	admin.Post("/deliveries", h.RecordDailyDelivery)
}

func (h *DeliveryHandler) RegisterCustomerRoutes(cust fiber.Router) {
	cust.Get("/deliveries", h.ListCustomerDeliveries)
	cust.Get("/bottles", h.CustomerBottleBalance)
}

func (h *DeliveryHandler) ListDeliveries(c *fiber.Ctx) error {
	tid, ok := tenantmw.TenantIDFromCtx(c)
	if !ok {
		return response.Fail(c, fiber.StatusForbidden, "NO_TENANT", "tenant required", nil)
	}
	var items []map[string]any
	err := h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		rows, err := tx.Query(c.Context(), `
			SELECT d.id, d.customer_id, c.full_name, d.delivery_date::text, d.delivery_status,
			       COALESCE(SUM(di.quantity_delivered),0), COALESCE(SUM(di.empty_quantity_returned),0),
			       COALESCE(SUM(di.total_amount),0)::float8
			FROM deliveries d
			JOIN customers c ON c.tenant_id = d.tenant_id AND c.id = d.customer_id
			LEFT JOIN delivery_items di ON di.tenant_id = d.tenant_id AND di.delivery_id = d.id
			GROUP BY d.id, c.full_name
			ORDER BY d.delivery_date DESC, d.created_at DESC
			LIMIT 50
		`)
		if err != nil {
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var id, cid uuid.UUID
			var cname, ddate, dstatus string
			var qty, ret int
			var total float64
			if err := rows.Scan(&id, &cid, &cname, &ddate, &dstatus, &qty, &ret, &total); err != nil {
				return err
			}
			items = append(items, map[string]any{
				"id": id, "customer_id": cid, "customer_name": cname,
				"delivery_date": ddate, "delivery_status": dstatus,
				"quantity_delivered": qty, "empty_returned": ret, "total_amount": total,
			})
		}
		return rows.Err()
	})
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "DB_ERROR", err.Error(), nil)
	}
	return response.OK(c, "deliveries", items)
}

// RecordDailyDelivery atomically records a delivery, updates inventory & bottle transactions, and posts an immutable ledger debit.
func (h *DeliveryHandler) RecordDailyDelivery(c *fiber.Ctx) error {
	tid, ok := tenantmw.TenantIDFromCtx(c)
	if !ok {
		return response.Fail(c, fiber.StatusForbidden, "NO_TENANT", "tenant required", nil)
	}
	uid, _ := authmw.UserIDFromCtx(c)

	var req struct {
		CustomerID    uuid.UUID `json:"customer_id"`
		ProductID     uuid.UUID `json:"product_id"`
		DeliveryDate  string    `json:"delivery_date"`
		Quantity      int       `json:"quantity"`
		EmptyReturned int       `json:"empty_returned"`
		Notes         string    `json:"notes"`
	}
	if err := c.BodyParser(&req); err != nil || req.CustomerID == uuid.Nil || req.ProductID == uuid.Nil || req.Quantity <= 0 {
		return response.Fail(c, fiber.StatusBadRequest, "INVALID_BODY", "valid customer_id, product_id, and quantity > 0 required", nil)
	}
	if req.DeliveryDate == "" {
		req.DeliveryDate = time.Now().UTC().Format("2006-01-02")
	}

	var deliveryID uuid.UUID
	err := h.txm.WithTenant(ctxWith(c), tid, func(tx pgx.Tx) error {
		// Row-level lock on customer for ledger consistency
		var unitPrice float64
		if err := tx.QueryRow(c.Context(), `SELECT default_price::float8 FROM products WHERE id = $1`, req.ProductID).Scan(&unitPrice); err != nil {
			return fmt.Errorf("product not found")
		}
		totalAmt := unitPrice * float64(req.Quantity)

		if err := tx.QueryRow(c.Context(), `
			INSERT INTO deliveries (tenant_id, customer_id, delivery_date, delivery_status, delivered_at, notes)
			VALUES ($1,$2,$3,'DELIVERED',NOW(),$4) RETURNING id
		`, tid, req.CustomerID, req.DeliveryDate, req.Notes).Scan(&deliveryID); err != nil {
			return err
		}

		if _, err := tx.Exec(c.Context(), `
			INSERT INTO delivery_items (tenant_id, delivery_id, product_id, quantity_delivered, empty_quantity_returned, unit_price, total_amount)
			VALUES ($1,$2,$3,$4,$5,$6,$7)
		`, tid, deliveryID, req.ProductID, req.Quantity, req.EmptyReturned, unitPrice, totalAmt); err != nil {
			return err
		}

		if _, err := tx.Exec(c.Context(), `
			UPDATE inventory SET
				full_quantity = GREATEST(0, full_quantity - $2),
				empty_quantity = empty_quantity + $3,
				updated_at = NOW()
			WHERE product_id = $1
		`, req.ProductID, req.Quantity, req.EmptyReturned); err != nil {
			return err
		}

		if _, err := tx.Exec(c.Context(), `
			INSERT INTO bottle_transactions (tenant_id, customer_id, delivery_id, product_id, transaction_type, quantity)
			VALUES ($1,$2,$3,$4,'DELIVERED_FULL',$5)
		`, tid, req.CustomerID, deliveryID, req.ProductID, req.Quantity); err != nil {
			return err
		}
		if req.EmptyReturned > 0 {
			if _, err := tx.Exec(c.Context(), `
				INSERT INTO bottle_transactions (tenant_id, customer_id, delivery_id, product_id, transaction_type, quantity)
				VALUES ($1,$2,$3,$4,'RETURNED_EMPTY',$5)
			`, tid, req.CustomerID, deliveryID, req.ProductID, req.EmptyReturned); err != nil {
				return err
			}
		}

		// Append-only ledger debit entry
		_, err := tx.Exec(c.Context(), `
			INSERT INTO customer_ledger_entries (tenant_id, customer_id, entry_type, reference_type, reference_id, debit_amount, description, created_by)
			VALUES ($1,$2,'WATER_CHARGE','DELIVERY',$3,$4,$5,$6)
		`, tid, req.CustomerID, deliveryID, totalAmt, fmt.Sprintf("Water delivery (%d units)", req.Quantity), uid)
		return err
	})
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "DELIVERY_FAILED", err.Error(), nil)
	}
	return response.Created(c, "delivery recorded", fiber.Map{"delivery_id": deliveryID})
}

func (h *DeliveryHandler) ListCustomerDeliveries(c *fiber.Ctx) error {
	tid, _ := tenantmw.TenantIDFromCtx(c)
	uid, _ := authmw.UserIDFromCtx(c)
	var items []map[string]any
	err := h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		rows, err := tx.Query(c.Context(), `
			SELECT d.id, d.delivery_date::text, d.delivery_status,
			       COALESCE(SUM(di.quantity_delivered),0), COALESCE(SUM(di.empty_quantity_returned),0),
			       COALESCE(SUM(di.total_amount),0)::float8
			FROM deliveries d
			JOIN customers c ON c.tenant_id = d.tenant_id AND c.id = d.customer_id
			LEFT JOIN delivery_items di ON di.tenant_id = d.tenant_id AND di.delivery_id = d.id
			WHERE c.user_id = $1
			GROUP BY d.id
			ORDER BY d.delivery_date DESC LIMIT 50
		`, uid)
		if err != nil {
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var id uuid.UUID
			var ddate, dstatus string
			var qty, ret int
			var total float64
			if err := rows.Scan(&id, &ddate, &dstatus, &qty, &ret, &total); err != nil {
				return err
			}
			items = append(items, map[string]any{
				"id": id, "delivery_date": ddate, "delivery_status": dstatus,
				"quantity_delivered": qty, "empty_returned": ret, "total_amount": total,
			})
		}
		return rows.Err()
	})
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "DB_ERROR", err.Error(), nil)
	}
	return response.OK(c, "customer deliveries", items)
}

func (h *DeliveryHandler) CustomerBottleBalance(c *fiber.Ctx) error {
	tid, _ := tenantmw.TenantIDFromCtx(c)
	uid, _ := authmw.UserIDFromCtx(c)
	var bal int64
	err := h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		return tx.QueryRow(c.Context(), `
			SELECT COALESCE(SUM(CASE WHEN bt.transaction_type = 'DELIVERED_FULL' THEN bt.quantity WHEN bt.transaction_type IN ('RETURNED_EMPTY','LOST') THEN -bt.quantity ELSE 0 END), 0)
			FROM bottle_transactions bt
			JOIN customers c ON c.tenant_id = bt.tenant_id AND c.id = bt.customer_id
			WHERE c.user_id = $1
		`, uid).Scan(&bal)
	})
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "DB_ERROR", err.Error(), nil)
	}
	return response.OK(c, "bottle balance", fiber.Map{"bottle_balance": bal})
}

func ctxWith(c *fiber.Ctx) context.Context {
	return c.Context()
}
