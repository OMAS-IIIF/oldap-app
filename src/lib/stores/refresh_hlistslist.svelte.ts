import { writable } from 'svelte/store';

export const refreshHlistsList = writable(0);

export function refreshHlistsListNow() {
	refreshHlistsList.update(n => n + 1);
}