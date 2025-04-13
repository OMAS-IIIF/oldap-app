<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import type { PageProps } from './$types';
	import Textfield from '$lib/components/basic_gui/inputs/Textfield.svelte';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { OldapUser } from '$lib/oldap/classes/user';
	import { userStore } from '$lib/stores/user';
	import { onMount } from 'svelte';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { OldapError } from '$lib/oldap/errors/OldapError';
	import { api_get_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import { OldapProject } from '$lib/oldap/classes/project';
	import { api_notget_config } from '$lib/helpers/api_config.js';
	import { LangString } from '$lib/oldap/datatypes/langstring';
	import LangstringField from '$lib/components/basic_gui/inputs/LangstringField.svelte';

	let { data }: PageProps = $props();


	const project_iri_pattern: RegExp = /^(https?:\/\/[^\s<>"]+|urn:[^\s<>"]+|[A-Za-z_][\w.-]*:[\w.-]+)$/;
	const ncname_pattern: RegExp = /^[A-Za-z_][A-Za-z0-9._-]*$/;
	const namespace_pattern = /^https?:\/\/[^\s<>"]+[\/#]$/;

	let authinfo: AuthInfo;
	let administrator = $state<OldapUser | null>(null);
	let project: OldapProject | null = null;

	let projectIri = $state('');
	let sname = $state('');
	let namespaceIri = $state('');
	let label = $state<LangString | null>(null);

	let topwin = $state<HTMLElement>();

	userStore.subscribe((admin) => {
		administrator = admin;
	});

	function scrollToTop() {
		if (topwin) {
			topwin.scrollTo({ top: -1000, behavior: 'smooth' });
		}
	}

	onMount(async () => {
		if (!topwin) return;
		authinfo = AuthInfo.fromString(sessionStorage.getItem('authinfo'));
		if (administrator) { // the administrator has to be defined...
			if (administrator.isRoot) {
				if (data?.sname !== 'new') {
					const config_projectdata = api_notget_config(authinfo, { projectId: data?.sname});
					const jsondata = await apiClient.getAdminprojectProjectId(config_projectdata);
					let project = OldapProject.fromOldapJson(jsondata);
					if (project) {
						projectIri = project.projectIri.toString();
						sname = project.projectShortName.toString();
						namespaceIri = project.namespaceIri.toString();
						label = project.label;
					}
				}
				else {
				}
			}
			else {
				errorInfoStore.set(new OldapError("You must be root user to access this page."));
			}
		}
	});

</script>

<div class="absolute top-0 left-0 right-0 bottom-0 overflow-auto flex flex-col justify-center items-center" bind:this={topwin}>
	<div>{data.sname !== 'new' ? m.edit()  : m.add()} Project </div>
	<form class="max-w-128 min-w-64">

		{#if data?.sname === 'new'}
			<Textfield type='text' label={m.project_iri()} name="projectiri" id="projectiri" placeholder="project Iri" required={true}
								 bind:value={projectIri} pattern={project_iri_pattern} />
		{:else}
			<Textfield type='text' label={m.project_iri()} name="projectiri" id="projectiri" placeholder="project Iri" required={true}
								 bind:value={projectIri} pattern={project_iri_pattern} disabled={true}/>
		{/if}
		<Textfield type='text' label={m.project_sname()} name="sname" id="sname" placeholder="shortname" required={true}
							 bind:value={sname} pattern={ncname_pattern} />

		<Textfield type='text' label={m.project_sname()} name="namespaceiri" id="namespaceiri" placeholder="namespace iri" required={true}
							 bind:value={namespaceIri} pattern={namespace_pattern} />
		<LangstringField label="LABEL" name="label" id="label" placeholder="label" value={label} />

	</form>
</div>