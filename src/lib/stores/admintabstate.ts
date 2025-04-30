/**
 * This store is used to keep the last selected tab in the admin route
 */
import { writable } from 'svelte/store';


export const adminTabState = writable<string>('');