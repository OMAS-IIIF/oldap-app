import { writable } from 'svelte/store';

export const refreshRolesList = writable(0);

export function refreshRolesListNow() {
	refreshRolesList.update(n => n + 1);
}