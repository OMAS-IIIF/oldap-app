<script lang="ts">

	import { availableLanguageTags } from '$lib/paraglide/runtime';
	import type { LangString } from '$lib/oldap/datatypes/langstring';
	import { convertToLanguage, getLanguageShortname, Language } from '$lib/oldap/enums/language';
	import { onMount } from 'svelte';

	let {
		/** @param {string} label The label to be used for the text field */
		label,

		/** @param {string} name The HTML input element name */
		name,

		/** @param {string} [id] Optional `id` for the HTML input element */
		id,

		/** @param {string} [placeholder] Optional placeholder text, defaults to an empty string */
		placeholder = '',

		value = $bindable(null),

		/** @param {boolean} [required] Optional flag to indicate of the field is mandatory. Defaults to false */
		required = undefined,

		/** @param {boolean} [disabled] Optional bindable flag to indicate if the field is disabled */
		disabled = $bindable(false),

		/** @param {string} [class] Optional string that is passed to the class attribute of HTML input element. Defaults to an empty string */
		class: userClass = ""

	} : {
		label: string,
		name: string,
		id?: string,
		placeholder: string,
		value: LangString | null,
		required?: boolean,
		disabled?: boolean,
		class?: string
	} = $props();

	const languagesArray = Array.from(availableLanguageTags);

	let vals = $state<Record<string, string>>({});
	let orig_vals = <Record<string, string>>({});
	let modified = $state<Record<string, boolean>>({});
	let initialized = false;


		for (const lang of languagesArray) {
			orig_vals[lang] = '';
		}

		$effect(() => {
			if (value === null || Object.keys(vals).length > 0) return;
			for (const lang of languagesArray) {
				const lobj = convertToLanguage(lang);
				if (lobj) {
					vals[lang] = value?.getraw(lobj) || '';
					orig_vals[lang] = value?.getraw(lobj) || '';
				}
			}
			console.log("EFFECT-1", label, $state.snapshot(vals));
		});

	$effect(() => {
		if (!vals || Object.keys(vals).length === 0) return;
		for (const lang of languagesArray) {
			if (orig_vals[lang] === undefined) {
				//orig_vals[lang] = vals[lang];
				modified[lang] = false;
			}
		}
		console.log("EFFECT-2", label, orig_vals, $state.snapshot(vals));
	});

	const value_changed = (lang: string, val?: string) => {
		modified[lang] = orig_vals[lang] !== val;
		//const langobj = convertToLanguage(lang);
		//if (value !== null) value.set(langobj as Language, val || '');
	}

	const handle_reset_key = (event: KeyboardEvent, lang: string) => {
		if (event.key === 'Enter' || event.key === ' ') {
			reset_value(lang);
		}
	}

	const reset_value = (lang: string) => {
		vals[lang] = orig_vals[lang];
		modified[lang] = false;
	}


</script>

<div class="mt-3">
	<label for={id} class="{required ? 'underline' : ''} block text-xs/4 font-medium text-input-label-fg dark:text-input-label-fg-dark">{label}:</label>
	<div class="mt-2 grid grid-cols-1">
		<table>
			<tbody>
				{#each languagesArray as langstr}
					<tr>
						<td>{langstr}:</td>
						<td>
							<div class="grid grid-cols-1">
							<input type="text" name={name} id={id} placeholder={placeholder} oninput={() => value_changed(langstr, vals[langstr])}
										 class="py-1.0 oldap-textfield-common {disabled ? 'oldap-textfield-disabled' : 'oldap-textfield-valid'} {userClass}"
										 bind:value={vals[langstr]}>
							{#if modified[langstr]}
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
										 role="button" tabindex="0" onkeydown={(event) => handle_reset_key(event, langstr)} class="size-3 col-start-1 row-start-1 mr-3 self-center justify-self-end" onclick={() => reset_value(langstr)}>
									<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
								</svg>
							{/if}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>