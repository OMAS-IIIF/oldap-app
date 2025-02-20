<script lang="ts">

	import DropdownLinkItem from '$lib/components/basic_gui/dropdown/DropdownLinkItem.svelte';
	import DropdownMenu from '$lib/components/basic_gui/dropdown/DropdownMenu.svelte';
	import DropdownLabel from '$lib/components/basic_gui/dropdown/DropdownLabel.svelte';
	import { process_api_error } from '$lib/helpers/process_api_error';

	import { userStore } from '$lib/stores/user';
	import type { InProject, OldapUser } from '$lib/oldap/classes/user';

	let projectsIsOpen = $state(false);


	userStore.subscribe((user: OldapUser | null) => {
		if (user !== null && user !== undefined) {
			user?.inProject?.forEach((in_project: InProject) => {
				
			});
		}

	});

	const test = () => {

	}
</script>

<DropdownLabel bind:isOpen={projectsIsOpen} name="projects" labelText="Projects">
	<DropdownMenu bind:isOpen={projectsIsOpen} position="left" name="projects">
		<DropdownLinkItem bind:isOpen={projectsIsOpen} onclick={test} id="oldap">OLDAP</DropdownLinkItem>
	</DropdownMenu>
</DropdownLabel>
