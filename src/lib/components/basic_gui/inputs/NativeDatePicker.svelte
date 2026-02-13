<!--
  - Copyright (©) 2026. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
  -->

<!-- NativeDatePicker.svelte
     Single-value date picker using the browser's native <input type="date">.
     Keeps the same “checkbox to activate” behavior as your DatePicker.svelte.
-->
<script lang="ts">

	import { XsdDate } from '$lib/oldap/datatypes/xsd_date';

	let {
		/** Label shown above the field */
		label,

		/** HTML input name */
		name,

		/** Optional id */
		id,

		/** Initial value */
		value = $bindable<XsdDate>(),

		/** Optional flag to indicate mandatory field */
		required = undefined,

		/** Show the optional 'used' checkbox when not required */
		showCheckbox = true,

		/** Optional bindable disabled flag */
		disabled = $bindable(false),

		/** Optional class string */
		class: userClass = ''
	}: {
		label?: string;
		name: string;
		id?: string;
		value?: XsdDate | null;
		required?: boolean;
		showCheckbox?: boolean;
		disabled?: boolean;
		class?: string;
	} = $props();

	let is_used = $state<boolean>(true);
	is_used = (() : boolean => required ? true : !showCheckbox)()

	// Native date input uses "YYYY-MM-DD" (or "" for empty).
	let dateStr = $state<string>('');

	function pad2(n: number) {
		return String(n).padStart(2, '0');
	}

	// Sync incoming `value` into the input string and is_used.
	$effect(() => {
		if (value === null || value === undefined) {
			dateStr = '';
			if (!required) is_used = false;
			return;
		} else {
			if (!showCheckbox) {
				is_used = true;
			}
			if (required) {
				is_used = true;
			}
		}


		dateStr = value.toString() || '';
		is_used = true;
	});

	$effect(() => {
		if (is_used) {
			value = new XsdDate(dateStr);
		}
		else {
			value = null;
		}
	});

	function set_today() {
		const now = new Date();
		const y = now.getFullYear();
		const m = now.getMonth() + 1;
		const d = now.getDate();
		dateStr = `${y}-${pad2(m)}-${pad2(d)}`;
		is_used = true;
	}

	/** Pull API to match your existing DatePicker.svelte */
	export const get_value = (): XsdDate | null => {
		if (!is_used) return null;
		return new XsdDate(dateStr);
	};
</script>

<div class="mt-3">
	{#if label !== undefined && label !== '' && label !== null}
		<label
			for={id}
			class="{required ? 'underline' : ''} block text-xs/4 font-medium text-input-label-fg dark:text-input-label-fg-dark"
		>
			{label}:
		</label>
	{/if}

	<div class="mt-2 flex items-center gap-2">
		{#if showCheckbox && !required}
			<input type="checkbox" bind:checked={is_used} />
		{/if}

		<input
			type="date"
			name={name}
			id={id}
			bind:value={dateStr}
			disabled={disabled || (showCheckbox && !required && !is_used)}
			class="rounded-md bg-white px-3 py-1 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 {userClass}"
			onchange={() => value = new XsdDate(dateStr)}
		/>

		<button
			type="button"
			class="px-2 py-1 rounded-md border text-sm disabled:opacity-40"
			onclick={set_today}
			disabled={disabled || (showCheckbox && !required && !is_used)}
			title="Set today"
		>
			Today
		</button>
	</div>
</div>