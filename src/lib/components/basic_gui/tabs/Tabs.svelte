<script lang="ts">

	import { onMount } from 'svelte';

	export type TabsType = {[key: string]: string};
	let { tabs, selected = $bindable(), height = $bindable() }: { tabs: TabsType, selected: string, height: number } = $props();

	//let selected = $state(Object.keys(tabs)[0] || '');

	const tab_changes = (id: string) => {
		selected = id;
	};

	const select_changes = (event: Event) => {
		selected = (event.target as HTMLSelectElement).value;
	};

	let element: HTMLElement;

	onMount(() => {
		if (element) {
			height = element.clientHeight;
			const observer = new ResizeObserver(() => {
				height = element.clientHeight;
				console.log("============================++++++++++++++++++", height);
			});
			observer.observe(element);

			return () => observer.disconnect();
		}
	});

</script>

<div bind:this={element}>
	<div class="grid grid-cols-1 sm:hidden">
		<!-- Use an "onChange" listener to redirect the user to the selected tab URL. -->
		<select aria-label="Select a tab" onchange={select_changes} class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600">
			{#each Object.entries(tabs) as [id, name]}
				<option value={id} selected={selected === id}>{name}</option>
			{/each}
		</select>
		<svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-gray-500" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
			<path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
		</svg>
	</div>
	<div class="hidden sm:block">
		<div class="border-b border-gray-200">
			<nav class="-mb-px flex gap-x-10" aria-label="Tabs">
				<!-- Current: "border-indigo-500 text-indigo-600", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" -->
				{#each Object.entries(tabs) as [id, name]}
					{#if selected === id}
						<a href="#" class="border-b-2 border-indigo-500 px-1 py-4 text-center text-xs font-medium text-indigo-600" aria-current="page">{name}</a>
					{:else}
						<a href="#" onclick={() => tab_changes(id)} class="border-b-2 border-transparent px-1 py-4 text-center text-xs font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">{name}</a>
					{/if}
				{/each}
			</nav>
		</div>
	</div>
</div>