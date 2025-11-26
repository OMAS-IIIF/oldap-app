<script lang="ts">

	import type { PageProps } from './$types';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { OldapUser } from '$lib/oldap/classes/user';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { userStore } from '$lib/stores/user';
	import * as m from '$lib/paraglide/messages';
	import { goto_page } from '$lib/helpers/goto_page';
	import DropdownField from '$lib/components/basic_gui/inputs/DropdownField.svelte';
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';
	import Confirmation from '$lib/components/basic_gui/dialogs/Confirmation.svelte';
	import LangstringField from '$lib/components/basic_gui/inputs/LangstringField.svelte';
	import Textfield from '$lib/components/basic_gui/inputs/Textfield.svelte';
	import { ExternalOntology } from '$lib/oldap/classes/extonto';
	import { LangString } from '$lib/oldap/datatypes/langstring';
	import { getLanguageShortname } from '$lib/oldap/enums/language';
	import { api_notget_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import { successInfoStore } from '$lib/stores/successinfo';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import { onMount, tick } from 'svelte';
	import { getProjectsOfUser } from '$lib/helpers/get_projects_of_user';
	import { page } from '$app/state';
	import { projectStore } from '$lib/stores/project';
	import type { OldapProject } from '$lib/oldap/classes/project';
	import { datamodelStore } from '$lib/stores/datamodel';
	import { DatamodelClass } from '$lib/oldap/classes/datamodel';

	let { data } : PageProps = $props();

	const ncname_pattern: RegExp = /^[A-Za-z_][A-Za-z0-9._-]*$/;
	const namespace_pattern: RegExp = /^(https?|ftp|file|urn):[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+[#/]$/;

	let authinfo: AuthInfo | null = $authInfoStore;
	let administrator = $state<OldapUser | null>(null);
	let project = $state<OldapProject | null>(null);
	let datamodel = $state<DatamodelClass | null>(null);


	let extonto: ExternalOntology | undefined = $state();
	let prefix = $state('');
	let namespaceIri = $state('');
	let label_field: LangstringField;
	let label = $state<LangString | null>(null);
	let comment_field: LangstringField;
	let comment = $state<LangString | null>(null);

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

	projectStore.subscribe(proj => {
		project = proj;
	});

	datamodelStore.subscribe(dm => {
		datamodel = dm;
	});

	function scrollToTop() {
		if (topwin) {
			topwin.scrollTo({ top: -1000, behavior: 'smooth' });
		}
	}

	onMount(async () => {
		if (!topwin || !authinfo) return;

		if (data.prefix !== 'new') {
			extonto = datamodel?.externalOntologies.find(item => item.prefix.toString() === data.prefix);
			prefix = extonto?.prefix.toString() || '';
			namespaceIri = extonto?.namespaceIri.toString() || '';
			label = extonto?.label || null;
			comment = extonto?.comment || null;
		}
		await tick();
		scrollToTop();
	});

	const add_extonto = async () => {
		confirmation_title = "ADD EXTONTO";
		confirmation_message = "REALLY ADD EXTONTO";
		const ok = await confirmation_dialog.open();
		if (!ok) return;

		if (!authinfo) return;
		const label = label_field.get_value().map((lang, val) => `${val}@${getLanguageShortname(lang)}`);
		const comment = comment_field.get_value().map((lang, val) => `${val}@${getLanguageShortname(lang)}`);

		let extontodata: {
			namespaceIri: string,
			label?: string[],
			comment?: string[],
		} = {
			namespaceIri: namespaceIri,
			label: label.length > 0 ? label : undefined,
			comment: comment.length > 0 ? comment : undefined,
		};
		const extonto_put = api_notget_config(authinfo, {
			project: project?.projectShortName.toString() || '',
			prefix: prefix,
		});
		apiClient.putAdmindatamodelProjectextontoPrefix(extontodata, extonto_put).then((res) => {
			successInfoStore.set(`External Ontology "${prefix}" added successfully!`);
		}).catch((error: unknown) => {
			errorInfoStore.set(process_api_error(error as Error));
		});
	};

	const modify_extonto = async () => {
		confirmation_title = "MODIFY EXTONTO";
		confirmation_message = "MODIFY EXTONTO";
		const ok = await confirmation_dialog.open();
		if (!ok) return;


		let extontodata: {
			label?: string[] | Partial<Record<'add'|'del', string[]>> | null,
			comment?: string[] | Partial<Record<'add'|'del', string[]>> | null,
		} = {};


		const new_label = label_field.get_value();
		const tmp_modlabel = new_label.modify_data(extonto?.label || null);
		if (tmp_modlabel !== undefined) {
			extontodata.label = new_label.modify_data(extonto?.label || null);
		}

		const new_comment = comment_field.get_value();
		const tmp_modcomment = new_comment.modify_data(extonto?.comment || null);
		if (tmp_modcomment !== undefined) {
			extontodata.comment = new_comment.modify_data(extonto?.comment || null);
		}

		if (extontodata) {
			const extonto_post = api_notget_config(authinfo as AuthInfo, {
				project: project?.projectShortName.toString() || '',
				prefix: prefix,
			});
			apiClient.postAdmindatamodelProjectextontoPrefix(extontodata, extonto_post).then((res) => {
				successInfoStore.set(`External Ontology modified successfully!`);
			}).catch((error) => {
				errorInfoStore.set(process_api_error(error as Error));
			});
		}
	};

</script>

<div class="absolute top-0 left-0 right-0 bottom-0 overflow-auto flex flex-col justify-center items-center" bind:this={topwin}>
	<div>{data.prefix !== 'new' ? m.edit()  : m.add()} "EXTONTO" </div>
	<form class="max-w-128 min-w-96">
		<Textfield type='text' label="PREFIX" name="prefix" id="prefix" placeholder="prefix" required={true}
							 bind:value={prefix} pattern={ncname_pattern} disabled={data?.prefix !== 'new'} />

		<Textfield type='text' label="NAMESPACE" name="namespace" id="namespace" placeholder="namespace" required={true}
							 bind:value={namespaceIri} pattern={namespace_pattern} disabled={data?.prefix !== 'new'} />

		<LangstringField bind:this={label_field} label={m.label()} name="label" id="label" placeholder="label" value={label} />
		<LangstringField bind:this={comment_field} label={m.comment()} name="comment" id="comment" placeholder="comment" value={comment} />

		<div class="flex justify-center gap-4 mt-6">
			<Button class="mx-4 my-2" onclick={goto_page('/admin')}>{m.cancel()}</Button>
			{#if data?.prefix === 'new'}
				<Button class="mx-4 my-2" onclick={() => add_extonto()}>{m.add()}</Button>
			{:else}
				<Button class="mx-4 my-2" onclick={() => modify_extonto()}>{m.modify()}</Button>
			{/if}
		</div>

	</form>
</div>

<Confirmation bind:this={confirmation_dialog} title={confirmation_title}>
	{confirmation_message}
</Confirmation>
