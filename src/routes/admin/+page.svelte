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

	let tabs: TabsType = $state({}); // info about the tabs: key and (lang-dependent) name
	let administrator: OldapUser | null = $state($userStore);  // the admin user...
	let project = $state<OldapProject | null>(get(projectStore)); // the current project that the administrator has elected
	let selected_tab = $state(''); // the current tab that has been selected....

	let tabs_height = $state(100); // just an arbitrary value
	let table_height = $state(($contentAreaHeight || 200) - (() => tabs_height)() - 25);

	//
	// TODO: this is net working I think...
	//
	adminTabState.subscribe((state) => {
		if (state) {
			selected_tab = state;
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
	<HlistsList table_height={table_height} {project}/>
{/if}

