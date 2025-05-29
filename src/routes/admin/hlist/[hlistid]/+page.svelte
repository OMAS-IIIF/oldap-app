<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import type { PageProps } from './$types';
	import { userStore } from '$lib/stores/user';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { OldapUser } from '$lib/oldap/classes/user';
	import { onMount } from 'svelte';
	import { AdminPermission } from '$lib/oldap/enums/admin_permissions';
	import { projectStore } from '$lib/stores/project';
	import { OldapProject } from '$lib/oldap/classes/project';
	import { api_notget_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import type { TreeNodeInterface } from '$lib/helpers/treenodeinterface';
	import NodeTree from '$lib/components/basic_gui/NodeTree/NodeTree.svelte';
	import { OldapList } from '$lib/oldap/classes/list';
	import type { OldapListNode } from '$lib/oldap/classes/listnode';
	import { languageTag } from '$lib/paraglide/runtime';
	import { convertToLanguage, Language } from '$lib/oldap/enums/language';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { refreshNodeTree } from './refresh_nodetree.svelte';
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';
	import { goto } from '$app/navigation';


	let { data }: PageProps = $props();
	let current_project = $state<OldapProject | null>(null);

	let lang = $state(languageTag());
	let langobj = $derived(convertToLanguage(lang) ?? Language.EN);

	let authinfo: AuthInfo | null = $authInfoStore;
	let administrator = $state<OldapUser | null>(null);

	let topwin = $state<HTMLElement>();
	let topnodes = $state<TreeNodeInterface[]>([]);

	let hlist = $state<OldapList>();

	let refresh = $state(0);

	authInfoStore.subscribe(data => {
		authinfo = data;
	});

	userStore.subscribe((admin) => {
		administrator = admin;
	});

	projectStore.subscribe((project) => {
		current_project = project;
	})

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

				}
				else {
					const config_hlistdata = api_notget_config(authinfo as AuthInfo, {
						project: current_project?.projectShortName.toString() || '',
						hlistid: data.hlistid
					});
					const jsondata = await apiClient.getAdminhlistProjectHlistid(config_hlistdata);
					hlist = OldapList.fromOldapJson(jsondata);
					topnodes = process_tnodes(hlist.nodes) || []
				}
			}
		}
	}

	onMount(async () => {
		await read_data();
	});

	$effect(() => {
		const _ = $refreshNodeTree;
		read_data();
	})

</script>

<div class="absolute top-0 left-0 right-0 bottom-0 overflow-auto flex flex-col justify-center items-center" bind:this={topwin}>
	<div>{data.hlistid !== 'new' ? m.edit()  : m.add()} Hierarchical List for "{hlist?.prefLabel?.get(langobj)}"</div>
	<div class="py-2"> </div>
	<form class="max-w-128 min-w-96">
		<ul class="pl-4 list-none border-l border-gray-300 ml-1 space-y-1">
			{#each topnodes as node}
				<NodeTree node={node} />
			{/each}
		</ul>
		<div class="py-2"> </div>
		<Button onclick={() => goto('/admin')}>Back</Button>
	</form>
</div>
