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
import AvatarButton from '$lib/components/basic_gui/buttons/AvatarButton.svelte';
import DialogWin from '$lib/components/basic_gui/dialogwin/DialogWin.svelte';
import Login from '$lib/components/basic_gui/login/Login.svelte';
import { apiClient } from '$lib/shared/apiClient';
import type { AuthInfo } from '$lib/interfaces/authinfo';

let { children } = $props();
let menuIsOpen = $state(false);
let loginIsOpen = $state(false)

let test = (event: Event) => {
	console.log(event)
}

let do_login = (userid: string, password: string) => {
	console.log(userid, password)
	const config_auth = {
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json; utf-8',
		},
		params: { userId: userid },
	}
	const data = {password: password as string};
	apiClient.postAdminauthUserId(data, config_auth)
		.then(authdata => {
			if (authdata.token) {
				const authinfo: AuthInfo = {
					userid: userid,
					token: authdata.token,
				}
				sessionStorage.setItem('authinfo', JSON.stringify(authinfo));
			}
			else {
				console.log("NO TOKEN!!!!")
			}
		})
	.catch(err => {
		console.log(err);
	})
};

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
			<AvatarButton initials="LR" onclick={(event: MouseEvent) => {loginIsOpen = true;}}></AvatarButton>
			<DialogWin bind:isopen={loginIsOpen} title="Login">
				<Login onsubmit={do_login} bind:isopen={loginIsOpen} />
			</DialogWin>
		</RightHeader>
	</Header>
	<ContentArea>
		{@render children()}
	</ContentArea>
	<Footer>
		<div>Footer</div>
	</Footer>
</div>
