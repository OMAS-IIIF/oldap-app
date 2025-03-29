<script lang="ts">
	import { error } from '@sveltejs/kit';

	type ValidateFunction = (value?: string) => [boolean, string];

	let {
		label, name, id, type = 'text', placeholder = '', value = $bindable(), validate = undefined,
		readonly = false, disabled = $bindable(false), required = undefined,
		pattern = undefined, class: userClass = ""
	}: {label: string, name: string, id?: string, type: string, placeholder: string, value?: string,
		validate?: ValidateFunction, readonly?: boolean, disabled?: boolean, required?: boolean,
		pattern?: RegExp, class?: string} = $props();


	const allowed_types = ['text', 'password', 'email', 'number', 'search', 'tel', 'url'];
	let thisele: HTMLInputElement | undefined= $state();
	let invalid = $state(false);
	let errortext = $state('');
	let modified = $state(false);
	let orig_value = value;

	if (!allowed_types.includes(type)) {
		throw error(400, `Internal error: invalid type "${type}"cfor Input-field. must be "text", "password", "email", "number", "search", "tel" or "url"`);
	}

	/**
	 * Callback when the field looses the focus. Performs validation (required field, regex pattern and,
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

		if (pattern && thisele?.value) {
			invalid = !(pattern as RegExp).test(thisele?.value);
			if (invalid) {
				if (type === 'password') {
					errortext += 'Password must have at least 8 characters, whereof at least one lowercase, one uppercase letter, one digit and one special character.';
				}
				else {
					errortext += `Text "${thisele?.value}" does not match required pattern "${pattern.toString()}"!`
				}
			}
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
	<div class="mt-2 grid grid-cols-1">
		<input bind:this={thisele} type={type} name={name} id={id} onblur={loose_focus} oninput={() => value_changed(value)} {disabled} {required} {readonly}
					 class="py-1.0 oldap-textfield-common {disabled ? 'oldap-textfield-disabled' : (invalid ? 'oldap-textfield-invalid' : 'oldap-textfield-valid')} {userClass}"
					 placeholder={placeholder} bind:value={value} aria-invalid="true" aria-describedby={`${id}-error`}>
		{#if invalid}
			<svg class="pointer-events-none col-start-1 row-start-1 mr-3 size-5 self-center justify-self-end text-red-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
				<path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
			</svg>
			{:else if modified}
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
					 role="button" tabindex="0" onkeydown={handle_reset_key} class="size-3 col-start-1 row-start-1 mr-3 self-center justify-self-end" onclick={reset_value}>
				<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
			</svg>
		{/if}
	</div>
	{#if invalid}
		<span class="mt-0 text-[8px]/2 text-red-600" id="text-field-error">{errortext}</span>
	{/if}
</div>
