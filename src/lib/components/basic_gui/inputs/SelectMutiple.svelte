<!--
  Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)

  @component

  This component allows the user to select multiple values from a predefined set. It takes the following properties:
  - selectables: A Set of objects representing the available values. Each object should have a 'key' property and an optional 'label' property.
  - values: A Set of objects representing the selected values. Each object should have a 'key' property and an optional 'label' property.
  - label: A string representing the label for the input field.
  - disabled: A boolean indicating whether the input field is disabled.
  - id: An optional string representing the unique identifier for the input field.
  - name: An optional string representing the name for the HTML input element.

-->
<script lang="ts">
	import { PlusCircle, X } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import DropdownButton from '$lib/components/basic_gui/dropdown/DropdownButton.svelte';
	import { difference } from '$lib/helpers/setops';
	import DropdownMenu from '$lib/components/basic_gui/dropdown/DropdownMenu.svelte';
	import DropdownLinkItem from '$lib/components/basic_gui/dropdown/DropdownLinkItem.svelte';


	let {
		/** @param {Set<{key: string, label?: string}>} Set of all "possible" values that can be selected.
		 * Each object should have a 'key' property and an optional 'label' property.
		 * If a value is already in the 'values' set, it will not be shown in the dropdown.*/
		selectables = new Set<{key: string, label?: string}>(),

		/** @param {Set<string>} values Bindbare Sammlung der ausgewälten Werte */
		values = $bindable(new Set<string>()),

		/** @param {string} label Label für das Eingabefeld */
		label = 'Erlaubte Werte',

		/** @param {boolean} disabled Deaktiviert die Komponente */
		disabled = false,

		/** @param {string} id Eindeutige ID für das Element */
		id = 'allowed-values',
	}: {
		selectables?: Set<{key: string, label?: string}>,
		values?: Set<string>,
		label?: string,
		disabled?: boolean,
		id?: string,
	} = $props();

	let inputElement: HTMLInputElement | undefined = $state();
	let errorMessage = $state('');

	let dpm_is_open = $state(false);

	// let buttonvalue = $state<{key: string, label?: string}>({key: 'X', label: 'X'});

	// Convert set to array for better iteration. This array contains all passed possible values
	let selectablesDict: Record<string, string> = $derived.by(() => {
		return Array.from(selectables).reduce((acc, { key, label }) => {
			acc[key] = label || key;
			return acc;
		}, {} as Record<string, string>);
	});

	// Array of keys that can be selected in the current state. This means that
	// values that have already been selected are no longer displayed.
	let selectableKeysArray = $derived.by(() => {
		return Array.from(selectables).map(selectable => selectable.key).filter(key => !values.has(key)) as string[];
	})

	let valuesArray = $derived(Array.from(values));
	let buttonvalue = $derived(selectableKeysArray[0]);


	/**
	 * Fügt einen neuen Wert zur Sammlung hinzu
	 */
	const addValue = () => {
		if (buttonvalue) {
			values = new Set([...values, buttonvalue]);
			console.log("2 values **>", $state.snapshot(values));
			buttonvalue = selectableKeysArray.length > 0 ? selectableKeysArray[0] : '-';
		}
		errorMessage = '';
		inputElement?.focus();
	};

	/**
	 * Entfernt einen Wert aus der Sammlung
	 */
	const removeValue = (valueToRemove: string) => {
		values = new Set([...values].filter(v => v !== valueToRemove));
	};

	/**
	 * Behandelt Tastatureingaben für Lösch-Buttons
	 */
	const handleRemoveKeydown = (event: KeyboardEvent, value: string) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			removeValue(value);
		}
	};

	// Lösche Fehlermeldung bei Input-Änderung
	$effect(() => {
		if (buttonvalue) {
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
		<DropdownButton
			bind:isOpen={dpm_is_open}
			buttonText={selectablesDict[buttonvalue]}
			name="resselsel"
			id="resselsel_id"
		>
			<DropdownMenu bind:isOpen={dpm_is_open} position="left" name="resselsel" id="resselsel_id">
				{#each selectableKeysArray as val (val)}
					<DropdownLinkItem bind:isOpen={dpm_is_open}
														onclick={() => {buttonvalue = val; dpm_is_open = false;}}
														selected={val === buttonvalue}>
						{selectablesDict[val]}
					</DropdownLinkItem>
				{/each}
			</DropdownMenu>
		</DropdownButton>
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
				{#each valuesArray as val (val)}
					<span class="inline-flex items-center gap-x-1.5 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-900 dark:bg-gray-700 dark:text-gray-100">
						<span class="font-mono">{selectablesDict[val] || val}</span>
						{#if !disabled}
							<button
								type="button"
								onclick={() => removeValue(val)}
								onkeydown={(e) => handleRemoveKeydown(e, val)}
								class="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-gray-200 dark:hover:bg-gray-600"
								title="Wert entfernen"
							>
								<X class="h-3 w-3 stroke-gray-600/50 group-hover:stroke-gray-600/75 dark:stroke-gray-400/50 dark:group-hover:stroke-gray-400/75" />
								<span class="sr-only">Wert {buttonvalue} entfernen</span>
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
