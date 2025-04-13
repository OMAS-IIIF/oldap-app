<script lang="ts">

	import { availableLanguageTags } from '$lib/paraglide/runtime';
	import type { LangString } from '$lib/oldap/datatypes/langstring';
	import { getLanguageShortname } from '$lib/oldap/enums/language';

	let {
		/** @param {string} label The label to be used for the text field */
		label,

		/** @param {string} name The HTML input element name */
		name,

		/** @param {string} [id] Optional `id` for the HTML input element */
		id,

		value = $bindable(),

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
		value?: LangString,
		required?: boolean,
		disabled?: boolean,
		class?: string
	} = $props();

	const languagesArray = Array.from(availableLanguageTags);

</script>

<div class="mt-3">
	<label for={id} class="{required ? 'underline' : ''} block text-xs/4 font-medium text-input-label-fg dark:text-input-label-fg-dark">{label}:</label>
	<div class="mt-2 grid grid-cols-1">
		<table>
			<tbody>
				{#each languagesArray as langstr}
					<tr>
						<td>{langstr}:</td>
						<td><input type="text" class="py-1.0 oldap-textfield-common {disabled ? 'oldap-textfield-disabled' : 'oldap-textfield-valid'} {userClass}" value="XXX"/></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>