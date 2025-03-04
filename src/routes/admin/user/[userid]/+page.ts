import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = ({url, params}) => {
	const action = url.searchParams.get('action');
	if (action !== 'edit' && action !== 'add') {
		throw error(404, 'Invalid action'); // ✅ Properly handled by SvelteKit
	}

	return {action: action, userid: params.userid};
};

