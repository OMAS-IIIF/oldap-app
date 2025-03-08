<script lang="ts">
	import type { PageProps } from './$types';
	import Textfield from '$lib/components/basic_gui/inputs/Textfield.svelte';
	import { apiClient } from '$lib/shared/apiClient';
	import { OldapUser } from '$lib/oldap/classes/user';
	import { api_config, api_get_config } from '$lib/helpers/api_config';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import Togglefield from '$lib/components/basic_gui/inputs/Togglefield.svelte';
	import TableHeader from '$lib/components/basic_gui/table/TableHeader.svelte';
	import Table from '$lib/components/basic_gui/table/Table.svelte';
	import TableBody from '$lib/components/basic_gui/table/TableBody.svelte';
	import TableRow from '$lib/components/basic_gui/table/TableRow.svelte';
	import TableItem from '$lib/components/basic_gui/table/TableItem.svelte';
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';
	import * as m from '$lib/paraglide/messages';
	import { AdminPermission } from '$lib/oldap/enums/admin_permissions';
	import TableColumnTitle from '$lib/components/basic_gui/table/TableColumnTitle.svelte';
	import Tooltip from '$lib/components/basic_gui/tooltip/Tooltip.svelte';
	import { onMount } from 'svelte';
	import { OldapProject } from '$lib/oldap/classes/project';

	let { data }: PageProps = $props();

	let authinfo: AuthInfo;
	let user = $state<OldapUser | null>(null);
	const ncname_pattern = /^[A-Za-z_][A-Za-z0-9._-]*$/;
	const email_pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	let checked = $state<boolean[]>([]);
	let projects = $state<OldapProject[]>([]);


	onMount(() => {
		authinfo = AuthInfo.fromString(sessionStorage.getItem('authinfo'));

		if (data && data.userid) {
			const config_userdata = api_config(authinfo, { userId: data.userid });
			apiClient.getAdminuserUserId(config_userdata).then((jsondata) => {
				user = OldapUser.fromOldapJson(jsondata);
				if (user) {
					user.inProject?.forEach(inProject => {
						const config_projectdata = api_get_config(authinfo, { iri: inProject.project.toString() });
						apiClient.getAdminprojectget(config_projectdata).then((jsondata) => {
							const project = OldapProject.fromOldapJson(jsondata);
							projects.push(project);
						})
							.catch(error => {
								console.log("====A=", error);
							});
					});
				}
				console.log(user);
				Object.keys(AdminPermission).forEach((key) => {
					const p = AdminPermission[key as keyof typeof AdminPermission]
					checked.push(false); //TODO!!!!!!!
					//checked.push(AdminPermission[key as keyof typeof AdminPermission]);
				});

			})
				.catch(error => {
					console.log("=====B=", error);
				});
			}
	});


</script>
{#snippet actions()}
	<div class="flex flex-row items-center justify-end gap-4">
		<span><Button innerClass="text-xs" >Add project</Button></span>
	</div>
{/snippet}

<div class="absolute top-0 left-0 right-0 bottom-0 overflow-auto">
	<h1>{data.userid ? m.edit() : m.add()} User "{data.userid}"</h1>
	<form class="max-w-128">
		<Textfield type='text' label={m.user_id()} name="userid" id="userid" placeholder="user id" required={true}
							 value={user?.userId.toString()} pattern={ncname_pattern} />
		<Textfield type='text' label={m.family_name()} name="familyName" id="familyName" placeholder="family name"
							 required={true} value={user?.familyName} />
		<Textfield type='text' label={m.given_name()} name="givenName" id="givenName" placeholder="given name"
							 required={true} value={user?.givenName} />
		<Textfield type='email' label={m.email()} name="email" id="email" placeholder="john.doe@example.org" required={true}
							 value={user?.email} pattern={email_pattern} />
		<Togglefield label={m.is_active()} name="isActive" id="isActive" />
		<Table title={m.projects()} description={m.perprojperms()} action_elements={actions}>
			<TableHeader>
				<TableColumnTitle>{m.project()}</TableColumnTitle>
				<TableColumnTitle> <!-- ADMIN_OLDAP -->
					<Tooltip text={m.superuser()}>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
								 stroke="currentColor" class="size-4">
							<path stroke-linecap="round" stroke-linejoin="round"
										d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
						</svg>
					</Tooltip>
				</TableColumnTitle>
				<TableColumnTitle> <!-- ADMIN_USER -->
					<Tooltip text={m.adminusers()}>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
								 stroke="currentColor" class="size-4">
							<path stroke-linecap="round" stroke-linejoin="round"
										d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
						</svg>
					</Tooltip>
				</TableColumnTitle>
				<TableColumnTitle> <!-- ADMIN_PERMISSION_SETS -->
					<Tooltip text={m.adminpermsets()}>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
								 stroke="currentColor" class="size-4">
							<path stroke-linecap="round" stroke-linejoin="round"
										d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
							<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
						</svg>
					</Tooltip>
				</TableColumnTitle>
				<TableColumnTitle> <!-- ADMIN_RESOURCES -->
					<Tooltip text={m.adminres()}>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
							<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
						</svg>
					</Tooltip>
				</TableColumnTitle>
				<TableColumnTitle> <!-- ADMIN_MODEL -->
					<Tooltip text={m.admindatamodel()}>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
								 stroke="currentColor" class="size-4">
							<path stroke-linecap="round" stroke-linejoin="round"
										d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
							<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
						</svg>
					</Tooltip>
				</TableColumnTitle>
				<TableColumnTitle> <!-- ADMIN_CREATE -->
					<Tooltip text={m.createres()}>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
								 stroke="currentColor" class="size-4">
							<path stroke-linecap="round" stroke-linejoin="round"
										d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z" />
						</svg>
					</Tooltip>
				</TableColumnTitle>
				<TableColumnTitle> <!-- ADMIN_LISTS -->
					<Tooltip text={m.adminlists()}>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
								 stroke="currentColor" class="size-4">
							<path stroke-linecap="round" stroke-linejoin="round"
										d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
						</svg>
					</Tooltip>
				</TableColumnTitle>

			</TableHeader>
			<TableBody>
				{#each projects as project}
					<TableRow>
						<TableItem>{project.projectShortName.toString()}</TableItem>
						{#each checked as perm}
							<TableItem><input type="checkbox"></TableItem>
						{/each}
						<TableItem>
							<Button round={true}>XXX</Button>
						</TableItem>
					</TableRow>
				{/each}
				<!--
				<TableRow>
					<TableItem>HyperHamlet</TableItem>
					<TableItem><input type="checkbox"></TableItem>
					<TableItem><input type="checkbox"></TableItem>
					<TableItem>
						<Button round={true}>XXX</Button>
					</TableItem>
				</TableRow>
				<TableRow>
					<TableItem>SwissBritNet</TableItem>
					<TableItem><input type="checkbox"></TableItem>
					<TableItem><input type="checkbox"></TableItem>
					<TableItem>
						<Button round={true}>XXX</Button>
					</TableItem>
				</TableRow>
				<TableRow>
					<TableItem>XYZ</TableItem>
					<TableItem><input type="checkbox"></TableItem>
					<TableItem><input type="checkbox"></TableItem>
					<TableItem>
						<Button round={true}>XXX</Button>
					</TableItem>
				</TableRow>
				<TableRow>
					<TableItem>XYZ</TableItem>
					<TableItem><input type="checkbox"></TableItem>
					<TableItem><input type="checkbox"></TableItem>
					<TableItem>
						<Button round={true}>XXX</Button>
					</TableItem>
				</TableRow>
				-->
			</TableBody>
		</Table>
	</form>
</div>
