<script lang="ts">
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';

	let { children, isOpen = $bindable(), buttonText = $bindable(), name = "", id = null, round = false, class: userClass = ""} = $props();

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	let chevron_size = $state("size-5");
	if (userClass.includes("text-xs")) {
		chevron_size = "size-4"
	}
	userClass += ` ${name}`;

</script>

<div class="relative inline-block text-left">
	<div>
		<Button onclick={toggleDropdown} {id} class={userClass} {round}>
			{buttonText}
			{#if !round}
				<svg class="-mr-1 {chevron_size} text-oldap-fg dark:text-oldap-fg-dark {name}" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
						 data-slot="icon">
					<path fill-rule="evenodd"
								d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
								clip-rule="evenodd" />
				</svg>
			{/if}
		</Button>
	</div>
	{@render children()}
</div>