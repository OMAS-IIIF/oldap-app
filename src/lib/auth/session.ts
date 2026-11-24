import { refreshAccessToken, setAccessToken } from '#lib/auth/accessToken.ts';
import { AuthInfo } from '#lib/oldap/classes/authinfo.ts';
import { OldapUser } from '#lib/oldap/classes/user.ts';
import { getApiBaseUrl } from '#lib/shared/apiBaseUrl.ts';
import { apiClient } from '#lib/shared/apiClient.ts';
import { authInfoStore } from '#lib/stores/authinfo.ts';
import { userStore } from '#lib/stores/user.ts';

function userRequestConfig(authinfo: AuthInfo) {
	return {
		path: { userId: authinfo.userid },
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${authinfo.token}`
		}
	};
}

async function loadAuthenticatedUser(authinfo: AuthInfo): Promise<OldapUser> {
	const userdata = await apiClient.getAdminUserByUserId(userRequestConfig(authinfo));
	return OldapUser.fromOldapJson(userdata);
}

/** Authenticate a named user and retain its short-lived access token in memory. */
export async function loginAuthenticatedUser(userid: string, password: string): Promise<OldapUser> {
	const authdata = await apiClient.postAdminAuthByUserId({
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json; utf-8'
		},
		path: { userId: userid },
		body: { password }
	});
	const accessToken = authdata.accessToken;
	if (!accessToken) throw new Error('The login response contained no access token.');

	const authinfo = setAccessToken(accessToken, userid);
	const user = await loadAuthenticatedUser(authinfo);
	userStore.set(user);
	return user;
}

/** Restore a named-user session after navigation or reload through the HttpOnly refresh cookie. */
export async function restoreAuthenticatedSession(): Promise<boolean> {
	try {
		const token = await refreshAccessToken();
		const authinfo = setAccessToken(token);
		const user = await loadAuthenticatedUser(authinfo);
		userStore.set(user);
		return true;
	} catch {
		clearAuthenticatedSession();
		return false;
	}
}

/** Remove the named-user session before returning to anonymous access. */
export function clearAuthenticatedSession(): void {
	authInfoStore.set(null);
	userStore.set(null);
}

/** Revoke the cookie-backed session globally and always clear transient browser state. */
export async function logoutAuthenticatedSession(): Promise<void> {
	try {
		const baseUrl = await getApiBaseUrl();
		const response = await fetch(`${baseUrl}/admin/auth/logout`, {
			method: 'POST',
			credentials: 'include',
			headers: { Accept: 'application/json' }
		});
		if (!response.ok) throw new Error(`Server-side logout failed (HTTP ${response.status}).`);
	} finally {
		clearAuthenticatedSession();
	}
}
