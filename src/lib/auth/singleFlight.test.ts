import { describe, expect, it } from 'vitest';

import { SingleFlight } from './singleFlight';

describe('SingleFlight', () => {
	it('shares one refresh operation between concurrent callers', async () => {
		const coordinator = new SingleFlight<string>();
		let calls = 0;
		let release!: (value: string) => void;
		const operation = () => {
			calls += 1;
			return new Promise<string>((resolve) => {
				release = resolve;
			});
		};

		const first = coordinator.run(operation);
		const second = coordinator.run(operation);
		const third = coordinator.run(operation);

		expect(calls).toBe(1);
		release('new-access-token');
		await expect(Promise.all([first, second, third])).resolves.toEqual([
			'new-access-token',
			'new-access-token',
			'new-access-token'
		]);
	});

	it('releases the slot after a failed operation', async () => {
		const coordinator = new SingleFlight<string>();
		let calls = 0;

		await expect(
			coordinator.run(async () => {
				calls += 1;
				throw new Error('refresh failed');
			})
		).rejects.toThrow('refresh failed');

		await expect(
			coordinator.run(async () => {
				calls += 1;
				return 'recovered';
			})
		).resolves.toBe('recovered');
		expect(calls).toBe(2);
	});
});
