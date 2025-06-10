<script lang="ts">

	import { OldapUser } from '$lib/oldap/classes/user';
	import type { OldapProject } from '$lib/oldap/classes/project';
	import { languageTag } from '$lib/paraglide/runtime';
	import { convertToLanguage, Language } from '$lib/oldap/enums/language';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { OldapList } from '$lib/oldap/classes/list';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { OldapPermissionSet } from '$lib/oldap/classes/permissionset';
	import Confirmation from '$lib/components/basic_gui/dialogs/Confirmation.svelte';
	import { refreshPermsetsList } from '$lib/stores/refresh_permsetslist.svelte';
	import { api_get_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';

	let { table_height, administrator = null, project = null }: {
		table_height: number,
		administrator: OldapUser | null,
		project: OldapProject | null
	} = $props();

	let lang = $state(languageTag());
	let langobj = $derived(convertToLanguage(lang) ?? Language.EN);

	let authinfo = $state<AuthInfo | null>($authInfoStore);
	let permsets = $state<Record<string, OldapPermissionSet>>({});
	let permset_list = $state<string[]>([]);
	let permset_in_use = $state<Record<string, boolean>>({});

	let confirmation_dialog: Confirmation;
	let confirmation_title = $state('');
	let confirmation_text = $state('');

	authInfoStore.subscribe(data => {
		authinfo = data;
	});

	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const _ = $refreshPermsetsList;
		permset_list = [];
		if (authinfo) {
			let permsetsearch = api_get_config(authinfo, { definedByProject: project?.projectIri?.toString() || ''});
			apiClient.getAdminpermissionsetsearch(permsetsearch).then((psdata) => {
				console.log("==>", psdata);
				permsets = {} as Record<string, OldapPermissionSet>;
				const promises = psdata.map(hl => {
					const config_plistdata = api_get_config(authinfo as AuthInfo, { iri: hl });
					return apiClient.getAdminpermissionsetget(config_plistdata);
				});
				Promise.all(promises)
					.then((results) => {
						results.forEach((permsetdata) => {
							console.log("#####>", permsetdata);
							const permset = OldapPermissionSet.fromOldapJson(permsetdata);
							const permsetid = permset.permissionSetId.toString();
							permsets[permsetid] = permset;
							permset_list.push(permsetid);
						});
						permset_list = permset_list.sort((a, b) => a.localeCompare(b));
						console.log("*********>", $state.snapshot(permsets));
					})
					.catch((err) => {
						errorInfoStore.set(process_api_error(err as Error));
					});
			}).catch((error) => {
				errorInfoStore.set(process_api_error(error as Error));
			});
		}
	});

</script>

<div>
	PERMSETSLIST
</div>