/*
 * Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
 */

import { writable } from 'svelte/store';

export const refreshResourcesList = writable(0);

export function refreshResourcesListNow() {
	refreshResourcesList.update(n => n + 1);
}