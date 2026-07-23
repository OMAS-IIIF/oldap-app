import { browser } from '$app/environment';
import { env as publicEnv } from '$env/dynamic/public';

function stripTrailingSlash(url: string): string {
	return url.replace(/\/+$/, '');
}

function getServerEnv(name: string): string | undefined {
	// Shared modules cannot import private SvelteKit environment values in the browser bundle.
	const processLike = (
		globalThis as typeof globalThis & {
			process?: { env?: Record<string, string | undefined> };
		}
	).process;
	return processLike?.env?.[name];
}

/** Resolve the OLDAP API origin for browser and server-side requests. */
export async function getApiBaseUrl(): Promise<string> {
	if (browser) {
		if (!publicEnv.PUBLIC_API_URL) throw new Error('PUBLIC_API_URL is not set');
		return stripTrailingSlash(publicEnv.PUBLIC_API_URL);
	}

	const url = getServerEnv('SERVER_API_URL') ?? publicEnv.PUBLIC_API_URL;
	if (!url) throw new Error('SERVER_API_URL (or PUBLIC_API_URL fallback) is not set on the server');
	return stripTrailingSlash(url);
}
