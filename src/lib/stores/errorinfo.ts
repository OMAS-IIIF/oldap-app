import { writable } from 'svelte/store';
import type { OldapError } from '#lib/oldap/errors/OldapError.ts';


export const errorInfoStore = writable<OldapError | null>(null);