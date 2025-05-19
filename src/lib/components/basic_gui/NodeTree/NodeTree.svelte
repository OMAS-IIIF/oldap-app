<script lang="ts">

	import * as m from '$lib/paraglide/messages';
	import NodeTree from './NodeTree.svelte';
	import type { TreeNodeInterface } from '$lib/helpers/treenodeinterface';
	import { Plus, ArrowDown, ArrowUp, CornerDownRight, Trash2 } from '@lucide/svelte'
	import Tooltip from '$lib/components/basic_gui/tooltip/Tooltip.svelte';
	import DialogWin from '$lib/components/basic_gui/dialogs/DialogWin.svelte';
	import Node from '$lib/components/oldap/Node.svelte';
	import { api_config } from '$lib/helpers/api_config';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { projectStore } from '$lib/stores/project';
	import { apiClient } from '$lib/shared/apiClient';
	import { successInfoStore } from '$lib/stores/successinfo';
	import { refreshNodeTreeNow } from '../../../../routes/admin/hlist/[hlistid]/refresh_nodetree.svelte';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import Confirmation from '$lib/components/basic_gui/dialogs/Confirmation.svelte';
	import { draggable, droppable, type DragDropState } from '@thisux/sveltednd';

	let { node } : {node: TreeNodeInterface } = $props();

	let nodeIsOpen = $state(false);
	let expanded = $state(false);
	let nodeid = $state<string>();
	let refnode = $state<string>();
	let action = $state('');
	let authinfo = $authInfoStore || new AuthInfo('', '');
	let current_project = $projectStore;

	let confirmation_dialog: Confirmation;
	let confirmation_title = $state('');
	let dialog_title = $state('');

	function toggle() {
		expanded = !expanded;
	}

	function edit(node: TreeNodeInterface) {
		nodeid = node.nodeid;
		nodeIsOpen = true;
		action = 'edit';
		dialog_title = m.edit_node_2({nodename: node.nodeid});
	}

	function add(node: TreeNodeInterface, pos: 'addBefore' | 'addAfter' | 'addBelow') {
		nodeid = undefined;
		refnode = node.nodeid;
		nodeIsOpen = true;
		action = pos;
		switch (pos) {
			case 'addBefore':
				dialog_title = m.add_node_before_2({nodename: refnode});
				break;
			case 'addAfter':
				dialog_title = m.add_node_after_2({nodename: refnode});
				break;
			case 'addBelow':
				dialog_title = m.add_node_child_2({nodename: refnode});
				break;
		}
	}

	async function delete_node(node: TreeNodeInterface) {
		confirmation_title = m.delete_node();
		const ok = await confirmation_dialog.open();

		if (ok) {
			const node_delete = api_config(authinfo, {
				project: current_project?.projectShortName.toString() || '',
				hlistid: node.hlistid,
				nodeid: node.nodeid
			}, {
				recursive: "true"
			});
			apiClient.deleteAdminhlistProjectHlistidNodeid(undefined, node_delete).then(res => {
				successInfoStore.set(`!${res.message}`);
				refreshNodeTreeNow();
			}).catch(error => {
				errorInfoStore.set(process_api_error(error as Error));
				return;
			});
		}
	}

	function handleDrop(state: DragDropState<TreeNodeInterface>) {
		const { draggedItem, sourceContainer, targetContainer } = state;
		console.log("-->", $state.snapshot(draggedItem), sourceContainer, targetContainer);
		const node_move = api_config(authinfo, {
			project: current_project?.projectShortName.toString() || '',
			hlistid: draggedItem.hlistid,
			nodeid: draggedItem.nodeid
		});
		const [position, nodeid] = targetContainer?.split(':') || ['', ''];
		type Position = 'leftOf' | 'rightOf' | 'belowOf';
		const data: Record<Position, string> = {[position as Position]: nodeid} as Record<Position, string>;
		apiClient.postAdminhlistProjectHlistidNodeidmove(data, node_move).then((re) => {
			successInfoStore.set(`!${re.message}`);
			refreshNodeTreeNow();
		}).catch(error => {
			errorInfoStore.set(process_api_error(error as Error));
			return;
		});
	}

</script>

<li class="ml-1 pl-1">
	<div class="flex items-center space-x-3">
		{#if node.children}
			<!-- <strong style="cursor: pointer;" onclick={toggle}>{expanded ? '▼' : '▶'}</strong> -->
			<button
				onclick={toggle}
				class="bg-transparent font-bold text-inherit p-0 m-0 leading-none cursor-pointer focus:outline-none"
				aria-expanded={expanded}
				type="button"
			>
				{expanded ? '▼' : '▶'}
			</button>
		{/if}
		<button type="button" onclick={() => {edit(node)}} use:draggable={{ container: 'nodes', dragData: node }} class="cursor-pointer">{node.name}</button>
		<div class="flex space-x-3">
			<Tooltip text={m.add_node_before()}>
				<button
					onclick={() => add(node, 'addBefore')}
					aria-label={m.add_node_before()}
					class="flex items-center space-x-0 text-gray-500 hover:text-black outline-2 rounded-md outline-offset-3"
					use:droppable={{ container: `leftOf:${node.nodeid}`, callbacks: { onDrop: handleDrop }, attributes: {draggingClass: "text-red-400"} }}
				>
					<Plus class="size-3 -ml-1" /><ArrowUp class="size-3" />
				</button>
			</Tooltip>
			<Tooltip text={m.add_node_after()}>
				<button
					onclick={() => add(node, 'addAfter')}
					aria-label={m.add_node_after()}
					class="flex items-center space-x-0 text-gray-500 hover:text-black outline-2 rounded-md outline-offset-3"
					use:droppable={{ container: `rightOf:${node.nodeid}`, callbacks: { onDrop: handleDrop }, attributes: {draggingClass: "text-red-400"} }}
				>
					<Plus class="size-3 -ml-1" /><ArrowDown class="size-3" />
				</button>
			</Tooltip>
			{#if !(node.children && node.children.length > 0)}
				<Tooltip text={m.add_node_child()}>
					<button
						onclick={() => add(node, 'addBelow')}
						aria-label={m.add_node_child()}
						class="flex items-center space-x-0 text-gray-500 hover:text-black outline-2 rounded-md outline-offset-3"
						use:droppable={{ container: `belowOf:${node.nodeid}`, callbacks: { onDrop: handleDrop }, attributes: {draggingClass: "text-red-400"} }}
					>
						<Plus class="size-3 -ml-1" /><CornerDownRight class="size-3" />
					</button>
				</Tooltip>
			{/if}
			<Tooltip text={m.delete_node()}>
				<button onclick={() => delete_node(node)} aria-label={m.add_node_child()} class="flex items-center space-x-0 text-gray-500 hover:text-black outline-2 rounded-md outline-offset-3"><Trash2 class="size-3" /></button>
			</Tooltip>
		</div>
	</div>

	{#if expanded && node.children && node.children.length > 0}
		<ul class="pl-4 list-none border-l border-gray-300 ml-1 space-y-1">
			{#each node.children as child}
				<NodeTree node={child} />
			{/each}
		</ul>
	{/if}
</li>

<DialogWin bind:isopen={nodeIsOpen} title={dialog_title}>
	<Node {action}
				hlistid={node.hlistid}
				bind:nodeid={nodeid}
				{refnode}
				bind:isopen={nodeIsOpen} />
</DialogWin>

<Confirmation bind:this={confirmation_dialog} title={confirmation_title}>
	{m.delete_node_2({nodename: node.nodeid})}
</Confirmation>

