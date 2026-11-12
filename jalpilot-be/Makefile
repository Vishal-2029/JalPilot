.PHONY: build run-api run-worker test lint migrate-up migrate-down

build:
	go build -o bin/jalpilot-api ./cmd/api
	go build -o bin/jalpilot-worker ./cmd/worker

run-api:
	go run ./cmd/api

run-worker:
	go run ./cmd/worker

test:
	go test -v -race ./...

migrate-up:
	migrate -path migrations/schema -database "$(DATABASE_URL)" up

migrate-down:
	migrate -path migrations/schema -database "$(DATABASE_URL)" down 1

