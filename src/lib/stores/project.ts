import { writable } from 'svelte/store';
import type { OldapProject } from '#lib/oldap/classes/project.ts';


export const projectStore = writable<OldapProject | null>(null);
