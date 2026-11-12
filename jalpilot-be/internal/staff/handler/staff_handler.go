package handler

import (
	"fmt"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	authmw "github.com/jalpilot/jalpilot-be/internal/auth/middleware"
	authsvc "github.com/jalpilot/jalpilot-be/internal/auth/service"
	tenantmw "github.com/jalpilot/jalpilot-be/internal/tenant/middleware"
	"github.com/jalpilot/jalpilot-be/pkg/database"
	"github.com/jalpilot/jalpilot-be/pkg/response"
)

type StaffHandler struct {
	txm *database.TxManager
}

func NewStaffHandler(txm *database.TxManager) *StaffHandler {
	return &StaffHandler{txm: txm}
}

func (h *StaffHandler) RegisterAdminRoutes(admin fiber.Router) {
	admin.Get("/staff", h.ListStaff)
	admin.Post("/staff", h.CreateStaff)
}

func (h *StaffHandler) RegisterStaffRoutes(staff fiber.Router) {
	staff.Get("/deliveries", h.AssignedDeliveries)
	staff.Patch("/deliveries/:id/status", h.UpdateDeliveryStatus)
}

func (h *StaffHandler) ListStaff(c *fiber.Ctx) error {
	tid, _ := tenantmw.TenantIDFromCtx(c)
	var items []map[string]any
	err := h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		rows, err := tx.Query(c.Context(), `
			SELECT id, employee_code, full_name, phone, employment_status, created_at::text
			FROM staff_profiles ORDER BY created_at DESC
		`)
		if err != nil {
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var id uuid.UUID
			var code, name, phone, status, created string
			if err := rows.Scan(&id, &code, &name, &phone, &status, &created); err != nil {
				return err
			}
			items = append(items, map[string]any{
				"id": id, "employee_code": code, "full_name": name, "phone": phone, "employment_status": status, "created_at": created,
			})
		}
		return rows.Err()
	})
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "DB_ERROR", err.Error(), nil)
	}
	return response.OK(c, "staff list", items)
}

func (h *StaffHandler) CreateStaff(c *fiber.Ctx) error {
	tid, _ := tenantmw.TenantIDFromCtx(c)
	var req struct {
		FullName string `json:"full_name"`
		Phone    string `json:"phone"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.BodyParser(&req); err != nil || req.FullName == "" || req.Phone == "" || req.Password == "" {
		return response.Fail(c, fiber.StatusBadRequest, "INVALID_BODY", "full_name, phone, and password required", nil)
	}
	hash, err := authsvc.HashPassword(req.Password)
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "HASH_ERROR", err.Error(), nil)
	}
	empCode := fmt.Sprintf("EMP-%s", strings.ToUpper(uuid.NewString()[:5]))
	var staffID uuid.UUID

	err = h.txm.WithPlatformAdmin(c.Context(), func(tx pgx.Tx) error {
		var normEmail *string
		var emailPtr *string
		if strings.TrimSpace(req.Email) != "" {
			e := strings.ToLower(strings.TrimSpace(req.Email))
			normEmail = &e
			emailPtr = &e
		}
		var userID uuid.UUID
		if err := tx.QueryRow(c.Context(), `
			INSERT INTO users (full_name, email, normalized_email, phone, normalized_phone, password_hash, account_status)
			VALUES ($1,$2,$3,$4,$5,$6,'ACTIVE') RETURNING id
		`, req.FullName, emailPtr, normEmail, req.Phone, strings.TrimSpace(req.Phone), hash).Scan(&userID); err != nil {
			return err
		}
		if _, err := tx.Exec(c.Context(), `
			INSERT INTO tenant_memberships (tenant_id, user_id, membership_status) VALUES ($1,$2,'ACTIVE')
		`, tid, userID); err != nil {
			return err
		}
		return tx.QueryRow(c.Context(), `
			INSERT INTO staff_profiles (tenant_id, user_id, employee_code, full_name, phone, employment_status)
			VALUES ($1,$2,$3,$4,$5,'ACTIVE') RETURNING id
		`, tid, userID, empCode, req.FullName, req.Phone).Scan(&staffID)
	})
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "CREATE_STAFF_FAILED", err.Error(), nil)
	}
	return response.Created(c, "staff created", fiber.Map{"id": staffID, "employee_code": empCode})
}

func (h *StaffHandler) AssignedDeliveries(c *fiber.Ctx) error {
	tid, _ := tenantmw.TenantIDFromCtx(c)
	uid, _ := authmw.UserIDFromCtx(c)
	var items []map[string]any
	err := h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		rows, err := tx.Query(c.Context(), `
			SELECT d.id, c.full_name, c.phone, d.delivery_date::text, d.delivery_status
			FROM deliveries d
			JOIN customers c ON c.tenant_id = d.tenant_id AND c.id = d.customer_id
			LEFT JOIN staff_profiles sp ON sp.tenant_id = d.tenant_id AND sp.id = d.assigned_staff_id
			WHERE (sp.user_id = $1 OR d.assigned_staff_id IS NULL) AND d.delivery_date = CURRENT_DATE
			ORDER BY d.created_at ASC
		`, uid)
		if err != nil {
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var id uuid.UUID
			var cname, cphone, ddate, status string
			if err := rows.Scan(&id, &cname, &cphone, &ddate, &status); err != nil {
				return err
			}
			items = append(items, map[string]any{
				"id": id, "customer_name": cname, "customer_phone": cphone, "delivery_date": ddate, "delivery_status": status,
			})
		}
		return rows.Err()
	})
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "DB_ERROR", err.Error(), nil)
	}
	return response.OK(c, "assigned deliveries", items)
}

func (h *StaffHandler) UpdateDeliveryStatus(c *fiber.Ctx) error {
	tid, _ := tenantmw.TenantIDFromCtx(c)
	did, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "INVALID_ID", "invalid delivery id", nil)
	}
	var req struct {
		Status string `json:"status"`
	}
	if err := c.BodyParser(&req); err != nil || req.Status == "" {
		return response.Fail(c, fiber.StatusBadRequest, "INVALID_BODY", "status required", nil)
	}
	err = h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		_, err := tx.Exec(c.Context(), `
			UPDATE deliveries SET delivery_status = $2, delivered_at = CASE WHEN $2 = 'DELIVERED' THEN NOW() ELSE delivered_at END, updated_at = NOW()
			WHERE id = $1
		`, did, req.Status)
		return err
	})
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "UPDATE_FAILED", err.Error(), nil)
	}
	return response.OK(c, "delivery status updated", nil)
}

