<script lang="ts">

	let { items, id, name, label, selectedItems = $bindable() } = $props();

</script>
<div class="mt-3">
	<label for={id} class="block text-xs/4 font-medium text-input-label-fg dark:text-input-label-fg-dark">{label}</label>
<fieldset id={id} class="flex flex-row gap-4">
	{#each items as item}
		<label class="text-xs">
			<input type="checkbox" bind:group={selectedItems} value={item} />
			{item}
		</label>

	{/each}
</fieldset>
</div>