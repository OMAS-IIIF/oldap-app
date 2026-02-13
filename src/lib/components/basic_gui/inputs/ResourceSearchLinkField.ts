/*
 * Copyright (©) 2026. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
 */

export type OldapFieldName = string; // z.B. "schema:familyName", "dcterms:title", "my:foo"

export type SearchHit = {
	iri: string; // Resource IRI, die verlinkt wird
	text: string; // Text, der im Feld angezeigt wird (Wert von `field`)
	// optional:
	// type?: string;
	// project?: string;
};
export type SearchFn = (args: {
	field: OldapFieldName;
	q: string;
	limit: number;
}) => Promise<SearchHit[]>;
