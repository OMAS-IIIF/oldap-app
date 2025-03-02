<script lang="ts">

import Table from '$lib/components/basic_gui/table/Table.svelte';
import type { OldapUser } from '$lib/oldap/classes/user';
import type { OldapProject } from '$lib/oldap/classes/project';
import { api_config, api_get_config } from '$lib/helpers/api_config';
import { apiClient } from '$lib/shared/apiClient';
import Checkbox from '$lib/components/basic_gui/checkbox/Checkbox.svelte';
import Button from '$lib/components/basic_gui/buttons/Button.svelte';
import * as m from '$lib/paraglide/messages.js';
import TableHeader from '$lib/components/basic_gui/table/TableHeader.svelte';
import TableBody from '$lib/components/basic_gui/table/TableBody.svelte';
import TableRow from '$lib/components/basic_gui/table/TableRow.svelte';
import TableItem from '$lib/components/basic_gui/table/TableItem.svelte';
import Toggle from '$lib/components/basic_gui/buttons/Toggle.svelte';
import { AuthInfo } from '$lib/oldap/classes/authinfo';
import { onMount } from 'svelte';

let { table_height, administrator, project } : {
	table_height: number,
	administrator: OldapUser,
	project: OldapProject} = $props();

let show_all_users = $state(false);

let authinfo: AuthInfo;


onMount(() => {
	authinfo = AuthInfo.fromString(sessionStorage.getItem('authinfo'));
});

$effect(() => {
	if (administrator && project && authinfo) {
		let usersearch = api_get_config(authinfo);
		if (!show_all_users) {
			usersearch = {...usersearch, queries: {inProject: project?.projectIri?.toString()} };
		}
		apiClient.getAdminusersearch(usersearch).then((iris) => {
			iris.forEach((x) => {
				const config_userdata = api_config(authinfo, undefined, {iri: x});
				apiClient.getAdminuserget(config_userdata).then((userdata) => {

				});
			});
		});

	}
});



let headers: string[] = $state([
	'User ID',
	'Family name',
	'Given name',
	'Email',
	'Active',
	'Action'])

</script>

{#snippet actions()}
	<div class="flex flex-row items-center justify-end gap-4">
		{#if administrator?.isRoot}
			<span><Checkbox label="Show all users" position="left" bind:checked={show_all_users}/></span>
		{/if}
		<span><Button innerClass="text-xs">{m.add_user()}</Button></span>
	</div>
{/snippet}

<Table height={table_height} title={m.users()}
			 description={m.userlist_descr()}
			 action_elements={actions}>
	<TableHeader {headers}></TableHeader>
	<TableBody>
		<TableRow>
			<TableItem>rosenth</TableItem>
			<TableItem>Rosenthaler</TableItem>
			<TableItem>Lukas</TableItem>
			<TableItem>lukas.rosenthaler@unibas.ch</TableItem>
			<TableItem><Toggle /></TableItem>
			<TableItem>
				<div class="flex flex-row items-center justify-left gap-2">
				<Button round={true}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
						<path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
					</svg>
				</Button>
				<Button round={true}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
						<path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
					</svg>
				</Button>
				</div>
			</TableItem>
		</TableRow>

		<TableRow>
			<TableItem>rosenth</TableItem>
			<TableItem>Rosenthaler</TableItem>
			<TableItem>Lukas</TableItem>
			<TableItem>lukas.rosenthaler@unibas.ch</TableItem>
			<TableItem>XXX</TableItem>
			<TableItem>YYY</TableItem>
		</TableRow>

		<TableRow>
			<TableItem>rosenth</TableItem>
			<TableItem>Rosenthaler</TableItem>
			<TableItem>Lukas</TableItem>
			<TableItem>lukas.rosenthaler@unibas.ch</TableItem>
			<TableItem>XXX</TableItem>
			<TableItem>YYY</TableItem>
		</TableRow>

		<TableRow>
			<TableItem>rosenth</TableItem>
			<TableItem>Rosenthaler</TableItem>
			<TableItem>Lukas</TableItem>
			<TableItem>lukas.rosenthaler@unibas.ch</TableItem>
			<TableItem>XXX</TableItem>
			<TableItem>YYY</TableItem>
		</TableRow>

		<TableRow>
			<TableItem>rosenth</TableItem>
			<TableItem>Rosenthaler</TableItem>
			<TableItem>Lukas</TableItem>
			<TableItem>lukas.rosenthaler@unibas.ch</TableItem>
			<TableItem>XXX</TableItem>
			<TableItem>YYY</TableItem>
		</TableRow>

		<TableRow>
			<TableItem>rosenth</TableItem>
			<TableItem>Rosenthaler</TableItem>
			<TableItem>Lukas</TableItem>
			<TableItem>lukas.rosenthaler@unibas.ch</TableItem>
			<TableItem>XXX</TableItem>
			<TableItem>YYY</TableItem>
		</TableRow>

	</TableBody>
</Table>