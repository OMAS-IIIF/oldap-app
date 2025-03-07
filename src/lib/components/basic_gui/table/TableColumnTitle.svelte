<script lang="ts">
	let { children } = $props();
</script>

<th scope="col" class="py-2 pr-2 pl-4 text-left font-semibold bg-table-header-bg dark:bg-table-header-bg-dark text-table-header-fg dark:text-table-header-fg-dark sm:pl-6 sticky top-0 z-10">
	{@render children()}
</th>
