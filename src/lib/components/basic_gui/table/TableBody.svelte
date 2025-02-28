<script lang="ts">

	let { children } = $props()

</script>

<tbody class="divide-y divide-gray-200 bg-white">
	{@render children?.()}
</tbody>