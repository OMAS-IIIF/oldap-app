import { writable } from 'svelte/store';

export function persistentWritable<T>(key: string, initial: T) {
	let value = initial;

	if (typeof localStorage !== 'undefined') {
		const stored = localStorage.getItem(key);
		if (stored) {
			value = JSON.parse(stored);
		}
	}

	const store = writable<T>(value);

	if (typeof window !== 'undefined') {
		store.subscribe((val) => {
			localStorage.setItem(key, JSON.stringify(val));
		});
	}

	return store;
}