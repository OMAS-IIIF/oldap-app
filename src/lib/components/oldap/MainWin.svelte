<script lang="ts">

import DropdownMenu from '$lib/components/basic_gui/dropdown/DropdownMenu.svelte';
import DropdownLinkItem from '$lib/components/basic_gui/dropdown/DropdownLinkItem.svelte';
import LeftHeader from '$lib/components/basic_gui/header/LeftHeader.svelte';
import Dropdown from '$lib/components/basic_gui/dropdown/Dropdown.svelte';
import ContentArea from '$lib/components/basic_gui/ContentArea.svelte';
import Header from '$lib/components/basic_gui/header/Header.svelte';
import DropdownButtonItem from '$lib/components/basic_gui/dropdown/DropdownButtonItem.svelte';
import RightHeader from '$lib/components/basic_gui/header/RightHeader.svelte';
import Footer from '$lib/components/basic_gui/footer/Footer.svelte';
import Button from '$lib/components/basic_gui/Buttons/Button.svelte';
import AvatarButton from '$lib/components/basic_gui/Buttons/AvatarButton.svelte';

let { children } = $props();
let menuIsOpen = $state(false);

let test = (event: Event) => {
	console.log(event)
}
</script>
<div class="oldap-body">
	<Header size="text-xs lg:text-base ">
		<LeftHeader>
			<a href="/static"><img src="/images/oldap-logo.svg" class="me-3 h-6 sm:h-12" alt="OLDAP Logo" /></a>
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
		</LeftHeader>
		<RightHeader>
			<!--<Button>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
					<path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
				</svg>
			</Button>-->
			<AvatarButton initials="LR"></AvatarButton>
		</RightHeader>
	</Header>
	<ContentArea>
		{@render children()}
	</ContentArea>
	<Footer>
		<div>Footer</div>
	</Footer>
</div>
