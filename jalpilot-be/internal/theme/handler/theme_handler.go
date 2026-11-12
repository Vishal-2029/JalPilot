package handler

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	tenantmw "github.com/jalpilot/jalpilot-be/internal/tenant/middleware"
	"github.com/jalpilot/jalpilot-be/pkg/database"
	pkgredis "github.com/jalpilot/jalpilot-be/pkg/redis"
	"github.com/jalpilot/jalpilot-be/pkg/response"
)

type ThemeHandler struct {
	txm *database.TxManager
	rdb *pkgredis.Client
}

func NewThemeHandler(txm *database.TxManager, rdb *pkgredis.Client) *ThemeHandler {
	return &ThemeHandler{txm: txm, rdb: rdb}
}

func (h *ThemeHandler) RegisterPublicRoutes(pub fiber.Router) {
	pub.Get("/themes", h.ListPublishedThemes)
	pub.Get("/tenant-context", h.GetPublicTenantContext)
}

func (h *ThemeHandler) RegisterSuperAdminRoutes(sa fiber.Router) {
	sa.Get("/themes", h.ListAllThemes)
	sa.Post("/themes", h.CreateTheme)
	sa.Post("/themes/:id/publish", h.PublishTheme)
}

func (h *ThemeHandler) RegisterAdminRoutes(admin fiber.Router) {
	admin.Get("/themes", h.ListMarketplaceThemes)
	admin.Post("/themes/:id/purchase", h.PurchaseTheme)
	admin.Post("/themes/:id/activate", h.ActivateTheme)
}

// GetPublicTenantContext resolves a tenant by slug or domain and returns its active theme configuration (cached in Redis).
func (h *ThemeHandler) GetPublicTenantContext(c *fiber.Ctx) error {
	slug := c.Query("slug", "")
	domain := c.Query("domain", "")
	if slug == "" && domain == "" {
		return response.Fail(c, fiber.StatusBadRequest, "MISSING_IDENTIFIER", "slug or domain required", nil)
	}

	var result map[string]any
	err := h.txm.WithPlatformAdmin(c.Context(), func(tx pgx.Tx) error {
		var tid uuid.UUID
		var companyName, tSlug string
		var logoURL *string

		if slug != "" {
			if err := tx.QueryRow(c.Context(), `SELECT id, company_name, slug, logo_url FROM tenants WHERE slug = $1 AND status != 'CANCELLED' LIMIT 1`, slug).Scan(&tid, &companyName, &tSlug, &logoURL); err != nil {
				return fmt.Errorf("tenant not found")
			}
		} else {
			if err := tx.QueryRow(c.Context(), `
				SELECT t.id, t.company_name, t.slug, t.logo_url
				FROM tenant_domains td JOIN tenants t ON t.id = td.tenant_id
				WHERE td.domain = $1 AND t.status != 'CANCELLED' LIMIT 1
			`, domain).Scan(&tid, &companyName, &tSlug, &logoURL); err != nil {
				return fmt.Errorf("tenant not found")
			}
		}

		var themeSlug, themeName string
		var configJSON any
		var primaryCol, secondaryCol *string
		err := tx.QueryRow(c.Context(), `
			SELECT th.theme_slug, th.theme_name, tv.configuration_json, tts.primary_color, tts.secondary_color
			FROM tenant_theme_settings tts
			JOIN themes th ON th.id = tts.theme_id
			JOIN theme_versions tv ON tv.id = tts.theme_version_id
			WHERE tts.tenant_id = $1 AND tts.is_active = TRUE
			LIMIT 1
		`, tid).Scan(&themeSlug, &themeName, &configJSON, &primaryCol, &secondaryCol)
		if err != nil {
			// Default to Aqua Professional if tenant has not activated a custom theme yet
			themeSlug = "aqua-professional"
			themeName = "Aqua Professional"
			configJSON = map[string]any{"primary": "#0284c7", "secondary": "#e0f2fe", "accent": "#0369a1", "surface": "#ffffff", "layout": "sidebar"}
		}

		result = map[string]any{
			"tenant_id":       tid,
			"company_name":    companyName,
			"slug":            tSlug,
			"logo_url":        logoURL,
			"theme_slug":      themeSlug,
			"theme_name":      themeName,
			"theme_config":    configJSON,
			"primary_color":   primaryCol,
			"secondary_color": secondaryCol,
		}
		return nil
	})
	if err != nil {
		return response.Fail(c, fiber.StatusNotFound, "TENANT_NOT_FOUND", err.Error(), nil)
	}
	return response.OK(c, "tenant context", result)
}

func (h *ThemeHandler) ListPublishedThemes(c *fiber.Ctx) error {
	var items []map[string]any
	err := h.txm.WithPlatformAdmin(c.Context(), func(tx pgx.Tx) error {
		rows, err := tx.Query(c.Context(), `
			SELECT t.id, t.theme_name, t.theme_slug, COALESCE(t.description,''), t.price::float8, t.currency,
			       COALESCE((SELECT tv.configuration_json FROM theme_versions tv WHERE tv.theme_id = t.id ORDER BY tv.created_at DESC LIMIT 1), '{}'::jsonb)
			FROM themes t WHERE t.theme_status = 'PUBLISHED' ORDER BY t.price ASC
		`)
		if err != nil {
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var id uuid.UUID
			var name, slug, desc, curr string
			var price float64
			var cfg any
			if err := rows.Scan(&id, &name, &slug, &desc, &price, &curr, &cfg); err != nil {
				return err
			}
			items = append(items, map[string]any{
				"id": id, "theme_name": name, "theme_slug": slug, "description": desc,
				"price": price, "currency": curr, "configuration": cfg,
			})
		}
		return rows.Err()
	})
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "DB_ERROR", err.Error(), nil)
	}
	return response.OK(c, "published themes", items)
}

func (h *ThemeHandler) ListAllThemes(c *fiber.Ctx) error {
	var items []map[string]any
	err := h.txm.WithPlatformAdmin(c.Context(), func(tx pgx.Tx) error {
		rows, err := tx.Query(c.Context(), `
			SELECT id, theme_name, theme_slug, COALESCE(description,''), price::float8, currency, theme_status
			FROM themes ORDER BY created_at DESC
		`)
		if err != nil {
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var id uuid.UUID
			var name, slug, desc, curr, status string
			var price float64
			if err := rows.Scan(&id, &name, &slug, &desc, &price, &curr, &status); err != nil {
				return err
			}
			items = append(items, map[string]any{
				"id": id, "theme_name": name, "theme_slug": slug, "description": desc,
				"price": price, "currency": curr, "theme_status": status,
			})
		}
		return rows.Err()
	})
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "DB_ERROR", err.Error(), nil)
	}
	return response.OK(c, "all themes", items)
}

func (h *ThemeHandler) CreateTheme(c *fiber.Ctx) error {
	var req struct {
		ThemeName   string         `json:"theme_name"`
		ThemeSlug   string         `json:"theme_slug"`
		Description string         `json:"description"`
		Price       float64        `json:"price"`
		Config      map[string]any `json:"configuration"`
	}
	if err := c.BodyParser(&req); err != nil || req.ThemeName == "" || req.ThemeSlug == "" {
		return response.Fail(c, fiber.StatusBadRequest, "INVALID_BODY", "theme_name and theme_slug required", nil)
	}
	cfgBytes, _ := json.Marshal(req.Config)
	var id uuid.UUID
	err := h.txm.WithPlatformAdmin(c.Context(), func(tx pgx.Tx) error {
		if err := tx.QueryRow(c.Context(), `
			INSERT INTO themes (theme_name, theme_slug, description, price, theme_status)
			VALUES ($1,$2,$3,$4,'DRAFT') RETURNING id
		`, req.ThemeName, req.ThemeSlug, req.Description, req.Price).Scan(&id); err != nil {
			return err
		}
		_, err := tx.Exec(c.Context(), `
			INSERT INTO theme_versions (theme_id, version, configuration_json) VALUES ($1,'1.0.0',$2)
		`, id, cfgBytes)
		return err
	})
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "CREATE_FAILED", err.Error(), nil)
	}
	return response.Created(c, "theme created", fiber.Map{"id": id})
}

func (h *ThemeHandler) PublishTheme(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "INVALID_ID", "invalid theme id", nil)
	}
	err = h.txm.WithPlatformAdmin(c.Context(), func(tx pgx.Tx) error {
		_, err := tx.Exec(c.Context(), `UPDATE themes SET theme_status = 'PUBLISHED', updated_at = NOW() WHERE id = $1`, id)
		return err
	})
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "PUBLISH_FAILED", err.Error(), nil)
	}
	return response.OK(c, "theme published", nil)
}

func (h *ThemeHandler) ListMarketplaceThemes(c *fiber.Ctx) error {
	tid, _ := tenantmw.TenantIDFromCtx(c)
	var items []map[string]any
	err := h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		rows, err := tx.Query(c.Context(), `
			SELECT t.id, t.theme_name, t.theme_slug, COALESCE(t.description,''), t.price::float8, t.currency,
			       EXISTS(SELECT 1 FROM theme_purchases tp WHERE tp.tenant_id = $1 AND tp.theme_id = t.id AND tp.purchase_status = 'COMPLETED') AS is_purchased,
			       EXISTS(SELECT 1 FROM tenant_theme_settings tts WHERE tts.tenant_id = $1 AND tts.theme_id = t.id AND tts.is_active = TRUE) AS is_active
			FROM themes t WHERE t.theme_status = 'PUBLISHED' ORDER BY t.price ASC
		`, tid)
		if err != nil {
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var id uuid.UUID
			var name, slug, desc, curr string
			var price float64
			var purchased, active bool
			if err := rows.Scan(&id, &name, &slug, &desc, &price, &curr, &purchased, &active); err != nil {
				return err
			}
			items = append(items, map[string]any{
				"id": id, "theme_name": name, "theme_slug": slug, "description": desc,
				"price": price, "currency": curr, "is_purchased": purchased || price == 0, "is_active": active,
			})
		}
		return rows.Err()
	})
	if err != nil {
		return response.Fail(c, fiber.StatusInternalServerError, "DB_ERROR", err.Error(), nil)
	}
	return response.OK(c, "marketplace themes", items)
}

func (h *ThemeHandler) PurchaseTheme(c *fiber.Ctx) error {
	tid, _ := tenantmw.TenantIDFromCtx(c)
	themeID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "INVALID_ID", "invalid theme id", nil)
	}

	err = h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		var price float64
		var status string
		if err := tx.QueryRow(c.Context(), `SELECT price::float8, theme_status FROM themes WHERE id = $1`, themeID).Scan(&price, &status); err != nil {
			return fmt.Errorf("theme not found")
		}
		if status != "PUBLISHED" {
			return fmt.Errorf("theme is not available for purchase")
		}
		var txnID uuid.UUID
		if err := tx.QueryRow(c.Context(), `
			INSERT INTO platform_transactions (tenant_id, transaction_type, reference_type, reference_id, amount, payment_method, payment_status)
			VALUES ($1,'THEME_PURCHASE','THEME',$2,$3,'ONLINE','COMPLETED') RETURNING id
		`, tid, themeID, price).Scan(&txnID); err != nil {
			return err
		}
		_, err := tx.Exec(c.Context(), `
			INSERT INTO theme_purchases (tenant_id, theme_id, purchased_price, purchase_status, platform_transaction_id)
			VALUES ($1,$2,$3,'COMPLETED',$4)
			ON CONFLICT DO NOTHING
		`, tid, themeID, price, txnID)
		return err
	})
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "PURCHASE_FAILED", err.Error(), nil)
	}
	return response.OK(c, "theme purchased", nil)
}

func (h *ThemeHandler) ActivateTheme(c *fiber.Ctx) error {
	tid, _ := tenantmw.TenantIDFromCtx(c)
	themeID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "INVALID_ID", "invalid theme id", nil)
	}

	err = h.txm.WithTenant(c.Context(), tid, func(tx pgx.Tx) error {
		var price float64
		if err := tx.QueryRow(c.Context(), `SELECT price::float8 FROM themes WHERE id = $1 AND theme_status = 'PUBLISHED'`, themeID).Scan(&price); err != nil {
			return fmt.Errorf("theme not found")
		}
		if price > 0 {
			var owned bool
			_ = tx.QueryRow(c.Context(), `SELECT EXISTS(SELECT 1 FROM theme_purchases WHERE tenant_id = $1 AND theme_id = $2 AND purchase_status = 'COMPLETED')`, tid, themeID).Scan(&owned)
			if !owned {
				return fmt.Errorf("theme must be purchased before activation")
			}
		}
		var versionID uuid.UUID
		if err := tx.QueryRow(c.Context(), `SELECT id FROM theme_versions WHERE theme_id = $1 ORDER BY created_at DESC LIMIT 1`, themeID).Scan(&versionID); err != nil {
			return fmt.Errorf("theme version not found")
		}

		_, err := tx.Exec(c.Context(), `
			INSERT INTO tenant_theme_settings (tenant_id, theme_id, theme_version_id, is_active, activated_at)
			VALUES ($1,$2,$3,TRUE,NOW())
			ON CONFLICT (tenant_id) DO UPDATE SET
				theme_id = EXCLUDED.theme_id,
				theme_version_id = EXCLUDED.theme_version_id,
				is_active = TRUE,
				activated_at = NOW(),
				updated_at = NOW()
		`, tid, themeID, versionID)
		return err
	})
	if err != nil {
		return response.Fail(c, fiber.StatusBadRequest, "ACTIVATE_FAILED", err.Error(), nil)
	}
	if h.rdb != nil {
		_ = h.rdb.RDB.Del(c.Context(), pkgredis.TenantKey(tid, "theme", "active")).Err()
	}
	return response.OK(c, "theme activated", fiber.Map{"activated_at": time.Now().UTC()})
}

