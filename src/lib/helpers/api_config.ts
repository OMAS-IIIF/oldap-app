import type { AuthInfo } from '#lib/oldap/classes/authinfo.ts';

type PathParameters = Record<string, string>;
type QueryParameters = Record<string, string | string[] | number | boolean | undefined>;

/** Build SDK options with raw path values; the transport performs URL encoding. */
export function api_config<
	const P extends PathParameters | undefined = undefined,
	const Q extends QueryParameters | undefined = undefined
>(authinfo: AuthInfo, path?: P, query?: Q) {
	return {
		headers: {
			Accept: 'application/json',
			Authorization: 'Bearer ' + authinfo.token
		},
		path: path as P,
		query: query as Q
	};
}

/** Build options for a query-only endpoint without losing its inferred keys. */
export function api_get_config<const Q extends QueryParameters | undefined = undefined>(
	authinfo: AuthInfo,
	query?: Q
) {
	return api_config(authinfo, undefined, query);
}

/** Build options for a path-based write; the caller supplies the body separately. */
export function api_notget_config<const P extends PathParameters | undefined = undefined>(
	authinfo: AuthInfo,
	path?: P
) {
	return api_config(authinfo, path);
}
