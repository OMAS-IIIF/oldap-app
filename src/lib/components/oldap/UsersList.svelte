<script lang="ts">

import Table from '$lib/components/basic_gui/table/Table.svelte';
import type { OldapUser } from '$lib/oldap/classes/user';
import type { OldapProject } from '$lib/oldap/classes/project';
import { api_get_config } from '$lib/helpers/api_config';
import { apiClient } from '$lib/shared/apiClient';
import Checkbox from '$lib/components/basic_gui/checkbox/Checkbox.svelte';
import Button from '$lib/components/basic_gui/buttons/Button.svelte';
import * as m from '$lib/paraglide/messages.js';

let { table_height, administrator, project } : {table_height: number, administrator: OldapUser | null, project: OldapProject | null} = $props();

let ulist = {};

if (administrator && project) {
	if (administrator.isRoot) {
		let usersearch = api_get_config(authinfo, { inProject: project?.projectIri?.toString() });
		apiClient.getAdminusersearch(usersearch)

	}
}


</script>

<Table height={table_height} title={m.users()}>
	<div class="flex flex-row items-center justify-end gap-4">
		{#if administrator?.isRoot}
			<span><Checkbox label="Show all users" position="left"/></span>
		{/if}
		<span><Button>Add user</Button></span>
	</div>

</Table>