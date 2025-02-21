import type { AuthInfo } from '$lib/oldap/classes/authinfo';

export const api_config = (authinfo: AuthInfo,
													 params?: Record<string, string>,
													 queries?: Record<string, string>)=> {
	return {
		headers: {
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + authinfo.token,
		},
		...(params ? { params } : {}),
		...(queries ? { queries  } : {}),
	}
}