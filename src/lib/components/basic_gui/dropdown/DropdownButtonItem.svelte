<script lang="ts">

	let { children, isOpen = $bindable(), id = null, onclick = undefined, round = false, selected = false} = $props();


	let myevent = (event: MouseEvent) => {
		if (onclick) {
			event.preventDefault();
			onclick(event);
		}
		isOpen = false;
	}
</script>

<button {id} onclick={myevent}
				class="{round ? 'oldap-dropdown-rbutton-item' : 'oldap-dropdown-linkitem'} {selected ? 'italic underline' : ''}"
				role="menuitem"
				tabindex="-1">
	{@render children()}
</button>