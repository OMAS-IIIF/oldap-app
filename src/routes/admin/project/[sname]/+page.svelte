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
	import { apiClient } from '$lib/shared/apiClient';
	import { OldapProject } from '$lib/oldap/classes/project';
	import { api_notget_config } from '$lib/helpers/api_config.js';
	import { LangString } from '$lib/oldap/datatypes/langstring';
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';
	import { XsdDate } from '$lib/oldap/datatypes/xsd_date';
	import { successInfoStore } from '$lib/stores/successinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import { convertToLanguage, Language } from '$lib/oldap/enums/language';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { getLocale, locales } from '$lib/paraglide/runtime';
	import { goto_page } from '$lib/helpers/goto_page';
	import Confirmation from '$lib/components/basic_gui/dialogs/Confirmation.svelte';
	import { refreshProjectsListNow } from '$lib/stores/refresh_projectslist.svelte';
	import NativeDatePicker from '$lib/components/basic_gui/inputs/NativeDatePicker.svelte';
	import LangstringfieldNew from '$lib/components/basic_gui/inputs/LangstringfieldNew.svelte';


	let { data }: PageProps = $props();


	const project_iri_pattern: RegExp = /^(https?:\/\/[^\s<>"]+|urn:[^\s<>"]+|[A-Za-z_][\w.-]*:[\w.-]+)$/;
	const ncname_pattern: RegExp = /^[A-Za-z_][A-Za-z0-9._-]*$/;
	const namespace_pattern = /^https?:\/\/[^\s<>"]+[/#]$/;

	let lang = $state(getLocale());

	const languages = Array.from(locales).map(lang => convertToLanguage(lang) || Language.DE);

	let authinfo: AuthInfo | null = $authInfoStore;
	let administrator = $state<OldapUser | null>(null);

	let project: OldapProject;
	let projectIri = $state('');
	let sname = $state('');
	let namespaceIri = $state('');
	let label = $state<LangString>(new LangString());
	let orig_label: LangString = new LangString();
	let comment = $state<LangString>(new LangString());
	let orig_comment: LangString = new LangString();
	let projectStart = $state<XsdDate>(new XsdDate());
	let orig_projectStart: XsdDate = new XsdDate();
	let projectEnd = $state<XsdDate | null>(null);
	let orig_projectEnd: XsdDate | null = null;

	let topwin = $state<HTMLElement>();

	let confirmation_dialog: Confirmation;
	let confirmation_title = $state('');
	let confirmation_message = $state('');

	userStore.subscribe((admin) => {
		administrator = admin;
	});

	authInfoStore.subscribe(data => {
		authinfo = data;
	});

	function scrollToTop() {
		if (topwin) {
			topwin.scrollTo({ top: -1000, behavior: 'smooth' });
		}
	}

	onMount(async () => {
		if (!topwin || !authinfo) return;
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
						label = project.label || new LangString();
						orig_label = label.clone();
						comment = project.comment || new LangString();
						orig_comment = comment.clone();
						projectStart = project.projectStart || new XsdDate();
						orig_projectStart = projectStart.clone();
						projectEnd = project.projectEnd || null;
						orig_projectEnd = projectEnd ? projectEnd.clone() : null;
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

	const add_project = async () => {
		confirmation_title = m.add_project();
		//confirmation_message = m.confirm_project_add({projectid: project.projectShortName.toString()}); // TODO: HIER PASSIERT FEHLER
		confirmation_message = m.confirm_project_add({projectid: sname}); // TODO: HIER PASSIERT FEHLER
		const ok = await confirmation_dialog.open();
		if (!ok) return;

		if (!authinfo) return;
		//const projectStart = projectStart_field.get_value();
		//const projectEnd = projectEnd_field.get_value();
		let projectdata: {
			projectIri?: string,
			namespaceIri: string,
			label?: string[],
			comment?: string[],
			projectStart?: string,
			projectEnd?: string,
		} = {
			projectIri: projectIri.length > 0 ? projectIri : undefined,
			namespaceIri: namespaceIri,
			label: label.toApi() || undefined,
			comment: comment.toApi() || undefined,
			projectStart: projectStart.toApi() || undefined,
			projectEnd: projectEnd?.toApi() || undefined
		};
		const project_put = api_notget_config(authinfo, {projectId: sname});
		apiClient.putAdminprojectProjectId(projectdata, project_put).then(() => {
			const empty_dm = api_notget_config(authinfo || new AuthInfo('unknown', ''), {project: sname});
			return apiClient.putAdmindatamodelProject(undefined, empty_dm);
		}).then(() => {
			successInfoStore.set(`Project ${sname} added successfully!`);
			refreshProjectsListNow();
		}).catch((error) => {
			errorInfoStore.set(process_api_error(error as Error));
		});
	};

	const modify_project = async () => {
		confirmation_title = m.modify_project();
		confirmation_message = m.confirm_project_modify({sname: project?.projectShortName.toString() || ''});
		const ok = await confirmation_dialog.open();
		if (!ok) return;

		let projectdata: {
			label?: string[] | Partial<Record<'add'|'del', string[]>> | null,
			comment?: string[] | Partial<Record<'add'|'del', string[]>> | null,
			projectStart?: string | null,
			projectEnd?: string | null,
		} = {};

		projectdata.label = label.modify_data(orig_label || null);
		projectdata.comment = comment.modify_data(orig_comment || null);
		if (!XsdDate.areEqual(projectStart, orig_projectStart)) {
			projectdata.projectStart = projectStart?.toApi() || null;
		}
		if (!XsdDate.areEqual(projectEnd, orig_projectEnd)) {
			projectdata.projectEnd = projectEnd?.toApi() || null;
		}

		if (projectdata) {
			const project_post = api_notget_config(authinfo || new AuthInfo('unknown', ''), {projectId: project?.projectShortName.toString() || ''});
			apiClient.postAdminprojectProjectId(projectdata, project_post).then((res) => {
				successInfoStore.set(`Project "${res.projectId}" modified successfully!`);
			}).catch((error) => {
				errorInfoStore.set(process_api_error(error as Error));
			});
		}
	};

</script>

<div class="absolute top-0 left-0 right-0 bottom-0 overflow-auto flex flex-col justify-center items-center" bind:this={topwin}>
	<div>{data.sname !== 'new' ? m.edit()  : m.add()} {m.project()} </div>
	<form class="max-w-128 min-w-96">
		<Textfield type='text' label={m.project_iri()} name="projectiri" id="projectiri" placeholder="project Iri"
							 bind:value={projectIri} pattern={project_iri_pattern} disabled={data?.sname !== 'new'} />
		<Textfield type='text' label={m.project_sname()} name="sname" id="sname" placeholder="shortname" required={true}
							 bind:value={sname} pattern={ncname_pattern} disabled={data?.sname !== 'new'} />
		<Textfield type='text' label={m.namespaceiri()} name="namespaceiri" id="namespaceiri" placeholder="namespace iri" required={true}
							 bind:value={namespaceIri} pattern={namespace_pattern} disabled={data?.sname !== 'new'} />
		<LangstringfieldNew
			label={m.label()}
			name="label"
			id="label"
			languages={languages}
			placeholder="label"
			bind:value={label}
		/>
		<LangstringfieldNew
			label={m.comment()}
			name="comment"
			id="comment"
			languages={languages}
			placeholder="comment"
			input_type="textarea"
			bind:value={comment}
		/>
		<NativeDatePicker
			label="Project start"
			name="project_start"
			id="project_start"
			required={true}
			bind:value={projectStart} />
		<NativeDatePicker
			label="Project start"
			name="project_start"
			id="project_start"
			bind:value={projectEnd}
		/>

		<div class="flex justify-center gap-4 mt-6">
			<Button class="mx-4 my-2" onclick={goto_page('/admin')}>{m.cancel()}</Button>
			{#if data?.sname === 'new'}
				<Button class="mx-4 my-2" onclick={() => add_project()}>{m.add()}</Button>
			{:else}
				<Button class="mx-4 my-2" onclick={() => modify_project()}>{m.modify()}</Button>
			{/if}
		</div>

	</form>
</div>

<Confirmation bind:this={confirmation_dialog} title={confirmation_title}>
	{confirmation_message}
</Confirmation>
