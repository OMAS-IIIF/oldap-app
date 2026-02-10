#!/bin/sh
set -e

# ---- Fail fast on misconfiguration ----
: "${PUBLIC_API_URL:?PUBLIC_API_URL is required}"
: "${SERVER_API_URL:?SERVER_API_URL is required}"

# Optional extras (only if you still use them)
IIIF_URL="${IIIF_URL:-}"
UPLOAD_URL="${UPLOAD_URL:-}"

# ---- Debug logging ----
echo "[entrypoint] Starting oldap-app..."
echo "[entrypoint] PUBLIC_API_URL=${PUBLIC_API_URL}"
echo "[entrypoint] SERVER_API_URL=${SERVER_API_URL}"
echo "[entrypoint] IIIF_URL=${IIIF_URL}"
echo "[entrypoint] UPLOAD_URL=${UPLOAD_URL}"

# ---- Start SvelteKit Node adapter ----
exec node build