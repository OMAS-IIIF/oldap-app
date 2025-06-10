import { writable } from 'svelte/store';

export const refreshPermsetsList = writable(0);

export function refreshPermsetsListNow() {
	refreshPermsetsList.update(n => n + 1);
}