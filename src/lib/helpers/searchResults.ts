/**
 * Convert API search rows to the instance tables' IRI-keyed property arrays.
 * Current endpoints return scalar IRIs; legacy responses used singleton arrays.
 * Full-text hits can repeat a resource for different properties or values, so
 * merge those rows instead of losing hits or using array indexes as identifiers.
 */
export function searchResults(
	rows: Record<string, unknown>[]
): Record<string, Record<string, string[]>> {
	const result: Record<string, Record<string, string[]>> = {};
	for (const row of rows) {
		const iri = (Array.isArray(row.iri) ? row.iri[0] : row.iri) as string;
		const properties = (result[iri] ??= {});
		for (const [property, value] of Object.entries(row)) {
			if (property === 'iri' || property === 'resclass') continue;
			const values = (Array.isArray(value) ? value : [value]).map(String);
			properties[property] = [...new Set([...(properties[property] ?? []), ...values])];
		}
	}
	return result;
}

/** Query values remain unencoded: the HTTP client encodes them exactly once. */
export function fulltextQueries(resClass: string, searchString: string, countOnly = false) {
	return { resClass, searchString, countOnly };
}
