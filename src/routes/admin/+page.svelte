<script lang="ts">

	import Tabs, { type TabsType } from '$lib/components/basic_gui/tabs/Tabs.svelte';
	import { userStore } from '$lib/stores/user';
	import { projectStore } from '$lib/stores/project';
	import type { InProject, OldapUser } from '$lib/oldap/classes/user';
	import Table from '$lib/components/basic_gui/table/Table.svelte';
	import { contentAreaHeight } from '$lib/stores/contentarea_h';
	import type { OldapProject } from '$lib/oldap/classes/project';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { onMount } from 'svelte';
	import { apiClient } from '$lib/shared/apiClient';
	import { api_get_config } from '$lib/helpers/api_config';
	import * as m from '$lib/paraglide/messages.js'
	import { AdminPermission } from '$lib/oldap/enums/admin_permissions';
	import UsersList from '$lib/components/oldap/UsersList.svelte';
	import { get } from 'svelte/store';

	//type UsersList = {[key: string]: OldapUser};

	let tabs: TabsType = $state({});
	let administrator: OldapUser | null = $state(null);
	let project = $state<OldapProject | null>(get(projectStore));
	let selected_tab = $state('');

	let tabs_height = $state(100); // just an arbitrary value
	let table_height = $state(($contentAreaHeight || 200) - (() => tabs_height)() - 25);

	let authinfo: AuthInfo;

	onMount(() => {
		authinfo = AuthInfo.fromString(sessionStorage.getItem('authinfo'));
	});

	//
	// the logged in user changed
	//
	userStore.subscribe((userinfo) => {
		if (userinfo) {
			//
			// we determine which tabs the user has available depending on his/her admin permissions
			administrator = userinfo;
			let in_project: InProject | undefined = undefined;
			administrator.inProject?.forEach((inProject) => {
				if (inProject.project.toString() === project?.projectIri.toString()) {
					in_project = inProject;
				}
			});
			if (administrator.isRoot) {
				tabs = {
					projects: m.projects(),
					users: m.users(),
					lists: m.lists(),
					models: m.datamodel(),
					permsets: m.permsets()
				}
			} else {
				if (in_project) {
					(in_project as InProject).permissions.forEach((x) => {
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
			}
		}
		else {
			tabs = {};
		}
		if (tabs['projects']) {
			selected_tab = 'projects';
		}
		else if (tabs['users']) {
			selected_tab = 'users';
		}
		else if (tabs['lists']) {
			selected_tab = 'lists';
		}
		else if (tabs['models']) {
			selected_tab = 'models';
		}
		else if (tabs['permsets']) {
			selected_tab = 'permsets';
		}
	});

	//
	// the project chosen has changed
	//
	projectStore.subscribe((projectinfo) => {
		if (projectinfo) {
			project = projectinfo;
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

</script>

<Tabs tabs={tabs} bind:selected={selected_tab} bind:height={tabs_height}></Tabs>
{#if selected_tab === 'users'}
	<UsersList table_height={table_height} bind:administrator={administrator} bind:project={project}/>
{/if}
