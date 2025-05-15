import { writable } from 'svelte/store';

export const refreshNodeTree = writable(0);

export function refreshNodeTreeNow() {
	refreshNodeTree.update(n => n + 1);
}