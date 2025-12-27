/*
 * Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
 */

// $lib/config.ts
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
		configPromise = fetchFn('/config.json')
			.then((res) => {
				if (!res.ok) {
					throw new Error(`Failed to load config.json: ${res.status}`);
				}
				return res.json();
			});
	}
	return configPromise;
}

export async function getConfigValue<T = unknown>(key: string): Promise<T | undefined> {
	const config = await getConfig(fetch);
	return config[key] as T | undefined;
}