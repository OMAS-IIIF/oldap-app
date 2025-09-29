# OLDAP APP

## Notes

In order to add the URL of thge OLDAP API, the following steps must be followed:

1. Add in `static/` a file called `config.js` with the following content:
   ```js
   window.__APP_CONFIG__ = {
      apiUrl: "http://127.0.0.1:8000" // fallback for local dev
   };
   ```
   This file set's a default if everything else fails  


2. In `src/lib`, add  a `config.ts` with the following content:
   ```ts
   import { browser } from '$app/environment';

   export const apiUrl: string =
   (browser ? window.__APP_CONFIG__?.apiUrl : undefined) ??
   import.meta.env.VITE_OLDAP_API_URL ??
   "http://127.0.0.1:8000";
   ```

3. There must be a `docker-entrypoint.sh` e.g. as follows:
   ```bash
   #!/bin/sh
   #
   # Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
   #

   set -e

   # Debug logging
   echo "[entrypoint] Starting oldap-app..."
   echo "[entrypoint] Using API_URL=${API_URL}"

   # Inject runtime config into the built frontend
   cat > /app/build/client/config.js <<EOF
   window.__APP_CONFIG__ = {
   apiUrl: "${API_URL}"
   };
   EOF

   echo "[entrypoint] Wrote /app/build/client/config.js"

   # Start the SvelteKit Node adapter server
   exec node build
   ```

4. The docker start command must give the API_URL:
   ```bash
   docker run --rm -it -e API_URL=http://127.0.0.1:8000 -p 3000:3000 oldap-app
   ```
   