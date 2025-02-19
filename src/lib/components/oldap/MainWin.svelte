<script lang="ts">

import DropdownMenu from '$lib/components/basic_gui/dropdown/DropdownMenu.svelte';
import DropdownLinkItem from '$lib/components/basic_gui/dropdown/DropdownLinkItem.svelte';
import LeftHeader from '$lib/components/basic_gui/header/LeftHeader.svelte';
import DropdownButton from '$lib/components/basic_gui/dropdown/DropdownButton.svelte';
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
import { OldapErrorApiFailure } from '$lib/oldap/errors/OldapErrorApiFailure';
import { OldapUser } from '$lib/oldap/classes/user';
import { userStore } from '$lib/stores/user';
import { getGravatarUrl } from '$lib/helpers/getgravatar'
import DropdownAvatar from '$lib/components/basic_gui/dropdown/DropdownAvatar.svelte';
import DropdownLabel from '$lib/components/basic_gui/dropdown/DropdownLabel.svelte';


let { children } = $props();
let menuIsOpen = $state(false);
let loginIsOpen = $state(false);
let avatarIsOpen = $state(false);
let projectsIsOpen = $state(false);
let user: OldapUser | null = $state(null);
let initials: string | undefined = $state(undefined);
let src: string | undefined = $state(undefined);

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
				return authinfo;
			}
			throw new OldapErrorApiFailure("Got no token from login procedure");
		})
		.then(authinfo => {
			const config_user = {
				params: { userId: authinfo.userid },
				headers: {
					'Accept': 'application/json',
					'Authorization': 'Bearer ' + authinfo.token,
				},
			}
			return apiClient.getAdminuserUserId(config_user);
		})
		.then(userdata => {
			user = OldapUser.fromOldapJson(userdata);
			userStore.set(user);
			console.log(user);
			src = getGravatarUrl(user.email, 200);
		})
	.catch(err => {
		console.log(err);
	})
};

let do_logout = () => {
	console.log("DO_LOGOUT!!!!!!!!")
	user = null;
	initials = undefined;
	src = undefined;
	userStore.set(null);
	//projectStore.set(null);
	sessionStorage.removeItem('authinfo');

}

</script>
<div class="oldap-body">
	<Header size="text-xs lg:text-base ">
		<LeftHeader>
			<a href="/static"><img src="/images/oldap-logo.svg" class="me-3 h-6 sm:h-12" alt="OLDAP Logo" /></a>
			<DropdownButton bind:isOpen={menuIsOpen} buttonText="Test" name="test-menu">
				<DropdownMenu bind:isOpen={menuIsOpen} name="test-menu">
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
			</DropdownButton>
			<div>header2</div>
		</LeftHeader>
		<RightHeader>
			{#if user}
				<DropdownAvatar bind:isOpen={avatarIsOpen} {initials} {src} name="avatar">
					<DropdownMenu bind:isOpen={avatarIsOpen} position="right" name="avatar" grouping={true}>
						<div role="none">
							<DropdownLinkItem bind:isOpen={avatarIsOpen} onclick={do_logout} id="logout">Sign out</DropdownLinkItem>
						</div>
						<div role="none">
							<DropdownLinkItem bind:isOpen={avatarIsOpen} onclick={test} id="gugusX">Reset&nbsp;password</DropdownLinkItem>
							<DropdownLinkItem bind:isOpen={avatarIsOpen} onclick={test} id="gugusX">User&nbsp;settings</DropdownLinkItem>
						</div>
					</DropdownMenu>
				</DropdownAvatar>
			{:else}
				<AvatarButton {initials} {src} onclick={(event: MouseEvent) => {loginIsOpen = true;}}></AvatarButton>
				<DialogWin bind:isopen={loginIsOpen} title="Login">
					<Login onsubmit={do_login} bind:isopen={loginIsOpen} />
				</DialogWin>
			{/if}
			<DropdownLabel bind:isOpen={projectsIsOpen} name="projects" labelText="Projects">
				<DropdownMenu bind:isOpen={projectsIsOpen} position="left" name="projects">
					<DropdownLinkItem bind:isOpen={projectsIsOpen} onclick={test} id="oldap">OLDAP</DropdownLinkItem>
				</DropdownMenu>
			</DropdownLabel>
		</RightHeader>
	</Header>
	<ContentArea>
		{@render children()}
	</ContentArea>
	<Footer>
		<div>© Lukas & Manuel Rosenthaler (2025)</div>
	</Footer>
</div>
