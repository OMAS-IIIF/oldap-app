<script lang="ts">
	let { children, title, isopen = $bindable() } = $props();
</script>

{#if isopen}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-9999">
		<div class="bg-oldap-bg p-3 rounded-lg shadow-lg w-96">
			<div class="flex items-between justify-center p-0 h-10">
				<h2 class="flex-none text-xl font-semibold">{title}</h2>
				<div class="flex-grow">&nbsp;</div>
					<button aria-label="close" onclick={() => {isopen = false;}}>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
						</svg>
					</button>
			</div>
			{@render children()}
		</div>
	</div>
{/if}