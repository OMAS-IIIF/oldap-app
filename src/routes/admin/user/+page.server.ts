import { redirect } from '@sveltejs/kit';

export function load({ url }) {
/*
	const lang = locals.lang;
	throw redirect(302, '/admin/user/new');
*/

	const lang = url.pathname.split('/')[1]; // gets 'en' from '/en/admin/...'
	throw redirect(302, `/${lang}/admin/user/new`);

}