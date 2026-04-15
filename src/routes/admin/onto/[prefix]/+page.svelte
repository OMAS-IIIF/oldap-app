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
	import LangstringfieldNew from '$lib/components/basic_gui/inputs/LangstringfieldNew.svelte';
	import Textfield from '$lib/components/basic_gui/inputs/Textfield.svelte';
	import { ExternalOntology } from '$lib/oldap/classes/extonto';
	import { LangString } from '$lib/oldap/datatypes/langstring';
	import { convertToLanguage, Language } from '$lib/oldap/enums/language';
	import { api_notget_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import { successInfoStore } from '$lib/stores/successinfo';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import { onMount, tick } from 'svelte';
	import { getProjectsOfUser } from '$lib/helpers/get_projects_of_user';
	import { getLocale, locales } from '$lib/paraglide/runtime';
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
	let lang = $state(getLocale());
	const languages = Array.from(locales).map(lang => convertToLanguage(lang) || Language.DE);


	let extonto: ExternalOntology | undefined = $state();
	let prefix = $state('');
	let namespaceIri = $state('');
	let label = $state<LangString>(new LangString());
	let orig_label: LangString = new LangString();
	let comment = $state<LangString>(new LangString());
	let orig_comment: LangString = new LangString();

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
			label = extonto?.label || new LangString();
			orig_label = label.clone();
			comment = extonto?.comment || new LangString();
			orig_comment = comment.clone();
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

		let extontodata: {
			namespaceIri: string,
			label?: string[],
			comment?: string[],
		} = {
			namespaceIri: namespaceIri,
			label: label.toApi() || undefined,
			comment: comment.toApi() || undefined,
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


		const tmp_modlabel = label.modify_data(orig_label || null);
		if (tmp_modlabel !== undefined) {
			extontodata.label = tmp_modlabel;
		}

		const tmp_modcomment = comment.modify_data(orig_comment || null);
		if (tmp_modcomment !== undefined) {
			extontodata.comment = tmp_modcomment;
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
