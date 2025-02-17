<script lang="ts">

	import { getContext, onMount } from 'svelte';

	let { children, position = 'left', isOpen = $bindable() , id = null } = $props();

	let menubutton_id = getContext('menubutton_id');
	let drop_down_menu: HTMLElement | undefined = $state();
	let position_class = $state('left-0');

	function close_menu(event: Event) {
		if ((event?.target as HTMLElement)?.closest(".dd-menu")?.id == menubutton_id) {
			return;
		}
		isOpen = false;
	}

	onMount(() => {
		if (position) {
			if (position == 'left') {
				position_class = 'left-0'
			}
			else if (position == 'right') {
				position_class = 'right-0'
			}
		}
	});

	$effect(() => {
		if (isOpen && drop_down_menu) {
			drop_down_menu.scrollTop = 0;
		}
	});

</script>


<svelte:window onclick={close_menu} />
<div bind:this={drop_down_menu} {id}
		 class="{isOpen ? 'oldap-dropdown-menu-in' : 'oldap-dropdown-menu-out'} oldap-dropdown-menu {position_class}"
		 role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
	<div class="py-1" role="none">
		{@render children()}
	</div>
</div>
