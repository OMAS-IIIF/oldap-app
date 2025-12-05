# OLDAP APP

## Notes

In order to add information about the api's such as the OLDAP api, the IIIF server or the upload server, a
`config.json`-file must be generated that contains all the necessary information. This file will reside in the
`static`-folder and is being load when the ZODIOS apiClient is first used
the following steps must be followed. 

1. Add in `static/` a file called `config.json` with the following content (change the values according to Your
   configuration:
   ```json
   {
      "apiUrl": "http://127.0.0.1:8000",
      "iiifUrl": "http://localhost:8182/iiif/",
      "uploadUrl": "http://localhost:8080/upload"
   }
   ```
   This file set's a default if everything else fails. It should be overwritten by the docker container.

2. In `src/lib`, add  a `config.ts` with the following content:
   ```ts
    export type AppConfig = {
        apiUrl: string;
        iiifUrl?: string;
        uploadUrl?: string;
        //mapDefaultCenter?: [number, number];
        //featureFlags?: Record<string, boolean>;
        [key: string]: unknown;
    };

    let configPromise: Promise<AppConfig> | null = null;

    export function getConfig(fetchFn: typeof fetch): Promise<AppConfig> {
        if (!configPromise) {
            configPromise = fetchFn('/config.json').then((res) => {
                if (!res.ok) {
                    throw new Error(`Failed to load config.json: ${res.status}`);
                }
                return res.json();
            });
        }
        return configPromise;
    }

    export async function getConfigValue<T = unknown>(key: string): Promise<T | undefined> {
        const config = await getConfig();
        return config[key] as T | undefined;
    }
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

    # Write runtime config.json (the frontend will fetch this at /config.json)
    cat > /app/build/client/config.json <<EOF
    {
      "apiUrl": "$API_URL"
      "iiifUrl": "$IIIF_URL"
      "uploadUrl": $UPLOAD_URL"
    }
    EOF

   # Start the SvelteKit Node adapter server
   exec node build
   ```

4. The docker start command must give the API_URL:
   ```bash
   docker run --rm -it -e API_URL=http://127.0.0.1:8000 -p 3000:3000 oldap-app
   ```
   
5. The frontend will now fetch the config.json from the server. The parameters can be accessed as follows:
    ```sveltehtml
    import type { PageData } from './$types';

    let {
      children,
      data
	}: {
      children: Snippet,
      data: PageData
   } = $props();

    onMount(async () => {
      // Automatisches Login für unbekannten Benutzer beim Anwendungsstart
      if (!$userStore && !$authInfoStore) {
        await loginUnknownUser();
      }
      console.log(data.config);
    });
    ```
   `data.config.apiUrl` will return `http://127.0.0.1:8000` etc.
   Alternative: Use the `getConfigValue` function to get the config value.