import { goto } from '$app/navigation';
import { i18n } from '$lib/i18n';
import { getLocale } from '$lib/paraglide/runtime';

export const goto_page = (url: string, queryParams?: Record<string, string>) => {
	return () => {
		const cleaned = url.startsWith('/') ? url : `/${url}`;
		const canonicalPath = i18n.route(cleaned);
		const localizedPath = i18n.resolveRoute(canonicalPath, getLocale());

		let finalUrl = localizedPath;

		if (queryParams) {
			const query = new URLSearchParams(queryParams).toString();
			finalUrl += `?${query}`;
		}

		goto(finalUrl);
	}
}

