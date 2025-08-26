/*
 * Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
 */


import { redirect } from '@sveltejs/kit';
import { i18n } from '$lib/i18n';
import { languageTag } from '$lib/paraglide/runtime';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	// Gleiche Logik wie in goto_page.ts
	const baseUrl = '/admin/resource/new';
	const canonicalPath = i18n.route(baseUrl);
	const localizedPath = i18n.resolveRoute(canonicalPath, languageTag());

	const queryParams = url.searchParams.toString();
	const redirectUrl = queryParams
		? `${localizedPath}?${queryParams}`
		: localizedPath;

	throw redirect(302, redirectUrl);
};