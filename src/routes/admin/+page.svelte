<script lang="ts">

	import Tabs, { type TabsType } from '$lib/components/basic_gui/tabs/Tabs.svelte';
	import { userStore } from '$lib/stores/user';
	import { projectStore } from '$lib/stores/project';
	import type { OldapUser } from '$lib/oldap/classes/user';
	import Table from '$lib/components/basic_gui/table/Table.svelte';
	import { contentAreaHeight } from '$lib/stores/contentarea_h';

	let tabs: TabsType = $state({});
	let user: OldapUser | null = $state(null);
	let selected = $state('');

	let tabs_height = $state(50); // TODO: Where does this "50" comes from....!
	let table_height = $state(($contentAreaHeight || 200) - (() => tabs_height)() - 25);

	userStore.subscribe((userinfo) => {
		if (userinfo) {
			user = userinfo;
			tabs = {
				users: 'Users',
				lists: 'Lists',
				models: 'Data model',
				permsets: 'Permission sets'
			};
		}
		else {
			tabs = {};
		}
	});

	projectStore.subscribe((projectinfo) => {

	});


	//
	// act on changes of the contentAreaHeight
	//
	contentAreaHeight.subscribe((height) => {
		if (height) {
			table_height = height - tabs_height - 25;
			console.log("height=>", height, "table_height=>", table_height);
		}
	});

	//
	// act on changes of tabs_height
	//
	$effect(() => {
		table_height = ($contentAreaHeight || 250) - tabs_height - 25;
	})

</script>

<Tabs tabs={tabs} bind:selected={selected} bind:height={tabs_height}></Tabs>
{#if selected === 'users'}
	<Table height={table_height}></Table>
{/if}
