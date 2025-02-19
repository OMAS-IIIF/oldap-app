<script lang="ts">
	import { setContext } from 'svelte';
	import AvatarButton from '$lib/components/basic_gui/buttons/AvatarButton.svelte';

	let { children = () => {}, isOpen = $bindable(), src = null, initials = "", name = "", id = null} = $props();


	function toggleDropdown() {
		console.log('toggle Avatar dropdown');
		isOpen = !isOpen;
	}

	//setContext(name, id);

</script>

<div class="relative inline-block text-left">
	<div>
		<AvatarButton onclick={toggleDropdown} id={id} {initials} {src} innerClass={name}>

		</AvatarButton>
	</div>
	{@render children()}
</div>