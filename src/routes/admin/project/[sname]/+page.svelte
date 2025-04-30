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
	import { availableLanguageTags } from '$lib/paraglide/runtime';
	import { convertToLanguage, Language } from '$lib/oldap/enums/language';
	import { difference } from '$lib/helpers/setops';
	import { XsdDate } from '$lib/oldap/datatypes/xsd_date';
	import { successInfoStore } from '$lib/stores/successinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';

	let { data }: PageProps = $props();


	const project_iri_pattern: RegExp = /^(https?:\/\/[^\s<>"]+|urn:[^\s<>"]+|[A-Za-z_][\w.-]*:[\w.-]+)$/;
	const ncname_pattern: RegExp = /^[A-Za-z_][A-Za-z0-9._-]*$/;
	const namespace_pattern = /^https?:\/\/[^\s<>"]+[\/#]$/;

	const languagesArray = Array.from(availableLanguageTags);

	let authinfo: AuthInfo;
	let administrator = $state<OldapUser | null>(null);

	let project: OldapProject;
	let projectIri = $state('');
	let sname = $state('');
	let namespaceIri = $state('');
	let label_field: LangstringField;
	let label = $state<LangString | null>(null);
	let comment_field: LangstringField;
	let comment = $state<LangString | null>(null);
	let projectStart_field: DatePicker;
	let projectStart = $state<Date | null>(null);
	let projectEnd_field: DatePicker;
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
					project = OldapProject.fromOldapJson(jsondata);
					if (project) {
						projectIri = project.projectIri.toString();
						sname = project.projectShortName.toString();
						namespaceIri = project.namespaceIri.toString();
						label = project.label || null;
						comment = project.comment || null;
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
		let projectdata: {
			label?: string[] | Partial<Record<'add'|'del', string[]>> | null,
			comment?: string[] | Partial<Record<'add'|'del', string[]>> | null,
			projectStart?: string | null,
			projectEnd?: string | null,
		} = {};
		const new_label = label_field.get_value();
		const tmp_modlabel = new_label.modify_data(project?.label || null);
		if (tmp_modlabel !== undefined) {
			projectdata.label = new_label.modify_data(project?.label || null);
		}

		const new_comment = comment_field.get_value();
		const tmp_modcomment = new_comment.modify_data(project?.comment || null);
		if (tmp_modcomment !== undefined) {
			projectdata.comment = new_comment.modify_data(project?.comment || null);
		}

		const new_projectStart = projectStart_field.get_value();
		if (!XsdDate.areEqual(new_projectStart, project?.projectStart)) {
			projectdata.projectStart = new_projectStart?.toString() || null;
		}

		const new_projectEnd = projectEnd_field.get_value();
		if (!XsdDate.areEqual(new_projectEnd, project?.projectEnd)) {
			projectdata.projectEnd = new_projectEnd?.toString() || null;
		}
		
		if (projectdata) {
			const project_post = api_notget_config(authinfo, {projectId: project?.projectShortName.toString() || ''});
			apiClient.postAdminprojectProjectId(projectdata, project_post).then((res) => {
				successInfoStore.set(`project "${res.projectId}" modified successfully!`);
			}).catch((error) => {
				errorInfoStore.set(process_api_error(error as Error));
			});

		}
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
		<DatePicker bind:this={projectStart_field} label="Project start" name="project_start" id="project_start" value={projectStart} />
		<DatePicker bind:this={projectEnd_field} label="Project start" name="project_start" id="project_start" value={projectEnd} />

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