<script lang="ts">
	import { Language } from '$lib/oldap/enums/language';
	import { ChevronDown, X } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	// Props für die Komponente
	let {
		selectedLanguages = $bindable([]),
		label = 'Permitted languages',
		id = 'language-selector',
		name = 'allowedLanguages',
		disabled = false,
		placeholder = 'Select language for this field...',
		searchLabel = 'Search language...',
	} = $props();

	// Konvertiere das Language Enum in ein Array von Objekten
	const languageOptions = Object.entries(Language).map(([code, name]) => ({
		code,
		name,
		display: `${code} - ${name}`
	})).sort((a, b) => a.display.localeCompare(b.display));

	let isOpen = $state(false);
	let searchTerm = $state('');
	let dropdownRef: HTMLDivElement;

	// Gefilterte Optionen basierend auf Suchbegriff
	const filteredOptions = $derived(
		languageOptions.filter(option =>
			option.display.toLowerCase().includes(searchTerm.toLowerCase()) ||
			option.code.toLowerCase().includes(searchTerm.toLowerCase())
		)
	);

	// Ausgewählte Sprachen als Display-Strings
	const selectedDisplayItems = $derived(
		selectedLanguages.map(code => {
			const option = languageOptions.find(lang => lang.code === code);
			return option?.display || code;
		})
	);

	// Klick außerhalb schließt Dropdown
	function handleClickOutside(event: MouseEvent) {
		if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	// Event Listener für Click Outside
	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleClickOutside);
			return () => document.removeEventListener('click', handleClickOutside);
		}
	});

	function toggleLanguage(langCode: string) {
		if (selectedLanguages.includes(langCode)) {
			selectedLanguages = selectedLanguages.filter(code => code !== langCode);
		} else {
			selectedLanguages = [...selectedLanguages, langCode];
		}
	}

	function removeLanguage(langCode: string) {
		selectedLanguages = selectedLanguages.filter(code => code !== langCode);
	}

	function toggleDropdown() {
		if (!disabled) {
			isOpen = !isOpen;
			if (isOpen) {
				searchTerm = '';
			}
		}
	}

	function clearSearch() {
		searchTerm = '';
	}
</script>

<div class="relative mt-3" bind:this={dropdownRef}>
	<!-- Label -->
	<label for={id} class="block text-xs/4 font-medium text-input-label-fg dark:text-input-label-fg-dark mb-1">
		{label}
	</label>

	<!-- Selected Languages Display -->
	{#if selectedLanguages.length > 0}
		<div class="mb-2 flex flex-wrap gap-1">
			{#each selectedLanguages as langCode}
				{@const option = languageOptions.find(lang => lang.code === langCode)}
				<span class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-md">
					{option?.code || langCode}
					{#if !disabled}
						<button
							type="button"
							onclick={() => removeLanguage(langCode)}
							class="hover:text-indigo-600 dark:hover:text-indigo-300"
						>
							<X size="12" />
						</button>
					{/if}
				</span>
			{/each}
		</div>
	{/if}

	<!-- Dropdown Trigger -->
	<div class="relative">
		<button
			type="button"
			{id}
			{name}
			onclick={toggleDropdown}
			disabled={disabled}
			class="oldap-textfield-common oldap-textfield-valid h-8 w-full !flex !flex-row !items-center !gap-2 !justify-start cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
		>
			<ChevronDown
				size="16"
				class="flex-shrink-0 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}"
			/>
			<span class="flex-1 text-left truncate leading-none">
			{selectedLanguages.length > 0
				? `${selectedLanguages.length} ${selectedLanguages.length === 1 ? m.lang() : m.langs()} ${m.selected()}`
				: placeholder
			}
		</span>
		</button>

		<!-- Dropdown Menu -->
		{#if isOpen}
			<div class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-hidden">
				<!-- Search Input -->
				<div class="p-2 border-b border-gray-300 dark:border-gray-600">
					<div class="relative">
						<input
							type="text"
							placeholder={searchLabel}
							bind:value={searchTerm}
							class="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
						/>
						{#if searchTerm}
							<button
								type="button"
								onclick={clearSearch}
								class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
							>
								<X size="14" />
							</button>
						{/if}
					</div>
				</div>

				<!-- Options List -->
				<div class="max-h-48 overflow-y-auto">
					{#if filteredOptions.length === 0}
						<div class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
							{m.no_lang_found()}
						</div>
					{:else}
						{#each filteredOptions as option}
							<button
								type="button"
								onclick={() => toggleLanguage(option.code)}
								class="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none flex items-center justify-between"
							>
								<span class="truncate text-xs">
									<span class="font-medium text-sx">{option.code}</span>
									<span class="text-gray-600 dark:text-gray-400 ml-2 text-sx">{option.name}</span>
								</span>
								{#if selectedLanguages.includes(option.code)}
									<span class="text-indigo-600 dark:text-indigo-400 ml-2 text-sx">✓</span>
								{/if}
							</button>
						{/each}
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<!-- Selected Count Info -->
	{#if selectedLanguages.length > 0}
		<div class="mt-1 text-xs text-gray-600 dark:text-gray-400">
			{m.n_langs({n_langs: selectedLanguages.length, all_langs: languageOptions.length})}
		</div>
	{/if}
</div>