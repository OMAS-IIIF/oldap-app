<script lang="ts">

	let { children } = $props()

</script>

<tbody class="divide-y divide-gray-200 dark:divide-gray-600 bg-table-body-bg dark:bg-table-body-bg-dark">
	{@render children?.()}
</tbody>