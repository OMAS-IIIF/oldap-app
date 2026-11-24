import axios, { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({
	currentAuthInfo: vi.fn(() => ({ token: 'current-token' })),
	expireAuthenticatedSession: vi.fn(),
	hasRefreshableSession: vi.fn(() => true),
	refreshAccessToken: vi.fn(async () => 'refreshed-token')
}));
vi.mock('$app/env', () => ({ browser: true }));
vi.mock('../auth/accessToken.ts', () => auth);
vi.mock('./apiBaseUrl.ts', () => ({ getApiBaseUrl: async () => 'https://api.example.test' }));
import { createApiClient } from './apiClient.ts';

const originalCreate = axios.create.bind(axios);
let requests: InternalAxiosRequestConfig[];
let respond: AxiosAdapter;

/** Exercise the real generated transport and validators without any network. */
beforeEach(() => {
	vi.clearAllMocks();
	auth.currentAuthInfo.mockReturnValue({ token: 'current-token' });
	auth.refreshAccessToken.mockImplementation(async () => {
		auth.currentAuthInfo.mockReturnValue({ token: 'refreshed-token' });
		return 'refreshed-token';
	});
	requests = [];
	respond = async (config) => ({ data: [], status: 200, statusText: 'OK', headers: {}, config });
	vi.spyOn(axios, 'create').mockImplementation((config) =>
		originalCreate({
			...config,
			adapter: async (request) => {
				requests.push(request);
				return respond(request);
			}
		})
	);
});
afterEach(() => vi.restoreAllMocks());

function unauthorized(config: InternalAxiosRequestConfig): AxiosError {
	return new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, {
		data: { message: 'Unauthorized' },
		status: 401,
		statusText: 'Unauthorized',
		headers: {},
		config
	});
}

it('encodes raw path values once and serializes repeated query fields', async () => {
	const client = createApiClient('https://api.example.test');
	await client.getDataOfclassByProject({
		path: { project: 'https://example.test/project#one' },
		query: {
			resClass: 'test:Item',
			includeProperties: ['test:title', 'test:name'],
			sortBy: ['test:title|asc', 'test:name|desc'],
			countOnly: false,
			limit: 25,
			offset: 0
		}
	});
	// Axios adapters serialize params at dispatch time; getUri uses that same serializer.
	const url = new URL(axios.getUri(requests[0]));
	expect(url.pathname).toBe('/data/ofclass/https%3A%2F%2Fexample.test%2Fproject%23one');
	expect(url.searchParams.getAll('includeProperties[]')).toEqual(['test:title', 'test:name']);
	expect(url.searchParams.getAll('sortBy[]')).toEqual(['test:title|asc', 'test:name|desc']);
	expect(url.searchParams.has('includeProperties')).toBe(false);
	expect(url.searchParams.get('countOnly')).toBe('false');
	expect(url.searchParams.get('offset')).toBe('0');
	expect(url.searchParams.get('limit')).toBe('25');
	expect(requests[0].withCredentials).toBe(true);
});

it('rejects invalid request bodies before sending and invalid response data after receiving', async () => {
	const client = createApiClient('https://api.example.test');
	await expect(
		client.putAdminDatamodelByProjectPropertyByProperty({
			path: { project: 'test', property: 'test:title' },
			body: { datatype: 'xsd:string', class: 'test:Item' }
		})
	).rejects.toThrow('Supply exactly one');
	expect(requests).toHaveLength(0);
	respond = async (config) => ({ data: 42, status: 200, statusText: 'OK', headers: {}, config });
	await expect(client.getAdminProjectSearch({})).rejects.toThrow();
	expect(requests).toHaveLength(1);
});

it('refreshes once on 401 and validates the retried response', async () => {
	const client = createApiClient('https://api.example.test');
	respond = async (config) => {
		if (requests.length === 1) throw unauthorized(config);
		return {
			data: [{ projectShortName: 'test' }],
			status: 200,
			statusText: 'OK',
			headers: {},
			config
		};
	};
	const result = await client.getAdminProjectSearch({ headers: { Authorization: 'Bearer stale' } });
	expect(result).toEqual([{ projectShortName: 'test' }]);
	expect(auth.refreshAccessToken).toHaveBeenCalledTimes(1);
	expect(requests).toHaveLength(2);
	expect(requests[1].headers.get('Authorization')).toBe('Bearer refreshed-token');
});

it('does not retry a failed login or repeatedly retry a rejected refreshed session', async () => {
	const client = createApiClient('https://api.example.test');
	respond = async (config) => {
		throw unauthorized(config);
	};
	await expect(
		client.postAdminAuthByUserId({ path: { userId: 'name' }, body: { password: 'wrong' } })
	).rejects.toBeInstanceOf(AxiosError);
	expect(auth.refreshAccessToken).not.toHaveBeenCalled();
	await expect(
		client.getAdminProjectSearch({ headers: { Authorization: 'Bearer stale' } })
	).rejects.toBeInstanceOf(AxiosError);
	expect(auth.refreshAccessToken).toHaveBeenCalledTimes(1);
	expect(requests).toHaveLength(3);
});

it('rejects invalid response data even after a successful authentication retry', async () => {
	const client = createApiClient('https://api.example.test');
	respond = async (config) => {
		if (requests.length === 1) throw unauthorized(config);
		return { data: { invalid: true }, status: 200, statusText: 'OK', headers: {}, config };
	};
	await expect(
		client.getAdminProjectSearch({ headers: { Authorization: 'Bearer stale' } })
	).rejects.toThrow();
	expect(auth.refreshAccessToken).toHaveBeenCalledTimes(1);
	expect(requests).toHaveLength(2);
});

it('does not refresh failed authentication beneath an API base path', async () => {
	const client = createApiClient('https://api.example.test/api/v1');
	respond = async (config) => {
		throw unauthorized(config);
	};
	await expect(
		client.postAdminAuthByUserId({ path: { userId: 'name' }, body: { password: 'wrong' } })
	).rejects.toBeInstanceOf(AxiosError);
	expect(auth.refreshAccessToken).not.toHaveBeenCalled();
	expect(auth.expireAuthenticatedSession).not.toHaveBeenCalled();
	expect(requests).toHaveLength(1);
});

it('sends bodyless deletes and preserves Axios error identity', async () => {
	const client = createApiClient('https://api.example.test');
	respond = async (config) => ({
		data: { message: 'Deleted' },
		status: 200,
		statusText: 'OK',
		headers: {},
		config
	});
	await expect(
		client.deleteAdminProjectByProjectId({ path: { projectId: 'test' } })
	).resolves.toEqual({ message: 'Deleted' });
	expect(requests[0].method).toBe('delete');
	expect(requests[0].data).toBeUndefined();
	const error = new AxiosError('Forbidden', 'ERR_BAD_REQUEST');
	respond = async () => {
		throw error;
	};
	await expect(client.getAdminProjectSearch({})).rejects.toBe(error);
});
