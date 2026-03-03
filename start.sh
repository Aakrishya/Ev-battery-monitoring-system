#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
RUN_DIR="$ROOT_DIR/.run"

mkdir -p "$RUN_DIR"

# Stop stale local PIDs if present
if [ -f "$RUN_DIR/backend.pid" ]; then
  kill "$(cat "$RUN_DIR/backend.pid")" 2>/dev/null || true
  rm -f "$RUN_DIR/backend.pid"
fi
if [ -f "$RUN_DIR/frontend.pid" ]; then
  kill "$(cat "$RUN_DIR/frontend.pid")" 2>/dev/null || true
  rm -f "$RUN_DIR/frontend.pid"
fi

echo "[1/4] Starting PostgreSQL container..."
docker compose -f "$ROOT_DIR/infra/docker-compose.yml" up -d

echo "[2/4] Waiting for PostgreSQL to be ready..."
until docker exec ev-monitor-postgres pg_isready -U postgres -d ev_monitoring >/dev/null 2>&1; do
  sleep 2
  echo "  - still waiting..."
done
echo "  - PostgreSQL is ready"

echo "[3/4] Starting backend..."
cd "$ROOT_DIR/backend"
if [ ! -f .env ]; then
  cp .env.example .env
fi
nohup npm run dev > "$RUN_DIR/backend.log" 2>&1 &
echo $! > "$RUN_DIR/backend.pid"

echo "[4/4] Starting frontend..."
cd "$ROOT_DIR/frontend"
if [ ! -f .env ]; then
  cp .env.example .env
fi
nohup npm run dev > "$RUN_DIR/frontend.log" 2>&1 &
echo $! > "$RUN_DIR/frontend.pid"

echo ""
echo "Started successfully"
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:5000"
echo ""
echo "Logs:"
echo "  tail -f $RUN_DIR/backend.log"
echo "  tail -f $RUN_DIR/frontend.log"
echo ""
echo "Stop app services with: ./stop.sh"
echo "Stop DB as well with: docker compose -f infra/docker-compose.yml down"
