<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import '../app.css';
	import Header from '$lib/components/basic_gui/Header.svelte';
	import Footer from '$lib/components/basic_gui/Footer.svelte';
	import Dropdown from '$lib/components/basic_gui/dropdown/Dropdown.svelte';
	import DropdownMenu from '$lib/components/basic_gui/dropdown/DropdownMenu.svelte';
	import DropdownLinkItem from '$lib/components/basic_gui/dropdown/DropdownLinkItem.svelte';
	import ContentArea from '$lib/components/basic_gui/ContentArea.svelte';
	import DropdownButtonItem from '$lib/components/basic_gui/dropdown/DropdownButtonItem.svelte';

	let { children } = $props();
	let menuIsOpen = $state(false);

	let test = (event: Event) => {
		console.log(event)
	}

</script>

<ParaglideJS {i18n}>
	<Header>
		<Dropdown bind:isOpen={menuIsOpen} buttonText="Test">
			<DropdownMenu bind:isOpen={menuIsOpen}>
				<DropdownLinkItem bind:isOpen={menuIsOpen} onclick={test} id="gaga">GAGA</DropdownLinkItem>
				<DropdownLinkItem bind:isOpen={menuIsOpen} onclick={test} id="Gugus">Gugus</DropdownLinkItem>
				<DropdownLinkItem bind:isOpen={menuIsOpen} onclick={test}>AllesodernichtshisthierdieFrage</DropdownLinkItem>
				<DropdownButtonItem bind:isOpen={menuIsOpen} onclick={test}>BUTTON</DropdownButtonItem>
				<DropdownLinkItem bind:isOpen={menuIsOpen} onclick={test} id="gaga-1">GAGA-1</DropdownLinkItem>
				<DropdownLinkItem bind:isOpen={menuIsOpen} onclick={test} id="gaga-2">GAGA-2</DropdownLinkItem>
				<DropdownLinkItem bind:isOpen={menuIsOpen} onclick={test} id="gaga-3">GAGA-3</DropdownLinkItem>
				<DropdownLinkItem bind:isOpen={menuIsOpen} onclick={test} id="gaga-4">GAGA-4</DropdownLinkItem>
				<DropdownLinkItem bind:isOpen={menuIsOpen} onclick={test} id="gaga-5">GAGA-5</DropdownLinkItem>
			</DropdownMenu>
		</Dropdown>
		<div>header2</div>
	</Header>
	<ContentArea>
		{@render children()}
	</ContentArea>
	<Footer>
		<div>footer</div>
	</Footer>
</ParaglideJS>
