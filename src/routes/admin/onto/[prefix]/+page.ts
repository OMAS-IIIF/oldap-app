import type { PageLoad } from './$types';

export const load: PageLoad = ({url, params}) => {
	return {prefix: params.prefix};
};
