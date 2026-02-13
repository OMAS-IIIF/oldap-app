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
	import type { PageData } from './$types';

	let {
		children,
		data
	}: {
		children: Snippet,
		data: PageData
	} = $props();

	onMount(async () => {
		// changing the locale if necessary...
		localeStore.set(getLocale());
		afterNavigate(() => {
			localeStore.set(getLocale());
		});

		// Automatisches Login für unbekannten Benutzer beim Anwendungsstart
		if (!$userStore && !$authInfoStore) {
			await loginUnknownUser();
		}
	});

	authInfoStore.subscribe((authinfo: AuthInfo | null) => {
		if (authinfo && authinfo.userid !== 'unknown') {
			const dmlist = ['oldap', 'shared']
			const promises = dmlist.map(dm => {
				const dm_config = api_config(authinfo, { project: dm });
				return apiClient.getAdmindatamodelProject(dm_config)
			});

			Promise.all(promises).then((results) => {
				results.forEach((dmdata) => {
					const dm = DatamodelClass.fromOldapJson(dmdata);
					if (dm.projectid.toString() === 'oldap') {
						datamodelOldapStore.set(dm);
					}
					else if (dm.projectid.toString() === 'shared') {
						console.log('datamodelSharedStore:', dm);
						datamodelSharedStore.set(dm);
					}
				});
			}).catch((error) => {
				errorInfoStore.set(process_api_error(error as Error));
			});
		}
	})

</script>

{#key $localeStore}
	<MainWin>{@render children()}</MainWin>
{/key}