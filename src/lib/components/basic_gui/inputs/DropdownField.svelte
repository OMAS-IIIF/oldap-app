<script lang="ts">

	import DropdownMenu from '$lib/components/basic_gui/dropdown/DropdownMenu.svelte';
	import DropdownLinkItem from '$lib/components/basic_gui/dropdown/DropdownLinkItem.svelte';
	import DropdownButton from '$lib/components/basic_gui/dropdown/DropdownButton.svelte';

	let { items, id, name, label, selectedItem = $bindable(), disabled = false } = $props();

	let is_open = $state(false);

</script>

<div class="mt-3">
	<label for={id} class="block text-xs/4 font-medium text-input-label-fg dark:text-input-label-fg-dark">{label}</label>
	<DropdownButton bind:isOpen={is_open} buttonText={selectedItem} {name} {disabled} class="text-xs">
		<DropdownMenu bind:isOpen={is_open} position="left" {name} {id}>
			{#each items as item}
				<DropdownLinkItem bind:isOpen={is_open}
													onclick={() => {selectedItem = item}} id="oldap"
													selected={item === selectedItem}>
					{item}
				</DropdownLinkItem>
			{/each}
		</DropdownMenu>
	</DropdownButton>

</div>