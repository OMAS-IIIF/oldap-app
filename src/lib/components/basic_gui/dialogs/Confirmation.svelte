<script lang="ts">

	import { fade } from 'svelte/transition';

	let { children, title = 'Confirmation', cancel = 'Cancel', ok = 'OK'} = $props();

	let show = $state(false)
	let resolve: (resolve: boolean) => void;

	export function open() {
		show = true;
		return new Promise<boolean>((res) => {
			resolve = res; // Store resolver for later
		});
	}

	function handleOk() {
		resolve(true); // Resolve the promise with true
		show = false;
	}

	function handleCancel() {
		resolve(false); // Resolve the promise with false
		show = false;
	}

</script>

{#if show}
<div class="relative z-10 " transition:fade aria-labelledby="modal-title" role="dialog" aria-modal="true">
	<div class="fixed inset-0 bg-gray-500/75 transition-opacity" aria-hidden="true"></div>

	<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
		<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0" transition:fade>
			<div class="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
				<div class="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
					<button type="button" class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden" onclick={handleCancel}>
						<span class="sr-only">Close</span>
						<svg class="size-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
				<div class="sm:flex sm:items-start">
					<div class="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-red-600">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
						</svg>
					</div>
					<div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
						<h3 class="text-base font-semibold text-gray-900" id="modal-title">{title}</h3>
						<div class="mt-2">
							<p class="text-sm text-gray-500">
								{@render children()}
							</p>
						</div>
					</div>
				</div>
				<div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
					<button type="button" class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto" onclick={handleOk}>{ok}</button>
					<button type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto" onclick={handleCancel}>{cancel}</button>
				</div>
			</div>
		</div>
	</div>
</div>
{/if}