#!/usr/bin/env bash
# Refresh Mostar flights: fetch from API, save to MongoDB, update Redis cache.
#
# Local:  ./scripts/refresh-mostar.sh   (or bash scripts/refresh-mostar.sh)
# Docker: docker compose exec backend node dist/scripts/scrape-mostar.js

set -e
cd "$(dirname "$0")/.."
npm run scrape:mostar
