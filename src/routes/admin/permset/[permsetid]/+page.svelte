<script lang="ts">

	import type { PageProps } from './$types';
	import * as m from '$lib/paraglide/messages';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import Textfield from '$lib/components/basic_gui/inputs/Textfield.svelte';
	import DropdownField from '$lib/components/basic_gui/inputs/DropdownField.svelte';
	import LangstringField from '$lib/components/basic_gui/inputs/LangstringField.svelte';
	import { LangString } from '$lib/oldap/datatypes/langstring';
	import { dataPermissionAsString, strippedDataPermission } from '$lib/oldap/enums/data_permissions';
	import { onMount, tick } from 'svelte';
	import { api_notget_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import { OldapPermissionSet } from '$lib/oldap/classes/permissionset';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import { goto_page } from '$lib/helpers/goto_page';
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';
	import Confirmation from '$lib/components/basic_gui/dialogs/Confirmation.svelte';
	import { successInfoStore } from '$lib/stores/successinfo';
	import { getLanguageShortname } from '$lib/oldap/enums/language';
	import { userStore } from '$lib/stores/user';
	import { OldapUser } from '$lib/oldap/classes/user';
	import { OldapProject } from '$lib/oldap/classes/project';
	import { getProjectsOfUser } from '$lib/helpers/get_projects_of_user';
	import { page } from '$app/state';

	type DataPermissionShort =
		| 'DATA_RESTRICTED'
		| 'DATA_VIEW'
		| 'DATA_EXTEND'
		| 'DATA_UPDATE'
		| 'DATA_DELETE'
		| 'DATA_PERMISSIONS'
		| undefined;

	let { data } : PageProps = $props();

	const ncname_pattern: RegExp = /^[A-Za-z_][A-Za-z0-9._-]*$/;

	let authinfo: AuthInfo | null = $authInfoStore;
	let administrator = $state<OldapUser | null>(null);

	let all_projects: Record<string, OldapProject> = {};
	let allProjectsIds = $state<string[]>([]);
	let selectedProjectId = $state<string>('');

	let definedByProject: string | null = null;  // is set for modify, the value is given as query parameter "definedByProject"
	let permset: OldapPermissionSet;
	let permsetId = $state('');
	let oldPermission: DataPermissionShort;
	let currentPermission = $state<DataPermissionShort>("DATA_RESTRICTED");
	let label_field: LangstringField;
	let label = $state<LangString | null>(null);
	let comment_field: LangstringField;
	let comment = $state<LangString | null>(null);

	const allPermissions = strippedDataPermission();

	let topwin = $state<HTMLElement>();

	let confirmation_dialog: Confirmation;
	let confirmation_title = $state('');
	let confirmation_message = $state('');

	authInfoStore.subscribe(authdata => {
		authinfo = authdata;
	});

	userStore.subscribe((admin) => {
		administrator = admin;
	});

	function scrollToTop() {
		if (topwin) {
			topwin.scrollTo({ top: -1000, behavior: 'smooth' });
		}
	}

	onMount(async () => {
		if (!topwin || !authinfo) return;
		if (administrator) {
			try {
				all_projects = await getProjectsOfUser(authinfo as AuthInfo, administrator);
			}
			catch(error) {
				errorInfoStore.set(process_api_error(error as Error));
				return;
			}
		}
		allProjectsIds = Object.values(all_projects).map(x => x.projectShortName.toString());

		if (data.permsetid !== 'new') {
			definedByProject = page.url.searchParams.get('projectid');
			const config_permset = api_notget_config(authinfo as AuthInfo, {
				definedByProject: definedByProject || '',
				permissionSetId: data.permsetid
			});
			apiClient.getAdminpermissionsetDefinedByProjectPermissionSetId(config_permset).then((data) => {
				permset = OldapPermissionSet.fromOldapJson(data);
				if (permset) {
					permsetId = permset.permissionSetId.toString();
					currentPermission = dataPermissionAsString(permset.givesPermission)?.replace(/^oldap:/, '') as DataPermissionShort;
					oldPermission = currentPermission;
					label = permset.label || null;
					comment = permset.comment || null;
				}
			}).catch((error) => {
				errorInfoStore.set(process_api_error(error as Error));
				return;
			});
		}
		else {
			selectedProjectId = Object.values(all_projects)[0].projectShortName.toString();
		}
		await tick();
		scrollToTop();
	});

	const add_permset = async () => {
		confirmation_title = m.add_permset();
		confirmation_message = m.confirm_permset_add({permsetid: permsetId.toString()});
		const ok = await confirmation_dialog.open();
		if (!ok) return;

		if (!authinfo) return;
		const label = label_field.get_value().map((lang, val) => `${val}@${getLanguageShortname(lang)}`);
		const comment = comment_field.get_value().map((lang, val) => `${val}@${getLanguageShortname(lang)}`);

		let permsetdata: {
			label?: string[],
			comment?: string[],
			givesPermission: DataPermissionShort
		} = {
			label: label.length > 0 ? label : undefined,
			comment: comment.length > 0 ? comment : undefined,
			givesPermission: currentPermission
		};
		const permset_put = api_notget_config(authinfo, {
			definedByProject: selectedProjectId,
			permissionSetId: permsetId
		});
		apiClient.putAdminpermissionsetDefinedByProjectPermissionSetId(permsetdata, permset_put).then((res) => {
			successInfoStore.set(`Permission set "${permsetId}" added successfully!`);
		}).catch((error) => {
			errorInfoStore.set(process_api_error(error as Error));
		});
	};

	const modify_permset = async () => {
		confirmation_title = m.modify_permset();
		confirmation_message = m.confirm_permset_modify({permsetid: permset?.permissionSetId.toString() || ''});
		const ok = await confirmation_dialog.open();
		if (!ok) return;

		let permsetdata: {
			label?: string[] | Partial<Record<'add'|'del', string[]>> | null,
			comment?: string[] | Partial<Record<'add'|'del', string[]>> | null,
			givesPermission?: DataPermissionShort
		} = {};

		if (oldPermission !== currentPermission) {
			permsetdata.givesPermission = currentPermission;
		}

		const new_label = label_field.get_value();
		const tmp_modlabel = new_label.modify_data(permset?.label || null);
		if (tmp_modlabel !== undefined) {
			permsetdata.label = new_label.modify_data(permset?.label || null);
		}

		const new_comment = comment_field.get_value();
		const tmp_modcomment = new_comment.modify_data(permset?.comment || null);
		if (tmp_modcomment !== undefined) {
			permsetdata.comment = new_comment.modify_data(permset?.comment || null);
		}

		if (permsetdata) {
			const permset_post = api_notget_config(authinfo as AuthInfo, {
				definedByProject: encodeURIComponent(definedByProject || ''),
				permissionSetId: data.permsetid
			});
			apiClient.postAdminpermissionsetDefinedByProjectPermissionSetId(permsetdata, permset_post).then((res) => {
				successInfoStore.set(`Permission set "${res.permsetid}" modified successfully!`);
			}).catch((error) => {
				errorInfoStore.set(process_api_error(error as Error));
			});
		}
	};

</script>

<div class="absolute top-0 left-0 right-0 bottom-0 overflow-auto flex flex-col justify-center items-center" bind:this={topwin}>
	<div>{data.permsetid !== 'new' ? m.edit()  : m.add()} {m.permset()} </div>
	<form class="max-w-128 min-w-96">
		{#if (data.permsetid === 'new')}
			<DropdownField items={allProjectsIds} bind:selectedItem={selectedProjectId} label="PROJECT" name="project" id="project_id"/>
		{/if}
		<Textfield type='text' label={m.permset_id()} name="permsetid" id="permsetid" placeholder="permset ID" required={true}
							 bind:value={permsetId} pattern={ncname_pattern} disabled={data?.permsetid !== 'new'} />

		<DropdownField items={allPermissions} bind:selectedItem={currentPermission} label={m.permission()} name="permsetperm" id="permsetperm_id"/>

		<LangstringField bind:this={label_field} label={m.label()} name="label" id="label" placeholder="label" value={label} />
		<LangstringField bind:this={comment_field} label={m.comment()} name="comment" id="comment" placeholder="comment" value={comment} />

		<div class="flex justify-center gap-4 mt-6">
			<Button class="mx-4 my-2" onclick={goto_page('/admin')}>{m.cancel()}</Button>
			{#if data?.permsetid === 'new'}
				<Button class="mx-4 my-2" onclick={() => add_permset()}>{m.add()}</Button>
			{:else}
				<Button class="mx-4 my-2" onclick={() => modify_permset()}>{m.modify()}</Button>
			{/if}
		</div>

	</form>
</div>

<Confirmation bind:this={confirmation_dialog} title={confirmation_title}>
	{confirmation_message}
</Confirmation>


