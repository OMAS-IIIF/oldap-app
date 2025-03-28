import { writable } from 'svelte/store';


export const successInfoStore = writable<string | null>(null);