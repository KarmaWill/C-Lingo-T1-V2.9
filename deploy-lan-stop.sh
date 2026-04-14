#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

PID_FILE=".deploy/preview-lan.pid"

if [ ! -f "$PID_FILE" ]; then
  echo "No PID file found. Preview server may already be stopped."
  exit 0
fi

PID="$(cat "$PID_FILE" 2>/dev/null || true)"
if [ -z "${PID:-}" ]; then
  rm -f "$PID_FILE"
  echo "PID file was empty and has been removed."
  exit 0
fi

if ! kill -0 "$PID" 2>/dev/null; then
  rm -f "$PID_FILE"
  echo "Process $PID is not running. PID file removed."
  exit 0
fi

echo "Stopping preview server (PID: $PID)..."
kill "$PID"

for _ in {1..10}; do
  if ! kill -0 "$PID" 2>/dev/null; then
    rm -f "$PID_FILE"
    echo "Preview server stopped."
    exit 0
  fi
  sleep 1
done

echo "Process is still running. Force stopping..."
kill -9 "$PID" 2>/dev/null || true
rm -f "$PID_FILE"
echo "Preview server force-stopped."
