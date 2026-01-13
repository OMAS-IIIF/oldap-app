import type { PageLoad } from './$types';

// @ts-ignore
export const load: PageLoad = ({url, params}) => {
	return {roleid: params.roleid};
};
