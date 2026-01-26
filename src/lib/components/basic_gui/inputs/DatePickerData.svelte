<!--
  - Copyright (©) 2026. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
  -->

<!--
  DatePickerData.svelte

  Multi-value wrapper for DatePicker.svelte with minCount/maxCount.
  Manages multiple DatePicker instances and provides a get_value() that returns an array.
-->
<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import NativeDatePicker from './NativeDatePicker.svelte';
	import { XsdDate } from '$lib/oldap/datatypes/xsd_date';

	// Type of the NativeDatePicker component instance (so we can call get_value())
	type NativeDatePickerInstance = {
		get_value: () => XsdDate | null;
	};

	let {
		/** Label shown above the whole group */
		label,

		/** Base name (used to build ids; your DatePicker currently doesn't use `name` internally) */
		name,

		/** Optional base id; each picker will use `${id}-${i}` */
		id,

		/** Optional initial values (prefill). Each entry may be XsdDate or null. */
		values = [],

		/** Optional bindable disabled forwarded to DatePicker */
		disabled = $bindable(false),

		/** Optional class forwarded to DatePicker */
		class: userClass = '',

		/** Cardinality */
		minCount = 1,
		maxCount = Infinity
	}: {
		label: string;
		name: string;
		id?: string;
		values?: XsdDate[];
		disabled?: boolean;
		class?: string;
		minCount?: number;
		maxCount?: number;
	} = $props();

	(() => {
		if (minCount !== undefined) {
			minCount = Math.max(0, Math.floor(minCount));
		} else {
			minCount = 0;
		}
	})();

	(() => {
		if (maxCount !== undefined) {
			maxCount = maxCount === Infinity ? Infinity : Math.max(minCount, Math.floor(maxCount));
		} else {
			maxCount = Infinity;
		}
	})();

	// We keep an internal list for how many pickers to render.
	// Each entry stores the initial value passed to that picker.
	let items = $state<XsdDate[]>([]);

	onMount(() => {
		ensureCardinality();
	})


	function ensureCardinality() {
		const current = Array.isArray(values) ? values : [];
		let next = [...current];

		// Ensure at least minCount items
		while (next.length < minCount) next.push(new XsdDate());

		// Ensure not above maxCount
		if (maxCount !== Infinity && next.length > maxCount) next = next.slice(0, maxCount);

		// Apply if changed
		/*
				if (next.length !== current.length || next.some((v, i) => v !== current[i])) {
					values = next;
				}
		*/
		items = next;
	}


		// Refs to child components so we can call get_value() on each
	let pickers = $state<(NativeDatePickerInstance | null)[]>([]);

	// function normalizeItems(src: XsdDate[]): XsdDate[] {
	// 	let next = [...src];
	//
	// 	// Ensure at least minCount items
	// 	while (next.length < minCount) next.push(new XsdDate());
	//
	// 	// Ensure not above maxCount
	// 	if (maxCount !== Infinity && next.length > maxCount) {
	// 		next = next.slice(0, maxCount);
	// 	}
	//
	// 	return next;
	// }
	//
	// function shallowEqual(a: unknown[], b: unknown[]): boolean {
	// 	if (a === b) return true;
	// 	if (a.length !== b.length) return false;
	// 	for (let i = 0; i < a.length; i++) {
	// 		if (a[i] !== b[i]) return false;
	// 	}
	// 	return true;
	// }

	function alignPickers(nextLen: number) {
		// Keep picker refs aligned WITHOUT making callers react to `pickers`.
		const current = untrack(() => pickers);
		if (current.length === nextLen) return;
		if (current.length < nextLen) {
			pickers = [...current, ...Array(nextLen - current.length).fill(null)];
		} else {
			pickers = current.slice(0, nextLen);
		}
	}

	function canAdd() {
		return maxCount === Infinity ? true : items.length < maxCount;
	}

	function canRemove() {
		return items.length > minCount;
	}

	function addPicker(afterIndex?: number) {
		if (!canAdd()) return;
		const idx =
			afterIndex === undefined
				? items.length
				: Math.min(Math.max(0, afterIndex + 1), items.length);

		items = [...items.slice(0, idx), new XsdDate(), ...items.slice(idx)];
		alignPickers(items.length);
	}

	function removePicker(index: number) {
		if (!canRemove()) return;
		if (index < 0 || index >= items.length) return;

		items = [...items.slice(0, index), ...items.slice(index + 1)];
		alignPickers(items.length);
	}

	// If parent changes `values` later, we reflect it (best-effort)
	// $effect(() => {
	// 	const src = Array.isArray(values) ? values : [];
	// 	const nextItems = normalizeItems(src);
	//
	// 	// Only write when something actually changed to avoid effect loops
	// 	if (!shallowEqual(items, nextItems)) {
	// 		items = nextItems;
	// 	}
	//
	// 	alignPickers(items.length);
	// });

	/**
	 * Returns an array of XsdDate|null, one entry per picker (in order).
	 * - If a picker is "unused" (checkbox off), its get_value() returns null.
	 */
	export const get_value = (): XsdDate[] => {
		// Ensure we have refs aligned; then pull values from children
		return items.map((_, i) => pickers[i]?.get_value() || new XsdDate('0000-01-01'));
	};
</script>

<div class="mt-3">
	<label
		for={id}
		class="{minCount > 0 ? 'underline' : ''} block text-xs/4 font-medium text-input-label-fg dark:text-input-label-fg-dark"
	>
		{label}:
	</label>

	<div class="mt-2 space-y-2">
		{#if items.length === 0}
			<!-- No values yet (e.g., 0-1 or 0-n): show an add button -->
			<div class="flex justify-end">
				<button
					type="button"
					class="px-2 py-1 rounded-md border text-sm disabled:opacity-40"
					onclick={() => addPicker()}
					disabled={disabled || !canAdd()}
					aria-label="Add date"
					title="Add"
				>
					+
				</button>
			</div>
		{:else}
			{#each items as initial, i (i)}
				<div class="grid grid-cols-[1fr_auto] gap-2 items-start">
					<!-- The actual picker -->
					<div class={userClass}>
						<NativeDatePicker
							bind:this={pickers[i]}
							showCheckbox={false}
							name={`${name}[${i}]`}
							id={id ? `${id}-${i}` : undefined}
							value={initial}
							required={true}
							bind:disabled={disabled}
							class={userClass}
						/>
					</div>

					<!-- +/- controls -->
					<div class="flex gap-1 pt-6">
						{#if i === items.length - 1}
							<button
								type="button"
								class="px-2 py-1 rounded-md border text-sm disabled:opacity-40"
								onclick={() => addPicker(i)}
								disabled={disabled || !canAdd()}
								aria-label="Add date"
								title="Add"
							>
								+
							</button>
						{/if}

						<button
							type="button"
							class="px-2 py-1 rounded-md border text-sm disabled:opacity-40"
							onclick={() => removePicker(i)}
							disabled={disabled || !canRemove()}
							aria-label="Remove date"
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