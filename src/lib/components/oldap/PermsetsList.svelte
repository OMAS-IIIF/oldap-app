<script lang="ts">

	import { OldapUser } from '$lib/oldap/classes/user';
	import type { OldapProject } from '$lib/oldap/classes/project';
	import { languageTag } from '$lib/paraglide/runtime';
	import { convertToLanguage, Language } from '$lib/oldap/enums/language';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { OldapPermissionSet } from '$lib/oldap/classes/permissionset';
	import Confirmation from '$lib/components/basic_gui/dialogs/Confirmation.svelte';
	import { refreshPermsetsList, refreshPermsetsListNow } from '$lib/stores/refresh_permsetslist.svelte';
	import { api_config, api_get_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import { goto_page } from '$lib/helpers/goto_page';
	import * as m from '$lib/paraglide/messages';
	import Checkbox from '$lib/components/basic_gui/checkbox/Checkbox.svelte';
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';
	import TableItem from '$lib/components/basic_gui/table/TableItem.svelte';
	import TableRow from '$lib/components/basic_gui/table/TableRow.svelte';
	import { Pencil, Trash2 } from '@lucide/svelte';
	import Table from '$lib/components/basic_gui/table/Table.svelte';
	import TableColumnTitle from '$lib/components/basic_gui/table/TableColumnTitle.svelte';
	import TableHeader from '$lib/components/basic_gui/table/TableHeader.svelte';
	import TableBody from '$lib/components/basic_gui/table/TableBody.svelte';
	import { dataPermissionAsString } from '$lib/oldap/enums/data_permissions';

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
	let permset_projs = $state<Record<string, URLSearchParams>>({});
	let show_all_permsets = $state(false);

	let confirmation_dialog: Confirmation;
	let confirmation_title = $state('');
	let confirmation_text = $state('');

	const params = new URLSearchParams({ tab: 'permissions' });

	authInfoStore.subscribe(data => {
		authinfo = data;
	});

	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const _ = $refreshPermsetsList;
		permset_list = [];
		if (authinfo) {
			let permsetsearch = api_get_config(authinfo);
			if (!show_all_permsets) {
				permsetsearch = { ...permsetsearch, queries: { definedByProject: project?.projectIri?.toString() } };
			}
			apiClient.getAdminpermissionsetsearch(permsetsearch).then((psdata) => {
				permsets = {} as Record<string, OldapPermissionSet>;
				const promises = psdata.map(hl => {
					const config_plistdata = api_get_config(authinfo as AuthInfo, { iri: hl });
					return apiClient.getAdminpermissionsetget(config_plistdata);
				});
				Promise.all(promises).then((results) => {
					results.forEach((permsetdata) => {
						const permset = OldapPermissionSet.fromOldapJson(permsetdata);
						const permsetid = permset.permissionSetId.toString();
						permsets[permsetid] = permset;
						permset_list.push(permsetid);
						permset_projs[permsetid] = new URLSearchParams({ projectid: permset.definedByProject.toString() || 'XXX' });

						const config_permset_in_use = api_config(authinfo as AuthInfo, {
							definedByProject: permset.definedByProject.toString(),
							permissionSetId: permsetid
						});
						apiClient.getAdminpermissionsetDefinedByProjectPermissionSetIdin_use(config_permset_in_use).then((result2) => {
							permset_in_use[permsetid] = result2['in_use'] === undefined ? false : result2['in_use'];
						});


					});
					permset_list = permset_list.sort((a, b) => a.localeCompare(b));
				}).catch((err) => {
					errorInfoStore.set(process_api_error(err as Error));
				});
			}).catch((error) => {
				errorInfoStore.set(process_api_error(error as Error));
			});
		}
	});

	const delete_permset = async (permset_id: string) => {
		confirmation_title = m.delete_permset();
		confirmation_text = m.delete_permset_2({permsetid: permset_id});
		const ok = await confirmation_dialog.open();
		if (!ok) {
			return;
		}
		const config_permset_delete = api_config(authinfo as AuthInfo, {
			definedByProject: permsets[permset_id].definedByProject.toString(),
			permissionSetId: permset_id
		});
		apiClient.deleteAdminpermissionsetDefinedByProjectPermissionSetId(undefined, config_permset_delete).then((res) => {
			console.log(res);
			refreshPermsetsListNow();
		}).catch((error) => {
			errorInfoStore.set(process_api_error(error as Error));
		});
	};

	let headers: string[] = $state([
		m.permset_iri(),
		m.permset_id(),
		m.label(),
		m.project(),
		m.permission(),
		m.action()]);

</script>

{#snippet actions()}
	<div class="flex flex-row items-center justify-end gap-4">
		{#if administrator?.isRoot}
			<span><Checkbox label={m.show_all_permsets()} position="left" bind:checked={show_all_permsets} /></span>
		{/if}
		<span><Button class="text-xs" onclick={goto_page("/admin/permset")}>ADD PERMSET</Button></span>
	</div>
{/snippet}

<Table height={table_height} title={m.permsets_title()}
			 description={m.permsets_descr()}
			 action_elements={actions}>
	<TableHeader>
		{#each headers as header}
			<TableColumnTitle>{header}</TableColumnTitle>
		{/each}
	</TableHeader>
	<TableBody>
		{#each permset_list as permset_id}
			<TableRow>
				<TableItem>{permsets[permset_id].permissionSetIriAsString}</TableItem>
				<TableItem>{permset_id}</TableItem>
				<TableItem>{permsets[permset_id].label?.get(langobj)}</TableItem>
				<TableItem>{permsets[permset_id].definedByProject.toString()}</TableItem>
				<TableItem>{dataPermissionAsString(permsets[permset_id].givesPermission)}</TableItem>
				<TableItem>
					<div class="flex flex-row items-center justify-left gap-2">
						<Button round={true} onclick={goto_page(`/admin/permset/${permset_id}?${permset_projs[permset_id]}`)}>
							<Pencil size="16" strokeWidth="1" />
						</Button>
						<Button round={true} onclick={() => delete_permset(permset_id)}  disabled={permset_in_use[permset_id]}>
							<Trash2  size="16" strokeWidth="1" />
						</Button>
					</div>
				</TableItem>
			</TableRow>
		{/each}
	</TableBody>
</Table>

<Confirmation bind:this={confirmation_dialog} title={confirmation_title}>
	{confirmation_text}
</Confirmation>
