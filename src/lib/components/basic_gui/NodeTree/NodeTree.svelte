<script lang="ts">

	import NodeTree from './NodeTree.svelte';
	import type { TreeNodeInterface } from '$lib/helpers/treenodeinterface';


	let { node } : {node: TreeNodeInterface } = $props();

	let expanded = $state(false);

	function toggle() {
		expanded = !expanded;
	}
</script>

<li>
	<div style="cursor: pointer;" onclick={toggle}>
		{#if node.children}
			<strong>{expanded ? '▼' : '▶'}</strong>
		{/if}
		{node.name}
	</div>

	{#if expanded && node.children && node.children.length > 0}
		<ul>
			{#each node.children as child}
				<NodeTree node={child} />
			{/each}
		</ul>
	{/if}
</li>