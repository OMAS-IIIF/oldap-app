<script lang="ts">

	let { label, position = 'left' } : { label: string, position: 'left' | 'right' } = $props();

</script>

<div class="block">
	{#if position === 'left'}
		{label} <input type="checkbox" />
	{:else}
		<input type="checkbox" />{label}
	{/if}
</div>