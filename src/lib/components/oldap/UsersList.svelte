<script lang="ts">

import Table from '$lib/components/basic_gui/table/Table.svelte';
import type { OldapUser } from '$lib/oldap/classes/user';
import type { OldapProject } from '$lib/oldap/classes/project';
import { api_get_config } from '$lib/helpers/api_config';
import { apiClient } from '$lib/shared/apiClient';
import Checkbox from '$lib/components/basic_gui/checkbox/Checkbox.svelte';
import Button from '$lib/components/basic_gui/buttons/Button.svelte';
import * as m from '$lib/paraglide/messages.js';
import TableHeader from '$lib/components/basic_gui/table/TableHeader.svelte';
import TableBody from '$lib/components/basic_gui/table/TableBody.svelte';
import TableRow from '$lib/components/basic_gui/table/TableRow.svelte';
import TableItem from '$lib/components/basic_gui/table/TableItem.svelte';
import Toggle from '$lib/components/basic_gui/buttons/Toggle.svelte';

let { table_height, administrator, project } : {table_height: number, administrator: OldapUser | null, project: OldapProject | null} = $props();

let ulist = {};

if (administrator && project) {
	if (administrator.isRoot) {
		let usersearch = api_get_config(authinfo, { inProject: project?.projectIri?.toString() });
		apiClient.getAdminusersearch(usersearch)

	}
}

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
			<span><Checkbox label="Show all users" position="left"/></span>
		{/if}
		<span><Button>{m.add_user()}</Button></span>
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
				YYY
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