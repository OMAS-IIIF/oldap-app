<!--
  - Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
  -->
<!--
	@comment

	This component implements a field for editing LangStrings with textarea elements.
	Features collapsible textareas that expand when focused.

-->
<script lang="ts">

	import { locales } from '$lib/paraglide/runtime';
	import { LangString } from '$lib/oldap/datatypes/langstring';
	import { convertToLanguage, getLanguageShortname, Language } from '$lib/oldap/enums/language';

	let {
		/** @param {string} label The label to be used for the text field */
		label,

		/** @param {string} name The HTML textarea element name */
		name,

		/** @param {string} [id] Optional `id` for the HTML textarea element */
		id,

		/** @param {string} [placeholder] Optional placeholder text, defaults to an empty string */
		placeholder = '',

		/** @param {number} [expandedHeight] Height in pixels when expanded, defaults to 120 */
		expandedHeight = 120,

		value = null,

		/** @param {boolean} [required] Optional flag to indicate if the field is mandatory. Defaults to false */
		required = undefined,

		/** @param {boolean} [disabled] Optional bindable flag to indicate if the field is disabled */
		disabled = $bindable(false),

		/** @param {string} [class] Optional string that is passed to the class attribute of HTML textarea element. Defaults to an empty string */
		class: userClass = ''

	}: {
		label: string,
		name: string,
		id?: string,
		placeholder?: string,
		expandedHeight?: number,
		value: LangString | null,
		required?: boolean,
		disabled?: boolean,
		class?: string
	} = $props();

	const languagesArray = Array.from(locales);

	let vals = $state<Record<string, string>>({});
	let orig_vals = <Record<string, string>>({});
	let modified = $state<Record<string, boolean>>({});
	let focused = $state<Record<string, boolean>>({});

	for (const lang of languagesArray) {
		orig_vals[lang] = '';
		focused[lang] = false;
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
	});

	$effect(() => {
		if (!vals || Object.keys(vals).length === 0) return;
		for (const lang of languagesArray) {
			if (orig_vals[lang] === undefined) {
				modified[lang] = false;
			}
		}
	});

	const value_changed = (lang: string, val?: string) => {
		modified[lang] = orig_vals[lang] !== val;
	};

	const handle_focus = (lang: string) => {
		focused[lang] = true;
	};

	const handle_blur = (lang: string) => {
		focused[lang] = false;
	};

	const handle_reset_key = (event: KeyboardEvent, lang: string) => {
		if (event.key === 'Enter' || event.key === ' ') {
			reset_value(lang);
		}
	};

	const reset_value = (lang: string) => {
		vals[lang] = orig_vals[lang];
		modified[lang] = false;
	};

	export const is_modified = (): Record<string, boolean> => {
		return $state.snapshot<Record<string, boolean>>(modified);
	}

	export const get_value = (): LangString => {
		let retval: Record<Language, string> = {} as Record<Language, string>;
		for (const lang of languagesArray) {
			if (vals[lang]) {
				retval[convertToLanguage(lang) || Language.EN] = vals[lang];
			}
		}
		return new LangString(retval);
	}

</script>

<div class="mt-3">
	<label for={id} class="{required ? 'underline' : ''} block text-xs/4 font-medium text-input-label-fg dark:text-input-label-fg-dark">{label}:</label>
	<div class="mt-2 grid grid-cols-1">
		<table>
			<tbody>
			{#each languagesArray as langstr}
				<tr>
					<td class="align-top pt-1">{langstr}:</td>
					<td>
						<div class="grid grid-cols-1">
								<textarea
									name={name}
									id={id}
									placeholder={placeholder}
									style="height: {focused[langstr] ? expandedHeight : 'auto'}px; min-height: {focused[langstr] ? expandedHeight : '2.5rem'}px; resize: {focused[langstr] ? 'vertical' : 'none'}; overflow-y: {focused[langstr] ? 'auto' : 'hidden'}; white-space: {focused[langstr] ? 'normal' : 'nowrap'}; text-overflow: {focused[langstr] ? 'clip' : 'ellipsis'};"
									oninput={() => value_changed(langstr, vals[langstr])}
									onfocus={() => handle_focus(langstr)}
									onblur={() => handle_blur(langstr)}
									class="py-1.0 oldap-textfield-common {disabled ? 'oldap-textfield-disabled' : 'oldap-textfield-valid'} {userClass} transition-all duration-200 ease-in-out"
									bind:value={vals[langstr]}
									{disabled}
									rows={focused[langstr] ? Math.ceil(expandedHeight / 24) : 1}
								></textarea>
							{#if modified[langstr]}
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
										 role="button" tabindex="0" onkeydown={(event) => handle_reset_key(event, langstr)} class="size-3 col-start-1 row-start-1 mr-3 mt-1 self-start justify-self-end" onclick={() => reset_value(langstr)}>
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
