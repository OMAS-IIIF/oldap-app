<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import '../app.css';
	import MainWin from '$lib/components/oldap/MainWin.svelte';
	import { userStore } from '$lib/stores/user';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { onMount, type Snippet } from 'svelte';
	import { loginUnknownUser } from '$lib/helpers/login_unknown_user';
	import * as m from '$lib/paraglide/messages';
	import { api_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import { DatamodelClass } from '$lib/oldap/classes/datamodel';
	import { datamodelStore } from '$lib/stores/datamodel';
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
		// Automatisches Login für unbekannten Benutzer beim Anwendungsstart
		if (!$userStore && !$authInfoStore) {
			await loginUnknownUser();
		}
		console.log(data.config);
	});

	authInfoStore.subscribe((authinfo: AuthInfo | null) => {
		if (authinfo) {
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
						datamodelSharedStore.set(dm);
					}
				});
			}).catch((error) => {
				errorInfoStore.set(process_api_error(error as Error));
			});
		}
	})

</script>

<ParaglideJS {i18n}>
	<MainWin>{@render children()}</MainWin>
</ParaglideJS>
