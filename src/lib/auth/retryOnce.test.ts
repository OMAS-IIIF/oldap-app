import { describe, expect, it, vi } from 'vitest';

import { retryOnceAfterUnauthorized } from './retryOnce';

describe('retryOnceAfterUnauthorized', () => {
	it('retries an unauthorized request exactly once after refresh', async () => {
		let requests = 0;
		const refresh = vi.fn(async () => undefined);
		const result = await retryOnceAfterUnauthorized({
			request: async () => ({ status: ++requests === 1 ? 401 : 200 }),
			isUnauthorized: ({ status }) => status === 401,
			canRefresh: () => true,
			refresh,
			onRefreshFailure: () => expect.fail('refresh unexpectedly failed')
		});

		expect(result.status).toBe(200);
		expect(requests).toBe(2);
		expect(refresh).toHaveBeenCalledOnce();
	});

	it('does not loop when the retried request is still unauthorized', async () => {
		let requests = 0;
		const refresh = vi.fn(async () => undefined);
		const result = await retryOnceAfterUnauthorized({
			request: async () => ({ status: ((requests += 1), 401) }),
			isUnauthorized: ({ status }) => status === 401,
			canRefresh: () => true,
			refresh,
			onRefreshFailure: () => expect.fail('refresh unexpectedly failed')
		});

		expect(result.status).toBe(401);
		expect(requests).toBe(2);
		expect(refresh).toHaveBeenCalledOnce();
	});

	it('returns the original response and expires locally when refresh fails', async () => {
		let requests = 0;
		const onRefreshFailure = vi.fn();
		const result = await retryOnceAfterUnauthorized({
			request: async () => ({ status: ((requests += 1), 401) }),
			isUnauthorized: ({ status }) => status === 401,
			canRefresh: () => true,
			refresh: async () => {
				throw new Error('invalid cookie');
			},
			onRefreshFailure
		});

		expect(result.status).toBe(401);
		expect(requests).toBe(1);
		expect(onRefreshFailure).toHaveBeenCalledOnce();
	});
});
