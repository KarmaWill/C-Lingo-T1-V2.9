#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

PORT="${PORT:-4173}"
HOST="${HOST:-0.0.0.0}"
DEPLOY_DIR=".deploy"
PID_FILE="$DEPLOY_DIR/preview-lan.pid"
LOG_FILE="$DEPLOY_DIR/preview-lan.log"

mkdir -p "$DEPLOY_DIR"

if [ -f "$PID_FILE" ]; then
  EXISTING_PID="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [ -n "${EXISTING_PID:-}" ] && kill -0 "$EXISTING_PID" 2>/dev/null; then
    echo "Preview server is already running (PID: $EXISTING_PID)."
    echo "Stop it first: npm run deploy:lan:stop"
    exit 0
  fi
  rm -f "$PID_FILE"
fi

echo "Building project..."
npm run build

echo "Starting LAN preview server in background..."
nohup npm run preview -- --host "$HOST" --port "$PORT" >"$LOG_FILE" 2>&1 &
NEW_PID=$!
echo "$NEW_PID" >"$PID_FILE"

sleep 2
if ! kill -0 "$NEW_PID" 2>/dev/null; then
  echo "Failed to start preview server. See log: $LOG_FILE"
  exit 1
fi

LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
if [ -z "$LAN_IP" ]; then
  LAN_IP="$(ifconfig | awk '/inet / && $2 != "127.0.0.1" {print $2; exit}')"
fi

echo "Preview server started (PID: $NEW_PID)"
echo "Local URL: http://localhost:$PORT"
if [ -n "$LAN_IP" ]; then
  echo "LAN URL:   http://$LAN_IP:$PORT"
else
  echo "LAN URL:   http://<your-local-ip>:$PORT"
fi
echo "Log file:  $LOG_FILE"
