import {
	currentAuthInfo,
	expireAuthenticatedSession,
	hasRefreshableSession,
	refreshAccessToken
} from '$lib/auth/accessToken';
import { retryOnceAfterUnauthorized } from '$lib/auth/retryOnce';

function withCurrentBearer(init: RequestInit): RequestInit {
	const headers = new Headers(init.headers);
	const authorization = headers.get('Authorization');
	const token = currentAuthInfo()?.token;
	if (token && authorization?.startsWith('Bearer '))
		headers.set('Authorization', `Bearer ${token}`);
	return { ...init, headers };
}

/**
 * Fetch with the current in-memory Bearer token and one cookie-backed retry on 401.
 * The resource request retains its original credentials policy; only refresh sends cookies.
 */
export async function authenticatedFetch(
	input: RequestInfo | URL,
	init: RequestInit = {}
): Promise<Response> {
	return retryOnceAfterUnauthorized({
		request: () => fetch(input, withCurrentBearer(init)),
		isUnauthorized: (response) => response.status === 401,
		canRefresh: hasRefreshableSession,
		refresh: refreshAccessToken,
		onRefreshFailure: expireAuthenticatedSession
	});
}
