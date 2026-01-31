<script lang="ts">

	import { OldapUser } from '$lib/oldap/classes/user';
	import type { OldapProject } from '$lib/oldap/classes/project';
	import { getLocale } from '$lib/paraglide/runtime';
	import { convertToLanguage, Language } from '$lib/oldap/enums/language';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { OldapRole } from '$lib/oldap/classes/role';
	import Confirmation from '$lib/components/basic_gui/dialogs/Confirmation.svelte';
	import { refreshRolesList, refreshRolesListNow } from '$lib/stores/refresh_roleslist.svelte.js';
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
	import { Pencil, Plus, Trash2 } from '@lucide/svelte';
	import Table from '$lib/components/basic_gui/table/Table.svelte';
	import TableColumnTitle from '$lib/components/basic_gui/table/TableColumnTitle.svelte';
	import TableHeader from '$lib/components/basic_gui/table/TableHeader.svelte';
	import TableBody from '$lib/components/basic_gui/table/TableBody.svelte';
	import Tooltip from '$lib/components/basic_gui/tooltip/Tooltip.svelte';

	let { table_height, administrator = null, project = null }: {
		table_height: number,
		administrator: OldapUser | null,
		project: OldapProject | null
	} = $props();

	let lang = $state(getLocale());
	let langobj = $derived(convertToLanguage(lang) ?? Language.EN);

	let authinfo = $state<AuthInfo | null>($authInfoStore);
	let roles = $state<Record<string, OldapRole>>({});
	let role_list = $state<string[]>([]);
	let role_in_use = $state<Record<string, boolean>>({});
	let role_projs = $state<Record<string, URLSearchParams>>({});
	let show_all_roles = $state(false);

	let confirmation_dialog: Confirmation;
	let confirmation_title = $state('');
	let confirmation_text = $state('');

	const params = new URLSearchParams({ tab: 'roles' });

	authInfoStore.subscribe(data => {
		authinfo = data;
	});

	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const _ = $refreshRolesList;
		role_list = [];
		if (authinfo) {
			let rolesearch = api_get_config(authinfo);
			if (!show_all_roles) {
				rolesearch = { ...rolesearch, queries: { definedByProject: project?.projectIri?.toString() } };
			}
			apiClient.getAdminrolesearch(rolesearch).then((psdata) => {
				roles = {} as Record<string, OldapRole>;
				const promises = psdata.map(hl => {
					const config_plistdata = api_get_config(authinfo as AuthInfo, { iri: hl });
					return apiClient.getAdminroleget(config_plistdata);
				});
				Promise.all(promises).then((results) => {
					results.forEach((roledata) => {
						console.log("----->", roledata)
						const role = OldapRole.fromOldapJson(roledata);
						console.log("****>", role);
						const roleid = role.roleId.toString();
						roles[roleid] = role;
						role_list.push(roleid);
						role_projs[roleid] = new URLSearchParams({ projectid: role.definedByProject.toString() || 'XXX' });

						const config_role_in_use = api_config(authinfo as AuthInfo, {
							definedByProject: encodeURIComponent(role.definedByProject.toString()),
							roleId: roleid
						});
						apiClient.getAdminroleDefinedByProjectRoleIdin_use(config_role_in_use).then((result2) => {
							role_in_use[roleid] = result2['in_use'] === undefined ? false : result2['in_use'];
						});
					});
					role_list = role_list.sort((a, b) => a.localeCompare(b));
				}).catch((err) => {
					errorInfoStore.set(process_api_error(err as Error));
				});
			}).catch((error) => {
				errorInfoStore.set(process_api_error(error as Error));
			});
		}
	});

	const delete_role = async (role_id: string) => {
		confirmation_title = m.delete_role();
		confirmation_text = m.delete_role_2({roleid: role_id});
		const ok = await confirmation_dialog.open();
		if (!ok) {
			return;
		}
		const config_role_delete = api_config(authinfo as AuthInfo, {
			definedByProject: encodeURIComponent(roles[role_id].definedByProject.toString()),
			permissionSetId: role_id
		});
		console.log(config_role_delete);
		apiClient.deleteAdminroleDefinedByProjectRoleId(undefined, config_role_delete).then((res) => {
			console.log(res);
			refreshRolesListNow();
		}).catch((error) => {
			errorInfoStore.set(process_api_error(error as Error));
		});
	};

	let headers: string[] = $state([
		m.role_iri(),
		m.role_id(),
		m.label(),
		m.project(),
		m.action()]);

</script>

{#snippet actions()}
	<div class="flex flex-row items-center justify-end gap-4">
		{#if administrator?.isRoot}
			<span><Checkbox label={m.show_all_roles()} position="left" bind:checked={show_all_roles} /></span>
		{/if}
		<!--<span><Button class="text-xs" onclick={goto_page("/admin/permset")}>ADD PERMSET</Button></span>-->
		<Tooltip text={m.add_role()}>
			<Button round={true} class="text-xs" onclick={goto_page("/admin/role")}>
				<Plus size="16" strokeWidth="1" />
			</Button>
		</Tooltip>

	</div>
{/snippet}

<Table height={table_height} title={m.roles_title()}
			 description={m.roles_descr()}
			 action_elements={actions}>
	<TableHeader>
		{#each headers as header}
			<TableColumnTitle>{header}</TableColumnTitle>
		{/each}
	</TableHeader>
	<TableBody>
		{#each role_list as role_id}
			<TableRow>
				<TableItem>{roles[role_id].roleIriAsString}</TableItem>
				<TableItem>{role_id}</TableItem>
				<TableItem>{roles[role_id].label?.get(langobj)}</TableItem>
				<TableItem>{roles[role_id].definedByProject.toString()}</TableItem>
				<TableItem>
					<div class="flex flex-row items-center justify-left gap-2">
						<Button round={true} onclick={goto_page(`/admin/role/${role_id}?${role_projs[role_id]}`)}>
							<Pencil size="16" strokeWidth="1" />
						</Button>
						<Button round={true} onclick={() => delete_role(role_id)}  disabled={role_in_use[role_id]}>
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
