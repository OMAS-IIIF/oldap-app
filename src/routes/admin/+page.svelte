<script lang="ts">

	import Tabs, { type TabsType } from '$lib/components/basic_gui/tabs/Tabs.svelte';
	import { userStore } from '$lib/stores/user';

	let tabs: TabsType = $state();

	userStore.subscribe((user) => {
		if (user) {
			tabs = {
				users: 'User',
				lists: 'Lists',
				models: 'Data model',
				permsets: 'Permission sets'
			};
		}
		else {
			tabs = {};
		}
	});

</script>
<Tabs tabs={tabs}></Tabs>