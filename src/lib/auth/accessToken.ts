import { browser } from '$app/environment';
import { get } from 'svelte/store';

import { SingleFlight } from '$lib/auth/singleFlight';
import { AuthInfo } from '$lib/oldap/classes/authinfo';
import { getApiBaseUrl } from '$lib/shared/apiBaseUrl';
import { authInfoStore } from '$lib/stores/authinfo';
import { userStore } from '$lib/stores/user';

export const AUTH_SESSION_EXPIRED_EVENT = 'oldap:auth-session-expired';

type AccessTokenResponse = {
	accessToken: string;
};

const refreshFlight = new SingleFlight<string>();

function userIdFromAccessToken(token: string): string {
	const payloadPart = token.split('.')[1];
	if (!payloadPart) throw new Error('The access token has no valid user identity.');

	const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
	const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
	const payload = JSON.parse(atob(padded)) as { sub?: unknown };
	if (typeof payload.sub !== 'string' || !payload.sub.trim()) {
		throw new Error('The access token has no valid user identity.');
	}
	return payload.sub;
}

/** Return the current in-memory authentication state. */
export function currentAuthInfo(): AuthInfo | null {
	return get(authInfoStore);
}

/** Replace the in-memory access token while preserving the authenticated identity. */
export function setAccessToken(token: string, userId?: string): AuthInfo {
	const auth = new AuthInfo(
		userId ?? currentAuthInfo()?.userid ?? userIdFromAccessToken(token),
		token
	);
	authInfoStore.set(auth);
	return auth;
}

/** Whether an automatic cookie-backed refresh is meaningful for the current session. */
export function hasRefreshableSession(): boolean {
	const userId = currentAuthInfo()?.userid.trim().toLowerCase();
	return Boolean(userId && userId !== 'unknown');
}

/**
 * Obtain a new access token through the HttpOnly refresh cookie.
 * Concurrent callers share one request and JavaScript never reads the cookie itself.
 */
export function refreshAccessToken(): Promise<string> {
	if (!browser)
		return Promise.reject(new Error('Access-token refresh is only available in the browser.'));

	return refreshFlight.run(async () => {
		const baseUrl = await getApiBaseUrl();
		const response = await fetch(`${baseUrl}/admin/auth/refresh`, {
			method: 'POST',
			credentials: 'include',
			headers: { Accept: 'application/json' }
		});
		if (!response.ok) throw new Error(`Session refresh failed (HTTP ${response.status}).`);

		const data = (await response.json()) as Partial<AccessTokenResponse>;
		if (!data.accessToken) throw new Error('Session refresh returned no access token.');
		setAccessToken(data.accessToken);
		return data.accessToken;
	});
}

/** Clear transient authentication state and notify the application shell. */
export function expireAuthenticatedSession(): void {
	const expiredNamedSession = hasRefreshableSession();
	authInfoStore.set(null);
	userStore.set(null);
	if (browser && expiredNamedSession) {
		window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
	}
}
