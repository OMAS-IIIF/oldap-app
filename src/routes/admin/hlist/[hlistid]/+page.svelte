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
	import { get } from 'svelte/store';
	import { api_notget_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import type { TreeNodeInterface } from '$lib/helpers/treenodeinterface';
	import type { ApiNode } from '$lib/oldap/classes/hlist';
	import NodeTree from '$lib/components/basic_gui/NodeTree/NodeTree.svelte';


	let { data }: PageProps = $props();
	let current_project = $state<OldapProject | null>(null);

	let authinfo: AuthInfo;
	let administrator = $state<OldapUser | null>(null);

	let topwin = $state<HTMLElement>();
	let topnodes = $state<TreeNodeInterface[]>([]);

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

	function process_tnodes(tnodes: ApiNode[] | undefined): TreeNodeInterface[] | undefined  {
		if (tnodes === undefined) {
			return undefined;
		}
		else {
			return tnodes.map((x) => {
				return {
					name: x.oldapListNodeId,
					...(x.nodes && x.nodes.length > 0 ? {children: process_tnodes(x.nodes as ApiNode[])} : {})
				}
			});
		}

	}

	onMount(async () => {
		if (!topwin) return;
		authinfo = AuthInfo.fromString(sessionStorage.getItem('authinfo'));
		if (administrator) { // the administrator has to be defined...
			if (administrator.isRoot || administrator.inProject?.some(obj => obj.permissions.includes(AdminPermission.ADMIN_LISTS))) {
				const config_hlistdata = api_notget_config(authinfo, {
					project: current_project?.projectShortName.toString() || '',
					hlistid: data.hlistid
				});
				const jsondata = await apiClient.getAdminhlistProjectHlistid(config_hlistdata);
				topnodes = process_tnodes(jsondata as ApiNode[]) || []

				console.log($state.snapshot(topnodes));
			}
		}
	});

</script>

<div class="absolute top-0 left-0 right-0 bottom-0 overflow-auto flex flex-col justify-center items-center" bind:this={topwin}>
	<div>{data.hlistid !== 'new' ? m.edit()  : m.add()} Project </div>
	<form class="max-w-128 min-w-96">
		<ul>
			{#each topnodes as node}
				<NodeTree node={node} />
			{/each}
		</ul>
	</form>
</div>