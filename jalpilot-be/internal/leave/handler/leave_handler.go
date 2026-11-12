package handler

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	authmw "github.com/jalpilot/jalpilot-be/internal/auth/middleware"
	tenantmw "github.com/jalpilot/jalpilot-be/internal/tenant/middleware"
	"github.com/jalpilot/jalpilot-be/pkg/database"
	"github.com/jalpilot/jalpilot-be/pkg/response"
)

type LeaveHandler struct {
	txm *database.TxManager
}

func NewLeaveHandler(txm *database.TxManager) *LeaveHandler {
	return &LeaveHandler{txm: txm}
}

func (h *LeaveHandler) RegisterAdminRoutes(admin fiber.Router) {
	admin.Get("/leave-requests", h.ListAll)
	admin.Post("/leave-requests/:id/approve", h.Approve)
	admin.Post("/leave-requests/:id/reject", h.Reject)
}

func (h *LeaveHandler) RegisterCustomerRoutes(cust fiber.Router) {
	cust.Get("/leave-requests", h.ListMine)
	cust.Post("/leave-requests", h.CreateMine)
}

func (h *LeaveHandler) ListAll(c *fiber.Ctx) error {
	tid, _ := tenantmw.TenantIDFromCtx(c)
	var items []map[string]any
	err := h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		rows, err := tx.Query(c.Context(), `
			SELECT lr.id, lr.customer_id, c.full_name, lr.start_date::text, lr.end_date::text, COALESCE(lr.reason,''), lr.request_status
			FROM leave_requests lr
			JOIN customers c ON c.tenant_id = lr.tenant_id AND c.id = lr.customer_id
			ORDER BY lr.created_at DESC LIMIT 50
		`)
		if err != nil {
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var id, cid uuid.UUID
			var cname, sdate, edate, reason, status string
			if err := rows.Scan(&id, &cid, &cname, &sdate, &edate, &reason, &status); err != nil {
				return err
			}
			items = append(items, map[string]any{
				"id": id, "customer_id": cid, "customer_name": cname,
				"start_date": sdate, "end_date": edate, "reason": reason, "request_status": status,
			})
		}
		return rows.Err()
	})
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "DB_ERROR", err.Error(), nil)
	}
	return response.OK(c, "leave requests", items)
}

func (h *LeaveHandler) Approve(c *fiber.Ctx) error {
	tid, _ := tenantmw.TenantIDFromCtx(c)
	uid, _ := authmw.UserIDFromCtx(c)
	lid, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "INVALID_ID", "invalid leave request id", nil)
	}

	err = h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		var cid uuid.UUID
		var sdate, edate, status string
		if err := tx.QueryRow(c.Context(), `
			SELECT customer_id, start_date::text, end_date::text, request_status FROM leave_requests WHERE id = $1 FOR UPDATE
		`, lid).Scan(&cid, &sdate, &edate, &status); err != nil {
			return fmt.Errorf("leave request not found")
		}
		if status != "PENDING" {
			return fmt.Errorf("leave request already %s", status)
		}
		if _, err := tx.Exec(c.Context(), `
			UPDATE leave_requests SET request_status = 'APPROVED', reviewed_by = $2, reviewed_at = NOW(), updated_at = NOW() WHERE id = $1
		`, lid, uid); err != nil {
			return err
		}
		_, err := tx.Exec(c.Context(), `
			INSERT INTO delivery_pauses (tenant_id, customer_id, leave_request_id, start_date, end_date, pause_status)
			VALUES ($1,$2,$3,$4,$5,'ACTIVE')
		`, tid, cid, lid, sdate, edate)
		return err
	})
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "APPROVE_FAILED", err.Error(), nil)
	}
	return response.OK(c, "leave approved and delivery pause activated", nil)
}

func (h *LeaveHandler) Reject(c *fiber.Ctx) error {
	tid, _ := tenantmw.TenantIDFromCtx(c)
	uid, _ := authmw.UserIDFromCtx(c)
	lid, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "INVALID_ID", "invalid leave request id", nil)
	}
	err = h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		_, err := tx.Exec(c.Context(), `
			UPDATE leave_requests SET request_status = 'REJECTED', reviewed_by = $2, reviewed_at = NOW(), updated_at = NOW()
			WHERE id = $1 AND request_status = 'PENDING'
		`, lid, uid)
		return err
	})
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "REJECT_FAILED", err.Error(), nil)
	}
	return response.OK(c, "leave rejected", nil)
}

func (h *LeaveHandler) ListMine(c *fiber.Ctx) error {
	tid, _ := tenantmw.TenantIDFromCtx(c)
	uid, _ := authmw.UserIDFromCtx(c)
	var items []map[string]any
	err := h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		rows, err := tx.Query(c.Context(), `
			SELECT lr.id, lr.start_date::text, lr.end_date::text, COALESCE(lr.reason,''), lr.request_status
			FROM leave_requests lr
			JOIN customers c ON c.tenant_id = lr.tenant_id AND c.id = lr.customer_id
			WHERE c.user_id = $1 ORDER BY lr.created_at DESC LIMIT 30
		`, uid)
		if err != nil {
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var id uuid.UUID
			var sdate, edate, reason, status string
			if err := rows.Scan(&id, &sdate, &edate, &reason, &status); err != nil {
				return err
			}
			items = append(items, map[string]any{
				"id": id, "start_date": sdate, "end_date": edate, "reason": reason, "request_status": status,
			})
		}
		return rows.Err()
	})
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "DB_ERROR", err.Error(), nil)
	}
	return response.OK(c, "my leave requests", items)
}

func (h *LeaveHandler) CreateMine(c *fiber.Ctx) error {
	tid, _ := tenantmw.TenantIDFromCtx(c)
	uid, _ := authmw.UserIDFromCtx(c)
	var req struct {
		StartDate string `json:"start_date"`
		EndDate   string `json:"end_date"`
		Reason    string `json:"reason"`
	}
	if err := c.BodyParser(&req); err != nil || req.StartDate == "" || req.EndDate == "" {
		return response.Fail(c, fiber.StatusBadRequest, "INVALID_BODY", "start_date and end_date required", nil)
	}
	var id uuid.UUID
	err := h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		var cid uuid.UUID
		if err := tx.QueryRow(c.Context(), `SELECT id FROM customers WHERE user_id = $1 LIMIT 1`, uid).Scan(&cid); err != nil {
			return fmt.Errorf("customer profile not found")
		}
		return tx.QueryRow(c.Context(), `
			INSERT INTO leave_requests (tenant_id, customer_id, start_date, end_date, reason)
			VALUES ($1,$2,$3,$4,$5) RETURNING id
		`, tid, cid, req.StartDate, req.EndDate, req.Reason).Scan(&id)
	})
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "CREATE_FAILED", err.Error(), nil)
	}
	return response.Created(c, "leave request submitted", fiber.Map{"id": id})
}

