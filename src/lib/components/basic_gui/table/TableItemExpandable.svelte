<!--
  - Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
  -->
<script lang="ts">
	import { ChevronDown, ChevronRight } from '@lucide/svelte';

	let {
		children,
		expandedContent,
		isExpanded = $bindable(false),
		class: className = ''
	}: {
		children: any,
		expandedContent: any,
		isExpanded?: boolean,
		class?: string
	} = $props();

	function toggleExpanded() {
		isExpanded = !isExpanded;
	}
</script>

<td class="py-2 pr-2 pl-4 text-xs font-medium whitespace-nowrap text-table-body-fg dark:text-table-body-fg-dark sm:pl-6 {className}">
	<div class="flex items-center gap-2">
		<button
			class="flex items-center justify-center w-4 h-4 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
			onclick={toggleExpanded}
			aria-expanded={isExpanded}
			aria-label={isExpanded ? 'Zuklappen' : 'Aufklappen'}
		>
			{#if isExpanded}
				<ChevronDown size="12" strokeWidth="2" />
			{:else}
				<ChevronRight size="12" strokeWidth="2" />
			{/if}
		</button>
		<div class="flex-1">
			{@render children()}
		</div>
	</div>

	{#if isExpanded}
		<div class="mt-2 pl-6 border-l-2 border-gray-200 dark:border-gray-600">
			{@render expandedContent()}
		</div>
	{/if}
</td>
