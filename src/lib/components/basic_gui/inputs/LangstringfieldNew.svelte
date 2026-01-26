<svelte:options runes={true} />

<script lang="ts">
	import { Language, getLanguageShortname, convertToLanguage } from '$lib/oldap/enums/language';
	import { LangString } from '$lib/oldap/datatypes/langstring';
	import { onMount, type Snippet } from 'svelte';

	type InputType = "input" | "textarea";

	let {
		/** @param {string} label */
		label,

		/** @param {string} name */
		name,

		/** @param {string} id */
		id,

		/** @param {LangString} value */
		value = $bindable<LangString>(),

		/** @param {Language[]} languages */
		languages,

		// UI / behavior
		selected = $bindable<Language>(Language.EN), // selected language
		placeholder = '',
		disabled = false,
		required = false,
		readonly = false,
		input_type = 'input' as InputType,
		rows = 3,
		additional_snippet = undefined,
		class: userClass = ''
	}: {
		label: string;
		name: string;
		id?: string;
		value: LangString;
		languages: Language[];
		selected?: Language;
		placeholder?: string;
		disabled?: boolean;
		required?: boolean;
		readonly?: boolean;
		input_type?: InputType;
		rows?: number;
		additional_snippet?: Snippet,
		class?: string;
	} = $props();

	let invalid = $state<boolean>(false);
	let buffer = $state('');
	let has_value = $state<Partial<Record<Language, boolean>>>({});

	// onMount(() => {
	// 	let tmp: Partial<Record<Language, boolean>> = {};
	// 	for (const lang of languages) {
	// 		console.log("::::>", lang, value.getraw(lang), (value.getraw(lang) || '').length > 0);
	// 		tmp[lang] = hasLangValue(lang);
	// 	}
	// 	has_value = tmp;
	// 	console.log("-----=======>", $state.snapshot(has_value));
	// });

	// whenever selected language changes, load exact (non-fallback) text
	$effect(() => {
		buffer = value?.getraw(selected) ?? '';
	});

	$effect(() => {
		for (const lang of languages) {
			has_value[lang] = hasLangValue(lang);
		}
	});

	// $effect(() => {
	// 	value.set(selected, buffer);
	// });


	function hasLangValue(lang: Language): boolean {
		return (value.getraw(lang) || '').length > 0;
	}

	function langKey(lang: Language): string {
		return getLanguageShortname(lang) || 'en';
	}

	function keyToLanguage(key: string): Language {
		// Prefer mapping via the provided `languages` list (what the UI actually shows)
		const found = languages?.find((l) => langKey(l) === key);
		if (found !== undefined) return found;

		// Fallback: try library helper (in case it supports short codes)
		try {
			const l = convertToLanguage(key);
			if (l !== undefined && l !== null) return l;
		} catch {
			// ignore
		}
		return Language.EN;
	}

	// Radio inputs operate on strings; keep a string mirror to avoid enum/object coercion issues
	let selectedKey = $state<string>(langKey(selected));

	// When parent changes `selected`, reflect it in the radio group
	// $effect(() => {
	// 	const k = langKey(selected);
	// 	if (selectedKey !== k) selectedKey = k;
	// });

	function language_selected(lang: string) {
		selected = keyToLanguage(lang);
		selectedKey = lang;
	}

	function onInput(e: Event) {
		value.set(selected, buffer);
		has_value[selected] = hasLangValue(selected);
		//console.log('INPUT CHANGED:', value.get(selected));
	}
	// When user clicks a pill, update the real `selected` (Language)
	// $effect(() => {
	// 	const lang = keyToLanguage(selectedKey);
	// 	console.log('NEW LANGUAGE SELECTED:', selected, 'key=', selectedKey);
	// 	if (lang !== selected) {
	// 		selected = lang;
	//
	// 	}
	// });

</script>

<div class="mt-3">
	<label for={id} class="{required ? 'underline' : ''} block text-xs/4 font-medium text-input-label-fg dark:text-input-label-fg-dark">{label}:</label>

	<!-- Grid mit Snippet und Input auf derselben Zeile -->
	<div class="{additional_snippet ? 'mt-2 grid grid-cols-[auto_1fr] gap-2 items-center' : 'mt-2'}">
		{#if additional_snippet}
			<div class="flex-shrink-0">
				{@render additional_snippet()}
			</div>
		{/if}
		<div class="relative">
			{#if input_type === 'input'}
				<input name={name} id={id} {disabled} {required} {readonly}
							 class="w-full py-1.0 oldap-textfield-common {disabled ? 'oldap-textfield-disabled' : (invalid ? 'oldap-textfield-invalid' : 'oldap-textfield-valid')} {userClass}"
							 placeholder={placeholder} aria-invalid={invalid} aria-describedby={id ? `${id}-error` : undefined}
							 bind:value={buffer}
							 oninput={onInput}
				>
			{:else}
				<textarea name={name} id={id} {rows} {disabled} {required} {readonly}
									class="w-full py-1.0 oldap-textfield-common {disabled ? 'oldap-textfield-disabled' : (invalid ? 'oldap-textfield-invalid' : 'oldap-textfield-valid')} {userClass}"
									placeholder={placeholder}
									aria-invalid={invalid}
									aria-describedby={id ? `${id}-error` : undefined}
									bind:value={buffer}
									oninput={onInput}
				></textarea>
			{/if}
		</div>
		<div class="mt-2">
			<div class="inline-flex flex-wrap gap-1" role="group" aria-label="Language">
				{#each languages as lang (lang)}
					{@const k = langKey(lang)}
					<button
						type="button"
						disabled={disabled}
						onclick={() => language_selected(k)}
						class="px-2 py-1 text-xs font-semibold rounded-md border select-none transition shadow-sm
							focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
						class:cursor-not-allowed={disabled}
						class:opacity-50={disabled}
						class:hover:brightness-95={!disabled}
						class:bg-emerald-50={has_value[lang] && selectedKey !== k}
						class:text-emerald-800={has_value[lang] && selectedKey !== k}
						class:border-emerald-300={has_value[lang] && selectedKey !== k}
						class:bg-rose-50={!has_value[lang] && selectedKey !== k}
						class:text-rose-800={!has_value[lang] && selectedKey !== k}
						class:border-rose-300={!has_value[lang] && selectedKey !== k}
						class:bg-emerald-600={has_value[lang] && selectedKey === k}
						class:bg-rose-600={!has_value[lang] && selectedKey === k}
						class:text-white={selectedKey === k}
						class:border-emerald-700={has_value[lang] && selectedKey === k}
						class:border-rose-700={!has_value[lang] && selectedKey === k}
						aria-pressed={selectedKey === k}
						title={k}
					>
						{k}
					</button>
				{/each}
			</div>
		</div>

	</div>
</div>

