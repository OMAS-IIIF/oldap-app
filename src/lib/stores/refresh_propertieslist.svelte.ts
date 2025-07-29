import { writable } from 'svelte/store';

export const refreshPropertiesList = writable(0);

export function refreshPropertiesListNow() {
	refreshPropertiesList.update(n => n + 1);
}