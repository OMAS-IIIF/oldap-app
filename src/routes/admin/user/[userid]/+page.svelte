<script lang="ts">
	import type { PageProps } from './$types';
	import Textfield from '$lib/components/basic_gui/inputs/Textfield.svelte';
	import { apiClient } from '$lib/shared/apiClient';
	import { OldapUser } from '$lib/oldap/classes/user';
	import { userStore } from '$lib/stores/user';
	import { api_get_config, api_notget_config } from '$lib/helpers/api_config';
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
	import DropdownButton from '$lib/components/basic_gui/dropdown/DropdownButton.svelte';
	import DropdownButtonItem from '$lib/components/basic_gui/dropdown/DropdownButtonItem.svelte';
	import DropdownMenu from '$lib/components/basic_gui/dropdown/DropdownMenu.svelte';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';

	type ProjRef = {iri: string, sname: string};
	type CheckedState = {[key: string]: Record<AdminPermission, boolean>};

	let { data }: PageProps = $props();

	let authinfo: AuthInfo;
	let user = $state<OldapUser | null>(null);
	let administrator = $state<OldapUser | null>(null);
	const ncname_pattern = /^[A-Za-z_][A-Za-z0-9._-]*$/;
	const email_pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	let user_in_projects = $state<ProjRef[]>([]);
	let assignable_projects = $state<ProjRef[]>([]);
	let checked = $state<CheckedState>({});
	let addProjOpen = $state(false);


	const allPermissions = Object.keys(AdminPermission)
		.map(key => AdminPermission[key as keyof typeof AdminPermission]);

	userStore.subscribe((admin) => {
		administrator = admin;
	})

	onMount(async () => {
		authinfo = AuthInfo.fromString(sessionStorage.getItem('authinfo'));
		//
		// fill "all_projects_iris" containing all the project iri's the current administrator may assign to the given user
		//
		let all_projects_iris: string[] = [];
		if (administrator) { // the administrator has to be defined...
			if (administrator.isRoot) {
				const psearch_config = api_get_config(authinfo);
				try {
					const projs = await apiClient.getAdminprojectsearch(psearch_config);
					projs.forEach(p => {
						if (p.projectIri) {
							console.log("p=", p.projectIri);
							all_projects_iris.push(p.projectIri);
						}
					});
				}
				catch (error) {
					errorInfoStore.set(process_api_error(error as Error));
					return null;
				}
			}
			else {
				administrator?.inProject?.forEach(in_project => {
					if (in_project.permissions.includes(AdminPermission.ADMIN_USERS)) {
						all_projects_iris.push(in_project.project.toString());
					}
				});
			}
		}
		//
		// now retrieve all projects data from the triplestore
		//
		let all_projects: Record<string, OldapProject> = {};
		const promises = all_projects_iris.map(async iri => {
			const config_projectdata = api_get_config(authinfo, { iri: iri });
			try {
				const jsondata = await apiClient.getAdminprojectget(config_projectdata);
				const project = OldapProject.fromOldapJson(jsondata);
				return { iri: project.projectIri.toString(), project };
			} catch (error) {
				errorInfoStore.set(process_api_error(error as Error));
				return null;
			}
		});
		const results = await Promise.all(promises);
		all_projects = Object.fromEntries(results.filter(p => p !== null).map(({ iri, project }) => [iri, project]));

		if (data?.userid) {
			//
			// first we get the user data
			//
			const config_userdata = api_notget_config(authinfo, { userId: data.userid });
			try {
				const jsondata = await apiClient.getAdminuserUserId(config_userdata);
				user = OldapUser.fromOldapJson(jsondata);
				if (user) {

					Object.keys(all_projects).forEach((p_iri) => {
						let tmp = false;
						user?.inProject?.forEach(in_project => {
							if (in_project.project.toString() === p_iri) {
								user_in_projects.push({iri: p_iri, sname: all_projects[p_iri].projectShortName.toString()});
								checked[p_iri]  = {} as Record<AdminPermission, boolean>;
								allPermissions.forEach(permission => {
									if (in_project.permissions.includes(permission)) {
										console.log("+====>", permission);
										checked[p_iri][permission] = true;
									} else {
										console.log("-====>", permission);
										checked[p_iri][permission] = false;
									}
								});
								tmp = true;
							}
						});
						if (!tmp) {
							assignable_projects.push({iri: p_iri, sname: all_projects[p_iri].projectShortName.toString()});
						}
					});
				}
			} catch(error) {
				errorInfoStore.set(process_api_error(error as Error));
				return null;
			}
			assignable_projects = assignable_projects.sort((a, b) => a.sname.localeCompare(b.sname));
			user_in_projects = user_in_projects.sort((a, b) => a.sname.localeCompare(b.sname));
		}

	});

	const add_project = (proj_ref: ProjRef) => {
		checked[proj_ref.iri] = {} as Record<AdminPermission, boolean>;
		allPermissions.forEach(permission => {
			checked[proj_ref.iri][permission] = false;
		});
		assignable_projects = assignable_projects.filter(item => item.iri !== proj_ref.iri);
		user_in_projects.push(proj_ref);
		assignable_projects = assignable_projects.sort((a, b) => a.sname.localeCompare(b.sname));
		user_in_projects = user_in_projects.sort((a, b) => a.sname.localeCompare(b.sname));
		addProjOpen = false;
	};

	const remove_project = (proj_ref: ProjRef) => {
		delete checked[proj_ref.iri];
		user_in_projects = user_in_projects.filter(item => item.iri !== proj_ref.iri);
		assignable_projects.push(proj_ref);
		assignable_projects = assignable_projects.sort((a, b) => a.sname.localeCompare(b.sname));
		user_in_projects = user_in_projects.sort((a, b) => a.sname.localeCompare(b.sname));
		addProjOpen = false;
	};


</script>

{#snippet actions()}
	<div class="flex flex-row items-center justify-end gap-4">
		<span>
			<DropdownButton bind:isOpen={addProjOpen} buttonText="Add project" name="add-proj-menu" innerClass="text-xs">
				<DropdownMenu bind:isOpen={addProjOpen} name="add-proj-menu" size="" transparent={false}>
				{#each assignable_projects as p_ref}
					<DropdownButtonItem bind:isOpen={addProjOpen} onclick={() => {add_project(p_ref)}}>{p_ref.sname}</DropdownButtonItem>
				{/each}
				</DropdownMenu>
			</DropdownButton>
		</span>
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
		<Togglefield label={m.is_active()} id="isActive" toggle_state={user?.isActive}/>
		<Table label={m.projects()} description={m.perprojperms()} padding={false} action_elements={actions}>
			<TableHeader>
				<TableColumnTitle>{m.project()}</TableColumnTitle>
				<TableColumnTitle> <!-- ADMIN_OLDAP -->
					<Tooltip text={m.superuser()}>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
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
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
								 stroke="currentColor" class="size-4">
							<path stroke-linecap="round" stroke-linejoin="round"
										d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
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
				<TableColumnTitle>{m.action()}</TableColumnTitle>

			</TableHeader>
			<TableBody>
				{#each user_in_projects as p_ref}
					<TableRow>
						<TableItem>{p_ref.sname}</TableItem>
						<TableItem><input type="checkbox" bind:checked={checked[p_ref.iri][AdminPermission.ADMIN_OLDAP]}></TableItem>
						<TableItem><input type="checkbox" bind:checked={checked[p_ref.iri][AdminPermission.ADMIN_USERS]}></TableItem>
						<TableItem><input type="checkbox" bind:checked={checked[p_ref.iri][AdminPermission.ADMIN_PERMISSION_SETS]}></TableItem>
						<TableItem><input type="checkbox" bind:checked={checked[p_ref.iri][AdminPermission.ADMIN_RESOURCES]}></TableItem>
						<TableItem><input type="checkbox" bind:checked={checked[p_ref.iri][AdminPermission.ADMIN_MODEL]}></TableItem>
						<TableItem><input type="checkbox" bind:checked={checked[p_ref.iri][AdminPermission.ADMIN_CREATE]}></TableItem>
						<TableItem><input type="checkbox" bind:checked={checked[p_ref.iri][AdminPermission.ADMIN_LISTS]}></TableItem>
						<TableItem>
							<Button round={true} onclick={() => {remove_project(p_ref)}}>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
										 stroke="currentColor" class="size-4">
									<path stroke-linecap="round" stroke-linejoin="round"
												d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
								</svg>
							</Button>
						</TableItem>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	</form>
</div>
