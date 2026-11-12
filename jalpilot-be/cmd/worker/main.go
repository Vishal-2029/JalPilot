package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jalpilot/jalpilot-be/configs"
	"github.com/jalpilot/jalpilot-be/pkg/database"
	"github.com/jalpilot/jalpilot-be/pkg/logger"
	pkgredis "github.com/jalpilot/jalpilot-be/pkg/redis"
)

func main() {
	cfg, err := configs.Load()
	if err != nil {
		slog.Error("failed to load config", "error", err)
		os.Exit(1)
	}
	log := logger.New(cfg.AppEnv)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	pool, err := database.NewPool(ctx, cfg)
	if err != nil {
		log.Error("worker failed to connect to postgres", "error", err)
		os.Exit(1)
	}
	defer pool.Close()

	rdb, err := pkgredis.NewClient(ctx, cfg)
	if err != nil {
		log.Error("worker failed to connect to redis", "error", err)
		os.Exit(1)
	}
	defer func() { _ = rdb.RDB.Close() }()

	log.Info("jalpilot-be worker started")

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-quit:
			log.Info("shutting down jalpilot-be worker")
			return
		case <-ticker.C:
			// Phase 5/7: poll Redis queues for email/SMS invitations, recurring deliveries, reports
		}
	}
}

