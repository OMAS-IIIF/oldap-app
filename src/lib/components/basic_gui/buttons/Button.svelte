<script lang="ts">

	let {
		children,
		onclick = null,
		id = null,
		disabled=false,
		class: userClass = "",
		ariaExpanded = null,
		ariaHaspopup = null,
		round = false } = $props();

</script>

<button type="button"
				onclick={onclick || undefined}
				{id}
				disabled={disabled}
				class="{round ? 'oldap-button-round' : 'oldap-button'} {userClass} {disabled ? 'opacity-30 cursor-not-allowed' : ''}"
				aria-expanded={ariaExpanded || undefined}
				aria-haspopup={ariaHaspopup || undefined}>
	{@render children()}
</button>