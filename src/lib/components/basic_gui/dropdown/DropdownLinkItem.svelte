<script lang="ts">
	let { children, isOpen = $bindable(), href = '#', id = null, onclick = undefined } = $props();

	let myevent = (event: MouseEvent) => {
		if (onclick) {
			event.preventDefault();
			onclick(event);
		}
		isOpen = false;
	}
</script>

<a {id} href={href} onclick={myevent} class="oldap-dropdown-linkitem" role="menuitem" tabindex="-1" >
	{@render children()}
</a>