<script lang="ts">
	import Table from '$lib/components/basic_gui/table/Table.svelte';
	import { OldapUser } from '$lib/oldap/classes/user';
	import type { OldapProject } from '$lib/oldap/classes/project';
	import { api_get_config, api_notget_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import Checkbox from '$lib/components/basic_gui/checkbox/Checkbox.svelte';
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { Pencil, Plus, Trash2 } from '@lucide/svelte';
	import TableHeader from '$lib/components/basic_gui/table/TableHeader.svelte';
	import TableBody from '$lib/components/basic_gui/table/TableBody.svelte';
	import TableRow from '$lib/components/basic_gui/table/TableRow.svelte';
	import TableItem from '$lib/components/basic_gui/table/TableItem.svelte';
	import Toggle from '$lib/components/basic_gui/buttons/Toggle.svelte';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import Confirmation from '$lib/components/basic_gui/dialogs/Confirmation.svelte';
	import TableColumnTitle from '$lib/components/basic_gui/table/TableColumnTitle.svelte';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { languageTag } from '$lib/paraglide/runtime';
	import { goto_page } from '$lib/helpers/goto_page';
	import Tooltip from '$lib/components/basic_gui/tooltip/Tooltip.svelte';


	let { table_height, administrator = null, project = null }: {
		table_height: number,
		administrator: OldapUser | null,
		project: OldapProject | null
	} = $props();

	let lang = $state(languageTag());

	let show_all_users = $state(false);
	let authinfo = $state<AuthInfo | null>($authInfoStore);
	let users = $state<Record<string, OldapUser>>({});
	let user_list = $state<string[]>([]);
	let user_active: Record<string, boolean> = $state({});

	let confirmation_dialog: Confirmation;
	let confirmation_title = $state('');
	let confirmation_for_userid = $state('');
	let confirmation_for_state = $state('');

	authInfoStore.subscribe(data => {
		authinfo = data;
	})

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
						const config_userdata = api_get_config(authinfo as AuthInfo, { iri: iri });
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
				headers: { 'Accept': 'application/json', 'Authorization': 'Bearer ' + authinfo?.token },
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

	const delete_user = async (user_id: string) => {
		confirmation_for_userid = user_id;
		confirmation_title = m.deluser();
		confirmation_for_state = '';
		const ok = await confirmation_dialog.open();
		if (ok && authinfo) {
			const config_data = api_notget_config(authinfo, {userId: user_id});
			apiClient.deleteAdminuserUserId (undefined, config_data).then(() => {
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
		<Tooltip text={m.add_user()}>
			<Button round={true} class="text-xs" onclick={goto_page("/admin/user")}>
				<Plus size="16" strokeWidth="1" />
			</Button>
		</Tooltip>

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
							<Pencil size="16" strokeWidth="1" />
						</Button>
						<Button round={true} onclick={() => delete_user(user_id)}>
							<Trash2  size="16" strokeWidth="1" />
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
