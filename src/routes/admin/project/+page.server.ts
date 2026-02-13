
import { redirect } from '@sveltejs/kit';
import { i18n } from '$lib/i18n';
import { getLocale } from '$lib/paraglide/runtime';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	// Gleiche Logik wie in goto_page.ts
	const baseUrl = '/admin/project/new';
	const canonicalPath = i18n.route(baseUrl);
	const localizedPath = i18n.resolveRoute(canonicalPath, getLocale());

	const queryParams = url.searchParams.toString();
	const redirectUrl = queryParams
		? `${localizedPath}?${queryParams}`
		: localizedPath;

	throw redirect(302, redirectUrl);
};