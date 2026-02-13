<!--
  - Copyright (©) 2026. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
  -->

<svelte:options runes={true} />

<script lang="ts">
	import { Language } from '$lib/oldap/enums/language';
	import type { LangString } from '$lib/oldap/datatypes/langstring';

	type InputMode = "input" | "textarea";

	let {
		/** Label shown above the whole group */
		label,

		/** Base name (used to build ids) */
		name,

		/** Optional base id; each picker will use `${id}-${i}` */
		id,

		// bindable value
		value = $bindable<LangString[]>([]),

		// UI config
		languages= [Language.DE, Language.FR, Language.IT, Language.EN],
		mode = "input" as InputMode,

		// cardinality
		minCount = 0,
		maxCount = Infinity,

		// optional UX
		placeholder = "",
		disabled = false,

		// styling hook
		class: userClass = ""
	} : {
		label: string;
		name: string;
		id?: string;
		value?: LangString[];
		languages?: Language[];
		mode?: InputMode;
		minCount?: number;
		maxCount?: number;
		placeholder?: string;
		disabled?: boolean;
		class?: string;
	} = $props();



	// per-row selected language
	let selectedLang = $state<string[]>([]);

	const defaultLang = $derived<string>(languages[0] ?? "en");

	// We render at least `minCount` rows, even if `value` has fewer entries.
	const rowCount = $derived(Math.max(value?.length ?? 0, minCount));
	const rowIndexes = $derived([...Array(rowCount).keys()]);

	function getSelected(i: number) {
		return selectedLang[i] && languages.includes(selectedLang[i]) ? selectedLang[i] : defaultLang;
	}

	function isEmptyLangString(ls: LangString | undefined) {
		if (!ls) return true;
		for (const k in ls) {
			if ((ls[k] ?? "").trim() !== "") return false;
		}
		return true;
	}

	function trimTrailingEmptyRows(arr: LangStringData) {
		// remove trailing empty rows but never go below minCount
		let end = arr.length;
		while (end > minCount && isEmptyLangString(arr[end - 1])) end--;
		return end === arr.length ? arr : arr.slice(0, end);
	}

	function hasText(ls: LangString, lang: string) {
		const t = (ls?.[lang] ?? "").trim();
		return t.length > 0;
	}

	function setSelected(i: number, lang: string) {
		const next = selectedLang.slice();
		next[i] = lang;
		selectedLang = next;
	}

	function updateText(i: number, lang: string, text: string) {
		const base = value ?? [];
		const next = base.slice();

		// ensure row exists
		while (next.length <= i) next.push({});

		const ls = { ...(next[i] ?? {}) };
		const trimmed = text.trim();

		if (trimmed === "") {
			delete ls[lang]; // treat empty as "not set"
		} else {
			ls[lang] = text;
		}

		next[i] = ls;
		value = trimTrailingEmptyRows(next);
	}

	function addRow(afterIndex: number) {
		const base = value ?? [];
		if (base.length >= maxCount) return;

		const next = base.slice();
		// if user clicks + on a virtual row (afterIndex >= next.length), just append
		const insertAt = Math.min(afterIndex + 1, next.length);
		next.splice(insertAt, 0, {});
		value = next;
	}

	function removeRow(i: number) {
		const base = value ?? [];
		if ((base.length) <= minCount) return;
		if (i < 0 || i >= base.length) return;

		const next = base.slice();
		next.splice(i, 1);
		value = trimTrailingEmptyRows(next);
	}
</script>

<div class="mt-3">
	<label
		for={id}
		class="{minCount > 0 ? 'underline' : ''} block text-xs/4 font-medium text-input-label-fg dark:text-input-label-fg-dark"
	>
		{label}:
	</label>

	{#each rowIndexes as i (i)}
		{@const ls = (value?.[i] ?? {})}
		<div class="space-y-2">
			<div class="flex items-start gap-2">
				<!-- input/textarea area -->
				<div class="flex-1">
					{#if mode === "textarea"}
						<textarea
							class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
							rows={rows}
							placeholder={placeholder}
							disabled={disabled}
							bind:value={ls[getSelected(i)]}
						></textarea>
					{:else}
						<input
							class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
							type="text"
							placeholder={placeholder}
							disabled={disabled}
							bind:value={ls[getSelected(i)]}
						/>
					{/if}
				</div>

				<!-- - / + buttons -->
				<div class="flex flex-col gap-2 pt-0.5">
					<button
						type="button"
						class="h-9 w-10 rounded-md border border-gray-300 bg-white text-sm shadow-sm hover:bg-gray-50 disabled:opacity-40"
						title="Remove"
						disabled={disabled || (value?.length ?? 0) <= minCount}
						onclick={() => removeRow(i)}
					>
						−
					</button>

					<button
						type="button"
						class="h-9 w-10 rounded-md border border-gray-300 bg-white text-sm shadow-sm hover:bg-gray-50 disabled:opacity-40"
						title="Add"
						disabled={disabled || (value?.length ?? 0) >= maxCount}
						onclick={() => addRow(i)}
					>
						+
					</button>
				</div>
			</div>

			<!-- language buttons under the field -->
			<div class="flex flex-wrap gap-2">
				{#each languages as lang (lang)}
					{@const ok = hasText(ls, lang)}
					{@const active = getSelected(i) === lang}

					<button
						type="button"
						disabled={disabled}
						onclick={() => setSelected(i, lang)}
						class={[
              "px-2.5 py-1 rounded-md border text-xs font-medium shadow-sm transition",
              active ? "ring-2 ring-blue-200" : "",
              ok ? "bg-green-100 border-green-300 text-green-900 hover:bg-green-200"
                 : "bg-red-100 border-red-300 text-red-900 hover:bg-red-200",
              disabled ? "opacity-60" : ""
            ].join(" ")}
						title={ok ? "Value set" : "Empty"}
					>
						{lang}
					</button>
				{/each}
			</div>
		</div>
	{/each}
</div>