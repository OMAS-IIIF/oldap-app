<!--
  - Copyright (©) 2026. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
  -->

<script lang="ts">
	import { getLocale } from '$lib/paraglide/runtime';
	import { convertToLanguage, Language } from '$lib/oldap/enums/language';
	import type { OldapList } from '$lib/oldap/classes/list';
	import type { OldapListNode } from '$lib/oldap/classes/listnode';

	let {
		label,
		name,
		id,
		hlist,
		values = $bindable<string[]>([]),
		disabled = $bindable(false),
		class: userClass = '',
		minCount = 1,
		maxCount = Infinity
	}: {
		label: string;
		name: string;
		id?: string;
		hlist: OldapList | undefined;
		values?: string[];
		disabled?: boolean;
		class?: string;
		minCount?: number;
		maxCount?: number;
	} = $props();

	const locale = getLocale();
	const lang = convertToLanguage(locale) ?? Language.EN;

	let pathSelections = $state<string[][]>([]);

	(() => {
		if (minCount === undefined) {
			minCount = 0;
		} else {
			minCount = Math.max(0, Math.floor(minCount));
		}

		if (maxCount === undefined) {
			maxCount = Infinity;
		} else {
			maxCount = maxCount === Infinity ? Infinity : Math.max(minCount, Math.floor(maxCount));
		}
	})();

	function isSyntheticRootNode(node: OldapListNode): boolean {
		const nodeId = node.nodeId?.toString?.() ?? '';
		const listId = hlist?.oldapListId?.toString?.() ?? '';
		const nodeIri = node.iri?.toString?.() ?? '';
		const listIri = hlist?.iri?.toString?.() ?? '';

		return (
			(nodeId.length > 0 && listId.length > 0 && nodeId === listId) ||
			(nodeIri.length > 0 && listIri.length > 0 && nodeIri === listIri)
		);
	}

	function rootNodes(): OldapListNode[] {
		const nodes = hlist?.nodes ?? [];
		const syntheticRoot = nodes.find((node) => isSyntheticRootNode(node));
		if (syntheticRoot) {
			return syntheticRoot.nodes ?? [];
		}
		return nodes;
	}

	function nodeLabel(node: OldapListNode): string {
		const byLang = node.prefLabel?.get(lang) ?? '';
		if (byLang && byLang.trim().length > 0) return byLang;
		const nodeId = node.nodeId?.toString?.() ?? '';
		if (nodeId.length > 0) return nodeId;
		return node.iri.toString();
	}

	function findPathByIri(
		nodes: OldapListNode[],
		targetIri: string,
		parentPath: string[] = []
	): string[] | null {
		for (const node of nodes) {
			const iri = node.iri.toString();
			const nextPath = [...parentPath, iri];
			if (iri === targetIri) return nextPath;
			const found = findPathByIri(node.nodes ?? [], targetIri, nextPath);
			if (found) return found;
		}
		return null;
	}

	function pathForValue(value: string): string[] {
		if (!value) return [];
		return findPathByIri(rootNodes(), value) ?? [];
	}

	function samePaths(a: string[][], b: string[][]): boolean {
		if (a.length !== b.length) return false;
		for (let i = 0; i < a.length; i++) {
			if (a[i].length !== b[i].length) return false;
			for (let j = 0; j < a[i].length; j++) {
				if (a[i][j] !== b[i][j]) return false;
			}
		}
		return true;
	}

	$effect(() => {
		const _roots = rootNodes();
		const incoming = Array.isArray(values) ? values : [];
		const nextValues = [...incoming];

		while (nextValues.length < minCount) nextValues.push('');
		if (maxCount !== Infinity && nextValues.length > maxCount) nextValues.splice(maxCount);

		const valuesChanged =
			nextValues.length !== incoming.length || nextValues.some((v, i) => v !== incoming[i]);
		if (valuesChanged) {
			values = nextValues;
		}

		const nextPaths = nextValues.map((v) => pathForValue(v));
		if (!samePaths(pathSelections, nextPaths)) {
			pathSelections = nextPaths;
		}
	});

	function canAdd(): boolean {
		return maxCount === Infinity ? true : values.length < maxCount;
	}

	function canRemove(): boolean {
		return values.length > minCount;
	}

	function addSelector(afterIndex?: number) {
		if (!canAdd()) return;
		const idx =
			afterIndex === undefined
				? values.length
				: Math.min(Math.max(0, afterIndex + 1), values.length);

		values = [...values.slice(0, idx), '', ...values.slice(idx)];
		pathSelections = [...pathSelections.slice(0, idx), [], ...pathSelections.slice(idx)];
	}

	function removeSelector(index: number) {
		if (!canRemove()) return;
		if (index < 0 || index >= values.length) return;

		values = [...values.slice(0, index), ...values.slice(index + 1)];
		pathSelections = [...pathSelections.slice(0, index), ...pathSelections.slice(index + 1)];
	}

	function levelsForPath(path: string[]): OldapListNode[][] {
		const levels: OldapListNode[][] = [];
		let levelNodes = rootNodes();
		let depth = 0;

		while (levelNodes.length > 0) {
			levels.push(levelNodes);

			const selectedAtDepth = path[depth];
			if (!selectedAtDepth) break;

			const selectedNode = levelNodes.find((node) => node.iri.toString() === selectedAtDepth);
			if (!selectedNode || !selectedNode.nodes || selectedNode.nodes.length === 0) break;

			levelNodes = selectedNode.nodes;
			depth += 1;
		}

		return levels;
	}

	function updateSelection(rowIndex: number, levelIndex: number, selectedIri: string) {
		const currentPath = pathSelections[rowIndex] ?? [];
		const nextPath =
			selectedIri.length === 0
				? currentPath.slice(0, levelIndex)
				: [...currentPath.slice(0, levelIndex), selectedIri];

		pathSelections = pathSelections.map((path, i) => (i === rowIndex ? nextPath : path));
		values = values.map((val, i) => (i === rowIndex ? (nextPath.at(-1) ?? '') : val));
	}

	export const get_value = (): (string | null)[] => {
		return values.map((v) => {
			const x = (v ?? '').trim();
			return x.length > 0 ? x : null;
		});
	};
</script>

<div class="mt-3">
	<label
		for={id}
		class="{minCount > 0
			? 'underline'
			: ''} text-input-label-fg dark:text-input-label-fg-dark block text-xs/4 font-medium"
	>
		{label}:
	</label>

	<div class="mt-2 space-y-2">
		{#if rootNodes().length === 0}
			<div class="rounded border bg-gray-50 px-2 py-2 text-xs opacity-70">
				No nodes available in this hierarchical list.
			</div>
		{:else if values.length === 0}
			<div class="flex justify-end">
				<button
					type="button"
					class="rounded-md border px-2 py-1 text-sm disabled:opacity-40"
					onclick={() => addSelector()}
					disabled={disabled || !canAdd()}
					aria-label="Add selection"
					title="Add"
				>
					+
				</button>
			</div>
		{:else}
			{#each values as _v, i (i)}
				{@const levels = levelsForPath(pathSelections[i] ?? [])}
				<div class="grid grid-cols-[1fr_auto] items-start gap-2">
					<div class="flex flex-wrap items-center gap-2 {userClass}">
						{#each levels as levelNodes, levelIndex (levelIndex)}
							<select
								name={`${name}[${i}][${levelIndex}]`}
								id={id ? `${id}-${i}-${levelIndex}` : undefined}
								class="max-w-72 min-w-48 rounded border px-2 py-1 text-sm disabled:opacity-50"
								value={pathSelections[i]?.[levelIndex] ?? ''}
								onchange={(e) =>
									updateSelection(i, levelIndex, (e.currentTarget as HTMLSelectElement).value)}
								{disabled}
							>
								<option value="">-</option>
								{#each levelNodes as node (node.iri.toString())}
									<option value={node.iri.toString()}>{nodeLabel(node)}</option>
								{/each}
							</select>
							{#if levelIndex < levels.length - 1}
								<span class="text-xs opacity-60">→</span>
							{/if}
						{/each}
					</div>

					<div class="flex gap-1 pt-1">
						{#if i === values.length - 1}
							<button
								type="button"
								class="rounded-md border px-2 py-1 text-sm disabled:opacity-40"
								onclick={() => addSelector(i)}
								disabled={disabled || !canAdd()}
								aria-label="Add selection"
								title="Add"
							>
								+
							</button>
						{/if}
						<button
							type="button"
							class="rounded-md border px-2 py-1 text-sm disabled:opacity-40"
							onclick={() => removeSelector(i)}
							disabled={disabled || !canRemove()}
							aria-label="Remove selection"
							title="Remove"
						>
							-
						</button>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>
