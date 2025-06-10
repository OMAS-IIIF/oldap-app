import type { PageLoad } from './$types';

export const load: PageLoad = ({url, params}) => {
	return {userid: params.userid};
};

