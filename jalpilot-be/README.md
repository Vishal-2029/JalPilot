# jalpilot-be

Backend REST API & background worker for **JalPilot** — Multi-Tenant Water Supply Management SaaS.

## Stack
- Go 1.27+ & Fiber v2
- PostgreSQL 16 (Shared DB + Composite FKs + Row-Level Security)
- Redis 7 (Tenant-prefixed caching, rate limiting, job queues)
- Argon2id + Short-lived JWT + Refresh Token Rotation (HTTP-only cookies)

## Quick Start
1. Copy `.env.example` to `.env`.
2. Start PostgreSQL & Redis: `docker compose up -d postgres redis`
3. Run migrations: `make migrate-up`
4. Run API: `go run ./cmd/api`
5. Run Worker: `go run ./cmd/worker`
6. Run tests: `go test ./...`

