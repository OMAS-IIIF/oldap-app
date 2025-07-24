<script lang="ts">

	let { name = null, id = null, value = null, checked = $bindable(), label, position = 'left', class: userClass = "" } = $props();

</script>

<div class="block">
	{#if position === 'left'}
		<span class="{userClass}">{label}</span> <input type="checkbox" class="mx-2" checked={checked} {name} {id} {value} onchange={() => checked=!checked} />
	{:else}
		<input type="checkbox" class="mx-2" checked={checked} {name} {id} {value} onchange={() => checked=!checked} /><span class="{userClass}">{label}</span>
	{/if}
</div>