<script lang="ts">

	import * as m from '$lib/paraglide/messages';
	import NodeTree from './NodeTree.svelte';
	import type { TreeNodeInterface } from '$lib/helpers/treenodeinterface';
	import { Plus, ArrowDown, ArrowUp, CornerDownRight } from '@lucide/svelte'
	import Tooltip from '$lib/components/basic_gui/tooltip/Tooltip.svelte';
	import DialogWin from '$lib/components/basic_gui/dialogs/DialogWin.svelte';
	import Node from '$lib/components/oldap/Node.svelte';

	let { node } : {node: TreeNodeInterface } = $props();

	let nodeIsOpen = $state(false);
	let expanded = $state(false);
	let nodeid = $state<string>();
	let refnode = $state<string>();
	let action = $state('');

	function toggle() {
		expanded = !expanded;
	}

	function edit(node: TreeNodeInterface) {
		nodeid = node.nodeid;
		nodeIsOpen = true;
		action = 'edit';
	}

	function add(node: TreeNodeInterface, pos: 'addBefore' | 'addAfter' | 'addBelow') {
		nodeid = undefined;
		refnode = node.nodeid;
		nodeIsOpen = true;
		action = pos;
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
		<Tooltip text={m.edit_node()}>
			<button type="button" onclick={() => {edit(node)}}>{node.name}</button>
		</Tooltip>
		<div class="flex space-x-3">
			<Tooltip text={m.add_node_before()}>
				<button onclick={() => add(node, 'addBefore')} aria-label={m.add_node_before()} class="flex items-center space-x-0 text-gray-500 hover:text-black outline-2 rounded-md outline-offset-3"><Plus class="size-3 -ml-1" /><ArrowUp class="size-3" /></button>
			</Tooltip>
			<Tooltip text={m.add_node_after()}>
				<button onclick={() => add(node, 'addAfter')} aria-label={m.add_node_after()} class="flex items-center space-x-0 text-gray-500 hover:text-black outline-2 rounded-md outline-offset-3"><Plus class="size-3 -ml-1" /><ArrowDown class="size-3" /></button>
			</Tooltip>
			<Tooltip text={m.add_node_child()}>
				<button onclick={() => add(node, 'addBelow')} aria-label={m.add_node_child()} class="flex items-center space-x-0 text-gray-500 hover:text-black outline-2 rounded-md outline-offset-3"><Plus class="size-3 -ml-1" /><CornerDownRight class="size-3" /></button>
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

<DialogWin bind:isopen={nodeIsOpen} title="NODE-EDIT">
	<Node {action}
				hlistid={node.hlistid}
				bind:nodeid={nodeid}
				{refnode}
				bind:isopen={nodeIsOpen} />
</DialogWin>
