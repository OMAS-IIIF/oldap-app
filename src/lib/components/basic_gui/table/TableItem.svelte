<script lang="ts">
	let { children } = $props()
</script>

<td class="py-2 pr-2 pl-4 text-xs font-medium whitespace-nowrap text-table-body-fg dark:text-table-body-fg-dark sm:pl-6">
	{@render children()}
</td>