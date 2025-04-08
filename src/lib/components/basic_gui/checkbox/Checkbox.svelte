<script lang="ts">

	let { name = null, id = null, value = null, checked = $bindable(), label, position = 'left' } = $props();

</script>

<div class="block">
	{#if position === 'left'}
		{label} <input type="checkbox" class="mx-2" checked={checked} {name} {id} {value} onchange={() => checked=!checked} />
	{:else}
		<input type="checkbox" class="mx-2" checked={checked} {name} {id} {value} onchange={() => checked=!checked} />{label}
	{/if}
</div>