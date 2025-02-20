import { writable } from 'svelte/store';
import type { OldapError } from '$lib/oldap/errors/OldapError';


export const errorInfoStore = writable<OldapError | null>(null);