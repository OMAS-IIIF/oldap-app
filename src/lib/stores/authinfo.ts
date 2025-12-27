import { writable } from 'svelte/store';
import type { AuthInfo } from '$lib/oldap/classes/authinfo';

//export const authInfoStore = persistentWritable('authInfoStore', null);

export const authInfoStore = writable<AuthInfo | null>(null);
//export const authInfoStore = writable(null);