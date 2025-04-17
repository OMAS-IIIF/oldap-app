<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import type { PageProps } from './$types';
	import Textfield from '$lib/components/basic_gui/inputs/Textfield.svelte';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { OldapUser } from '$lib/oldap/classes/user';
	import { userStore } from '$lib/stores/user';
	import { onMount, tick } from 'svelte';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { OldapError } from '$lib/oldap/errors/OldapError';
	import { api_get_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import { OldapProject } from '$lib/oldap/classes/project';
	import { api_notget_config } from '$lib/helpers/api_config.js';
	import { LangString } from '$lib/oldap/datatypes/langstring';
	import LangstringField from '$lib/components/basic_gui/inputs/LangstringField.svelte';
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';
	import DatePicker from '$lib/components/basic_gui/inputs/DatePicker.svelte';

	let { data }: PageProps = $props();


	const project_iri_pattern: RegExp = /^(https?:\/\/[^\s<>"]+|urn:[^\s<>"]+|[A-Za-z_][\w.-]*:[\w.-]+)$/;
	const ncname_pattern: RegExp = /^[A-Za-z_][A-Za-z0-9._-]*$/;
	const namespace_pattern = /^https?:\/\/[^\s<>"]+[\/#]$/;

	let authinfo: AuthInfo;
	let administrator = $state<OldapUser | null>(null);

	let projectIri = $state('');
	let sname = $state('');
	let namespaceIri = $state('');
	let label_field: LangstringField;
	let label = $state<LangString | null>(null);
	let comment_field: LangstringField;
	let comment = $state<LangString | null>(null);
	let projectStart = $state<Date | null>(null);
	let projectEnd = $state<Date | null>(null);

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
						label = project.label || null;
						projectStart = project.projectStart || null;
						projectEnd = project.projectEnd || null;
					}
				}
			}
			else {
				errorInfoStore.set(new OldapError("You must be root user to access this page."));
			}
		}
		await tick();
		scrollToTop();
	});

	const add_project = () => {

	};

	const modify_project = () => {
		console.log('MODIFIED-1:', label_field.get_value());
		console.log('MODIFIED-1:', comment_field.get_value());
	};

</script>

<div class="absolute top-0 left-0 right-0 bottom-0 overflow-auto flex flex-col justify-center items-center" bind:this={topwin}>
	<div>{data.sname !== 'new' ? m.edit()  : m.add()} Project </div>
	<form class="max-w-128 min-w-96">
		<Textfield type='text' label={m.project_iri()} name="projectiri" id="projectiri" placeholder="project Iri" required={true}
							 bind:value={projectIri} pattern={project_iri_pattern} disabled={data?.sname !== 'new'} />
		<Textfield type='text' label={m.project_sname()} name="sname" id="sname" placeholder="shortname" required={true}
							 bind:value={sname} pattern={ncname_pattern} disabled={data?.sname !== 'new'} />
		<Textfield type='text' label={m.namespaceiri()} name="namespaceiri" id="namespaceiri" placeholder="namespace iri" required={true}
							 bind:value={namespaceIri} pattern={namespace_pattern} disabled={data?.sname !== 'new'} />
		<LangstringField bind:this={label_field} label={m.label()} name="label" id="label" placeholder="label" value={label} />
		<LangstringField bind:this={comment_field} label="COMMENT" name="comment" id="comment" placeholder="comment" value={comment} />
		<DatePicker label="Project start" name="project_start" id="project_start" bind:value={projectStart} />
		<DatePicker label="Project start" name="project_start" id="project_start" bind:value={projectEnd} />

		<div class="flex justify-center gap-4 mt-6">
			<Button class="mx-4 my-2" onclick={() => window.history.back()}>{m.cancel()}</Button>
			{#if data?.sname === 'new'}
				<Button class="mx-4 my-2" onclick={() => add_project()}>{m.add()}</Button>
			{:else}
				<Button class="mx-4 my-2" onclick={() => modify_project()}>{m.modify()}</Button>
			{/if}
		</div>

	</form>
</div>