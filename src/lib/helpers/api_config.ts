import type { AuthInfo } from '$lib/oldap/classes/authinfo';
import type { DeepReadonlyObject } from '@zodios/core/lib/utils.types';

export function api_config(authinfo: AuthInfo,
													 params?: Record<string, string>,
													 queries?: Record<string, string>) {
	return {
		headers: {
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + authinfo.token,
		},
		...(params ? { params: params } : {}),
		...(queries ? { queries: queries  } : {}),
	} as DeepReadonlyObject<any>
}

export function api_get_config(authinfo: AuthInfo, queries?: Record<string, string>){
	return api_config(authinfo, undefined, queries);
}

export function api_notget_config(authinfo: AuthInfo, params?: Record<string, string>) {
	return api_config(authinfo, params, undefined);
}