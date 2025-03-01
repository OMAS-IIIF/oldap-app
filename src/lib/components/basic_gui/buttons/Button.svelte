<script lang="ts">

	let { children, onclick = null, id = null, innerClass = "", ariaExpanded = null, ariaHaspopup = null, round = false } = $props();

</script>

<button type="button"
				onclick={onclick || undefined}
				{id}
				class="{round ? 'oldap-button-round' : 'oldap-button'} {innerClass}"
				aria-expanded={ariaExpanded || undefined}
				aria-haspopup={ariaHaspopup || undefined}>
	{@render children()}
</button>