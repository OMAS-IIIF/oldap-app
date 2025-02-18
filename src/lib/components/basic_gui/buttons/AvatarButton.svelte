<script lang="ts">
	let { children = () => {}, src = null, initials = null, onclick = null } = $props();

	let class_str: string = $state('')

	if (src) {
		class_str = "";
	}
	else if (initials) {
		class_str = "inline-flex size-10 items-center justify-center rounded-full bg-gray-500";
	}
	else {
		class_str = "inline-block size-10 overflow-hidden rounded-full bg-gray-100";
	}
</script>

<button class={class_str} onclick={onclick || undefined}>
	{#if src}
		<img class="inline-block size-10 rounded-full" src={src} alt="" />
	{:else if initials}
		 <span class="text-medium font-medium text-white">LR</span>
	{:else}
		<svg class="size-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
			<path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
		</svg>
	{/if}
	{@render children()}
</button>