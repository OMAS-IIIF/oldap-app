<!--
  - Copyright (©) 2026. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
  -->

<!--
  @component

  TextFieldData: Multi-value text input field with cardinality constraints (minCount/maxCount).
  Based on Textfield.svelte, but manages an array of strings and shows (+)/(-) controls.
-->
<script lang="ts">
	import { error } from '@sveltejs/kit';
	import { onMount, type Snippet } from 'svelte';

	type ValidateFunction = (value?: string) => [boolean, string];

	let {
		/** Label shown above the group */
		label,

		/** Base name for input elements; rendered as name[index] */
		name,

		/** Optional base id; rendered as `${id}-${index}` */
		id,

		/** Input type */
		type = 'text',

		/** Optional placeholder */
		placeholder = '',

		/** Bindable array value */
		values,

		/** Optional validation function per field */
		validate = undefined,

		/** Optional readonly */
		readonly = false,

		/** Optional bindable disabled */
		disabled = $bindable(false),

		/** Optional required flag (applies to each field) */
		required = undefined,

		/** Optional pattern validated on blur */
		pattern = undefined,

		/** Optional snippet shown left of the first row */
		additional_snippet = undefined,

		/** Cardinality */
		minCount = 1,
		maxCount = Infinity,

		/** Optional CSS class for input element */
		class: userClass = ""
	}: {
		label: string;
		name: string;
		id?: string;
		type?: string;
		placeholder?: string;
		values?: string[];
		validate?: ValidateFunction;
		readonly?: boolean;
		disabled?: boolean;
		required?: boolean;
		pattern?: RegExp;
		additional_snippet?: Snippet;
		minCount?: number;
		maxCount?: number;
		class?: string;
	} = $props();

	let internal_values = $state<string[]>([]);

	const allowed_types = ['text', 'password', 'email', 'number', 'search', 'tel', 'url'];
	if (!allowed_types.includes(type)) {
		throw error(400, `Internal error: invalid type "${type}" for Input-field. must be "text", "password", "email", "number", "search", "tel" or "url"`);
	}

	// Normalize min/max
	(() => {
		if (minCount === undefined) {
			minCount = 0;
		} else {
			minCount = Math.max(0, Math.floor(minCount));
		}
		if (maxCount === undefined) {
			maxCount = Infinity;
		} else {
			maxCount = (maxCount === Infinity) ? Infinity : Math.max(minCount, Math.floor(maxCount));
		}
	})();

	// Per-field state
	let invalid = $state<boolean[]>([]);
	let errortext = $state<string[]>([]);

	onMount(() => {
		ensureCardinality();
	})

	function ensureCardinality() {
		const current = Array.isArray(values) ? values : [];
		let next = [...current];

		// Ensure at least minCount items
		while (next.length < minCount) next.push('');

		// Ensure not above maxCount
		if (maxCount !== Infinity && next.length > maxCount) next = next.slice(0, maxCount);

		// Apply if changed
/*
		if (next.length !== current.length || next.some((v, i) => v !== current[i])) {
			values = next;
		}
*/
		internal_values = next;

		// Keep error arrays aligned
		while (invalid.length < next.length) invalid.push(false);
		while (errortext.length < next.length) errortext.push('');
		if (invalid.length > next.length) invalid = invalid.slice(0, next.length);
		if (errortext.length > next.length) errortext = errortext.slice(0, next.length);
	}

	// Initial + whenever props change (e.g. parent sets minCount/maxCount/value)
	// $effect(() => {
	// 	ensureCardinality();
	// });

	function canAdd() {
		return maxCount === Infinity ? true : internal_values.length < maxCount;
	}

	function canRemove() {
		return internal_values.length > minCount;
	}

	function addField(atIndex?: number) {
		if (!canAdd()) return;
		const idx = (atIndex === undefined) ? internal_values.length : Math.min(Math.max(0, atIndex + 1), internal_values.length);
		values = [...internal_values.slice(0, idx), '', ...internal_values.slice(idx)];
		invalid = [...invalid.slice(0, idx), false, ...invalid.slice(idx)];
		errortext = [...errortext.slice(0, idx), '', ...errortext.slice(idx)];
	}

	function removeField(index: number) {
		if (!canRemove()) return;
		if (index < 0 || index >= internal_values.length) return;

		values = [...internal_values.slice(0, index), ...internal_values.slice(index + 1)];
		invalid = [...invalid.slice(0, index), ...invalid.slice(index + 1)];
		errortext = [...errortext.slice(0, index), ...errortext.slice(index + 1)];
	}

	function setValueAt(index: number, newVal: string) {
		internal_values = internal_values.map((v, i) => (i === index ? newVal : v));
	}

	function loose_focus(index: number) {
		let e = '';
		let inv = false;
		const v = internal_values[index] ?? '';

		if (required && !v) {
			inv = true;
			e += 'Mandatory field!';
		}

		if (!inv && pattern && v) {
			inv = !(pattern as RegExp).test(v);
			if (inv) {
				if (type === 'password') {
					e += 'Password must have at least 8 characters, whereof at least one lowercase, one uppercase letter, one digit and one special character.';
				} else {
					e += `Text "${v}" does not match required pattern "${pattern.toString()}"!`;
				}
			}
		}

		if (!inv && validate) {
			const [isvalid, errtxt] = validate(v);
			inv = !isvalid;
			if (inv) e += errtxt;
		}

		invalid[index] = inv;
		errortext[index] = e;
		// force reactive update for arrays
		invalid = [...invalid];
		errortext = [...errortext];
	}

	export const get_value = (): (string | null)[] => internal_values || [];

</script>

<div class="mt-3">
	<label for={id} class="{required ? 'underline' : ''} block text-xs/4 font-medium text-input-label-fg dark:text-input-label-fg-dark">
		{label}:
	</label>

	<div class="mt-2">
		<!-- Optional leading snippet aligned to first row -->
		<div class="{additional_snippet ? 'grid grid-cols-[auto_1fr] gap-2 items-start' : ''}">
			{#if additional_snippet}
				<div class="flex-shrink-0 pt-1">
					{@render additional_snippet()}
				</div>
			{/if}

			<div class="space-y-2">
				{#each internal_values as v, i (i)}
					<div class="grid grid-cols-[1fr_auto] gap-2 items-center">
						<div class="relative">
							<input
								type={type}
								name={`${name}[${i}]`}
								id={id ? `${id}-${i}` : undefined}
								placeholder={placeholder}
								bind:value={internal_values[i]}
								oninput={(e) => setValueAt(i, (e.currentTarget as HTMLInputElement).value)}
								onblur={() => loose_focus(i)}
								{disabled}
								{required}
								{readonly}
								class="w-full py-1.0 oldap-textfield-common {disabled ? 'oldap-textfield-disabled' : (invalid[i] ? 'oldap-textfield-invalid' : 'oldap-textfield-valid')} {userClass}"
								aria-invalid={invalid[i] ? 'true' : 'false'}
								aria-describedby={id ? `${id}-${i}-error` : undefined}
							/>

							{#if invalid[i]}
								<svg class="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none size-5 text-red-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
									<path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
								</svg>
							{/if}
						</div>

						<div class="flex gap-1">
							<button
								type="button"
								class="px-2 py-1 rounded-md border text-sm disabled:opacity-40"
								onclick={() => addField(i)}
								disabled={disabled || !canAdd()}
								aria-label="Add value"
								title="Add"
							>+</button>

							<button
								type="button"
								class="px-2 py-1 rounded-md border text-sm disabled:opacity-40"
								onclick={() => removeField(i)}
								disabled={disabled || !canRemove()}
								aria-label="Remove value"
								title="Remove"
							>-</button>
						</div>
					</div>

					{#if invalid[i]}
						<span class="mt-0 text-[8px]/2 text-red-600" id={id ? `${id}-${i}-error` : undefined}>{errortext[i]}</span>
					{/if}
				{/each}
			</div>
		</div>
	</div>
</div>