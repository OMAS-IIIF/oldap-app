<script lang="ts">

	import * as m from '$lib/paraglide/messages';
	import Textfield from '$lib/components/basic_gui/inputs/Textfield.svelte';
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';
	import Confirmation from '$lib/components/basic_gui/dialogs/Confirmation.svelte';
	import LangstringField from '$lib/components/basic_gui/inputs/LangstringField.svelte';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { LangString } from '$lib/oldap/datatypes/langstring';
	import { api_config } from '$lib/helpers/api_config';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { projectStore } from '$lib/stores/project';
	import { apiClient } from '$lib/shared/apiClient';
	import { getLanguageShortname } from '$lib/oldap/enums/language';
	import { successInfoStore } from '$lib/stores/successinfo';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import { refreshHlistsListNow } from '$lib/stores/refresh_hlistslist.svelte';

	const ncname_pattern: RegExp = /^[A-Za-z_][A-Za-z0-9._-]*$/;

	let { isopen = $bindable() } = $props();

	let authinfo = $authInfoStore || new AuthInfo('', '');
	let current_project = $projectStore;

	let hlistid = $state<string>('');
	let prefLabel_field: LangstringField;
	let prefLabel = $state<LangString | null>(null);
	let definition_field: LangstringField;
	let definition = $state<LangString | null>(null);

	let confirmation_dialog: Confirmation;
	let confirmation_title = $state(m.new_hlist_title());
	let conformation_text = $state(m.new_hlist_title());


	let add_hlist = async (event: Event) => {
		event.preventDefault();

		const ok = await confirmation_dialog.open();
		if (ok) {
			const prefLabel = prefLabel_field.get_value().map((lang, val) => `${val}@${getLanguageShortname(lang)}`);
			const definition = definition_field.get_value().map((lang, val) => `${val}@${getLanguageShortname(lang)}`);
			let hlistdata: {
				prefLabel: string[],
				definition?: string[],
			} = {
				prefLabel: prefLabel,
				definition: definition.length > 0 ? definition : undefined,
			}
			const hlist_put = api_config(authinfo, {
				project: current_project?.projectShortName.toString() || '',
				hlistid: hlistid,
			});
			apiClient.putAdminhlistProjectHlistid(hlistdata, hlist_put).then((res) => {
				successInfoStore.set(`!${res.message}`);
				refreshHlistsListNow();
			}).catch((error) => {
				errorInfoStore.set(process_api_error(error as Error));
			})
		}
		isopen = false;
	}

</script>

<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
	<form class="space-y-6" method="POST">
		<Textfield type='text' label={m.hlist_id()} name="hlistId" id="hlistId" placeholder="hlistID"
							 required={true}
							 bind:value={hlistid} pattern={ncname_pattern} disabled={false} />

		<LangstringField bind:this={prefLabel_field} label={m.label()} name="label" id="label" placeholder="label"
										 value={prefLabel} />
		<LangstringField bind:this={definition_field} label="COMMENT" name="comment" id="comment" placeholder="comment"
										 value={definition} />
		<div class="flex justify-center gap-4 mt-6">
			<Button class="mx-4 my-2" onclick={() => {isopen = false}}>{m.cancel()}</Button>
			<Button class="mx-4 my-2" onclick={(event: Event) => {add_hlist(event)}}>{m.add()}</Button>
		</div>
	</form>
</div>

<Confirmation bind:this={confirmation_dialog} title={confirmation_title}>
	{conformation_text}
</Confirmation>
