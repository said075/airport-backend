#!/usr/bin/env bash
# Refresh Banja Luka flights: fetch from BNX API, save to MongoDB, update Redis cache.
#
# Local:  ./scripts/refresh-banjaluka.sh   (or bash scripts/refresh-banjaluka.sh)
# Docker: docker compose exec backend node dist/scripts/scrape-banjaluka.js

set -e
cd "$(dirname "$0")/.."
npm run scrape:banjaluka
