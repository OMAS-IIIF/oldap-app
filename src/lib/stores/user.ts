import { writable } from 'svelte/store';
import type { OldapUser } from '$lib/oldap/classes/user';
import { persistentWritable } from '$lib/stores/persistantWritableStore';


//export const userStore = persistentWritable<OldapUser | null>('user', null);

export const userStore = writable<OldapUser | null>(null);
