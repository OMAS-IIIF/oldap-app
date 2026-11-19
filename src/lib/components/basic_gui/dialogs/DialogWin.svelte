<script lang="ts">
	/** Shared dialog styling. Native modality is opt-in for popups above another
	 * native modal (e.g. API errors inside the shape editor). */
	let {
		children,
		title,
		isopen = $bindable(),
		alert = false,
		nativeModal = false,
		onclose = null
	} = $props();
	let popup = $state<HTMLDialogElement>();
	const panelClass = $derived(
		alert
			? 'bg-oldap-error-bg p-3 rounded-lg shadow-lg w-96 border-4 border-oldap-error-border text-oldap-error-fg'
			: 'bg-oldap-bg dark:bg-oldap-bg-dark p-3 rounded-lg shadow-lg w-96'
	);

	$effect(() => {
		if (nativeModal && isopen && popup && !popup.open) popup.showModal();
	});

	function closeit(event: Event) {
		event.preventDefault();
		onclose?.(event);
		isopen = false;
	}
</script>

{#snippet content()}
	<div class="items-between flex h-10 justify-center p-0">
		<h2 class="flex items-center text-xl font-semibold {alert ? 'text-oldap-error-fg' : ''}">
			{#if alert}
				&nbsp;
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
					/>
				</svg>
			{/if}
			{title}
		</h2>
		<div class="flex-grow">&nbsp;</div>
		<button
			type="button"
			class={alert ? 'text-oldap-error-fg' : ''}
			aria-label="close"
			onclick={closeit}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="size-6"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
			</svg>
		</button>
	</div>
	{@render children()}
{/snippet}

{#if isopen}
	{#if nativeModal}
		<dialog
			bind:this={popup}
			class={panelClass +
				' m-auto max-h-[90vh] max-w-[calc(100vw-2rem)] overflow-y-auto backdrop:bg-black/50'}
			role={alert ? 'alertdialog' : 'dialog'}
			aria-label={title}
			oncancel={closeit}
		>
			{@render content()}
		</dialog>
	{:else}
		<div class="fixed inset-0 z-9999 flex items-center justify-center bg-black/50">
			<div class={panelClass + ' max-h-[90vh] overflow-y-auto'}>{@render content()}</div>
		</div>
	{/if}
{/if}
