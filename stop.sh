#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
RUN_DIR="$ROOT_DIR/.run"

if [ -f "$RUN_DIR/backend.pid" ]; then
  kill "$(cat "$RUN_DIR/backend.pid")" 2>/dev/null || true
  rm -f "$RUN_DIR/backend.pid"
  echo "Backend stopped"
fi

if [ -f "$RUN_DIR/frontend.pid" ]; then
  kill "$(cat "$RUN_DIR/frontend.pid")" 2>/dev/null || true
  rm -f "$RUN_DIR/frontend.pid"
  echo "Frontend stopped"
fi

echo "To stop DB too: docker compose -f infra/docker-compose.yml down"
