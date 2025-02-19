import { writable } from 'svelte/store';
import type { OldapUser } from '$lib/oldap/classes/user';


export const userStore = writable<OldapUser | null>(null);
