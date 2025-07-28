<script lang="ts">
	let { children, value = undefined, isOpen = $bindable(), href = '#', id = null, onclick = undefined, selected = false } = $props();

	let myevent = (event: MouseEvent) => {
		if (onclick) {
			event.preventDefault();
			//onclick(event);
			onclick(value);
		}
		isOpen = false;
	}
</script>

<a {id} href={href} onclick={myevent} class="oldap-dropdown-linkitem {selected ? 'italic underline' : ''}" role="menuitem" tabindex="-1" >
	{@render children()}
</a>