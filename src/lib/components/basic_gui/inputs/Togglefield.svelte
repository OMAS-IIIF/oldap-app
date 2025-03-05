<script lang="ts">

	import Toggle from '$lib/components/basic_gui/buttons/Toggle.svelte';

	let { id, label, toggle_state = $bindable(), readonly = false, disabled = false, required = undefined } = $props();



</script>

<div class="mt-3 flex flex-row justify-left items-center gap-x-4">
	<label for={id} class="block text-xs/4 font-medium text-input-label-fg dark:text-input-label-fg-dark">{label}</label>
	<Toggle bind:toggle_state={toggle_state} {id}/>
</div>