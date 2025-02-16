<script lang="ts">

	import { getContext } from 'svelte';

	let { children, isOpen = $bindable() , id = null } = $props();

	let menubutton_id = getContext('menubutton_id');
	let drop_down_menu: HTMLElement | undefined = $state();

	function close_menu(event: Event) {
		if ((event?.target as HTMLElement)?.closest(".oldap-dropdown")?.id == menubutton_id) {
			return;
		}
		isOpen = false;
	}

	$effect(() => {
		if (isOpen) {
			if (drop_down_menu) {
				drop_down_menu.scrollTop = 0;
			}
		}
	});

</script>


<svelte:window onclick={close_menu} />
<div bind:this={drop_down_menu} {id}
		 class="{isOpen ? 'oldap-dropdown-menu-in' : 'oldap-dropdown-menu-out'} oldap-dropdown-menu"
		 role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
	<div class="py-1" role="none">
		{@render children()}
	</div>
</div>
