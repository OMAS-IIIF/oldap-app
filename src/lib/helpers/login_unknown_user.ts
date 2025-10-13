/*
 * Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
 */

import { apiClient } from '$lib/shared/apiClient';
import { userStore } from '$lib/stores/user';
import { authInfoStore } from '$lib/stores/authinfo';
import { AuthInfo } from '$lib/oldap/classes/authinfo';
import { OldapUser } from '$lib/oldap/classes/user';
import { process_api_error } from './process_api_error';

export async function loginUnknownUser(): Promise<void> {
	try {
		// Login für den "unknown" Benutzer - verwende die gleiche API wie in User.svelte
		const config_auth = {
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json; utf-8',
			},
			params: { userId: 'unknown' },
		};

		const data = { password: '' }; // oder entsprechendes anonymes Passwort

		const authdata = await apiClient.postAdminauthUserId(data, config_auth);

		if (!authdata.token) {
			throw new Error("Got no token from login procedure for unknown user");
		}

		const authinfo = new AuthInfo('unknown', authdata.token);
		authInfoStore.set(authinfo);

		// Benutzerdaten laden
		const config_user = {
			params: { userId: 'unknown' },
			headers: {
				'Accept': 'application/json',
				'Authorization': 'Bearer ' + authdata.token,
			},
		};

		const userdata = await apiClient.getAdminuserUserId(config_user);
		const user = OldapUser.fromOldapJson(userdata);
		userStore.set(user);

		console.log('Anonymous user logged in successfully');

	} catch (error) {
		console.error('Failed to login anonymous user:', error);
		// Hier können Sie entscheiden, ob Sie einen Fallback setzen oder den Fehler weiterleiten möchten
		// Für jetzt setzen wir einfach null, um den ursprünglichen Zustand beizubehalten
		userStore.set(null);
		authInfoStore.set(null);
	}
}