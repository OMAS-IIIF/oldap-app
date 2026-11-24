/**
 * IMPORTANT:
 * - API base URL MUST come from env vars:
 *   - Browser: PUBLIC_API_URL
 *   - SSR:     SERVER_API_URL
 * - Do NOT read apiUrl from config.json
 * - Do NOT use import.meta.env.VITE_* for runtime URLs
 */

import * as sdk from '#lib/apischema/generated/sdk.gen.ts';
import { createClient, type Client } from '#lib/apischema/generated/client/index.ts';
import { browser } from '$app/env';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
	currentAuthInfo,
	expireAuthenticatedSession,
	hasRefreshableSession,
	refreshAccessToken
} from '#lib/auth/accessToken.ts';
import { getApiBaseUrl } from '#lib/shared/apiBaseUrl.ts';

type Sdk = typeof sdk;
/** The application receives validated response bodies and rejects HTTP failures. */
export type ApiClient = {
	[K in keyof Sdk]: (
		options: Omit<Parameters<Sdk[K]>[0], 'client' | 'throwOnError'>
	) => Promise<Exclude<Awaited<ReturnType<Sdk[K]>>['data'], undefined>>;
};

let clientPromise: Promise<ApiClient> | null = null;

export { getApiBaseUrl } from '#lib/shared/apiBaseUrl.ts';

function isAuthenticationEndpoint(url: string | undefined, baseURL: string): boolean {
	if (!url) return false;
	const basePath = new URL(baseURL).pathname.replace(/\/$/, '');
	return new URL(url, baseURL).pathname.startsWith(`${basePath}/admin/auth/`);
}

function installBrowserAuthentication(client: Client): void {
	if (!browser) return;

	client.instance.defaults.withCredentials = true;
	client.instance.interceptors.request.use((config) => {
		const authorization = config.headers.get('Authorization');
		const token = currentAuthInfo()?.token;
		if (token && typeof authorization === 'string' && authorization.startsWith('Bearer ')) {
			config.headers.set('Authorization', `Bearer ${token}`);
		}
		return config;
	});

	client.instance.interceptors.response.use(undefined, async (error: unknown) => {
		const axiosError = error as AxiosError;
		const config = axiosError.config as
			(InternalAxiosRequestConfig & { _oldapAuthRetry?: boolean }) | undefined;
		if (
			axiosError.response?.status !== 401 ||
			!config ||
			config._oldapAuthRetry ||
			isAuthenticationEndpoint(config.url, client.getConfig().baseURL || 'http://localhost') ||
			!hasRefreshableSession()
		) {
			return Promise.reject(error);
		}

		config._oldapAuthRetry = true;
		try {
			const token = await refreshAccessToken();
			config.headers?.set('Authorization', `Bearer ${token}`);
			return client.instance.request(config);
		} catch {
			expireAuthenticatedSession();
			return Promise.reject(error);
		}
	});
}

/**
 * Bind the generated SDK to one transport instance. Requests and responses are
 * validated by the generated Zod 4 validators; Axios retains error identity and
 * the browser's single-refresh, single-retry authentication behavior.
 */
export function createApiClient(baseURL: string): ApiClient {
	const client = createClient({
		baseURL,
		throwOnError: true,
		// OLDAP accepts Axios-style bracketed arrays (includeProperties[], sortBy[]).
		// Setting this delegates query serialization to Axios rather than Hey API.
		paramsSerializer: { indexes: false }
	});
	installBrowserAuthentication(client);
	return new Proxy({} as ApiClient, {
		get(_, property: string) {
			if (!(property in sdk)) return undefined;
			return async (options: Record<string, unknown>) => {
				// SDK operations have different input types; the mapped public
				// interface preserves them, while dispatch only injects transport.
				const operation = sdk[property as keyof Sdk] as unknown as (
					options: Record<string, unknown>
				) => Promise<{ data: unknown }>;
				const response = await operation({ ...options, client, throwOnError: true });
				return response.data;
			};
		}
	});
}

/** Resolve browser/server environment configuration before the first API call. */
async function getClient(): Promise<ApiClient> {
	if (!clientPromise) clientPromise = getApiBaseUrl().then(createApiClient);
	return clientPromise;
}

export const apiClient: ApiClient = new Proxy({} as ApiClient, {
	get(_, property: string) {
		if (!(property in sdk)) return undefined;
		return async (options: Record<string, unknown>) => {
			const client = await getClient();
			const operation = client[property as keyof ApiClient] as (
				options: Record<string, unknown>
			) => Promise<unknown>;
			return operation(options);
		};
	}
});
