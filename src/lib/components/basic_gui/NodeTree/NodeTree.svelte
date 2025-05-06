<script lang="ts">

	import NodeTree from './NodeTree.svelte';
	import type { TreeNodeInterface } from '$lib/helpers/treenodeinterface';


	let { node } : {node: TreeNodeInterface } = $props();

	let expanded = $state(false);

	function toggle() {
		expanded = !expanded;
	}
</script>

<li class="ml-1 pl-1">
	<div >
		{#if node.children}
			<strong style="cursor: pointer;" onclick={toggle}>{expanded ? '▼' : '▶'}</strong>
		{/if}
		{node.name}
	</div>

	{#if expanded && node.children && node.children.length > 0}
		<ul class="pl-4 list-none border-l border-gray-300 ml-1 space-y-1">
			{#each node.children as child}
				<NodeTree node={child} />
			{/each}
		</ul>
	{/if}
</li>