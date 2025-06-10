<script lang="ts">
	import { ChevronDown, Pencil } from '@lucide/svelte';

	let { children, isOpen = $bindable(), labelText, name = "", id = null, class: userClass = ''} = $props();

	function toggleDropdown(event) {
		event.preventDefault();
		isOpen = !isOpen;
	}

</script>

<div class="relative inline-block text-left">
	<div>
		<a href="/" onclick={toggleDropdown} class="flex items-center text-nowrap {name} {userClass}">
			{labelText}
			<svg class="-mr-1 size-5 text-oldap-fg dark:text-oldap-fg-dark {name}" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
					 data-slot="icon">
				<path fill-rule="evenodd"
							d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
							clip-rule="evenodd" />
			</svg>
			<!-- <ChevronDown size="16" strokeWidth="1" /> -->
		</a>
	</div>
	{@render children()}
</div>