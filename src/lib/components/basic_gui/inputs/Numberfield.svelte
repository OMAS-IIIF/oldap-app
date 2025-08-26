<!--
  - Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
  -->
<!--
  @component

  This components implements a generic text entry field with a lot of options:
  - includes a label
  - includes an optional placeholder
  - a validation function can be added
  - a RegExp pattern for validation can be added
-->
<script lang="ts">
	import { error } from '@sveltejs/kit';
	import { onMount, type Snippet } from 'svelte';

	type ValidateFunction = (value?: string) => [boolean, string];

	let {
		/** @param {string} label The label to be used for the text field */
		label,

		/** @param {string} name The HTML input element name */
		name,

		/** @param {string} [id] Optional `id` for the HTML input element */
		id,

		/** @param {string} [placeholder] Optional placeholder text, defaults to an empty string */
		placeholder = '',

		/** @param {string} [value] Optional bindable parameter which reflects the actual value */
		value = $bindable(),

		/** @param {number} [max] Optional maximum value for the number field. Defaults to undefined */
		max = undefined,

		/** @param {number} [min] Optional minimum value for the number field. Defaults to undefined */
		min = undefined,

		/** @param {number} [step] Optional step value for the number field. Defaults to undefined */
		step = undefined,

		/** @param {ValidateFunction} [validate] Optional validation function of the form `(value?: string) => [boolean, string]`. Defauklts to undefined */
		validate = undefined,

		/** @param {boolean} [readonly] Optional flag to indicate a readonly flag. Defaults to false */
		readonly = false,

		/** @param {boolean} [disabled] Optional bindable flag to indicate if the field is disabled */
		disabled = $bindable(false),

		/** @param {boolean} [required] Optional flag to indicate of the field is mandatory. Defaults to false */
		required = undefined,

		additional_snippet = undefined,

		/** @param {string} [class] Optional string that is passed to the class attribute of HTML input element. Defaults to an empty string */
		class: userClass = ""
	}: {
		label: string,
		name: string,
		id?: string,
		placeholder: string,
		value?: string,
		max?: number,
		min?: number,
		step?: number,
		validate?: ValidateFunction,
		readonly?: boolean,
		disabled?: boolean,
		required?: boolean,
		additional_snippet?: Snippet,
		class?: string
	} = $props();


	let thisele: HTMLInputElement | undefined= $state();
	let invalid = $state(false);
	let errortext = $state('');
	let modified = $state(false);
	let orig_value: string = value || '';


	/**
	 * Callback when the field loses the focus. Performs validation (required field, regex pattern and,
	 * if given, user supplied validation function)
	 */
	const loose_focus = () => {
		errortext = '';
		invalid = false;
		if (required && !thisele?.value) {
			invalid = true;
			errortext += "Mandatory field!"
			return;
		}

		if (validate) {
			let [isvalid, errtxt] = validate(thisele?.value);
			invalid = !isvalid;
			if (invalid) {
				errortext += errtxt;
			}
		}
	}

	/**
	 * Callback when value is changed
	 * @param value The new value (optional)
	 */
	const value_changed = (value?: string) => {
		modified = orig_value !== value;
	}

	/**
	 * Callback when key is pressed while the reset icon has the focus
	 * @param event
	 */
	const handle_reset_key = (event: KeyboardEvent) => {
		if (event.key === 'Enter' || event.key === ' ') {
			reset_value();
		}
	};

	/**
	 * Reset the textfield value to it's original value
	 */
	const reset_value = () => {
		value = orig_value;
		modified = false;
	}

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

		<!-- Input Container mit relativer Positionierung für Icons -->
		<div class="relative">
			<input bind:this={thisele} type="number" {max} {min} {step} name={name} id={id} onblur={loose_focus} oninput={() => value_changed(value)} {disabled} {required} {readonly}
						 class="w-full py-1.0 oldap-textfield-common {disabled ? 'oldap-textfield-disabled' : (invalid ? 'oldap-textfield-invalid' : 'oldap-textfield-valid')} {userClass}"
						 placeholder={placeholder} bind:value={value} aria-invalid="true" aria-describedby="{id}-error">

			<!-- Error/Reset Icons -->
			{#if invalid}
				<svg class="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none size-5 text-red-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
					<path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
				</svg>
			{:else if modified}
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
						 role="button" tabindex="0" onkeydown={handle_reset_key} class="absolute right-3 top-1/2 transform -translate-y-1/2 size-3 cursor-pointer" onclick={reset_value}>
					<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
				</svg>
			{/if}
		</div>
	</div>

	<!-- Error message -->
	{#if invalid}
		<span class="mt-0 text-[8px]/2 text-red-600" id="text-field-error">{errortext}</span>
	{/if}
</div>




