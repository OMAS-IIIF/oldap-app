<!--
  - Copyright (©) 2026. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
  -->

<svelte:options runes={true} />

<script lang="ts">
	import { Language } from '$lib/oldap/enums/language';
	import { LangString } from '$lib/oldap/datatypes/langstring';

	type InputMode = 'input' | 'textarea';

	let {
		label,
		name,
		id,
		value = $bindable<LangString[]>([]),
		languages = [Language.DE, Language.FR, Language.IT, Language.EN],
		mode = 'input' as InputMode,
		rows = 3,
		minCount = 0,
		maxCount = Infinity,
		placeholder = '',
		disabled = false,
		class: userClass = ''
	}: {
		label: string;
		name: string;
		id?: string;
		value?: LangString[];
		languages?: Language[];
		mode?: InputMode;
		rows?: number;
		minCount?: number;
		maxCount?: number;
		placeholder?: string;
		disabled?: boolean;
		class?: string;
	} = $props();

	let selectedLang = $state<Language[]>([]);

	const defaultLang = $derived<Language>(languages[0] ?? Language.EN);
	const rowCount = $derived(Math.max(value?.length ?? 0, minCount));
	const rowIndexes = $derived([...Array(rowCount).keys()]);

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

	function getSelected(i: number): Language {
		const lang = selectedLang[i];
		return lang && languages.includes(lang) ? lang : defaultLang;
	}

	function getRow(i: number): LangString | undefined {
		return value?.[i];
	}

	function getText(i: number, lang: Language): string {
		return getRow(i)?.getraw(lang) ?? '';
	}

	function isEmptyLangString(ls: LangString | undefined): boolean {
		if (!ls) return true;
		for (const [, text] of ls.entries()) {
			if (text.trim().length > 0) return false;
		}
		return true;
	}

	function trimTrailingEmptyRows(arr: LangString[]): LangString[] {
		let end = arr.length;
		while (end > minCount && isEmptyLangString(arr[end - 1])) end--;
		return end === arr.length ? arr : arr.slice(0, end);
	}

	function hasText(ls: LangString | undefined, lang: Language): boolean {
		return (ls?.getraw(lang) ?? '').trim().length > 0;
	}

	function setSelected(i: number, lang: Language) {
		const next = selectedLang.slice();
		next[i] = lang;
		selectedLang = next;
	}

	function updateText(i: number, lang: Language, text: string) {
		const next = (value ?? []).slice();
		while (next.length <= i) next.push(new LangString());

		const current = next[i] ?? new LangString();
		const updated = current.clone();

		if (text.trim().length === 0) {
			updated.set(lang, '');
			updated.removeEmpty();
		} else {
			updated.set(lang, text);
		}

		next[i] = updated;
		value = trimTrailingEmptyRows(next);
	}

	function addRow(afterIndex: number) {
		const base = value ?? [];
		if (base.length >= maxCount) return;

		const next = base.slice();
		const insertAt = Math.min(afterIndex + 1, next.length);
		next.splice(insertAt, 0, new LangString());
		value = next;
	}

	function removeRow(i: number) {
		const base = value ?? [];
		if (base.length <= minCount) return;
		if (i < 0 || i >= base.length) return;

		const next = base.slice();
		next.splice(i, 1);
		value = trimTrailingEmptyRows(next);
	}

	export const get_value = (): (LangString | null)[] => {
		return (value ?? []).map((ls) => (isEmptyLangString(ls) ? null : ls));
	};
</script>

<div class="mt-3">
	<label
		for={id}
		class="{minCount > 0 ? 'underline' : ''} block text-xs/4 font-medium text-input-label-fg dark:text-input-label-fg-dark"
	>
		{label}:
	</label>

	{#each rowIndexes as i (i)}
		{@const ls = getRow(i)}
		<div class="space-y-2">
			<div class="flex items-start gap-2">
				<div class="flex-1">
					{#if mode === 'textarea'}
						<textarea
							class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60 {userClass}"
							{rows}
							{placeholder}
							{disabled}
							value={getText(i, getSelected(i))}
							oninput={(e) =>
								updateText(i, getSelected(i), (e.currentTarget as HTMLTextAreaElement).value)}
						></textarea>
					{:else}
						<input
							class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60 {userClass}"
							type="text"
							{placeholder}
							{disabled}
							value={getText(i, getSelected(i))}
							oninput={(e) =>
								updateText(i, getSelected(i), (e.currentTarget as HTMLInputElement).value)}
						/>
					{/if}
				</div>

				<div class="flex flex-col gap-2 pt-0.5">
					<button
						type="button"
						class="h-9 w-10 rounded-md border border-gray-300 bg-white text-sm shadow-sm hover:bg-gray-50 disabled:opacity-40"
						title="Remove"
						disabled={disabled || (value?.length ?? 0) <= minCount}
						onclick={() => removeRow(i)}
					>
						-
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

			<div class="flex flex-wrap gap-2">
				{#each languages as lang (lang)}
					{@const ok = hasText(ls, lang)}
					{@const active = getSelected(i) === lang}

					<button
						type="button"
						{disabled}
						onclick={() => setSelected(i, lang)}
						class={[
							'px-2.5 py-1 rounded-md border text-xs font-medium shadow-sm transition',
							active ? 'ring-2 ring-blue-200' : '',
							ok
								? 'bg-green-100 border-green-300 text-green-900 hover:bg-green-200'
								: 'bg-red-100 border-red-300 text-red-900 hover:bg-red-200',
							disabled ? 'opacity-60' : ''
						].join(' ')}
						title={ok ? 'Value set' : 'Empty'}
					>
						{lang}
					</button>
				{/each}
			</div>
		</div>
	{/each}
</div>
