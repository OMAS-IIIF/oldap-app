/*
 * Copyright (©) 2026. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
 */

import type { ResourceClass } from '$lib/oldap/classes/resource';

//
// TODO: This should work recursively, but at the moment only one level of "inheritance" is supported!!!
//
export function is_mediaobject(res: ResourceClass): boolean {
	if (res.iri.toString() === 'shared:MediaObject') return true;
	if (res.superclass) {
		const gaga = [...res.superclass].map((s) => s.toString()) || [];
		if (gaga.includes('shared:MediaObject')) return true;
	}
	return false;
}
