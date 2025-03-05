<script lang="ts">

	let { headers }: { headers: string[]} = $props()

</script>

<thead class="bg-gray-50">
<tr>
	{#each headers as header}
		<th scope="col" class="py-3.5 pr-3 pl-4 text-left text-sm font-semibold bg-table-header-bg dark:bg-table-header-bg-dark text-table-header-fg dark:text-table-header-fg-dark sm:pl-6 sticky top-0 z-99">{header}</th>
	{/each}
	<!--<th scope="col" class="relative py-3.5 pr-4 pl-3 sm:pr-6">
		<span class="sr-only">Edit</span>
	</th>-->
</tr>
</thead>
