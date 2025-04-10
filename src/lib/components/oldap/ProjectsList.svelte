<script lang="ts">

	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';
	import { goto } from '$app/navigation';
	import Table from '$lib/components/basic_gui/table/Table.svelte';
	import { OldapUser } from '$lib/oldap/classes/user';
	import type { OldapProject } from '$lib/oldap/classes/project';
	import TableColumnTitle from '$lib/components/basic_gui/table/TableColumnTitle.svelte';
	import TableHeader from '$lib/components/basic_gui/table/TableHeader.svelte';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { onMount } from 'svelte';

	let { table_height, administrator = $bindable() }: {
		table_height: number,
		administrator: OldapUser,
	} = $props();

	let authinfo = $state<AuthInfo>();
	let projects = $state<Record<string, OldapProject>>({});
	let project_list = $state<string[]>([]);

	onMount(() => {
		authinfo = AuthInfo.fromString(sessionStorage.getItem('authinfo'));
	});

	$effect(() => {
		project_list = []
	});

	/**
	 * Returns a function that can be used for a onclick-action to navigate to the given route
	 * @param url An URL to goto to...
	 */
	const goto_page = (url: string) => {
		return () => {
			goto(url);
		}
	}


	let headers: string[] = $state([
		'Iri/QName',
		'Shortname',
		'Label',
		'Startdate',
		'Enddate']);

</script>

{#snippet actions()}
	<div class="flex flex-row items-center justify-end gap-4">
		<span><Button class="text-xs" onclick={goto_page("/admin/project")}>{m.add_project()}</Button></span>
	</div>
{/snippet}

<Table height={table_height} title={m.projects()}
			 description={m.userlist_descr()}
			 action_elements={actions}>
	<TableHeader>
		{#each headers as header}
			<TableColumnTitle>{header}</TableColumnTitle>
		{/each}
	</TableHeader>

</Table>
