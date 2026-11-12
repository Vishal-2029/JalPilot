package handler

import (
	"fmt"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	tenantmw "github.com/jalpilot/jalpilot-be/internal/tenant/middleware"
	"github.com/jalpilot/jalpilot-be/pkg/database"
	"github.com/jalpilot/jalpilot-be/pkg/response"
	"github.com/jalpilot/jalpilot-be/pkg/validator"
)

type ProductHandler struct {
	txm *database.TxManager
	val *validator.Validator
}

func NewProductHandler(txm *database.TxManager, val *validator.Validator) *ProductHandler {
	return &ProductHandler{txm: txm, val: val}
}

func (h *ProductHandler) RegisterRoutes(admin fiber.Router) {
	admin.Get("/products", h.ListProducts)
	admin.Post("/products", h.CreateProduct)
	admin.Post("/inventory/adjust", h.AdjustInventory)
}

func (h *ProductHandler) ListProducts(c *fiber.Ctx) error {
	tid, ok := tenantmw.TenantIDFromCtx(c)
	if !ok {
		return response.Fail(c, fiber.StatusForbidden, "NO_TENANT", "tenant required", nil)
	}
	var items []map[string]any
	err := h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		rows, err := tx.Query(c.Context(), `
			SELECT p.id, p.product_name, p.product_code, p.bottle_size_liters::float8, p.product_type, p.default_price::float8, p.is_active,
			       COALESCE(i.full_quantity,0), COALESCE(i.empty_quantity,0), COALESCE(i.damaged_quantity,0)
			FROM products p
			LEFT JOIN inventory i ON i.tenant_id = p.tenant_id AND i.product_id = p.id
			ORDER BY p.created_at DESC
		`)
		if err != nil {
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var id uuid.UUID
			var name, code, ptype string
			var size, price float64
			var active bool
			var fullQ, emptyQ, dmgQ int
			if err := rows.Scan(&id, &name, &code, &size, &ptype, &price, &active, &fullQ, &emptyQ, &dmgQ); err != nil {
				return err
			}
			items = append(items, map[string]any{
				"id": id, "product_name": name, "product_code": code,
				"bottle_size_liters": size, "product_type": ptype, "default_price": price, "is_active": active,
				"full_quantity": fullQ, "empty_quantity": emptyQ, "damaged_quantity": dmgQ,
			})
		}
		return rows.Err()
	})
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "DB_ERROR", err.Error(), nil)
	}
	return response.OK(c, "products", items)
}

func (h *ProductHandler) CreateProduct(c *fiber.Ctx) error {
	tid, ok := tenantmw.TenantIDFromCtx(c)
	if !ok {
		return response.Fail(c, fiber.StatusForbidden, "NO_TENANT", "tenant required", nil)
	}
	var req struct {
		ProductName      string  `json:"product_name" validate:"required,min=2,max=150"`
		BottleSizeLiters float64 `json:"bottle_size_liters"`
		ProductType      string  `json:"product_type" validate:"omitempty,oneof=RETURNABLE_JAR DISPOSABLE_BOTTLE DISPENSER ACCESSORY"`
		DefaultPrice     float64 `json:"default_price"`
		InitialFullQty   int     `json:"initial_full_quantity"`
	}
	if err := c.BodyParser(&req); err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "INVALID_BODY", "malformed JSON", nil)
	}
	if errs := h.val.Validate(req); len(errs) > 0 {
		return response.Fail(c, fiber.StatusUnprocessableEntity, "VALIDATION_ERROR", "validation failed", errs)
	}
	if req.ProductType == "" {
		req.ProductType = "RETURNABLE_JAR"
	}
	code := fmt.Sprintf("PRD-%s", strings.ToUpper(uuid.NewString()[:6]))

	var pid uuid.UUID
	err := h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		if err := tx.QueryRow(c.Context(), `
			INSERT INTO products (tenant_id, product_name, product_code, bottle_size_liters, product_type, default_price)
			VALUES ($1,$2,$3,$4,$5,$6) RETURNING id
		`, tid, req.ProductName, code, req.BottleSizeLiters, req.ProductType, req.DefaultPrice).Scan(&pid); err != nil {
			return err
		}
		_, err := tx.Exec(c.Context(), `
			INSERT INTO inventory (tenant_id, product_id, full_quantity) VALUES ($1,$2,$3)
		`, tid, pid, req.InitialFullQty)
		return err
	})
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "CREATE_FAILED", err.Error(), nil)
	}
	return response.Created(c, "product created", fiber.Map{"id": pid, "product_code": code})
}

func (h *ProductHandler) AdjustInventory(c *fiber.Ctx) error {
	tid, ok := tenantmw.TenantIDFromCtx(c)
	if !ok {
		return response.Fail(c, fiber.StatusForbidden, "NO_TENANT", "tenant required", nil)
	}
	var req struct {
		ProductID       uuid.UUID `json:"product_id" validate:"required"`
		FullDelta       int       `json:"full_delta"`
		EmptyDelta      int       `json:"empty_delta"`
		DamagedDelta    int       `json:"damaged_delta"`
		Notes           string    `json:"notes"`
	}
	if err := c.BodyParser(&req); err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "INVALID_BODY", "malformed JSON", nil)
	}
	err := h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		_, err := tx.Exec(c.Context(), `
			UPDATE inventory SET
				full_quantity = GREATEST(0, full_quantity + $2),
				empty_quantity = GREATEST(0, empty_quantity + $3),
				damaged_quantity = GREATEST(0, damaged_quantity + $4),
				updated_at = NOW()
			WHERE product_id = $1
		`, req.ProductID, req.FullDelta, req.EmptyDelta, req.DamagedDelta)
		if err != nil {
			return err
		}
		_, err = tx.Exec(c.Context(), `
			INSERT INTO inventory_transactions (tenant_id, product_id, transaction_type, quantity, notes)
			VALUES ($1,$2,'ADJUSTMENT',$3,$4)
		`, tid, req.ProductID, req.FullDelta, req.Notes)
		return err
	})
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "ADJUST_FAILED", err.Error(), nil)
	}
	return response.OK(c, "inventory adjusted", nil)
}

