import type { PageLoad } from './$types';

export const load: PageLoad = ({url, params}) => {
/*
	const action = url.searchParams.get('action');
	if (action !== 'edit' && action !== 'add') {
		throw error(404, 'Invalid action'); // ✅ Properly handled by SvelteKit
	}
*/
	return {userid: params.userid};
};

