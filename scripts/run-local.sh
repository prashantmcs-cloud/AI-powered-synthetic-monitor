#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
npm install
npm test
npm run dev:webhook > /tmp/ai-synthetic-webhook.log 2>&1 &
npm run dev:web > /tmp/ai-synthetic-ui.log 2>&1 &
echo "Webhook receiver running on http://localhost:3000"
echo "Web UI running on http://localhost:3000"
