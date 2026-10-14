#!/usr/bin/env bash
set -euo pipefail

# Resolve the app root independently of the caller's working directory.
cd "$(dirname "${BASH_SOURCE[0]}")/.."

npm ci --no-audit --no-fund
npm run check
npm run build

# Do not run db:push here: merging code must not silently alter stored leads.
# Workflow reconciliation restarts the application after this script succeeds.
