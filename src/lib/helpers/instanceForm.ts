import { LangString } from '$lib/oldap/datatypes/langstring';
import { XsdDate } from '$lib/oldap/datatypes/xsd_date';

/** Serialize the editor's strings, dates and multilingual values to API arrays. */
export function instanceFormValues(values: Record<string, unknown>): Record<string, string[]> {
	return Object.fromEntries(
		Object.entries(values)
			.filter(([key]) => key !== 'oldap:attachedToRole')
			.flatMap(([key, value]) => {
				if (value instanceof LangString) return [[key, value.toApi()]];
				if (
					Array.isArray(value) &&
					value.every((v) => typeof v === 'string' || v instanceof XsdDate)
				) {
					return [[key, value.map((v) => (v instanceof XsdDate ? v.toString() : v))]];
				}
				return [];
			})
	);
}

/** Only send changed fields; use null to remove a cleared property. Unshown
 * properties and role grants remain untouched by an ordinary content edit. */
export function instanceFormChanges(
	before: Record<string, string[]>,
	after: Record<string, string[]>
): Record<string, string[] | null> {
	return Object.fromEntries(
		Object.entries(after)
			.filter(
				([key, value]) =>
					JSON.stringify([...(before[key] ?? [])].sort()) !== JSON.stringify([...value].sort())
			)
			.map(([key, value]) => [key, value.length ? value : null])
	);
}
