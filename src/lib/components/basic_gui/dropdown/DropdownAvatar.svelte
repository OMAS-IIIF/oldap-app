<script lang="ts">
	import AvatarButton from '$lib/components/basic_gui/buttons/AvatarButton.svelte';

	let { children = () => {}, isOpen = $bindable(), src = null, initials = "", name = "", id = null} = $props();


	function toggleDropdown() {
		console.log('toggle Avatar dropdown');
		isOpen = !isOpen;
	}


</script>

<div class="relative inline-block text-left">
		<AvatarButton onclick={toggleDropdown} id={id} {initials} {src} innerClass={name} />
	{@render children()}
</div>