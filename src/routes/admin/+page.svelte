<script lang="ts">

	import Tabs, { type TabsType } from '$lib/components/basic_gui/tabs/Tabs.svelte';
	import { userStore } from '$lib/stores/user';
	import { projectStore } from '$lib/stores/project';
	import type { OldapUser } from '$lib/oldap/classes/user';
	import { contentAreaHeight } from '$lib/stores/contentarea_h';
	import type { OldapProject } from '$lib/oldap/classes/project';
	import * as m from '$lib/paraglide/messages.js'
	import { AdminPermission } from '$lib/oldap/enums/admin_permissions';
	import UsersList from '$lib/components/oldap/UsersList.svelte';
	import { get } from 'svelte/store';
	import ProjectsList from '$lib/components/oldap/ProjectsList.svelte';
	import { adminTabState } from '$lib/stores/admintabstate';
	import HlistsList from '$lib/components/oldap/HlistsList.svelte';
	import DialogWin from '$lib/components/basic_gui/dialogs/DialogWin.svelte';
	import HList from '$lib/components/oldap/HList.svelte';
	import PermsetsList from '$lib/components/oldap/PermsetsList.svelte';
	import PropsList from '$lib/components/oldap/PropsList.svelte';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { api_config } from '$lib/helpers/api_config';
	import { spinnerStore } from '$lib/stores/spinner';
	import { apiClient } from '$lib/shared/apiClient';
	import { DatamodelClass } from '$lib/oldap/classes/datamodel';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import { datamodelStore } from '$lib/stores/datamodel';
	import ResourcesList from '$lib/components/oldap/ResourcesList.svelte';

	let tabs: TabsType = $state({}); // info about the tabs: key and (lang-dependent) name
	let administrator: OldapUser | null = $state($userStore);  // the admin user...
	let project = $state<OldapProject | null>(get(projectStore)); // the current project that the administrator has elected
	let selected_tab = $state(''); // the current tab that has been selected....

	let tabs_height = $state(100); // just an arbitrary value
	let table_height = $state(($contentAreaHeight || 200) - (() => tabs_height)() - 25);
	let hlistIsOpen = $state(false);

	let authinfo = $state<AuthInfo | null>($authInfoStore);


	//
	// TODO: this is net working I think...
	//
	adminTabState.subscribe((state) => {
		if (state) {
			selected_tab = state;
			hlistIsOpen = false;
		}
	})

	//
	// if we change the current project, we have to adjust!
	//
	projectStore.subscribe(projectinfo => {
		project = projectinfo;
		const in_project = administrator?.inProject?.find(
			inProject => inProject.project.toString() === project?.projectIri.toString()
		);
		if (administrator?.isRoot) {
			tabs = {
				projects: m.projects(),
				users: m.users(),
				lists: m.lists(),
				models: m.datamodel(),
				permsets: m.permsets()
			};
			if (!selected_tab) { // if we have already a selected tab (e.g. from the adminTabState), we use this
				selected_tab = 'projects';
			}
		} else { // administrator is not root
			// select the tabs that the administrator has access to
			in_project?.permissions.forEach((x) => {
				switch (x) {
					case AdminPermission.ADMIN_USERS:
						tabs['users'] = m.users();
						break;
					case AdminPermission.ADMIN_LISTS:
						tabs['lists'] = m.lists();
						break;
					case AdminPermission.ADMIN_MODEL:
						tabs['models'] = m.datamodel();
						break;
					case AdminPermission.ADMIN_PERMISSION_SETS:
						tabs['permsets'] = m.permsets();
						break;
				}
			});
		}
		if (authinfo) {
			const dm_config = api_config(authinfo, { project: project?.projectShortName.toString() || '' });
			spinnerStore.set(m.retrieve_dm());
			apiClient.getAdmindatamodelProject(dm_config).then((jsonresult) => {
				console.log("111111>", jsonresult);
				const datamodel = DatamodelClass.fromOldapJson(jsonresult);
				console.log("222222>", datamodel);
				datamodelStore.set(datamodel);
				spinnerStore.set(null);
			}).catch((error) => {
				spinnerStore.set(null);
				errorInfoStore.set(process_api_error(error as Error));
			});
		}

		if (!selected_tab || !(selected_tab in tabs)) {
			// no tab selected, or the tab selected is not available for this administrator
			if (tabs['projects']) {
				selected_tab = 'projects';
			} else if (tabs['users']) {
				selected_tab = 'users';
			} else if (tabs['lists']) {
				selected_tab = 'lists';
			} else if (tabs['models']) {
				selected_tab = 'models';
			} else if (tabs['permsets']) {
				selected_tab = 'permsets';
			} else {
				selected_tab = '';
			}
		}

	});


	//
	// act on changes of the contentAreaHeight
	//
	contentAreaHeight.subscribe((height) => {
		if (height) {
			table_height = height - tabs_height - 25;
		}
	});

	//
	// act on changes of tabs_height
	//
	$effect(() => {
		table_height = ($contentAreaHeight || 250) - tabs_height - 25;
	})

	$effect(() => {
		adminTabState.set(selected_tab);
	})

</script>

<Tabs tabs={tabs} bind:selected={selected_tab} bind:height={tabs_height}></Tabs>
{#if selected_tab === 'projects'}
	<ProjectsList table_height={table_height} />
{/if}
{#if selected_tab === 'users'}
	<UsersList table_height={table_height} {administrator} {project}/>
{/if}
{#if selected_tab === 'lists'}
	<HlistsList table_height={table_height} {project} bind:hlistIsOpen={hlistIsOpen} />
	<DialogWin title={m.new_hlist_title()} bind:isopen={hlistIsOpen}>
		<HList bind:isopen={hlistIsOpen} />
	</DialogWin>
{/if}
{#if selected_tab === 'models'}
	<div class="grid grid-cols-2 gap-4 h-full">
		<div class="min-w-0">
			<PropsList {table_height} {project} />
		</div>
		<div class="min-w-0">
			<ResourcesList {table_height} {project} />
		</div>
	</div>
{/if}
{#if selected_tab === 'permsets'}
	<PermsetsList table_height={table_height} {administrator} {project} />
{/if}

