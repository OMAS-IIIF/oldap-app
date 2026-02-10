
/**
 * IMPORTANT:
 * - API base URL MUST come from env vars:
 *   - Browser: PUBLIC_API_URL
 *   - SSR:     SERVER_API_URL
 * - Do NOT read apiUrl from config.json
 * - Do NOT use import.meta.env.VITE_* for runtime URLs
 */

import { createApiClient } from '$lib/apischema/zod';
import { browser } from '$app/environment';
import { PUBLIC_API_URL } from '$env/static/public';

type ApiClient = ReturnType<typeof createApiClient>;

let clientPromise: Promise<ApiClient> | null = null;

function stripTrailingSlash(url: string) {
	return url.replace(/\/+$/, '');
}

function getServerEnv(name: string): string | undefined {
	// Avoid importing $env/static/private in shared modules; read from process.env at runtime on the server.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const p = (globalThis as any).process;
	return p?.env?.[name] as string | undefined;
}

async function getBaseUrl(): Promise<string> {
	// Browser: use PUBLIC_API_URL (available client-side)
	if (browser) {
		if (!PUBLIC_API_URL) {
			throw new Error('PUBLIC_API_URL is not set');
		}
		return stripTrailingSlash(PUBLIC_API_URL);
	}

	// Server/SSR: read SERVER_API_URL from process.env (available at runtime in Node)
	const serverUrl = getServerEnv('SERVER_API_URL');
	const url = serverUrl ?? PUBLIC_API_URL;
	if (!url) {
		throw new Error('SERVER_API_URL (or PUBLIC_API_URL fallback) is not set on the server');
	}
	return stripTrailingSlash(url);
}

async function getClient(): Promise<ApiClient> {
	if (!clientPromise) {
		clientPromise = getBaseUrl().then((baseUrl) => createApiClient(baseUrl));
	}
	return clientPromise;
}

type AsyncApiClient = {
	[K in keyof ApiClient]: ApiClient[K] extends (...args: infer A) => infer R
		? (...args: A) => Promise<Awaited<R>>
		: never;
};

export const apiClient: AsyncApiClient = new Proxy({} as any, {
	get(_, prop: string) {
		return async (...args: any[]) => {
			const client = await getClient();
			const fn = (client as any)[prop];
			if (typeof fn !== 'function') {
				throw new Error(`${prop} is not a function on ApiClient`);
			}
			return fn(...args);
		};
	}
});