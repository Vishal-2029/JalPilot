package configs

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

// Config holds all application configuration loaded from environment variables.
type Config struct {
	AppName            string
	AppEnv             string
	AppPort            string
	AppBaseURL         string
	DBHost             string
	DBPort             string
	DBUser             string
	DBPassword         string
	DBName             string
	DBSSLMode          string
	DBMaxConns         int32
	DBMinConns         int32
	RedisAddr          string
	RedisPassword      string
	RedisDB            int
	JWTAccessSecret    string
	JWTAccessTTL       time.Duration
	JWTRefreshTTL      time.Duration
	CookieDomain       string
	CookieSecure       bool
	CookieSameSite     string
	CSRFSecret         string
	CORSAllowedOrigins string
}

// Load reads environment variables (and optional .env file) into Config.
func Load() (*Config, error) {
	_ = godotenv.Load()

	accessTTL, err := time.ParseDuration(getEnv("JWT_ACCESS_TTL", "15m"))
	if err != nil {
		return nil, fmt.Errorf("invalid JWT_ACCESS_TTL: %w", err)
	}
	refreshTTL, err := time.ParseDuration(getEnv("JWT_REFRESH_TTL", "168h"))
	if err != nil {
		return nil, fmt.Errorf("invalid JWT_REFRESH_TTL: %w", err)
	}

	cfg := &Config{
		AppName:            getEnv("APP_NAME", "jalpilot-be"),
		AppEnv:             getEnv("APP_ENV", "development"),
		AppPort:            getEnv("APP_PORT", "8080"),
		AppBaseURL:         getEnv("APP_BASE_URL", "http://localhost:8080"),
		DBHost:             getEnv("DB_HOST", "localhost"),
		DBPort:             getEnv("DB_PORT", "5432"),
		DBUser:             getEnv("DB_USER", "jalpilot"),
		DBPassword:         getEnv("DB_PASSWORD", "jalpilot_secret"),
		DBName:             getEnv("DB_NAME", "jalpilot_db"),
		DBSSLMode:          getEnv("DB_SSLMODE", "disable"),
		DBMaxConns:         int32(getEnvInt("DB_MAX_CONNS", 25)),
		DBMinConns:         int32(getEnvInt("DB_MIN_CONNS", 5)),
		RedisAddr:          getEnv("REDIS_ADDR", "localhost:6379"),
		RedisPassword:      getEnv("REDIS_PASSWORD", ""),
		RedisDB:            getEnvInt("REDIS_DB", 0),
		JWTAccessSecret:    getEnv("JWT_ACCESS_SECRET", "dev-secret-change-in-production"),
		JWTAccessTTL:       accessTTL,
		JWTRefreshTTL:      refreshTTL,
		CookieDomain:       getEnv("COOKIE_DOMAIN", "localhost"),
		CookieSecure:       getEnvBool("COOKIE_SECURE", false),
		CookieSameSite:     getEnv("COOKIE_SAMESITE", "Lax"),
		CSRFSecret:         getEnv("CSRF_SECRET", "dev-csrf-secret-change-in-prod"),
		CORSAllowedOrigins: getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5174"),
	}

	if cfg.AppEnv == "production" && strings.Contains(cfg.JWTAccessSecret, "change") {
		return nil, fmt.Errorf("JWT_ACCESS_SECRET must be set in production")
	}

	return cfg, nil
}

// DSN returns the PostgreSQL connection string.
func (c *Config) DSN() string {
	return fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=%s",
		c.DBUser, c.DBPassword, c.DBHost, c.DBPort, c.DBName, c.DBSSLMode,
	)
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return fallback
}

func getEnvBool(key string, fallback bool) bool {
	if v := os.Getenv(key); v != "" {
		if b, err := strconv.ParseBool(v); err == nil {
			return b
		}
	}
	return fallback
}

