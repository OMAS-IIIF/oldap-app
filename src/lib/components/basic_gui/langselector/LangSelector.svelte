<script lang="ts">

	import DropdownMenu from '$lib/components/basic_gui/dropdown/DropdownMenu.svelte';
	import DropdownButton from '$lib/components/basic_gui/dropdown/DropdownButton.svelte';
	import DropdownButtonItem from '$lib/components/basic_gui/dropdown/DropdownButtonItem.svelte';
	import { availableLanguageTags, languageTag, setLanguageTag } from '$lib/paraglide/runtime.js';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { i18n } from '$lib/i18n';


	let langSelOpen = $state(false);

	// Get the datatype for the allowed languages (e.g. 'en' | 'de' | fr' | 'it') or equivalent
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const languagesArray = Array.from(availableLanguageTags);
	type LanguageTags = (typeof languagesArray)[number];

	let current_lang = $state(languageTag())

	const change_lang = async (lang: LanguageTags) => {
		current_lang = lang;
		setLanguageTag(lang)
		const canonicalPath = i18n.route(page.url.pathname); // get the route without language selector
		const localizedPath = i18n.resolveRoute(canonicalPath, languageTag()); // add the current lang selector
		goto(localizedPath); // relode the page
	};

</script>

<DropdownButton bind:isOpen={langSelOpen} bind:buttonText={current_lang} name="lang-menu" round={true}>
	<DropdownMenu bind:isOpen={langSelOpen} name="lang-menu" id="lang-menu-id" size="" transparent={true}>
		{#each availableLanguageTags as lang}
			<DropdownButtonItem bind:isOpen={langSelOpen} onclick={() => {change_lang(lang)}} round={true} selected={lang == current_lang}>{lang}</DropdownButtonItem>
		{/each}
	</DropdownMenu>
</DropdownButton>
