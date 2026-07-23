<script lang="ts">
	import DropdownAvatar from '$lib/components/basic_gui/dropdown/DropdownAvatar.svelte';
	import DropdownLinkItem from '$lib/components/basic_gui/dropdown/DropdownLinkItem.svelte';
	import DropdownMenu from '$lib/components/basic_gui/dropdown/DropdownMenu.svelte';
	import Login from '$lib/components/basic_gui/login/Login.svelte';
	import DialogWin from '$lib/components/basic_gui/dialogs/DialogWin.svelte';
	import AvatarButton from '$lib/components/basic_gui/buttons/AvatarButton.svelte';
	import { OldapUser } from '$lib/oldap/classes/user';
	import { getGravatarUrl } from '$lib/helpers/getgravatar';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import { userStore } from '$lib/stores/user';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { loginUnknownUser } from '$lib/helpers/login_unknown_user';
	import { loginAuthenticatedUser, logoutAuthenticatedSession } from '$lib/auth/session';

	let { user = $bindable() }: { user: OldapUser | null } = $props();

	let avatarIsOpen = $state(false);
	let initials: string | undefined = $state(undefined);
	let src: string | undefined = $state($userStore?.avatarSrc);
	let loginIsOpen = $state(false);

	let do_login = (userid: string, password: string) => {
		loginAuthenticatedUser(userid, password)
			.then((authenticatedUser) => {
				user = authenticatedUser;
				src = getGravatarUrl(user.email, 200);
				user.avatarSrc = src;
				initials = user.givenName[0] + user.familyName[0];
				userStore.set(user);
			})
			.catch((err) => {
				const errobj = process_api_error(err);
				errorInfoStore.set(errobj);
			});
	};

	let do_logout = async () => {
		try {
			await logoutAuthenticatedSession();
		} catch (error) {
			console.error('Logout request failed; local session was cleared.', error);
		}
		user = null;
		initials = undefined;
		src = undefined;
		await goto(resolve('/'));
		await loginUnknownUser();
	};

	let test = (event: Event) => {
		console.log(event);
	};
</script>

{#if user && user.userId.toString() !== 'unknown'}
	<DropdownAvatar bind:isOpen={avatarIsOpen} {initials} {src} name="avatar">
		<DropdownMenu
			bind:isOpen={avatarIsOpen}
			position="right"
			name="avatar"
			id="avatar-id"
			grouping={true}
		>
			<div role="none">
				<DropdownLinkItem bind:isOpen={avatarIsOpen} onclick={do_logout} id="logout"
					>Sign out</DropdownLinkItem
				>
			</div>
			<div role="none">
				<DropdownLinkItem bind:isOpen={avatarIsOpen} onclick={test} id="gugusX"
					>Reset&nbsp;password</DropdownLinkItem
				>
				<DropdownLinkItem bind:isOpen={avatarIsOpen} onclick={test} id="gugusX"
					>User&nbsp;settings</DropdownLinkItem
				>
			</div>
		</DropdownMenu>
	</DropdownAvatar>
{:else}
	<AvatarButton
		{initials}
		{src}
		onclick={() => {
			loginIsOpen = true;
		}}
	></AvatarButton>
	<DialogWin bind:isopen={loginIsOpen} title="Login">
		<Login onsubmit={do_login} bind:isopen={loginIsOpen} />
	</DialogWin>
{/if}
