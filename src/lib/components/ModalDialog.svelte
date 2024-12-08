<script>

	let {children, isOpen = $bindable(), title = 'MODAL DIALOG'} = $props();
	//export let isOpen = false;
	const closeModal = () => (isOpen = false);
</script>

{#if isOpen}
	<div class="modal modal-open">
		<div class="modal-box">
			<h2 class="font-bold text-lg">{title}</h2>
			<p class="py-4">{@render children()}</p>
			<div class="modal-action">
				<button class="btn btn-primary" onclick={closeModal}>Close</button>
			</div>
		</div>
	</div>
{/if}