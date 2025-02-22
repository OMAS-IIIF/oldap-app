import { writable } from 'svelte/store';
import type { OldapProject } from '$lib/oldap/classes/project';


export const projectStore = writable<OldapProject | null>(null);
