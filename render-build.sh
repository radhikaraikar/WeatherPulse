#!/usr/bin/env bash
# Render Build Script for WeatherPulse India
# Installs dependencies and runs database migrations

echo "=== Installing root dependencies ==="
npm install

echo "=== Installing report-service dependencies ==="
cd services/report-service && npm install && cd ../..

echo "=== Running database migrations ==="
node deploy/postgres/run_migrations.js || echo "Migration warning: some migrations may have already been applied"

echo "=== Build complete ==="
