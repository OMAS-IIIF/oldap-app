<script lang="ts">

	import * as m from '$lib/paraglide/messages';
	import LangstringField from '$lib/components/basic_gui/inputs/LangstringField.svelte';
	import { LangString } from '$lib/oldap/datatypes/langstring';
	import Textfield from '$lib/components/basic_gui/inputs/Textfield.svelte';
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';
	import { onMount } from 'svelte';
	import { api_config } from '$lib/helpers/api_config';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { projectStore } from '$lib/stores/project';
	import { apiClient } from '$lib/shared/apiClient';
	import { OldapListNode } from '$lib/oldap/classes/listnode';
	import { getLanguageShortname } from '$lib/oldap/enums/language';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import { successInfoStore } from '$lib/stores/successinfo';
	import { NCName } from '$lib/oldap/datatypes/xsd_ncname';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { OldapError } from '$lib/oldap/errors/OldapError';
	import { refreshNodeTreeNow } from '../../stores/refresh_nodetree.svelte.js';
	import Confirmation from '$lib/components/basic_gui/dialogs/Confirmation.svelte';

	const ncname_pattern: RegExp = /^[A-Za-z_][A-Za-z0-9._-]*$/;

	let { action, hlistid, nodeid = $bindable(), refnode, isopen = $bindable()} :
		{ action: string, hlistid: string, nodeid?: string, refnode?: string | null, isopen: boolean} = $props();

	let authinfo = $authInfoStore || new AuthInfo('', '');
	let current_project = $projectStore;

	let prefLabel_field: LangstringField;
	let prefLabel = $state<LangString | null>(null);
	let definition_field: LangstringField;
	let definition = $state<LangString | null>(null);
	let node: OldapListNode;

	let confirmation_dialog: Confirmation;
	let confirmation_title = $state('');
	let conformation_text = $state('');


	onMount(() => {
		if (nodeid && authinfo) {
			const config_nodedata = api_config(authinfo, {
				project: current_project?.projectShortName.toString() || '',
				hlistid: hlistid,
				nodeid: nodeid
			});
			apiClient.getAdminhlistProjectHlistidNodeid(config_nodedata).then((jsondata) => {
				node = OldapListNode.fromOldapJson(jsondata, new NCName(hlistid));
				prefLabel = node.prefLabel || null;
				definition = node.definition || null;
			})
		}
	});

	let process_event = async (event: Event) => {
		event.preventDefault();

		switch (action) {
			case 'edit':
				confirmation_title = m.store_mod_node();
				conformation_text = m.store_mod_node_2({nodename: nodeid || ''});
				break;
			case 'root':
				confirmation_title = m.add_root_node() + '?';
				conformation_text = `${m.store_node_root()}`;
				break;
			case 'addBefore':
				confirmation_title = m.add_node_before() + '?';
				conformation_text = m.store_node_below({nodename: refnode || ''});
				break;
			case 'addAfter':
				confirmation_title = m.add_node_after() + '?';
				conformation_text = m.store_node_after({nodename: refnode || ''});
				break;
			case 'addBelow':
				confirmation_title = m.add_node_child() + '?';
				conformation_text = m.store_node_child({nodename: refnode || ''});
				break;

		}
		const ok = await confirmation_dialog.open();
		if (!ok) {
			return;
		}
		if (action === 'edit') {
			let nodedata: {
				prefLabel?: string[] | Partial<Record<'add'|'del', string[]>> | null,
				definition?: string[] | Partial<Record<'add'|'del', string[]>> | null,
			} = {};
			const new_prefLabel = prefLabel_field.get_value();
			const tmp_modprefLabel = new_prefLabel.modify_data(node?.prefLabel || null);
			if (tmp_modprefLabel !== undefined) {
				nodedata.prefLabel = new_prefLabel.modify_data(node?.prefLabel || null);
			}

			const new_definition = definition_field.get_value();
			const tmp_moddefinition = new_definition.modify_data(node?.definition || null);
			if (tmp_moddefinition !== undefined) {
				nodedata.definition = new_definition.modify_data(node?.definition || null);
			}

			if (tmp_modprefLabel === undefined && tmp_moddefinition === undefined) {
				return;
			}

			if (nodeid) {
				const node_post = api_config(authinfo, {
					project: current_project?.projectShortName.toString() || '',
					hlistid: hlistid,
					nodeid: nodeid
				});
				apiClient.postAdminhlistProjectHlistidNodeid(nodedata, node_post).then((res) => {
					successInfoStore.set(`!${res.message}`);
					refreshNodeTreeNow();
				}).catch((error) => {
					errorInfoStore.set(process_api_error(error as Error));
					return;
				});
			} else {
				errorInfoStore.set(new OldapError(`NodeID is missing.`));
				return;
			}
		}
		else {
			const prefLabel = prefLabel_field.get_value().map((lang, val) => `${val}@${getLanguageShortname(lang)}`);
			const definition = definition_field.get_value().map((lang, val) => `${val}@${getLanguageShortname(lang)}`);

			let pos: 'root' | 'leftOf' | 'rightOf' | 'belowOf';
			switch (action) {
				case 'root': pos = 'root'; break;
				case 'addBefore': pos = 'leftOf'; break;
				case 'addAfter': pos = 'rightOf'; break;
				case 'addBelow': pos = 'belowOf'; break;
				default: {
					errorInfoStore.set(new OldapError(`Invalid action "${action}".`));
					return;
				}
			}

			let nodedata: {
				prefLabel: string[],
				definition?: string[],
				position: 'root' |'leftOf' | 'rightOf' | 'belowOf',
				refnode: string,
			} = {
				prefLabel: prefLabel,
				definition: definition.length > 0 ? definition : undefined,
				position: pos,
				refnode: refnode || '',
			};
			const node_post = api_config(authinfo, {
				project: current_project?.projectShortName.toString() || '',
				hlistid: hlistid,
				nodeid: nodeid || ''
			});
			apiClient.putAdminhlistProjectHlistidNodeid(nodedata, node_post).then((res) => {
				successInfoStore.set(`!${res.message}`);
				refreshNodeTreeNow();
			}).catch((error) => {
				errorInfoStore.set(process_api_error(error as Error));
			});
		}
		isopen = false;
		return;
	};

</script>

<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
	<form class="space-y-6" method="POST">
		<Textfield type='text' label="NODE_ID" name="nodeId" id="nodeId" placeholder="nodeID" required={refnode !== undefined}
							 bind:value={nodeid} pattern={ncname_pattern} disabled={false} />

		<LangstringField bind:this={prefLabel_field} label={m.label()} name="label" id="label" placeholder="label" value={prefLabel} />
		<LangstringField bind:this={definition_field} label="COMMENT" name="comment" id="comment" placeholder="comment" value={definition} />
		<div class="flex justify-center gap-4 mt-6">
			<Button class="mx-4 my-2" onclick={() => {isopen = false}}>{m.cancel()}</Button>
			<Button class="mx-4 my-2" onclick={(event: Event) => {process_event(event)}}>{m.add()}</Button>
		</div>
	</form>
</div>

<Confirmation bind:this={confirmation_dialog} title={confirmation_title}>
	{conformation_text}
</Confirmation>
