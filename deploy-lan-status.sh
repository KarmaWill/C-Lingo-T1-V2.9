#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

PORT="${PORT:-4173}"
PID_FILE=".deploy/preview-lan.pid"
LOG_FILE=".deploy/preview-lan.log"

LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
if [ -z "$LAN_IP" ]; then
  LAN_IP="$(ifconfig | awk '/inet / && $2 != "127.0.0.1" {print $2; exit}')"
fi

if [ -f "$PID_FILE" ]; then
  PID="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [ -n "${PID:-}" ] && kill -0 "$PID" 2>/dev/null; then
    echo "Status: running"
    echo "PID:    $PID"
    echo "Local:  http://localhost:$PORT"
    if [ -n "$LAN_IP" ]; then
      echo "LAN:    http://$LAN_IP:$PORT"
    else
      echo "LAN:    http://<your-local-ip>:$PORT"
    fi
    echo "Log:    $LOG_FILE"
    exit 0
  fi
fi

echo "Status: stopped"
echo "Start command: npm run deploy:lan:start"
