<script lang="ts">

	import { error } from '@sveltejs/kit';

	let {
		label, name, id, type = 'text', placeholder = '', value = '', validate = undefined,
		readonly = false, disabled = false, required = undefined, size = undefined, pattern = undefined,
	} = $props();

	const allowed_types = ['text', 'password', 'email', 'number', 'search', 'tel', 'url'];
	const invalid_class = "text-input-text-invalid outline-input-outline-invalid placeholder:text-input-placeholder-invalid focus:outline-oldap-focus";
	const valid_class = "text-input-text-valid outline-input-outline-valid placeholder:text-input-placeholder-valid focus:outline-oldap-focus"
	let thisele: HTMLInputElement | undefined= $state();
	let invalid = $state(false);
	let errortext = $state('');

	if (!allowed_types.includes(type)) {
		throw error(400, `Internal error: invalid type "${type}"cfor Input-field. must be "text", "password", "email", "number", "search", "tel" or "url"`);
	}

	const loose_focus = () => {
		errortext = '';
		invalid = false;
		if (required && !thisele?.value) {
			invalid = true;
			errortext += "Mandatory field!"
			return;
		}

		if (pattern) {
			invalid = !(pattern as RegExp).test(thisele?.value || '');
			if (invalid) {
				errortext += `Text "${thisele?.value}" does not match required pattern "${pattern.toString()}"!`
			}
		}
		if (validate) {
			let [isvalid, errtxt] = validate(thisele?.value);
			invalid = isvalid;
			errortext += errtxt;
		}
	}
</script>

<div class="mt-3">
	<label for={id} class="block text-xs/4 font-medium text-gray-900">{label}</label>
	<div class="mt-2 grid grid-cols-1">
		<input bind:this={thisele} type={type} name={name} id={id} onblur={loose_focus} {disabled} {required} {readonly}
					 class="col-start-1 row-start-1 block w-full rounded-md bg-white py-1.0 pr-10 pl-3 text-sm  outline-1 -outline-offset-1 {invalid ? invalid_class : valid_class} focus:outline-2 focus:-outline-offset-2  sm:pr-9 sm:text-sm/6"
					 placeholder={placeholder} value={value} aria-invalid="true" aria-describedby="email-error">
		{#if invalid}
			<svg class="pointer-events-none col-start-1 row-start-1 mr-3 size-5 self-center justify-self-end text-red-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
				<path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
			</svg>
		{/if}
	</div>
	{#if invalid}
		<span class="mt-0 text-[8px]/2 text-red-600" id="email-error">{errortext}</span>
	{/if}
</div>
