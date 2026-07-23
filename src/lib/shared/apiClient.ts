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
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
	currentAuthInfo,
	expireAuthenticatedSession,
	hasRefreshableSession,
	refreshAccessToken
} from '$lib/auth/accessToken';
import { getApiBaseUrl } from '$lib/shared/apiBaseUrl';

type ApiClient = ReturnType<typeof createApiClient>;

let clientPromise: Promise<ApiClient> | null = null;

export { getApiBaseUrl } from '$lib/shared/apiBaseUrl';

function isAuthenticationEndpoint(url?: string): boolean {
	return Boolean(url?.startsWith('/admin/auth/'));
}

function installBrowserAuthentication(client: ApiClient): void {
	if (!browser) return;

	client.axios.defaults.withCredentials = true;
	client.axios.interceptors.request.use((config) => {
		const authorization = config.headers.get('Authorization');
		const token = currentAuthInfo()?.token;
		if (token && typeof authorization === 'string' && authorization.startsWith('Bearer ')) {
			config.headers.set('Authorization', `Bearer ${token}`);
		}
		return config;
	});

	client.axios.interceptors.response.use(undefined, async (error: unknown) => {
		const axiosError = error as AxiosError;
		const config = axiosError.config as
			| (InternalAxiosRequestConfig & { _oldapAuthRetry?: boolean })
			| undefined;
		if (
			axiosError.response?.status !== 401 ||
			!config ||
			config._oldapAuthRetry ||
			isAuthenticationEndpoint(config.url) ||
			!hasRefreshableSession()
		) {
			return Promise.reject(error);
		}

		config._oldapAuthRetry = true;
		try {
			const token = await refreshAccessToken();
			config.headers?.set('Authorization', `Bearer ${token}`);
			return client.axios.request(config);
		} catch {
			expireAuthenticatedSession();
			return Promise.reject(error);
		}
	});
}

async function getClient(): Promise<ApiClient> {
	if (!clientPromise) {
		clientPromise = getApiBaseUrl().then((baseUrl) => {
			const client = createApiClient(baseUrl);
			installBrowserAuthentication(client);
			return client;
		});
	}
	return clientPromise;
}

type AsyncApiClient = {
	[K in keyof ApiClient]: ApiClient[K] extends (...args: infer A) => infer R
		? (...args: A) => Promise<Awaited<R>>
		: never;
};

export const apiClient: AsyncApiClient = new Proxy({} as AsyncApiClient, {
	get(_, prop: string) {
		return async (...args: unknown[]) => {
			const client = await getClient();
			const fn = (client as unknown as Record<string, unknown>)[prop];
			if (typeof fn !== 'function') {
				throw new Error(`${prop} is not a function on ApiClient`);
			}
			return Reflect.apply(fn, client, args);
		};
	}
});
