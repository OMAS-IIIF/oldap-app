<script lang="ts">
	import '../app.css';
	import MainWin from '$lib/components/oldap/MainWin.svelte';
	import { userStore } from '$lib/stores/user';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { afterNavigate } from '$app/navigation';
	import { localeStore } from '$lib/stores/locale';
	import { getLocale } from '$lib/paraglide/runtime.js';
	import { onMount, type Snippet } from 'svelte';
	import { loginUnknownUser } from '$lib/helpers/login_unknown_user';
	import { api_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import { DatamodelClass } from '$lib/oldap/classes/datamodel';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { datamodelOldapStore } from '$lib/stores/datamodel_oldap';
	import { datamodelSharedStore } from '$lib/stores/datamodel_shared';
	import { restoreAuthenticatedSession } from '$lib/auth/session';
	import { AUTH_SESSION_EXPIRED_EVENT } from '$lib/auth/accessToken';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let { children }: { children: Snippet } = $props();

	onMount(() => {
		// changing the locale if necessary...
		localeStore.set(getLocale());
		afterNavigate(() => {
			localeStore.set(getLocale());
		});

		const handleExpiredSession = () => {
			void goto(resolve('/')).then(() => loginUnknownUser());
		};
		window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleExpiredSession);

		// Restore a named session from its HttpOnly cookie before falling back to anonymous access.
		void (async () => {
			if (!$userStore && !$authInfoStore) {
				const restored = await restoreAuthenticatedSession();
				if (!restored) await loginUnknownUser();
			}
		})();

		return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleExpiredSession);
	});

	authInfoStore.subscribe((authinfo: AuthInfo | null) => {
		if (authinfo && authinfo.userid !== 'unknown') {
			const dmlist = ['oldap', 'shared'];
			const promises = dmlist.map((dm) => {
				const dm_config = api_config(authinfo, { project: dm });
				return apiClient.getAdmindatamodelProject(dm_config);
			});

			Promise.all(promises)
				.then((results) => {
					results.forEach((dmdata) => {
						const dm = DatamodelClass.fromOldapJson(dmdata);
						if (dm.projectid.toString() === 'oldap') {
							datamodelOldapStore.set(dm);
						} else if (dm.projectid.toString() === 'shared') {
							datamodelSharedStore.set(dm);
						}
					});
				})
				.catch((error) => {
					errorInfoStore.set(process_api_error(error as Error));
				});
		}
	});
</script>

{#key $localeStore}
	<MainWin>{@render children()}</MainWin>
{/key}
