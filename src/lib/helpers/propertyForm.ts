/** Editable model fields. Omitted fields are never sent; null explicitly removes a value. */
export interface PropertyWrite {
	/** Local resource-property policy: [] clears links, null clears the explicit flag. */
	reifierShapes?: string[];
	reificationRequired?: boolean | null;
	subPropertyOf?: string | string[] | null;
	class?: string | null;
	datatype?: string | null;
	name?: string[] | null;
	description?: string[] | null;
	languageIn?: string[] | null;
	inSet?: (string | number)[] | null;
	minLength?: number | null;
	maxLength?: number | null;
	pattern?: string | null;
	minExclusive?: number | null;
	minInclusive?: number | null;
	maxExclusive?: number | null;
	maxInclusive?: number | null;
	minCount?: number | null;
	maxCount?: number | null;
	order?: number | null;
	editor?: string | null;
}

/** Parse an optional numeric form control without treating an empty input as zero. */
export function optionalNumber(value: string | number | undefined | null): number | undefined {
	if (value == null || String(value).trim() === '') return undefined;
	const number = Number(value);
	if (!Number.isFinite(number)) throw new Error('Enter a finite number.');
	return number;
}

/** Compare editable snapshots, including unordered set values; removed values become null. */
export function propertyDelta(before: PropertyWrite, after: PropertyWrite): PropertyWrite {
	const result: Record<string, unknown> = {};
	const normalized = (value: unknown) => (Array.isArray(value) ? [...value].sort() : value);
	for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
		const field = key as keyof PropertyWrite;
		if (JSON.stringify(normalized(before[field])) !== JSON.stringify(normalized(after[field]))) {
			result[key] = after[field] ?? null;
		}
	}
	return result as PropertyWrite;
}
