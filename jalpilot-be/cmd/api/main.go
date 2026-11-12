package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jalpilot/jalpilot-be/configs"
	authhandler "github.com/jalpilot/jalpilot-be/internal/auth/handler"
	authmw "github.com/jalpilot/jalpilot-be/internal/auth/middleware"
	authrepo "github.com/jalpilot/jalpilot-be/internal/auth/repository"
	authsvc "github.com/jalpilot/jalpilot-be/internal/auth/service"
	companyhandler "github.com/jalpilot/jalpilot-be/internal/company/handler"
	custhandler "github.com/jalpilot/jalpilot-be/internal/customer/handler"
	custrepo "github.com/jalpilot/jalpilot-be/internal/customer/repository"
	deliveryhandler "github.com/jalpilot/jalpilot-be/internal/delivery/handler"
	expensehandler "github.com/jalpilot/jalpilot-be/internal/expense/handler"
	leavehandler "github.com/jalpilot/jalpilot-be/internal/leave/handler"
	paymenthandler "github.com/jalpilot/jalpilot-be/internal/payment/handler"
	platformhandler "github.com/jalpilot/jalpilot-be/internal/platform/handler"
	platformrepo "github.com/jalpilot/jalpilot-be/internal/platform/repository"
	producthandler "github.com/jalpilot/jalpilot-be/internal/product/handler"
	reporthandler "github.com/jalpilot/jalpilot-be/internal/report/handler"
	staffhandler "github.com/jalpilot/jalpilot-be/internal/staff/handler"
	subhandler "github.com/jalpilot/jalpilot-be/internal/subscription/handler"
	tenantmw "github.com/jalpilot/jalpilot-be/internal/tenant/middleware"
	themehandler "github.com/jalpilot/jalpilot-be/internal/theme/handler"
	"github.com/jalpilot/jalpilot-be/pkg/database"
	"github.com/jalpilot/jalpilot-be/pkg/logger"
	"github.com/jalpilot/jalpilot-be/pkg/middleware"
	pkgredis "github.com/jalpilot/jalpilot-be/pkg/redis"
	"github.com/jalpilot/jalpilot-be/pkg/response"
	"github.com/jalpilot/jalpilot-be/pkg/validator"
)

func main() {
	cfg, err := configs.Load()
	if err != nil {
		slog.Error("failed to load config", "error", err)
		os.Exit(1)
	}
	log := logger.New(cfg.AppEnv)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pool, err := database.NewPool(ctx, cfg)
	if err != nil {
		log.Error("failed to connect to postgres", "error", err)
		os.Exit(1)
	}
	defer pool.Close()

	rdb, err := pkgredis.NewClient(ctx, cfg)
	if err != nil {
		log.Error("failed to connect to redis", "error", err)
		os.Exit(1)
	}
	defer func() { _ = rdb.RDB.Close() }()

	txm := database.NewTxManager(pool)

	app := fiber.New(fiber.Config{
		AppName:      cfg.AppName,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	})

	middleware.RegisterGlobal(app, cfg)

	app.Get("/health", func(c *fiber.Ctx) error {
		return response.OK(c, "healthy", fiber.Map{"status": "up"})
	})

	v1 := app.Group("/api/v1")
	v1.Use(middleware.CSRFProtect())

	val := validator.New()
	tokens := authsvc.NewTokenManager(cfg.JWTAccessSecret, cfg.JWTAccessTTL)
	authRepo := authrepo.NewAuthRepository(pool)
	authService := authsvc.NewAuthService(authRepo, tokens, cfg.JWTRefreshTTL)
	authHandler := authhandler.NewAuthHandler(authService, val, cfg)
	authHandler.RegisterRoutes(v1)

	// Handlers
	platformH := platformhandler.NewPlatformHandler(platformrepo.NewPlatformRepository(txm), authService, val)
	companyH := companyhandler.NewCompanyHandler(txm)
	subH := subhandler.NewSubscriptionHandler(txm)
	custH := custhandler.NewCustomerHandler(custrepo.NewCustomerRepository(txm), val)
	prodH := producthandler.NewProductHandler(txm, val)
	delivH := deliveryhandler.NewDeliveryHandler(txm)
	payH := paymenthandler.NewPaymentHandler(txm)
	expH := expensehandler.NewExpenseHandler(txm)
	leaveH := leavehandler.NewLeaveHandler(txm)
	themeH := themehandler.NewThemeHandler(txm, rdb)
	staffH := staffhandler.NewStaffHandler(txm)
	reportH := reporthandler.NewReportHandler(txm)

	// Public Routes
	pub := v1.Group("/public")
	subH.RegisterPublicRoutes(pub)
	themeH.RegisterPublicRoutes(pub)
	custH.RegisterPublicRoutes(pub)

	// Super Admin Routes
	sa := v1.Group("/super-admin", authmw.Authenticate(tokens), authmw.RequirePlatformRole("SUPER_ADMIN"))
	platformH.RegisterRoutes(sa)
	themeH.RegisterSuperAdminRoutes(sa)

	// Company Admin Routes (Tenant-isolated)
	admin := v1.Group("/admin", authmw.Authenticate(tokens), tenantmw.RequireTenant(pool))
	companyH.RegisterRoutes(admin)
	subH.RegisterAdminRoutes(admin)
	custH.RegisterAdminRoutes(admin)
	prodH.RegisterRoutes(admin)
	delivH.RegisterAdminRoutes(admin)
	payH.RegisterAdminRoutes(admin)
	expH.RegisterRoutes(admin)
	leaveH.RegisterAdminRoutes(admin)
	themeH.RegisterAdminRoutes(admin)
	staffH.RegisterAdminRoutes(admin)
	reportH.RegisterRoutes(admin)

	// Delivery Staff Routes (Tenant-isolated)
	staff := v1.Group("/staff", authmw.Authenticate(tokens), tenantmw.RequireTenant(pool))
	staffH.RegisterStaffRoutes(staff)

	// Customer Portal Routes (Tenant-isolated)
	cust := v1.Group("/customer", authmw.Authenticate(tokens), tenantmw.RequireTenant(pool))
	custH.RegisterPortalRoutes(cust)
	delivH.RegisterCustomerRoutes(cust)
	payH.RegisterCustomerRoutes(cust)
	leaveH.RegisterCustomerRoutes(cust)

	go func() {
		log.Info("starting jalpilot-be api", "port", cfg.AppPort)
		if err := app.Listen(":" + cfg.AppPort); err != nil {
			log.Error("server error", "error", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info("shutting down jalpilot-be api")
	_ = app.Shutdown()
}
