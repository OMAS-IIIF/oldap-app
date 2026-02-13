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
		values = $bindable<XsdDate[]>([]),

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

	onMount(() => {
		//ensureCardinality();
		let changed = false;
		if (!Array.isArray(values)) values = [];
		while (values.length < minCount) {
			changed = true;
			values.push(new XsdDate());
		}
		if (maxCount !== Infinity && values.length > maxCount) {
			values = values.slice(0, maxCount);
			changed = false
		}
		if (changed) values = [...values];
	});

	// Refs to child components so we can call get_value() on each
	let pickers = $state<(NativeDatePickerInstance | null)[]>([]);

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
		return maxCount === Infinity ? true : values.length < maxCount;
	}

	function canRemove() {
		return values.length > minCount;
	}

	function addPicker(afterIndex?: number) {
		if (!canAdd()) return;
		const idx =
			afterIndex === undefined
				? values.length
				: Math.min(Math.max(0, afterIndex + 1), values.length);

		values = [...values.slice(0, idx), new XsdDate(), ...values.slice(idx)];
		alignPickers(values.length);
	}

	function removePicker(index: number) {
		if (!canRemove()) return;
		if (index < 0 || index >= values.length) return;

		values = [...values.slice(0, index), ...values.slice(index + 1)];
		alignPickers(values.length);
	}


	/**
	 * Returns an array of XsdDate|null, one entry per picker (in order).
	 * - If a picker is "unused" (checkbox off), its get_value() returns null.
	 */
	export const get_value = (): XsdDate[] => {
		// Ensure we have refs aligned; then pull values from children
		return values.map((_, i) => pickers[i]?.get_value() || new XsdDate('0000-01-01'));
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
		{#if values.length === 0}
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
			{#each values as v, i (i)}

				<div class="grid grid-cols-[1fr_auto] gap-2 items-start">
					<!-- The actual picker -->
					<div class={userClass}>
						<NativeDatePicker
							bind:this={pickers[i]}
							showCheckbox={false}
							name={`${name}[${i}]`}
							id={id ? `${id}-${i}` : undefined}
							bind:value={values[i]}
							required={true}
							bind:disabled={disabled}
							class={userClass}
						/>
					</div>

					<!-- +/- controls -->
					<div class="flex gap-1 pt-6">
						{#if i === values.length - 1}
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