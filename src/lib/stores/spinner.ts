import { writable } from 'svelte/store';

export const spinnerStore = writable<string | null>(null);