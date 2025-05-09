import { persistentWritable } from '$lib/stores/persistantWritableStore';
import { writable } from 'svelte/store';

//export const authInfoStore = persistentWritable('authInfoStore', null);

export const authInfoStore = writable(null);