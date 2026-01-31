import { localizeHref, deLocalizeHref, getLocale } from '$lib/paraglide/runtime.js';

export const i18n = {
	/**
	 * Remove locale prefix from a pathname (canonical route).
	 * Example: /de/foo -> /foo
	 */
	route: (pathname: string) => deLocalizeHref(pathname),

	/**
	 * Add locale prefix to a canonical pathname.
	 * Example: /foo + de -> /de/foo
	 */
	resolveRoute: (canonicalPath: string, locale = getLocale()) =>
		localizeHref(canonicalPath, { locale })
};