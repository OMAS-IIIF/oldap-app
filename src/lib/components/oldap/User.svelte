<script lang="ts">

	import DropdownAvatar from '$lib/components/basic_gui/dropdown/DropdownAvatar.svelte';
	import DropdownLinkItem from '$lib/components/basic_gui/dropdown/DropdownLinkItem.svelte';
	import DropdownMenu from '$lib/components/basic_gui/dropdown/DropdownMenu.svelte';
	import Login from '$lib/components/basic_gui/login/Login.svelte';
	import DialogWin from '$lib/components/basic_gui/dialogwin/DialogWin.svelte';
	import AvatarButton from '$lib/components/basic_gui/buttons/AvatarButton.svelte';
	import type { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { OldapErrorApiFailure } from '$lib/oldap/errors/OldapErrorApiFailure';
	import { OldapUser } from '$lib/oldap/classes/user';
	import { getGravatarUrl } from '$lib/helpers/getgravatar';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import { apiClient } from '$lib/shared/apiClient';
	import { userStore } from '$lib/stores/user';
	import { errorInfoStore } from '$lib/stores/errorinfo';

	let { user = $bindable() } = $props();

	let avatarIsOpen = $state(false);
	let initials: string | undefined = $state(undefined);
	let src: string | undefined = $state(undefined);
	let loginIsOpen = $state(false);

	let do_login = (userid: string, password: string) => {
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
				const errobj = process_api_error(err);
				errorInfoStore.set(errobj);
			});
	};

	let do_logout = () => {
		user = null;
		initials = undefined;
		src = undefined;
		userStore.set(null);
		sessionStorage.removeItem('authinfo');
	}

	let test = (event: Event) => {
		console.log(event)
	}

</script>

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
	<AvatarButton {initials} {src} onclick={() => {loginIsOpen = true;}}></AvatarButton>
	<DialogWin bind:isopen={loginIsOpen} title="Login">
		<Login onsubmit={do_login} bind:isopen={loginIsOpen} />
	</DialogWin>
{/if}
