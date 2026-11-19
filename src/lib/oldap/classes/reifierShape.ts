/** Named SHACL annotation shapes are independent of resource classes. Fields stay
 * plain API values so full-list replacement never loses constraints in conversion.
 */
import { QName } from '$lib/oldap/datatypes/xsd_qname';
import { Iri } from '$lib/oldap/datatypes/xsd_iri';

/** Supported read/write annotation-field constraints; unknown read keys are retained
 * so an unsupported constraint blocks replacement instead of disappearing silently.
 */
export interface ReifierField {
	iri: string;
	subPropertyOf?: string | string[];
	datatype?: string;
	toClass?: string;
	class?: string;
	nodeKind?: string;
	type?: string[];
	name?: string | string[];
	description?: string | string[];
	languageIn?: string[];
	uniqueLang?: boolean;
	inSet?: (string | number)[];
	minLength?: number;
	maxLength?: number;
	pattern?: string;
	minExclusive?: number;
	minInclusive?: number;
	maxExclusive?: number;
	maxInclusive?: number;
	minCount?: number;
	maxCount?: number;
	order?: number;
	group?: string;
	editor?: string;
	[key: string]: unknown;
}

/** A write field uses class, while the read API uses toClass. */
export interface ReifierFieldWrite extends ReifierField {
	toClass?: never;
	name?: string[];
	description?: string[];
}

/** A named shape returned by model GET or the dedicated shape endpoint. */
export interface ReifierShape {
	iri: string;
	properties: ReifierField[];
	creator?: string;
	created?: string;
	contributor?: string;
	modified?: string;
}

const auditKeys = new Set(['creator', 'created', 'contributor', 'modified', 'projectid']);
const stringKeys = new Set(['iri', 'datatype', 'class', 'nodeKind', 'pattern', 'group', 'editor']);
const numberKeys = new Set([
	'minLength',
	'maxLength',
	'minExclusive',
	'minInclusive',
	'maxExclusive',
	'maxInclusive',
	'minCount',
	'maxCount',
	'order'
]);
const integerKeys = new Set(['minLength', 'maxLength', 'minCount', 'maxCount']);
// Numeric JSON cannot preserve fractional or unsafe integer enumeration values.
// Exact integer strings from model reads remain lexical strings until API conversion.
const integerDatatypes = new Set([
	'xsd:integer',
	'xsd:nonPositiveInteger',
	'xsd:negativeInteger',
	'xsd:long',
	'xsd:int',
	'xsd:short',
	'xsd:byte',
	'xsd:nonNegativeInteger',
	'xsd:unsignedLong',
	'xsd:unsignedInt',
	'xsd:unsignedShort',
	'xsd:unsignedByte',
	'xsd:positiveInteger'
]);
const stringArrayKeys = new Set(['type', 'languageIn']);

function object(value: unknown, context: string): Record<string, unknown> {
	if (value === null || typeof value !== 'object' || Array.isArray(value)) {
		throw new Error(`${context} must be an object.`);
	}
	return value as Record<string, unknown>;
}

/** Read a shape without discarding unknown field constraints. Validation of writes
 * is deliberately separate so newer server definitions can still be inspected.
 */
export function reifierShapeFromJson(value: unknown): ReifierShape {
	const json = object(value, 'Reifier shape');
	if (typeof json.iri !== 'string' || !json.iri.trim() || !Array.isArray(json.properties)) {
		throw new Error('A reifier shape requires an IRI and a properties array.');
	}
	const properties = json.properties.map((entry) => {
		const field = object(entry, 'Reifier field');
		if (typeof field.iri !== 'string' || !field.iri.trim()) {
			throw new Error('A reifier field requires an IRI.');
		}
		// API JSON contains no class instances. Detach nested values from model snapshots.
		return JSON.parse(JSON.stringify(field)) as ReifierField;
	});
	const shape: ReifierShape = { iri: json.iri, properties };
	for (const key of ['creator', 'created', 'contributor', 'modified'] as const) {
		if (typeof json[key] === 'string') shape[key] = json[key];
	}
	return shape;
}

/** Serialize a complete field definition. Read-only audit keys are removed,
 * toClass maps to class, and unknown or unsupported constraints reject the write.
 * Zero, false, empty arrays, and omitted optional declarations remain distinct.
 */
export function reifierFieldToWrite(field: ReifierField): ReifierFieldWrite {
	const source = object(field, 'Reifier field');
	if (typeof source.iri !== 'string' || !source.iri.trim()) {
		throw new Error('A reifier field requires an IRI.');
	}
	new QName(source.iri);
	if (source.class != null && source.toClass != null && source.class !== source.toClass) {
		throw new Error(`${source.iri}: class and toClass disagree.`);
	}
	const result: Record<string, unknown> = {};
	for (const [readKey, value] of Object.entries(source)) {
		if (auditKeys.has(readKey) || value == null) continue;
		const key = readKey === 'toClass' ? 'class' : readKey;
		let valid = false;
		if (key === 'subPropertyOf') {
			const parents = Array.isArray(value) ? value : [value];
			valid = parents.every((parent) => typeof parent === 'string' && parent.trim().length > 0);
		} else if (stringKeys.has(key)) {
			valid = typeof value === 'string' && (key === 'pattern' || value.trim().length > 0);
		} else if (numberKeys.has(key)) {
			valid =
				typeof value === 'number' &&
				Number.isFinite(value) &&
				(!integerKeys.has(key) || (Number.isInteger(value) && value >= 0));
		} else if (stringArrayKeys.has(key)) {
			valid = Array.isArray(value) && value.every((item) => typeof item === 'string');
		} else if (key === 'name' || key === 'description') {
			valid =
				typeof value === 'string' ||
				(Array.isArray(value) && value.every((item) => typeof item === 'string'));
		} else if (key === 'uniqueLang') {
			valid = typeof value === 'boolean';
		} else if (key === 'inSet') {
			valid =
				Array.isArray(value) &&
				value.every(
					(item) => typeof item === 'string' || (typeof item === 'number' && Number.isFinite(item))
				);
		} else {
			throw new Error(`${source.iri}: unsupported annotation field constraint "${readKey}".`);
		}
		if (!valid) throw new Error(`${source.iri}: invalid value for "${readKey}".`);
		result[key] =
			(key === 'name' || key === 'description') && typeof value === 'string'
				? [value]
				: Array.isArray(value)
					? [...value]
					: value;
	}
	if ((result.datatype !== undefined) === (result.class !== undefined)) {
		throw new Error(`${source.iri}: supply exactly one datatype or class constraint.`);
	}
	if (
		typeof result.datatype === 'string' &&
		integerDatatypes.has(result.datatype) &&
		Array.isArray(result.inSet) &&
		result.inSet.some((item) => typeof item === 'number' && !Number.isSafeInteger(item))
	) {
		throw new Error(
			`${source.iri}: integer enumeration values must be safe integers; use exact strings for larger values.`
		);
	}
	if (typeof result.class === 'string') new QName(result.class);
	// Keep every declared parent, including full IRIs from imported ontologies.
	for (const parent of Array.isArray(result.subPropertyOf)
		? result.subPropertyOf
		: result.subPropertyOf === undefined
			? []
			: [result.subPropertyOf]) {
		if (/^(https?:|urn:)/.test(parent as string)) new Iri(parent as string);
		else new QName(parent as string);
	}
	for (const [min, max] of [
		['minCount', 'maxCount'],
		['minLength', 'maxLength']
	] as const) {
		if (
			typeof result[min] === 'number' &&
			typeof result[max] === 'number' &&
			result[min] > result[max]
		) {
			throw new Error(`${source.iri}: ${min} must not exceed ${max}.`);
		}
	}
	return result as ReifierFieldWrite;
}

/** Produce the full replacement body for PUT/POST. Callers must keep every field
 * they intend to retain; an empty array deliberately removes all fields.
 */
export function reifierShapeToWrite(shape: Pick<ReifierShape, 'properties'>): {
	properties: ReifierFieldWrite[];
} {
	if (!Array.isArray(shape.properties)) throw new Error('Shape properties must be an array.');
	const properties = shape.properties.map(reifierFieldToWrite);
	if (new Set(properties.map((field) => field.iri)).size !== properties.length) {
		throw new Error('Duplicate annotation field IRI.');
	}
	return { properties };
}
