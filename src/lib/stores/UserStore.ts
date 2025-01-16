import { writable } from 'svelte/store';
import { User } from '$lib/classes/User';

export const user = writable(new User());
