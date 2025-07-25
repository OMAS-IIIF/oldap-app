
<!--
  @component

  Diese Komponente ermöglicht das Hinzufügen und Entfernen von erlaubten Werten
  für SHACL inSet-Beschränkungen. Unterstützt sowohl Strings als auch Zahlen
  mit einer kompakten, benutzerfreundlichen Oberfläche.
-->
<script lang="ts">
	import { PlusCircle, X } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	type ValueType = 'string' | 'number';

	let {
		/** @param {Set<string | number>} values Bindbare Sammlung der erlaubten Werte */
		values = $bindable(new Set<string | number>()),

		/** @param {ValueType} valueType Typ der Werte ('string' oder 'number') */
		valueType = 'string',

		/** @param {string} label Label für das Eingabefeld */
		label = 'Erlaubte Werte',

		/** @param {string} placeholder Platzhalter-Text */
		placeholder = 'Neuen Wert eingeben...',

		/** @param {boolean} disabled Deaktiviert die Komponente */
		disabled = false,

		/** @param {string} id Eindeutige ID für das Element */
		id = 'allowed-values',

		/** @param {string} name Name für das HTML-Element */
		name = 'allowedValues'
	}: {
		values?: Set<string | number>,
		valueType?: ValueType,
		label?: string,
		placeholder?: string,
		disabled?: boolean,
		id?: string,
		name?: string
	} = $props();

	let currentInput = $state<string|number>('');
	let inputElement: HTMLInputElement | undefined = $state();
	let errorMessage = $state('');

	// Konvertiere Set zu Array für bessere Iteration
	let valuesArray = $derived(Array.from(values));

	/**
	 * Fügt einen neuen Wert zur Sammlung hinzu
	 */
	const addValue = () => {
		if (!currentInput) {
			if (valueType === 'number') {
				errorMessage = m.enter_valid_num();
				return;
			}
			else {
				errorMessage = m.enter_valid_text();
				return;
			}
		}
		if (!currentInput) return;
		const trimmedInput = typeof currentInput === 'string' ? currentInput.trim() : currentInput;
		if (!trimmedInput) return;

		let processedValue: string | number;

		if (valueType === 'number') {
			const numValue = parseFloat(trimmedInput as string);
			if (isNaN(numValue)) {
				errorMessage = m.enter_valid_num();
				return;
			}
			processedValue = numValue;
		} else {
			processedValue = trimmedInput;
		}

		if (values.has(processedValue)) {
			errorMessage = m.val_exists();
			return;
		}

		values = new Set([...values, processedValue]);
		currentInput = '';
		errorMessage = '';
		inputElement?.focus();
	};

	/**
	 * Entfernt einen Wert aus der Sammlung
	 */
	const removeValue = (valueToRemove: string | number) => {
		values = new Set([...values].filter(v => v !== valueToRemove));
	};

	/**
	 * Behandelt Tastatureingaben
	 */
	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			addValue();
		}
	};

	/**
	 * Behandelt Tastatureingaben für Lösch-Buttons
	 */
	const handleRemoveKeydown = (event: KeyboardEvent, value: string | number) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			removeValue(value);
		}
	};

	// Lösche Fehlermeldung bei Input-Änderung
	$effect(() => {
		if (currentInput) {
			errorMessage = '';
		}
	});
</script>

<div class="mt-3">
	<label for={id} class="block text-xs/4 font-medium text-input-label-fg dark:text-input-label-fg-dark">
		{label}:
	</label>

	<!-- Input-Bereich -->
	<div class="mt-2 flex gap-2">
		<input
			bind:this={inputElement}
			bind:value={currentInput}
			type={valueType === 'number' ? 'number' : 'text'}
			{id}
			{name}
			{placeholder}
			{disabled}
			onkeydown={handleKeydown}
			class="flex-1 py-1.0 oldap-textfield-common {disabled ? 'oldap-textfield-disabled' : 'oldap-textfield-valid'}"
		/>
		<button
			type="button"
			onclick={addValue}
			{disabled}
			class="inline-flex items-center rounded-md bg-oldap-button dark:bg-oldap-button-dark px-3 py-1.5 text-sm font-semibold text-oldap-fg dark:text-oldap-fg-dark shadow-sm hover:bg-oldap-button-hover dark:bg-oldap-button-hover-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oldap-button-outline dark:outline-oldap-button-outline-dark disabled:opacity-50 disabled:cursor-not-allowed"
			title="Wert hinzufügen"
		>
			<PlusCircle class="h-4 w-4" />
		</button>
	</div>

	<!-- Fehlermeldung -->
	{#if errorMessage}
		<span class="mt-1 text-[8px]/2 text-input-text-invalid">{errorMessage}</span>
	{/if}

	<!-- Werte-Tags -->
	{#if valuesArray.length > 0}
		<div class="mt-3">
			<div class="flex flex-wrap gap-2">
				{#each valuesArray as value (value)}
					<span class="inline-flex items-center gap-x-1.5 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-900 dark:bg-gray-700 dark:text-gray-100">
						<span class="font-mono">{value}</span>
						{#if !disabled}
							<button
								type="button"
								onclick={() => removeValue(value)}
								onkeydown={(e) => handleRemoveKeydown(e, value)}
								class="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-gray-200 dark:hover:bg-gray-600"
								title="Wert entfernen"
							>
								<X class="h-3 w-3 stroke-gray-600/50 group-hover:stroke-gray-600/75 dark:stroke-gray-400/50 dark:group-hover:stroke-gray-400/75" />
								<span class="sr-only">Wert {value} entfernen</span>
							</button>
						{/if}
					</span>
				{/each}
			</div>
			<div class="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
				{valuesArray.length} Wert{valuesArray.length !== 1 ? 'e' : ''} definiert
			</div>
		</div>
	{/if}
</div>