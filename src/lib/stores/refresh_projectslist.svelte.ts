import { writable } from 'svelte/store';

export const refreshProjectsList = writable(0);

export function refreshProjectsListNow() {
	refreshProjectsList.update(n => n + 1);
}
