<!--
  - Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
  -->
<script lang="ts">
	let {
		children,
		expandedRow,
		isExpanded = $bindable(false),
		class: className = ''
	}: {
		children: any,
		expandedRow?: any,
		isExpanded?: boolean,
		class?: string
	} = $props();
</script>

<tr class={className}>
	{@render children()}
</tr>

{#if isExpanded && expandedRow}
	<tr class="bg-gray-50 dark:bg-gray-800">
		<td colspan="100%" class="px-4 py-3 text-xs">
			{@render expandedRow()}
		</td>
	</tr>
{/if}
