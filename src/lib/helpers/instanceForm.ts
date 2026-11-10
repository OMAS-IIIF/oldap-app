import type { PropertyClass } from '$lib/oldap/classes/property';
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

/** Select direct fields for create/edit without mutating the shared model order.
 * Reverse fields must be changed through the related resource's forward relation.
 * Legacy absent QName values can be empty objects rather than undefined.
 */
export function instanceEditableProperties(properties: PropertyClass[]): PropertyClass[] {
	return properties
		.filter(
			(property) =>
				(!property.inversePath || property.inversePath.isEmpty) &&
				(!property.inverseOf || property.inverseOf.isEmpty)
		)
		.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
}
