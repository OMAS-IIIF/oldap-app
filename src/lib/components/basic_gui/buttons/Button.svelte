<script lang="ts">

	let { children, onclick = null, id = null, class: userClass = "", ariaExpanded = null, ariaHaspopup = null, round = false } = $props();

</script>

<button type="button"
				onclick={onclick || undefined}
				{id}
				class="{round ? 'oldap-button-round' : 'oldap-button'} {userClass}"
				aria-expanded={ariaExpanded || undefined}
				aria-haspopup={ariaHaspopup || undefined}>
	{@render children()}
</button>