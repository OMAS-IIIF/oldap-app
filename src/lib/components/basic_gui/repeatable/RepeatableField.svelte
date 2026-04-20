<svelte:options runes={true} />

<!--
  @component

  Generic wrapper for repeatable form fields.

  The component itself only manages:
  - the internal list of editable rows
  - add / remove / update logic
  - respecting `minCount` / `maxCount`
  - rendering action buttons next to each row

  The actual editor UI is fully supplied by the parent via a snippet.

  Example usage:

  <RepeatableField bind:values={values} minCount={1} maxCount={3} createEmpty={() => ''}>
  	{#snippet children(value, index, update)}
  		<input
  			class="py-1.0 oldap-textfield-common oldap-textfield-valid w-full"
  			value={value}
  			oninput={(e) => update(index, e.currentTarget.value)}
  		/>
  	{/snippet}
  </RepeatableField>
-->
<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	type UpdateFunction<T> = (index: number, value: T) => void;
	type Row<T> = {
		id: number;
		value: T;
	};

	let {
		/** @param {string} label The label to be used for the text field */
		label,

		/** @param {T[]} [values] The bindable array of values to be rendered */
		values = $bindable<T[]>([]),

		/** @param {number} [minCount] Minimum number of rows. `undefined` means no lower limit */
		minCount = undefined,

		/** @param {number} [maxCount] Maximum number of rows. `undefined` means no upper limit */
		maxCount = undefined,

		/** @param {() => T} createEmpty Factory used when a new empty row is added */
		createEmpty,

		/**
		 * Child snippet that renders the actual editor for one row.
		 *
		 * Parameters:
		 * 1. current row value
		 * 2. current row index
		 * 3. `update(index, value)` helper for immutable row updates
		 */
		children,

		/** @param {string} [class] Optional CSS classes for the outer wrapper */
		class: userClass = ''
	}: {
		label: string;
		values?: T[];
		minCount?: number;
		maxCount?: number;
		createEmpty: () => T;
		children: Snippet<[T, number, UpdateFunction<T>]>;
		class?: string;
	} = $props();


	const normalized_min_count = $derived(Math.max(0, minCount ?? 0));
	const required = $derived(Math.max(0, minCount ?? 0) > 0);
	let next_row_id = 0;

	const create_row = (value: T): Row<T> => ({
		id: next_row_id++,
		value
	});

	let rows = $state<Row<T>[]>([]);
	const can_add = $derived(maxCount === undefined || rows.length < maxCount);
	const can_delete = $derived(minCount === undefined || rows.length > normalized_min_count);
	let external_values_snapshot = $state<T[]>([]);

	const arrays_equal = (left: T[], right: T[]): boolean => {
		if (left.length !== right.length) {
			return false;
		}

		for (let index = 0; index < left.length; index += 1) {
			if (!Object.is(left[index], right[index])) {
				return false;
			}
		}

		return true;
	};

	/**
	 * Ensures that the visible editor rows satisfy `minCount`.
	 */
	const ensure_minimum_rows = (current_rows: Row<T>[]): Row<T>[] => {
		if (current_rows.length >= normalized_min_count) {
			return current_rows;
		}

		return [
			...current_rows,
			...Array.from({ length: normalized_min_count - current_rows.length }, () =>
				create_row(createEmpty())
			)
		];
	};

	const publish_rows = (next_rows: Row<T>[]) => {
		rows = next_rows;
		const next_values = next_rows.map((row) => row.value);
		external_values_snapshot = [...next_values];
		values = next_values;
	};

	$effect(() => {

		if (arrays_equal(values, external_values_snapshot)) {
			return;
		}

		external_values_snapshot = [...values];
		const normalized_rows = ensure_minimum_rows(values.map((value) => create_row(value)));
		rows = normalized_rows;

		const normalized_values = normalized_rows.map((row) => row.value);
		if (!arrays_equal(values, normalized_values)) {
			external_values_snapshot = [...normalized_values];
			values = normalized_values;
		}
	});

	/**
	 * Adds one new row at the end if the configured upper limit allows it.
	 */
	const addItem = () => {
		if (!can_add) {
			return;
		}

		publish_rows([...rows, create_row(createEmpty())]);
	};

	/**
	 * Removes the row at the given index if the configured lower limit allows it.
	 * @param index Row index to remove
	 */
	const removeItem = (index: number) => {
		if (!can_delete) {
			return;
		}

		publish_rows(rows.filter((_, current_index) => current_index !== index));
	};

	/**
	 * Replaces the value of a single row using an immutable array update.
	 * @param index Row index to update
	 * @param value New row value
	 */
	const updateItem: UpdateFunction<T> = (index, value) => {
		publish_rows(
			rows.map((row, current_index) =>
				current_index === index
					? {
							...row,
							value
						}
					: row
			)
		);
	};
</script>

<div class="mt-3">
	<label
		class="{required
			? 'underline'
			: ''} text-input-label-fg dark:text-input-label-fg-dark block text-xs/4 font-medium"
		>{label}:</label
	>

	<div class="space-y-2 {userClass}">
		{#if rows.length === 0}
			{#if can_add}
				<div class="flex justify-end">
					<button type="button" class="oldap-button-round" onclick={addItem} aria-label="Add item">
						+
					</button>
				</div>
			{/if}
		{:else}
			{#each rows as row, index (row.id)}
				<div class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
					<div class="min-w-0">
						{@render children(row.value, index, updateItem)}
					</div>

					<div class="flex items-center gap-2 pt-1">
						{#if can_delete}
							<button
								type="button"
								class="oldap-button-round"
								onclick={() => removeItem(index)}
								aria-label={`Remove item ${index + 1}`}
							>
								-
							</button>
						{/if}

						{#if index === rows.length - 1 && can_add}
							<button
								type="button"
								class="oldap-button-round"
								onclick={addItem}
								aria-label="Add item"
							>
								+
							</button>
						{/if}
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>
