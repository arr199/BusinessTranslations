#!/bin/bash
# Runs every suite: .NET tests (unit + integration, needs Docker) and
# the Playwright E2E suite (needs pnpm; starts the Vite dev server itself).
# Requires: Docker running, pnpm on PATH, Playwright chromium installed
# (pnpm install in Business.Translations.E2ETests does that).
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VITE_URL="http://localhost:5173"
VITE_PID=""

cleanup() {
  if [ -n "$VITE_PID" ]; then
    echo "Stopping Vite dev server..."
    kill "$VITE_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

echo "── .NET tests (unit + integration) ──"
dotnet test --solution "$ROOT_DIR/businessTranslations.sln"

echo "── Playwright E2E ──"
cd "$ROOT_DIR/Business.Translations.E2ETests"

if [ ! -d node_modules ]; then
  echo "Installing E2E dependencies..."
  pnpm install
fi

if curl -sf -o /dev/null "$VITE_URL"; then
  echo "Vite dev server already running on :5173"
else
  echo "Starting Vite dev server on :5173..."
  pnpm -C "$ROOT_DIR/Business.Translations.FrontEnd" run dev &
  VITE_PID=$!
  until curl -sf -o /dev/null "$VITE_URL"; do
    sleep 1
  done
fi

pnpm run test
