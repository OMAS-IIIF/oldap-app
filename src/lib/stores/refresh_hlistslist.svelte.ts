import { writable } from 'svelte/store';

export const refreshHlistsList = writable(0);

export function refreshHlistsHlistNow() {
	refreshHlistsList.update(n => n + 1);
}