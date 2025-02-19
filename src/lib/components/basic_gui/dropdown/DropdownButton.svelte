<script lang="ts">
	import { setContext } from 'svelte';
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';

	let { children, isOpen = $bindable(), buttonText, name = "", id = null} = $props();


	function toggleDropdown() {
		console.log('toggle Button dropdown');
		isOpen = !isOpen;
	}

	//setContext(name, id);

</script>

<div class="relative inline-block text-left">
	<div>
		<Button onclick={toggleDropdown} {id} innerClass={name}>
			{buttonText}
			<svg class="-mr-1 size-5 text-oldap-fg dark:text-oldap-fg-dark {name}" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
					 data-slot="icon">
				<path fill-rule="evenodd"
							d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
							clip-rule="evenodd" />
			</svg>
		</Button>
	</div>
	{@render children()}
</div>