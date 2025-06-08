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
	import { onMount, tick } from 'svelte';
	import { OldapProject } from '$lib/oldap/classes/project';
	import DropdownButton from '$lib/components/basic_gui/dropdown/DropdownButton.svelte';
	import DropdownButtonItem from '$lib/components/basic_gui/dropdown/DropdownButtonItem.svelte';
	import DropdownMenu from '$lib/components/basic_gui/dropdown/DropdownMenu.svelte';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import Checkbox from '$lib/components/basic_gui/checkbox/Checkbox.svelte';
	import { OldapPermissionSet } from '$lib/oldap/classes/permissionset';
	import { languageTag } from '$lib/paraglide/runtime';
	import { convertToLanguage, Language } from '$lib/oldap/enums/language';
	import { dataPermissionAsString } from '$lib/oldap/enums/data_permissions';
	import { OldapErrorInvalidValue } from '$lib/oldap/errors/OldapErrorInvalidValue';
	import { successInfoStore } from '$lib/stores/successinfo';
	import { difference, intersection } from '$lib/helpers/setops';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { goto } from '$app/navigation';

	type ProjRef = {iri: string, sname: string};
	type CheckedState = {[key: string]: Record<AdminPermission, boolean>};
	type AdminPerm = 'ADMIN_OLDAP' | 'ADMIN_USERS' | 'ADMIN_PERMISSION_SETS' | 'ADMIN_RESOURCES' | 'ADMIN_MODEL' |'ADMIN_CREATE'

	let { data }: PageProps = $props();

	let lang = $state(languageTag());
	let langobj = $derived(convertToLanguage(lang) ?? Language.EN);

	let authinfo: AuthInfo | null = $authInfoStore;
	let administrator = $state<OldapUser | null>(null);
	const ncname_pattern: RegExp = /^[A-Za-z_][A-Za-z0-9._-]*$/;
	const email_pattern: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	const iri_pattern: RegExp = /^(https?:\/\/|urn:)[^\s]+$/;
	const password_pattern: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

	let user_in_projects = $state<ProjRef[]>([]);
	let assignable_projects = $state<ProjRef[]>([]);
	let addProjOpen = $state(false);

	//let all_projects = $state<Record<string, OldapProject>>({});
	let all_projects: Record<string, OldapProject> = {};
	let user: OldapUser | null = null;

	let userIri = $state('');
	let userId = $state('');
	let password1 = $state('');
	let password2 = $state('');
	let familyName = $state('');
	let givenName = $state('');
	let email = $state('');
	let isActive = $state(false);
	let inProject = $state<CheckedState>({});
	let permissionSets = $state<OldapPermissionSet[]>([]);
	let user_permsets = $state<Record<string, boolean>>({});
	let topwin = $state<HTMLElement>();


	const allPermissions = Object.keys(AdminPermission)
		.map(key => AdminPermission[key as keyof typeof AdminPermission]);

	userStore.subscribe((admin) => {
		administrator = admin;
	});

	authInfoStore.subscribe(data => {
		authinfo = data;
	});

	function scrollToTop() {
		if (topwin) {
			topwin.scrollTo({ top: -1000, behavior: "smooth" });
		}
	}

	const goto_page = (url: string) => {
		return () => {
			const cleaned = url.startsWith('/') ? url : `/${url}`;
			goto(`/${lang}${cleaned}`);
		}
	}


	const process_permissions = async (): Promise<void> => {
		const sysprojref = {iri: "oldap:SystemProject", sname: 'oldap'} as ProjRef;
		const exists = user_in_projects.some(
			item => item.iri === "oldap:SystemProject"
		);
		let tmp: ProjRef[];
		if (!exists) {
			tmp = [sysprojref, ...user_in_projects];
		}
		else {
			tmp = user_in_projects;
		}
		const promises2 = tmp.map(async (in_project) => { // get data permission set iris for all projects the user is in
			const permset_config = api_get_config(authinfo as AuthInfo, {definedByProject: in_project.iri});
			const jsondata = await apiClient.getAdminpermissionsetsearch(permset_config);
			return jsondata;
		});
		let permset_iris: string[] = [];
		try {
			const results2 = await Promise.all(promises2);
			permset_iris = results2.flat();
		}
		catch (error) {
			return Promise.reject(error);
		}
		const promises3 = permset_iris.map(async ps_iri => { // get the complete permission set data for all permission sets
			const dataperm_config = api_get_config(authinfo as AuthInfo, {iri: ps_iri});
			return await apiClient.getAdminpermissionsetget(dataperm_config);
		});
		try {
			const results3 = await Promise.all(promises3);

			let gaga = user?.hasPermissions?.map(item => item.toString()) || [];

			permissionSets = results3.map(jsonobj => {
				let tmp = OldapPermissionSet.fromOldapJson(jsonobj);
				tmp.projectShortName = all_projects[tmp.definedByProject.toString()]?.projectShortName.toString();
				if (tmp?.permissionSetIri) {
					user_permsets[tmp.permissionSetIriAsString] = gaga.includes(tmp.permissionSetIriAsString);
				}
				return tmp;
			});
		}
		catch (error) {
			return Promise.reject(error);
		}
	}

	onMount(async () => {
		if (!topwin) return;
		//
		// fill "all_projects_iris" containing all the project iri's the current administrator may assign to the given user
		//
		let all_projects_iris: string[] = [];
		if (administrator) { // the administrator has to be defined...
			if (administrator.isRoot) {
				const psearch_config = api_get_config(authinfo as AuthInfo);
				try {
					const projs = await apiClient.getAdminprojectsearch(psearch_config);
					projs.forEach(p => {
						if (p.projectIri) {
							all_projects_iris.push(p.projectIri);
						}
					});
				}
				catch (error) {
					errorInfoStore.set(process_api_error(error as Error));
					return;
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
		const promises = all_projects_iris.map(async iri => {
			const config_projectdata = api_get_config(authinfo as AuthInfo, { iri: iri });
			const jsondata = await apiClient.getAdminprojectget(config_projectdata);
			const project = OldapProject.fromOldapJson(jsondata);
			return { iri: project.projectIri.toString(), project };
		});
		try {
			const results = await Promise.all(promises);
			all_projects = Object.fromEntries(results.filter(p => p !== null).map(({ iri, project }) => [iri, project]));
		}
		catch (error) {
			errorInfoStore.set(process_api_error(error as Error));
			return;
		}

		if (data?.userid !== 'new') {
			//
			// first we get the user data of the already existing user
			//
			const config_userdata = api_notget_config(authinfo as AuthInfo, { userId: data.userid });
			try {
				const jsondata = await apiClient.getAdminuserUserId(config_userdata);
				user = OldapUser.fromOldapJson(jsondata);
				if (user) {
					userIri = user.userIri.toString();
					userId = user.userId.toString();
					givenName = user.givenName;
					familyName = user.familyName;
					email = user.email;
					isActive = user.isActive;

					Object.keys(all_projects).forEach((p_iri) => {
						let tmp = false;
						user?.inProject?.forEach(in_project => {
							if (in_project.project.toString() === p_iri) {
								user_in_projects.push({iri: p_iri, sname: all_projects[p_iri].projectShortName.toString()});
								inProject[p_iri]  = {} as Record<AdminPermission, boolean>;
								allPermissions.forEach(permission => {
									if (in_project.permissions.includes(permission)) {
										inProject[p_iri][permission] = true;
									} else {
										inProject[p_iri][permission] = false;
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
				return;
			}
			assignable_projects = assignable_projects.sort((a, b) => a.sname.localeCompare(b.sname));
			user_in_projects = user_in_projects.sort((a, b) => a.sname.localeCompare(b.sname));
		}
		else {
			//
			// we want to create a new user...
			//
			Object.keys(all_projects).forEach((p_iri) => {
				assignable_projects.push({iri: p_iri, sname: all_projects[p_iri].projectShortName.toString()});
				assignable_projects = assignable_projects.sort((a, b) => a.sname.localeCompare(b.sname));
			});
		}

		// Initial scroll in case elements are already present
		await tick();
		scrollToTop();
	});

	$effect(() => {
		process_permissions().catch(error => {
			errorInfoStore.set(process_api_error(error as Error));
		});
	});

	const add_project = (proj_ref: ProjRef) => {
		inProject[proj_ref.iri] = {} as Record<AdminPermission, boolean>;
		allPermissions.forEach(permission => {
			inProject[proj_ref.iri][permission] = false;
		});
		assignable_projects = assignable_projects.filter(item => item.iri !== proj_ref.iri);
		user_in_projects.push(proj_ref);
		assignable_projects = assignable_projects.sort((a, b) => a.sname.localeCompare(b.sname));
		user_in_projects = user_in_projects.sort((a, b) => a.sname.localeCompare(b.sname));
		addProjOpen = false;
	};

	const remove_project = (proj_ref: ProjRef) => {
		delete inProject[proj_ref.iri];
		user_in_projects = user_in_projects.filter(item => item.iri !== proj_ref.iri);
		assignable_projects.push(proj_ref);
		assignable_projects = assignable_projects.sort((a, b) => a.sname.localeCompare(b.sname));
		user_in_projects = user_in_projects.sort((a, b) => a.sname.localeCompare(b.sname));
		addProjOpen = false;
	};

	const validate_password = (pw?: string): [boolean, string] => {
		let ele1 = document.getElementById('password1') as HTMLInputElement;
		if (ele1?.value !== pw) {
			return [false, "Passwords do not match!"];
		}
		else {
			return [true, "OK"];
		}
	}

	const add_user = () => {
		//
		// check validity of user data...
		//
		if (!(ncname_pattern as RegExp).test(userId)) {
			errorInfoStore.set(new OldapErrorInvalidValue('userID is not valid! Must be NCName'));
			return;
		}
		if (userIri && !(iri_pattern as RegExp).test(userIri)) {
			errorInfoStore.set(new OldapErrorInvalidValue('User iriri is not valid!'));
			return;
		}
		if (!givenName) {
			errorInfoStore.set(new OldapErrorInvalidValue('Given name is empty!'));
			return;
		}
		if (!familyName) {
			errorInfoStore.set(new OldapErrorInvalidValue('Family name is empty!'));
			return;
		}

		if (!(email_pattern as RegExp).test(email)) {
			errorInfoStore.set(new OldapErrorInvalidValue('Email is not valid!'));
			return;
		}
		if (!(password_pattern as RegExp).test(password1)) {
			errorInfoStore.set(new OldapErrorInvalidValue('Passwords is not valid!'));
			return;
		}
		if (password1 !== password2) {
			errorInfoStore.set(new OldapErrorInvalidValue('Passwords do not match!'));
			return;
		}
		//
		// build project membership and admin permissions for each project
		//
		let in_project: {project: string, permissions: AdminPerm[]}[] = []
		Object.entries(inProject).forEach(([iri, perms]) => {
			let p: AdminPerm[] = []
			Object.entries(perms).forEach(([perm, is_set]) => {
				if (is_set) {
					const tmp = perm.split(':');
					p.push(tmp[1] as AdminPerm);
				}
			});
			in_project.push({project: iri, permissions: p});
		});
		let userdata: {
			givenName: string,
			familyName: string,
			email: string,
			password: string,
			isActive: boolean,
			inProjects: {project: string, permissions: AdminPerm[]}[],
			hasPermissions: string[]
		} = {
			givenName: givenName,
			familyName: familyName,
			email: email,
			password: password1,
			isActive: isActive,
			inProjects: in_project,
			hasPermissions: []
		};

		//
		// build permission sets the user has assigned
		//
		Object.entries(user_permsets).forEach(([iri, checked]) => {
			if (checked) {
				userdata.hasPermissions.push(iri);
			}
		});
		const user_put = api_notget_config(authinfo as AuthInfo, {userId: userId});
		apiClient.putAdminuserUserId(userdata, user_put).then((res) => {
			console.log("ADD NEW USER");
			console.log(userdata);
			successInfoStore.set(`User "${res.userId}" added successfully!`);
			//window.history.back();
		}).catch((error) => {
			console.log("ADD NEW USER FAILED");
			console.log(userdata);
			errorInfoStore.set(process_api_error(error as Error));
		});
	}

	const modify_user = () => {
		let userdata: {
			userId?: string,
			givenName?: string,
			familyName?: string,
			email?: string,
			password?: string,
			isActive?: boolean,
			inProjects?: {project: string, permissions: AdminPerm[] | null | Record<'add'|'del', AdminPerm[]> }[],
			hasPermissions?: string[] | Record<'add'|'del', string[]>
		} = {};
		if (userId !== user?.userId.toString()) {
			userdata.userId = userId;
		}
		if (givenName !== user?.givenName) {
			userdata.givenName = givenName;
		}
		if (givenName !== user?.givenName) {
			userdata.givenName = givenName;
		}
		if (familyName !== user?.familyName) {
			userdata.familyName = familyName;
		}
		if (email !== user?.email) {
			if (!(email_pattern as RegExp).test(email)) {
				errorInfoStore.set(new OldapErrorInvalidValue('Email is not valid!'));
				return;
			}
			userdata.email = email;
		}
		if (isActive !== user?.isActive) {
			userdata.isActive = isActive;
		}
		//
		// check project membership
		//
		const p_iris = new Set(Object.keys(inProject));
		const u_iris = new Set(user?.inProject?.map(x => x.project.toString()));

		const new_iris = difference(p_iris, u_iris);
		const removed_iris = difference(u_iris, p_iris);
		const other_iris = intersection(p_iris, u_iris);

		if (new_iris || other_iris) {
			userdata.inProjects = [] as {project: string, permissions: AdminPerm[]}[];
			// add new projects with permissions
			for (const iri of new_iris) {
				let p: AdminPerm[] = []
				Object.entries(inProject[iri]).forEach(([perm, is_set]) => {
					if (is_set) {
						const tmp = perm.split(':');
						p.push(tmp[1] as AdminPerm);
					}
				});
				userdata.inProjects.push({project: iri, permissions: p});
			}
			// remove projects
			for (const iri of removed_iris) {
				userdata.inProjects.push({project: iri, permissions: null});
			}
		}
		// modify (if necessary) existing inProject permissions
		for (const iri of other_iris) {
			let u_perms = new Set<AdminPerm>(); // permissions previously set for this project iri
			let n_perms = new Set<AdminPerm>(); // permissions set in GUI for this project iri
			if (user?.inProject) {
				const pp = user.inProject.find(x => x.project.toString() === iri);
				if (pp) {
					for (const perm of pp.permissions) {
						const tmp = perm.split(':');
						u_perms.add(tmp[1] as AdminPerm);
					}
				}
			}
			Object.entries(inProject[iri]).forEach(([perm, is_set]) => {
				if (is_set) {
					const tmp = perm.split(':');
					n_perms.add(tmp[1] as AdminPerm);
				}
			});
			// now find out which permissions are to be added and deleted for this iri...
			const new_perms = difference(n_perms, u_perms);
			const del_perms = difference(u_perms, n_perms);
			// now let put the "add" and "del" modification to the userdata object that will be sent to the server
			if ((new_perms || del_perms) && !userdata.inProjects) {
				userdata.inProjects = [] as {project: string, permissions: AdminPerm[]}[];
			}
			if (new_perms.size > 0) {
				userdata?.inProjects?.push({project: iri, permissions: {'add': Array.from(new_perms)} as Record<'add'|'del', AdminPerm[]>});
			}
			if (del_perms.size > 0) {
				userdata?.inProjects?.push({project: iri, permissions: {'del': Array.from(del_perms)} as Record<'add'|'del', AdminPerm[]>});
			}
		}
		if (userdata?.inProjects?.length == 0) {
			delete userdata.inProjects;
		}

		//
		// process permission sets
		//
		const u_permsets = new Set<string>(user?.hasPermissions?.map(x => x.toString()));
		const n_permsets = new Set<string>([]);
		Object.entries(user_permsets).forEach(([perm, is_set]) => {
			if (is_set) n_permsets.add(perm);
		});
		if (n_permsets.size == 0) { // all permission sets have been removed!!
			userdata.hasPermissions = [];
		}
		else if (u_permsets.size == 0) { // User had nore permission sets before
			userdata.hasPermissions = Array.from(n_permsets);
		}
		else {
			const add_permsets = difference(n_permsets, u_permsets);
			const del_permsets = difference(u_permsets, n_permsets);
			let tmp: Record<'add'|'del', string[]> = {} as Record<'add'|'del', string[]>;
			if (add_permsets.size > 0) {
				tmp.add = Array.from(add_permsets);
			}
			if (del_permsets.size > 0) {
				tmp.del = Array.from(del_permsets);
			}
			console.log("====> tmp", tmp);
			if (tmp && Object.keys(tmp).length > 0) {
				userdata.hasPermissions = tmp;
			}
		}

		console.log("MODIFY USER:", userdata);
		const user_post = api_notget_config(authinfo as AuthInfo, {userId: user?.userId.toString() || ''});
		apiClient.postAdminuserUserId(userdata, user_post).then((res) => {
			successInfoStore.set(`User "${res.userId}" modified successfully!`);
		}).catch((error) => {
			errorInfoStore.set(process_api_error(error as Error));
		});
	}


</script>

{#snippet actions()}
	<div class="flex flex-row items-center justify-end gap-4">
		<span>
			<DropdownButton bind:isOpen={addProjOpen} buttonText="Add project" name="add-proj-menu" class="text-xs">
				<DropdownMenu bind:isOpen={addProjOpen} name="add-proj-menu" id="add-proj-menu-id" size="" transparent={false}>
				{#each assignable_projects as p_ref}
					<DropdownButtonItem bind:isOpen={addProjOpen} onclick={() => {add_project(p_ref)}}>{p_ref.sname}</DropdownButtonItem>
				{/each}
				</DropdownMenu>
			</DropdownButton>
		</span>
	</div>
{/snippet}

<div class="absolute top-0 left-0 right-0 bottom-0 overflow-auto flex flex-col justify-center items-center" bind:this={topwin}>
	<div>{data.userid !== 'new' ? m.edit()  : m.add()} User </div>
	<form class="max-w-128">

		{#if data?.userid === 'new'}
			<Textfield type='text' label={m.user_iri()} name="useriri" id="useriri" placeholder="user Iri" required={false}
								 bind:value={userIri} pattern={iri_pattern} />
		{:else}
			<Textfield type='text' label={m.user_id()} name="useriri" id="useriri" placeholder="user Iri" required={false}
								 bind:value={userIri} pattern={iri_pattern} disabled={true}/>
		{/if}
		<Textfield type='text' label={m.user_id()} name="userid" id="userid" placeholder="user id" required={true}
							 bind:value={userId} pattern={ncname_pattern} />
		<Textfield type='password' label={m.password()} name="password" id="password1" placeholder="password"
							 required={data?.userid === 'new'} bind:value={password1} pattern={password_pattern} />
		<Textfield type='password' label={m.password()} name="password" id="password2" placeholder="password"
							 required={data?.userid === 'new'} bind:value={password2} validate={validate_password} />
		<Textfield type='text' label={m.family_name()} name="familyName" id="familyName" placeholder="family name"
							 required={true} bind:value={familyName} />
		<Textfield type='text' label={m.given_name()} name="givenName" id="givenName" placeholder="given name"
							 required={true} bind:value={givenName} />
		<Textfield type='email' label={m.email()} name="email" id="email" placeholder="john.doe@example.org" required={true}
							 bind:value={email} pattern={email_pattern} />
		<Togglefield label={m.is_active()} id="isActive" bind:toggle_state={isActive}/>
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
						<TableItem><input type="checkbox" bind:checked={inProject[p_ref.iri][AdminPermission.ADMIN_OLDAP]}></TableItem>
						<TableItem><input type="checkbox" bind:checked={inProject[p_ref.iri][AdminPermission.ADMIN_USERS]}></TableItem>
						<TableItem><input type="checkbox" bind:checked={inProject[p_ref.iri][AdminPermission.ADMIN_PERMISSION_SETS]}></TableItem>
						<TableItem><input type="checkbox" bind:checked={inProject[p_ref.iri][AdminPermission.ADMIN_RESOURCES]}></TableItem>
						<TableItem><input type="checkbox" bind:checked={inProject[p_ref.iri][AdminPermission.ADMIN_MODEL]}></TableItem>
						<TableItem><input type="checkbox" bind:checked={inProject[p_ref.iri][AdminPermission.ADMIN_CREATE]}></TableItem>
						<TableItem><input type="checkbox" bind:checked={inProject[p_ref.iri][AdminPermission.ADMIN_LISTS]}></TableItem>
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

		<div class="text-sm ">Data Permissions</div>
		{#each permissionSets as pset}
			{@const txt = `${pset?.label ? pset?.label.get(langobj) : ''} (${dataPermissionAsString(pset?.givesPermission)} ${m.fromproj()} "${pset?.projectShortName}")`}
			<Checkbox label={txt} position="right" bind:checked={user_permsets[pset?.permissionSetIri.toString()]}></Checkbox>
		{/each}


		<div class="flex justify-center gap-4 mt-6">
			<Button class="mx-4 my-2" onclick={goto_page('/admin')}>{m.cancel()}</Button>
			{#if data?.userid === 'new'}
				<Button class="mx-4 my-2" onclick={() => add_user()}>{m.add()}</Button>
			{:else}
				<Button class="mx-4 my-2" onclick={() => modify_user()}>{m.modify()}</Button>
			{/if}
		</div>
	</form>
</div>

