/*
 * Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
 */

import { writable } from 'svelte/store';
import { DatamodelClass} from '$lib/oldap/classes/datamodel';


export const datamodelSharedStore = writable<DatamodelClass | null>(null);
