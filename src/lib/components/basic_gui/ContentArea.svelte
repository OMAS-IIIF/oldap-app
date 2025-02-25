<script lang="ts">
	import { onMount } from 'svelte';
	import { contentAreaHeight } from '$lib/stores/contentarea_h';

	let { children } = $props();

	let element: HTMLElement;

	onMount(() => {
		if (element) {
			const observer = new ResizeObserver(() => {
				contentAreaHeight.set(element.clientHeight);
			});
			observer.observe(element);

			return () => observer.disconnect();
		}
	});

</script>

<div class="oldap-content-area" bind:this={element}>
	{@render children()}
</div>
