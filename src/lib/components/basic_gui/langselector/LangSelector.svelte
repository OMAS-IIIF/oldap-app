<script lang="ts">

	import DropdownMenu from '$lib/components/basic_gui/dropdown/DropdownMenu.svelte';
	import DropdownButton from '$lib/components/basic_gui/dropdown/DropdownButton.svelte';
	import DropdownButtonItem from '$lib/components/basic_gui/dropdown/DropdownButtonItem.svelte';
	import { locales, getLocale, setLocale } from '$lib/paraglide/runtime';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { i18n } from '$lib/i18n';
	import { resolve, resolveRoute } from '$app/paths';
	import { localeStore } from '$lib/stores/locale';


	let langSelOpen = $state(false);

	// Get the datatype for the allowed languages (e.g. 'en' | 'de' | fr' | 'it') or equivalent
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const languagesArray = Array.from(locales);
	type LanguageTags = (typeof languagesArray)[number];

	let current_lang = $state(getLocale())

	// const change_lang = (lang: LanguageTags) => {
	// 	current_lang = lang;
	// 	setLocale(lang); // will navigate/reload by itself
	// };
	// const change_lang = async (lang: LanguageTags) => {
	// 	current_lang = lang;
	//
	// 	// prevent Paraglide from doing window.location.* navigation
	// 	setLocale(lang, { reload: false });
	//
	// 	const canonicalPath = i18n.route(page.url.pathname);
	// 	const localizedPath = i18n.resolveRoute(canonicalPath, lang);
	//
	// 	// ESLint-friendly + robust for relative paths
	// 	await goto(resolve(localizedPath));
	// 	// force reactive update immediately (even before afterNavigate runs)
	// 	localeStore.set(lang);
	// 	console.log(`Changed locale to ${lang}`);
	//
	// };

	const change_lang = async (lang: LanguageTags) => {
		current_lang = lang;

		// do NOT reload, keep store state/auth
		setLocale(lang, { reload: false });

		// IMPORTANT: $page.url.pathname is canonical (because reroute de-localizes)
		const canonicalPath = i18n.route(page.url.pathname);

		// IMPORTANT: use `lang`, not getLocale()
		const localizedPath = i18n.resolveRoute(canonicalPath, lang);

		// IMPORTANT: SvelteKit resolve()
		console.log('localizedPath', localizedPath);
		console.log('window.location.pathname BEFORE', window.location.pathname);
		await goto(resolve(localizedPath));
		console.log('window.location.pathname AFTER', window.location.pathname);

		// force a reactive signal (optional but helps)
		localeStore.set(lang);

		console.log('Changed locale to', lang, '->', localizedPath);
	};

/*
	const change_lang = async (lang: LanguageTags) => {
		current_lang = lang;
		setLocale(lang)
		const canonicalPath = i18n.route(page.url.pathname); // get the route without language selector
		const localizedPath = i18n.resolveRoute(canonicalPath, getLocale()); // add the current lang selector
		await goto(localizedPath); // relode the page
	};
*/

</script>

<DropdownButton bind:isOpen={langSelOpen} bind:buttonText={current_lang} name="lang-menu" round={true}>
	<DropdownMenu bind:isOpen={langSelOpen} name="lang-menu" id="lang-menu-id" size="" transparent={true}>
		{#each locales as lang (lang)}
			<DropdownButtonItem bind:isOpen={langSelOpen} onclick={() => {change_lang(lang)}} round={true} selected={lang == current_lang}>{lang}</DropdownButtonItem>
		{/each}
	</DropdownMenu>
</DropdownButton>
