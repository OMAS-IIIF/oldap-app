<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import type { PageProps } from './$types';
	import { userStore } from '$lib/stores/user';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { OldapUser } from '$lib/oldap/classes/user';
	import { AdminPermission } from '$lib/oldap/enums/admin_permissions';
	import { projectStore } from '$lib/stores/project';
	import { OldapProject } from '$lib/oldap/classes/project';
	import { api_notget_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import type { TreeNodeInterface } from '$lib/helpers/treenodeinterface';
	import NodeTree from '$lib/components/basic_gui/NodeTree/NodeTree.svelte';
	import { OldapList } from '$lib/oldap/classes/list';
	import type { OldapListNode } from '$lib/oldap/classes/listnode';
	import { getLocale } from '$lib/paraglide/runtime';
	import { convertToLanguage, Language } from '$lib/oldap/enums/language';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { refreshNodeTree } from '$lib/stores/refresh_nodetree.svelte.js';
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';
	import { goto_page } from '$lib/helpers/goto_page';
	import DialogWin from '$lib/components/basic_gui/dialogs/DialogWin.svelte';
	import HList from '$lib/components/oldap/HList.svelte';
	import LabeledDivider from '$lib/components/basic_gui/inputs/LabeledDivider.svelte';
	import LangstringField from '$lib/components/basic_gui/inputs/LangstringField.svelte';
	import { LangString } from '$lib/oldap/datatypes/langstring';
	import Confirmation from '$lib/components/basic_gui/dialogs/Confirmation.svelte';
	import { successInfoStore } from '$lib/stores/successinfo';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import { onMount, tick } from 'svelte';

	let { data }: PageProps = $props();
	let current_project = $state<OldapProject | null>(null);

	let lang = $state(getLocale());
	let langobj = $derived(convertToLanguage(lang) ?? Language.EN);

	let authinfo: AuthInfo | null = $authInfoStore;
	let administrator = $state<OldapUser | null>(null);

	let topwin = $state<HTMLElement>();
	let topnodes = $state<TreeNodeInterface[]>([]);

	let hlist = $state<OldapList>();
	let rootIsOpen = $state(false);

	let prefLabel_field: LangstringField;
	let prefLabel = $state<LangString | null>(null);
	let definition_field: LangstringField;
	let definition = $state<LangString | null>(null);

	let confirmation_dialog: Confirmation;
	let confirmation_title = $state('');
	let confirmation_message = $state('');

	let refresh = $state(0);

	authInfoStore.subscribe(data => {
		authinfo = data;
	});

	userStore.subscribe((admin) => {
		administrator = admin;
	});

	projectStore.subscribe((project) => {
		current_project = project;
	});

	function scrollToTop() {
		if (topwin) {
			topwin.scrollTo({ top: -1000, behavior: 'smooth' });
		}
	}

	function process_tnodes(tnodes: OldapListNode[] | undefined): TreeNodeInterface[] | undefined  {
		if (tnodes === undefined) {
			return undefined;
		}
		else {
			return tnodes.map((x) => {
				return {
					hlistid: data.hlistid,
					nodeid: x.nodeId.toString(),
					name: x?.prefLabel?.get(langobj),
					...(x.nodes && x.nodes.length > 0 ? {children: process_tnodes(x.nodes)} : {})
				} as TreeNodeInterface;
			});
		}

	}

	const read_data = async () => {
		if (!topwin || !authinfo) return;
		if (administrator) { // the administrator has to be defined...
			if (administrator.isRoot || administrator.inProject?.some(obj => obj.permissions.includes(AdminPermission.ADMIN_LISTS))) {
				if (data.hlistid === 'new') {
					rootIsOpen = true;
				}
				else {
					const config_hlistdata = api_notget_config(authinfo as AuthInfo, {
						project: current_project?.projectShortName.toString() || '',
						hlistid: data.hlistid
					});
					const jsondata = await apiClient.getAdminhlistProjectHlistid(config_hlistdata);
					console.log(jsondata);
					hlist = OldapList.fromOldapJson(jsondata);
					prefLabel = hlist.prefLabel || null;
					definition = hlist.definition || null;
					topnodes = process_tnodes(hlist.nodes) || []
				}
			}
		}
	}

	onMount(async () => {
		await tick();
		scrollToTop();
	})

	$effect(() => {
		const _ = $refreshNodeTree;
		read_data();
	})

	const modify_hlist = async () => {
		//confirmation_title = m.modify_project();
		//confirmation_message = m.confirm_project_modify({sname: project?.projectShortName.toString() || ''});
		confirmation_title = m.mod_hlist();
		confirmation_message = m.mod_hlist2({hlist: hlist?.prefLabel?.get(langobj) || ''});

		const ok = await confirmation_dialog.open();
		if (!ok) return;

		let hlistdata: {
			prefLabel?: string[] | Partial<Record<'add'|'del', string[]>> | null,
			definition?: string[] | Partial<Record<'add'|'del', string[]>> | null,
		} = {};

		const new_prefLabel = prefLabel_field.get_value();
		const tmp_modprefLabel = new_prefLabel.modify_data(hlist?.prefLabel || null);
		if (tmp_modprefLabel !== undefined) {
			hlistdata.prefLabel = new_prefLabel.modify_data(hlist?.prefLabel || null);
		}

		const new_definition = definition_field.get_value();
		const tmp_modcomment = new_definition.modify_data(hlist?.definition || null);
		if (tmp_modcomment !== undefined) {
			hlistdata.definition = new_definition.modify_data(hlist?.definition || null);
		}
		if (hlistdata) {
			const hlist_post = api_notget_config(authinfo, {
				project: current_project?.projectShortName.toString() || '',
				hlistid: data.hlistid
			});
			apiClient.postAdminhlistProjectHlistid(hlistdata, hlist_post).then((res) => {
				successInfoStore.set(m.mod_hlist3({hlist: hlist?.oldapListId?.toString() || ''}));
			}).catch((error) => {
				errorInfoStore.set(process_api_error(error as Error));
			});
		}
	}

</script>

<div class="absolute top-0 left-0 right-0 bottom-0 overflow-auto flex flex-col justify-center items-center" bind:this={topwin}>
	<div>{data.hlistid !== 'new' ? m.edit()  : m.add()} Hierarchical List for "{hlist?.prefLabel?.get(langobj)}"</div>
	<div class="py-2"> </div>
	<form class="max-w-128 min-w-96">
		<LabeledDivider>LIST</LabeledDivider>
		<LangstringField bind:this={prefLabel_field} label={m.label()} name="label" id="label" placeholder="label"
										 value={prefLabel} />
		<LangstringField bind:this={definition_field} label={m.comment()} name="comment" id="comment" placeholder="comment"
										 value={definition} />
		<Button class="mx-4 my-2" onclick={(event: Event) => {modify_hlist(event)}}>{m.modify()}</Button>

	</form>
	<form class="max-w-128 min-w-96">
		<LabeledDivider>NODES</LabeledDivider>
		<ul class="pl-4 list-none border-l border-gray-300 ml-1 space-y-1">
			{#if topnodes.length > 0}
				{#each topnodes as node}
					<NodeTree node={node} hlistid={data.hlistid} />
				{/each}
			{:else}
				<NodeTree hlistid={data.hlistid} />
			{/if}
		</ul>
		<div class="py-2"> </div>
		<Button onclick={goto_page('/admin')}>Back</Button>
	</form>
</div>

<DialogWin bind:isopen={rootIsOpen} title="ADD ROOT NODE">
		<HList bind:isopen={rootIsOpen} />
</DialogWin>

<Confirmation bind:this={confirmation_dialog} title={confirmation_title}>
	{confirmation_message}
</Confirmation>

