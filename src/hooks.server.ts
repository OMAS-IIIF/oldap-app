import type { Handle } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '#lib/paraglide/server.js';

export const handle: Handle = ({ event, resolve }) => {
	return paraglideMiddleware(event.request, ({ request, locale }) => {
		// SvelteKit 3 keeps the original event immutable; resolve the localized request.
		return resolve(
			{ ...event, request },
			{
				transformPageChunk: ({ html }) => html.replace('%lang%', locale).replace('%dir%', 'ltr')
			}
		);
	});
};
