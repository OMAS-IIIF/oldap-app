<script lang="ts">
	let { children } = $props();
</script>

<div class="mt-3">
	<span class="block text-xs/4 font-bold text-input-label-fg dark:text-input-label-fg-dark">
		{@render children()}
	</span>
	<hr />
</div>