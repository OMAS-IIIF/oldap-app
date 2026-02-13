import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';

export const handle: Handle = ({ event, resolve }) => {
	return paraglideMiddleware(event.request, ({ request, locale }) => {
		// ensure downstream sees the localized request
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html
				.replace('%lang%', locale)
				.replace('%dir%', 'ltr')
		});
	});
};
