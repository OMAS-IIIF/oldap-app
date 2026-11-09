<script lang="ts">

	import DropdownLinkItem from '$lib/components/basic_gui/dropdown/DropdownLinkItem.svelte';
	import DropdownMenu from '$lib/components/basic_gui/dropdown/DropdownMenu.svelte';
	import DropdownLabel from '$lib/components/basic_gui/dropdown/DropdownLabel.svelte';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import { apiClient } from '$lib/shared/apiClient';
	import { userStore } from '$lib/stores/user';
	import type { OldapUser } from '$lib/oldap/classes/user';
	import { api_config } from '$lib/helpers/api_config';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { OldapProject } from '$lib/oldap/classes/project';
	import { getLocale } from '$lib/paraglide/runtime';
	import { projectStore } from '$lib/stores/project';
	import { convertToLanguage, Language } from '$lib/oldap/enums/language';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { refreshProjectsList } from '$lib/stores/refresh_projectslist.svelte';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { refreshResourcesListNow } from '$lib/stores/refresh_resourceslist.svelte';
	import { refreshPropertiesList, refreshPropertiesListNow } from '$lib/stores/refresh_propertieslist.svelte';
	import { spinnerStore } from '$lib/stores/spinner';
	import { DatamodelClass } from '$lib/oldap/classes/datamodel';
	import { datamodelStore } from '$lib/stores/datamodel';

	let projectsIsOpen = $state(false);
	let current_project_id = $state<string | null>(null);
	let lang = $state(getLocale());
	let langobj = $derived(convertToLanguage(lang) ?? Language.EN);
	import * as m from '$lib/paraglide/messages';
	import { read_projects } from '$lib/helpers/read_projects';

	let projects: Record<string, OldapProject> = $state<Record<string, OldapProject>>({});

	let authinfo: AuthInfo | null = $authInfoStore;

	authInfoStore.subscribe(data => {
		authinfo = data;
	});

	// Restore the selected project's model as well as its label after login/reload.
	// A cancelled load must not restore data from a previous user session.
	$effect(() => {
		const user = $userStore;
		const auth = $authInfoStore;
		const refresh = $refreshProjectsList;
		void refresh;
		let cancelled = false;
		if (!user || !auth) {
			projects = {};
			current_project_id = null;
			projectStore.set(null);
			datamodelStore.set(null);
			return;
		}
		read_projects(user, auth).then((available) => {
			if (cancelled) return;
			projects = available;
			const selected = current_project_id && current_project_id in available
				? current_project_id : Object.keys(available)[0];
			if (selected) set_current_project(selected);
			else {
				current_project_id = null;
				projectStore.set(null);
				datamodelStore.set(null);
			}
		}).catch((error) => {
			if (!cancelled) errorInfoStore.set(process_api_error(error as Error));
		});
		return () => { cancelled = true; };
	});

	const set_current_project = (project_id: string): void => {
		current_project_id = project_id;
		projectStore.set(projects[project_id]);
		const dm_config = api_config(authinfo || new AuthInfo('', ''), { project:  project_id});
		spinnerStore.set(m.retrieve_dm());
		apiClient.getAdmindatamodelProject(dm_config).then((jsonresult) => {
			if (current_project_id !== project_id || !$userStore) return;
			const datamodel = DatamodelClass.fromOldapJson(jsonresult);
			datamodelStore.set(datamodel);
			spinnerStore.set(null);
		}).catch((error) => {
			spinnerStore.set(null);
			errorInfoStore.set(process_api_error(error as Error));
		});

		refreshResourcesListNow();
		refreshPropertiesListNow()
	}

</script>


<DropdownLabel bind:isOpen={projectsIsOpen} name="projects"
							 labelText={current_project_id ? projects[current_project_id]?.label?.get(langobj) : 'Projects'}>
	<DropdownMenu bind:isOpen={projectsIsOpen} position="left" name="projects" id="projects-id">
		{#each Object.entries(projects) as [key, value]}
			<DropdownLinkItem bind:isOpen={projectsIsOpen}
												onclick={() => set_current_project(key)} id="oldap"
												selected={key == current_project_id}>
				{value?.label?.get(langobj) ?? key}
			</DropdownLinkItem>
		{/each}
	</DropdownMenu>
</DropdownLabel>
