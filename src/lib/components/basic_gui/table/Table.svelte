<script lang="ts">

	import { onMount } from 'svelte';

	let { height } : { height: number } = $props();

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
		<div class="sm:flex-auto">
			<h1 class="text-base font-semibold text-gray-900 dark:text-gray-200">Users</h1>
			<p class="mt-2 text-sm text-gray-700 dark:text-gray-300">A list of all the users in your account including their name, title, email and role.</p>
		</div>
		<div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
			<!--<button type="button" class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Add user</button>-->
			<button type="button" class="oldap-button">Add user</button>
		</div>
	</div>
	<div class="mt-1 flow-root">
		<div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
			<div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
				<div class="overflow-hidden ring-1 shadow-sm ring-black/5 sm:rounded-lg overflow-y-auto" style:max-height={table_height}px>
					<table class="min-w-full divide-y divide-gray-300">
						<thead class="bg-gray-50">
						<tr>
							<th scope="col" class="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
							<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Title</th>
							<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
							<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
							<th scope="col" class="relative py-3.5 pr-4 pl-3 sm:pr-6">
								<span class="sr-only">Edit</span>
							</th>
						</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
						<tr>
							<td class="py-4 pr-3 pl-4 text-xs font-medium whitespace-nowrap text-gray-900 sm:pl-6">Lindsay Walton</td>
							<td class="px-3 py-4 text-xs whitespace-nowrap text-gray-500">Front-end Developer</td>
							<td class="px-3 py-4 text-xs whitespace-nowrap text-gray-500">lindsay.walton@example.com</td>
							<td class="px-3 py-4 text-xs whitespace-nowrap text-gray-500">Member</td>
							<td class="relative py-4 pr-4 pl-3 text-right text-xs font-medium whitespace-nowrap sm:pr-6">
								<a href="#" class="text-indigo-600 hover:text-indigo-900">Edit<span class="sr-only">, Lindsay Walton</span></a>
							</td>
						</tr>

						<!-- More people... -->
						<tr>
							<td class="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">Lindsay Walton</td>
							<td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">Front-end Developer</td>
							<td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">lindsay.walton@example.com</td>
							<td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">Member</td>
							<td class="relative py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
								<a href="#" class="text-indigo-600 hover:text-indigo-900">Edit<span class="sr-only">, Lindsay Walton</span></a>
							</td>
						</tr>

						<!-- More people... -->
						<tr>
							<td class="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">Lindsay Walton</td>
							<td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">Front-end Developer</td>
							<td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">lindsay.walton@example.com</td>
							<td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">Member</td>
							<td class="relative py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
								<a href="#" class="text-indigo-600 hover:text-indigo-900">Edit<span class="sr-only">, Lindsay Walton</span></a>
							</td>
						</tr>

						<!-- More people... -->
						<tr>
							<td class="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">Lindsay Walton</td>
							<td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">Front-end Developer</td>
							<td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">lindsay.walton@example.com</td>
							<td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">Member</td>
							<td class="relative py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
								<a href="#" class="text-indigo-600 hover:text-indigo-900">Edit<span class="sr-only">, Lindsay Walton</span></a>
							</td>
						</tr>

						<!-- More people... -->
						<tr>
							<td class="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">Lindsay Walton</td>
							<td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">Front-end Developer</td>
							<td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">lindsay.walton@example.com</td>
							<td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">Member</td>
							<td class="relative py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
								<a href="#" class="text-indigo-600 hover:text-indigo-900">Edit<span class="sr-only">, Lindsay Walton</span></a>
							</td>
						</tr>

						<!-- More people... -->
						<tr>
							<td class="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">Lindsay Walton</td>
							<td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">Front-end Developer</td>
							<td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">lindsay.walton@example.com</td>
							<td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">Member</td>
							<td class="relative py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
								<a href="#" class="text-indigo-600 hover:text-indigo-900">Edit<span class="sr-only">, Lindsay Walton</span></a>
							</td>
						</tr>

						<!-- More people... -->
						<tr>
							<td class="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">Lindsay Walton</td>
							<td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">Front-end Developer</td>
							<td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">lindsay.walton@example.com</td>
							<td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">Member</td>
							<td class="relative py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
								<a href="#" class="text-indigo-600 hover:text-indigo-900">Edit<span class="sr-only">, Lindsay Walton</span></a>
							</td>
						</tr>

						<!-- More people... -->
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</div>