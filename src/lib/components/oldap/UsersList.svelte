<script lang="ts">
	import { goto } from '$app/navigation';
	import Table from '$lib/components/basic_gui/table/Table.svelte';
	import { OldapUser } from '$lib/oldap/classes/user';
	import type { OldapProject } from '$lib/oldap/classes/project';
	import { api_config, api_get_config, api_notget_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import Checkbox from '$lib/components/basic_gui/checkbox/Checkbox.svelte';
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import TableHeader from '$lib/components/basic_gui/table/TableHeader.svelte';
	import TableBody from '$lib/components/basic_gui/table/TableBody.svelte';
	import TableRow from '$lib/components/basic_gui/table/TableRow.svelte';
	import TableItem from '$lib/components/basic_gui/table/TableItem.svelte';
	import Toggle from '$lib/components/basic_gui/buttons/Toggle.svelte';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { onMount } from 'svelte';
	import Confirmation from '$lib/components/basic_gui/dialogs/Confirmation.svelte';
	import TableColumnTitle from '$lib/components/basic_gui/table/TableColumnTitle.svelte';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';

	let { table_height, administrator = $bindable(), project = $bindable() }: {
		table_height: number,
		administrator: OldapUser,
		project: OldapProject
	} = $props();

	let show_all_users = $state(false);
	let authinfo = $state<AuthInfo>();
	let users = $state<Record<string, OldapUser>>({});
	let user_list = $state<string[]>([]);
	let user_active: Record<string, boolean> = $state({});

	let confirmation_dialog: Confirmation;
	let confirmation_title = $state('');
	let confirmation_for_userid = $state('');
	let confirmation_for_state = $state('');


	onMount(() => {
		authinfo = AuthInfo.fromString(sessionStorage.getItem('authinfo'));
	});

	$effect(() => {
		user_list = [];
		if (authinfo) {
			let usersearch = api_get_config(authinfo);
			if (!show_all_users) {
				usersearch = { ...usersearch, queries: { inProject: project?.projectIri?.toString() } };
			}
			apiClient.getAdminusersearch(usersearch)
				.then((iris) => {
					users = {} as Record<string, OldapUser>;
					const promises = iris.map(iri => {
						const config_userdata = api_get_config(authinfo, { iri: iri });
						return apiClient.getAdminuserget(config_userdata);
					});
					Promise.all(promises)
						.then((results) => {
							results.forEach((userdata) => {
								const user = OldapUser.fromOldapJson(userdata);
								const uid = user.userId.toString();
								user_active[uid] = user.isActive;
								users[uid] = user;
								user_list.push(uid);
							});
							user_list = user_list.sort((a, b) => a.localeCompare(b));
						})
						.catch((err) => {
							errorInfoStore.set(process_api_error(err as Error));
						});
				}).catch((err) => {
				errorInfoStore.set(process_api_error(err as Error));
			});
		}
	});

	const toggle_active = async (on: boolean, id: string): Promise<boolean> => {
		confirmation_for_userid = id;
		confirmation_title = on ? 'Deactivate user' : 'Activate user';
		confirmation_for_state = on ? 'inactive' : 'active';
		const ok = await confirmation_dialog.open();
		if (ok) {
			on = !on;
			const data = { isActive: on };
			const config_change_isActive = {
				headers: { 'Accept': 'application/json', 'Authorization': 'Bearer ' + authinfo.token },
				params: { userId: id }
			};
			apiClient.postAdminuserUserId(data, config_change_isActive)
				.then((result) => {
					console.log(result);
				})
				.catch((err) => {
					errorInfoStore.set(process_api_error(err as Error));
				});
		}
		return on;
	};

	/**
	 * Returns a function that can be used for a onclick-action to navigate to the given route
	 * @param url An URL to goto to...
	 */
	const goto_page = (url: string) => {
		return () => {
			goto(url);
		}
	}

	const delete_user = async (user_id: string) => {
		confirmation_for_userid = user_id;
		confirmation_title = 'Delete user';
		confirmation_for_state = '';
		const ok = await confirmation_dialog.open();
		if (ok && authinfo) {
			const config_data = api_notget_config(authinfo, {userId: user_id});
			apiClient.deleteAdminuserUserId (undefined, config_data).then((result) => {
				delete users[user_id];
				user_list = user_list.filter((id) => id !== user_id);
			}).catch((err) => {
				errorInfoStore.set(process_api_error(err as Error));
			})
		}
	}

	let headers: string[] = $state([
		m.user_id(),
		m.family_name(),
		m.given_name(),
		m.email(),
		m.active(),
		m.action()]);

</script>

{#snippet actions()}
	<div class="flex flex-row items-center justify-end gap-4">
		{#if administrator?.isRoot}
			<span><Checkbox label="Show all users" position="left" bind:checked={show_all_users} /></span>
		{/if}
		<span><Button class="text-xs" onclick={goto_page("/admin/user")}>{m.add_user()}</Button></span>
	</div>
{/snippet}

<Table height={table_height} title={m.users()}
			 description={m.userlist_descr()}
			 action_elements={actions}>
	<TableHeader>
		{#each headers as header}
			<TableColumnTitle>{header}</TableColumnTitle>
		{/each}
	</TableHeader>
	<TableBody>
		{#each user_list as user_id}
			<TableRow>
				<TableItem>{user_id}</TableItem>
				<TableItem>{users[user_id].familyName}</TableItem>
				<TableItem>{users[user_id].givenName}</TableItem>
				<TableItem>{users[user_id].email}</TableItem>
				<TableItem>
					<Toggle bind:toggle_state={user_active[user_id]} id={user_id} onclick={toggle_active} />
				</TableItem>
				<TableItem>
					<div class="flex flex-row items-center justify-left gap-2">
						<Button round={true} onclick={goto_page(`/admin/user/${user_id}`)}>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
									 stroke="currentColor" class="size-4">
								<path stroke-linecap="round" stroke-linejoin="round"
											d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
							</svg>
						</Button>
						<Button round={true} onclick={() => delete_user(user_id)}>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
									 stroke="currentColor" class="size-4">
								<path stroke-linecap="round" stroke-linejoin="round"
											d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
							</svg>
						</Button>
					</div>
				</TableItem>
			</TableRow>
		{/each}
	</TableBody>
</Table>

<Confirmation bind:this={confirmation_dialog} title={confirmation_title}>
	{#if confirmation_for_state === ''}
		{m.confirm_user_delete({ userid: confirmation_for_userid})}
	{:else}
		{m.confirm_state({ userid: confirmation_for_userid, state: confirmation_for_state })}
	{/if}
</Confirmation>