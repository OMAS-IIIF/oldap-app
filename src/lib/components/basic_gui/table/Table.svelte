<script lang="ts">

	import { onMount, type Snippet } from 'svelte';

	let { children, height, title = 'Table', description = '', action_elements} : { children: Snippet, height: number, title: string, description: string, action_elements: Snippet } = $props();

	let element: HTMLElement;
	let hh: number = $state(0);

	let table_height = $derived(height - hh);

	onMount(() => {
		if (element) {
			const observer = new ResizeObserver(() => {
				hh = element.clientHeight;
			});
			observer.observe(element);

			return () => observer.disconnect();
		}
	});

</script>


<div class="px-4 sm:px-6 lg:px-8">
	<div class="sm:flex sm:items-center" bind:this={element}>
		<div class="basis-auto">
			<h1 class="text-base font-semibold text-gray-900 dark:text-gray-200">{title}</h1>
			<p class="mt-2 text-sm text-gray-700 dark:text-gray-300">{description}</p>
		</div>
		<div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-auto grow">
			<div class="flex flex-row gap-2 items-center justify-end">
				{@render action_elements?.()}
			</div>
		</div>
	</div>
	<div class="mt-1 flow-root">
		<div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
			<div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
				<div class="overflow-hidden ring-1 shadow-sm ring-black/5 sm:rounded-lg overflow-y-auto" style:max-height={table_height}px>
					<table class="min-w-full divide-y divide-gray-300">
						{@render children()}
					</table>
				</div>
			</div>
		</div>
	</div>
</div>