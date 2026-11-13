.PHONY: run run-apps db-up db-down db-reset run-be run-worker run-admin run-customer build test

# Start PostgreSQL + Redis and run all JalPilot services (API, Worker, Admin UI, Customer UI)
run: db-up run-apps

# Run only the application processes (assumes PostgreSQL and Redis are already running)
run-apps:
	@echo "Starting all JalPilot app services..."
	@powershell -NoProfile -ExecutionPolicy Bypass -Command "\
		$$root = (Get-Location).Path; \
		$$jobs = @(); \
		$$jobs += Start-Job -Name 'jalpilot-api' -ScriptBlock { param($$d) Set-Location $$d; go run ./cmd/api } -ArgumentList (Join-Path $$root 'jalpilot-be'); \
		$$jobs += Start-Job -Name 'jalpilot-worker' -ScriptBlock { param($$d) Set-Location $$d; go run ./cmd/worker } -ArgumentList (Join-Path $$root 'jalpilot-be'); \
		$$jobs += Start-Job -Name 'jalpilot-admin' -ScriptBlock { param($$d) Set-Location $$d; npm run dev } -ArgumentList (Join-Path $$root 'jalpilot-admin'); \
		$$jobs += Start-Job -Name 'jalpilot-customer' -ScriptBlock { param($$d) Set-Location $$d; npm run dev } -ArgumentList (Join-Path $$root 'jalpilot-customer'); \
		Write-Host 'Services launched: API (:8080), Worker, Admin (:5173), Customer (:5174). Press Ctrl+C to stop.' -ForegroundColor Cyan; \
		try { \
			while ($$true) { \
				foreach ($$j in $$jobs) { Receive-Job -Job $$j }; \
				Start-Sleep -Milliseconds 500 \
			} \
		} finally { \
			Write-Host 'Stopping all JalPilot services...' -ForegroundColor Yellow; \
			Stop-Job -Job $$jobs -ErrorAction SilentlyContinue; \
			Remove-Job -Job $$jobs -Force -ErrorAction SilentlyContinue \
		}"

db-up:
	@powershell -NoProfile -ExecutionPolicy Bypass -Command "\
		docker info > $$null 2>&1; \
		if ($$LASTEXITCODE -ne 0) { \
			Write-Host 'ERROR: Docker Desktop is not currently running.' -ForegroundColor Red; \
			Write-Host 'Please open Docker Desktop from your Windows Start Menu (or launch it) and wait until the Docker engine starts.' -ForegroundColor Yellow; \
			Write-Host 'Once Docker Desktop is ready, run: make run' -ForegroundColor Cyan; \
			Write-Host 'If you are running PostgreSQL & Redis natively without Docker, run: make run-apps' -ForegroundColor Gray; \
			exit 1; \
		}; \
		docker compose -f jalpilot-be/docker-compose.yml up -d postgres redis"

db-down:
	docker compose -f jalpilot-be/docker-compose.yml down

db-reset:
	docker compose -f jalpilot-be/docker-compose.yml down -v
	docker compose -f jalpilot-be/docker-compose.yml up -d postgres redis

run-be:
	cd jalpilot-be && go run ./cmd/api

run-worker:
	cd jalpilot-be && go run ./cmd/worker

run-admin:
	cd jalpilot-admin && npm run dev

run-customer:
	cd jalpilot-customer && npm run dev

build:
	cd jalpilot-be && go build ./...
	cd jalpilot-admin && npm run build
	cd jalpilot-customer && npm run build

test:
	cd jalpilot-be && go test -v ./...
