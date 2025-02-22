<script lang="ts">

	import DropdownLinkItem from '$lib/components/basic_gui/dropdown/DropdownLinkItem.svelte';
	import DropdownMenu from '$lib/components/basic_gui/dropdown/DropdownMenu.svelte';
	import DropdownLabel from '$lib/components/basic_gui/dropdown/DropdownLabel.svelte';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import { apiClient } from '$lib/shared/apiClient';
	import { userStore } from '$lib/stores/user';
	import type { InProject, OldapUser } from '$lib/oldap/classes/user';
	import { api_config } from '$lib/helpers/api_config';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { error } from '@sveltejs/kit';
	import { OldapProject } from '$lib/oldap/classes/project';
	import { languageTag } from '$lib/paraglide/runtime';
	import { onMount } from 'svelte';
	import { NCName } from '$lib/oldap/datatypes/xsd_ncname';
	import { projectStore } from '$lib/stores/project';
	import { convertToLanguage, Language } from '$lib/oldap/enums/language';

	let projectsIsOpen = $state(false);
	let current_project_id = $state<string | null>(null);
	let lang = $state(languageTag());
	let langobj = $derived(convertToLanguage(lang) ?? Language.EN);

	let projects: Record<string, OldapProject> = $state<Record<string, OldapProject>>({});

	let authinfo: AuthInfo;

	onMount(() => {
		authinfo = AuthInfo.fromString(sessionStorage.getItem('authinfo'));
	});

	userStore.subscribe(async (user: OldapUser | null) => {
		if (user !== null && user !== undefined) {
			console.log("USER=", user);

			let project_iris: string[] | undefined;
			if (user.isRoot) {
				const all_projects_config = api_config(authinfo)
				try {
					const res = await apiClient.getAdminprojectsearch(all_projects_config);
					project_iris = res.map(item => item.projectIri) as string[] | undefined;
				}
				catch (err) {
					process_api_error(err as Error)
				}
			}
			else {
				project_iris = user.inProject?.map((x) => (x.project.toString()));
			}
			for (const iri of project_iris || []) {
				let config_projectiri = api_config(authinfo, undefined, { iri: iri });
				try {
					let proj_data = await apiClient.getAdminprojectget(config_projectiri);
					const project = OldapProject.fromOldapJson(proj_data);
					projects[project.projectShortName.toString()] = project;
				}
				catch (err) {
					console.log(err);
				}
			}
			for (const k in projects) {
				current_project_id = projects[k].projectShortName.toString();
				break;
			}
		}
		else {
			current_project_id = null;
			projectStore.set(null);
		}
	});

	const set_current_project = (project_id: string): void => {
		current_project_id = project_id;
		projectStore.set(projects[project_id]);
	}

</script>


<DropdownLabel bind:isOpen={projectsIsOpen} name="projects"
							 labelText={current_project_id ? projects[current_project_id].label[langobj] : 'Projects'}>
	<DropdownMenu bind:isOpen={projectsIsOpen} position="left" name="projects">
		{#each Object.entries(projects) as [key, value]}
			<DropdownLinkItem bind:isOpen={projectsIsOpen}
												onclick={() => set_current_project(key)} id="oldap"
												selected={key == current_project_id}>
				{value?.label?.[langobj] ?? key}
			</DropdownLinkItem>
		{/each}
	</DropdownMenu>
</DropdownLabel>
