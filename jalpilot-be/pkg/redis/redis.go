package redis

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	goredis "github.com/redis/go-redis/v9"
	"github.com/jalpilot/jalpilot-be/configs"
)

// Client wraps go-redis with tenant-aware cache key helpers.
type Client struct {
	RDB *goredis.Client
}

// NewClient initializes and pings the Redis connection.
func NewClient(ctx context.Context, cfg *configs.Config) (*Client, error) {
	rdb := goredis.NewClient(&goredis.Options{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDB,
	})
	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("ping redis: %w", err)
	}
	return &Client{RDB: rdb}, nil
}

// TenantKey constructs an isolated cache key scoped to a single tenant.
func TenantKey(tenantID uuid.UUID, module, key string) string {
	return fmt.Sprintf("jp:t:%s:%s:%s", tenantID.String(), module, key)
}

// PlatformKey constructs a cache key for platform-level non-tenant data.
func PlatformKey(module, key string) string {
	return fmt.Sprintf("jp:p:%s:%s", module, key)
}

