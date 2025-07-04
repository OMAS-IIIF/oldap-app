import { writable } from 'svelte/store';
import { DatamodelClass} from '$lib/oldap/classes/datamodel';


export const datamodelStore = writable<DatamodelClass | null>(null);
