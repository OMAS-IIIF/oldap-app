import { goto } from '$app/navigation';
import { i18n } from '$lib/i18n';
import { languageTag } from '$lib/paraglide/runtime';

export const goto_page = (url: string) => {
	return () => {
		const cleaned = url.startsWith('/') ? url : `/${url}`;
		const canonicalPath = i18n.route(cleaned); // get the route without language selector
		const localizedPath = i18n.resolveRoute(canonicalPath, languageTag()); // add the current lang selector
		goto(localizedPath); // relode the page
	}
}
