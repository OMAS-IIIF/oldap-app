#!/bin/sh
#
# Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
#
set -e

API_URL="${1:-${API_URL:-http://localhost:8000}}"

# Debug logging
echo "[entrypoint] Starting oldap-app..."
echo "[entrypoint] Using API_URL=${API_URL}"

# Write runtime config.json (the frontend will fetch this at /config.json)
cat > /app/build/client/config.json <<EOF
{
  "apiUrl": "$API_URL"
}
EOF

# Start the SvelteKit Node adapter server
exec node build
