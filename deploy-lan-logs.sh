#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

LOG_FILE=".deploy/preview-lan.log"

if [ ! -f "$LOG_FILE" ]; then
  echo "Log file not found: $LOG_FILE"
  echo "Start service first: npm run deploy:lan:start"
  exit 1
fi

echo "Showing logs: $LOG_FILE"
echo "Press Ctrl+C to stop following logs."
tail -n 120 -f "$LOG_FILE"
