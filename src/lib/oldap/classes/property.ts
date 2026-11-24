import { OldapObject } from '#lib/oldap/classes/object.ts';
import { Iri } from '#lib/oldap/datatypes/xsd_iri.ts';
import { xsdDatatypeFromString, XsdDatatypes } from '#lib/oldap/enums/xsd_datatypes.ts';
import { LangString } from '#lib/oldap/datatypes/langstring.ts';
import { convertToLanguage, Language } from '#lib/oldap/enums/language.ts';
import { NCName } from '#lib/oldap/datatypes/xsd_ncname.ts';
import { QName } from '#lib/oldap/datatypes/xsd_qname.ts';
import { XsdDateTime } from '#lib/oldap/datatypes/xsd_datetime.ts';

export enum OwlPropertyType {
	AnnotationProperty = 'owl:AnnotationProperty',
	DataProperty = 'owl:DatatypeProperty',
	ObjectProperty = 'owl:ObjectProperty',
	TransitiveProperty = 'owl:TransitiveProperty',
	SymmetricProperty = 'owl:SymmetricProperty',
	ReflexiveProperty = 'owl:ReflexiveProperty',
	IrreflexiveProperty = 'owl:IrreflexiveProperty',
	FunctionalProperty = 'owl:FunctionalProperty',
	InverseFunctionalProperty = 'owl:InverseFunctionalProperty'
}

export type OwlPropertyTypeApi =
	| 'AnnotationProperty'
	| 'DataProperty'
	| 'ObjectProperty'
	| 'TransitiveProperty'
	| 'SymmetricProperty'
	| 'ReflexiveProperty'
	| 'IrreflexiveProperty'
	| 'FunctionalProperty'
	| 'InverseFunctionalProperty';

export const owlPropertyTypeApi2OwlPropertyType: Record<OwlPropertyTypeApi, OwlPropertyType> = {
	AnnotationProperty: OwlPropertyType.AnnotationProperty,
	DataProperty: OwlPropertyType.DataProperty,
	ObjectProperty: OwlPropertyType.ObjectProperty,
	TransitiveProperty: OwlPropertyType.TransitiveProperty,
	SymmetricProperty: OwlPropertyType.SymmetricProperty,
	ReflexiveProperty: OwlPropertyType.ReflexiveProperty,
	IrreflexiveProperty: OwlPropertyType.IrreflexiveProperty,
	FunctionalProperty: OwlPropertyType.FunctionalProperty,
	InverseFunctionalProperty: OwlPropertyType.InverseFunctionalProperty
};

export const owlPropertyType2OwlPropertyTypeApi: Record<OwlPropertyType, OwlPropertyTypeApi> = {
	[OwlPropertyType.AnnotationProperty]: 'AnnotationProperty',
	[OwlPropertyType.DataProperty]: 'DataProperty',
	[OwlPropertyType.ObjectProperty]: 'ObjectProperty',
	[OwlPropertyType.TransitiveProperty]: 'TransitiveProperty',
	[OwlPropertyType.SymmetricProperty]: 'SymmetricProperty',
	[OwlPropertyType.ReflexiveProperty]: 'ReflexiveProperty',
	[OwlPropertyType.IrreflexiveProperty]: 'IrreflexiveProperty',
	[OwlPropertyType.FunctionalProperty]: 'FunctionalProperty',
	[OwlPropertyType.InverseFunctionalProperty]: 'InverseFunctionalProperty'
};

export function string2OwlPropertyType(value: string): OwlPropertyType | undefined {
	const apiName = value.replace(/^Owl/, '') as OwlPropertyTypeApi;
	return (
		owlPropertyTypeApi2OwlPropertyType[apiName] ??
		Object.values(OwlPropertyType).find((type) => type === value)
	);
}

export function string2OwlPropertyTypeValue(value: string) {
	const allowed: OwlPropertyTypeApi[] = [
		'AnnotationProperty',
		'DataProperty',
		'ObjectProperty',
		'TransitiveProperty',
		'SymmetricProperty',
		'ReflexiveProperty',
		'IrreflexiveProperty',
		'FunctionalProperty',
		'InverseFunctionalProperty'
	];

	return allowed.includes(value as OwlPropertyTypeApi) ? (value as OwlPropertyTypeApi) : undefined;
}

export function owlPropertyTypeValue2string(value: OwlPropertyTypeApi) {
	return value;
}

export function owlPropertyTypeAsString(value: OwlPropertyType) {
	const name = Object.keys(OwlPropertyType).find(
		(key) => OwlPropertyType[key as keyof typeof OwlPropertyType] === value
	);
	return name;
}

/** Normalize missing model fields without manufacturing empty QName objects. */
function optionalQName(value: string | null | undefined): QName | undefined {
	return value == null || value === '' ? undefined : new QName(value);
}

/** Preserve zero and decimal constraints; absent or invalid numbers stay absent. */
function optionalNumber(value: unknown): number | undefined {
	if (value == null || value === '') return undefined;
	const number = Number(value);
	return Number.isFinite(number) ? number : undefined;
}

export type PropertyClassOptions = {
	creator?: Iri;
	created?: XsdDateTime;
	contributor?: Iri;
	modified?: XsdDateTime;
	projectId: NCName;
	propertyIri: QName;
	appliedToProperty?: QName;
	type: Set<OwlPropertyType>;
	/** Complete direct superproperty set; accepts compact or absolute IRIs from the API. */
	subPropertyOf?: Iri[];
	toClass?: QName;
	nodeKind?: QName;
	datatype?: XsdDatatypes;
	name?: LangString;
	description?: LangString;
	languageIn?: Set<Language>;
	uniqueLang?: boolean;
	inSet?: Set<string | number>;
	minLength?: number;
	maxLength?: number;
	pattern?: string;
	minExclusive?: number;
	minInclusive?: number;
	maxExclusive?: number;
	maxInclusive?: number;
	lessThan?: QName;
	lessThanOrEquals?: QName;
	/** SHACL reverse field: values are derived from another resource's forward relation. */
	inversePath?: QName;
	inverseOf?: QName;
	equivalentProperty?: QName;
	minCount?: number;
	maxCount?: number;
	order?: number;
	editor?: QName;
	group?: QName;
	/** Passive RDF 1.2 policy metadata; all referenced shapes apply together. */
	reifierShapes?: string[];
	/** Absence means no local declaration; false is an explicit declaration. */
	reificationRequired?: boolean;
};

export class PropertyClass extends OldapObject {
	#projectId: NCName;
	#propertyIri: QName;
	appliedToProperty?: QName;
	type: Set<OwlPropertyType>;
	/** Complete direct superproperty set; accepts compact or absolute IRIs from the API. */
	subPropertyOf?: Iri[];
	toClass?: QName;
	nodeKind?: QName;
	datatype?: XsdDatatypes;
	name?: LangString;
	description?: LangString;
	languageIn?: Set<Language>;
	uniqueLang?: boolean;
	inSet?: Set<string | number>;
	minLength?: number;
	maxLength?: number;
	pattern?: string;
	minExclusive?: number;
	minInclusive?: number;
	maxExclusive?: number;
	maxInclusive?: number;
	lessThan?: QName;
	lessThanOrEquals?: QName;
	/** SHACL reverse field: values are derived from another resource's forward relation. */
	inversePath?: QName;
	inverseOf?: QName;
	equivalentProperty?: QName;
	minCount?: number;
	maxCount?: number;
	order?: number;
	editor?: QName;
	group?: QName;
	/** Passive RDF 1.2 policy metadata; all referenced shapes apply together. */
	reifierShapes?: string[];
	/** Absence means no local declaration; false is an explicit declaration. */
	reificationRequired?: boolean;

	constructor(options: PropertyClassOptions) {
		super(options.creator, options.created, options.contributor, options.modified);
		this.#projectId = options.projectId;
		this.#propertyIri = options.propertyIri;
		this.appliedToProperty = options.appliedToProperty;
		this.type = options.type;
		this.subPropertyOf = options.subPropertyOf;
		this.toClass = options.toClass;
		this.nodeKind = options.nodeKind;
		this.datatype = options.datatype;
		this.name = options.name;
		this.description = options.description;
		this.languageIn = options.languageIn;
		this.uniqueLang = options.uniqueLang;
		this.inSet = options.inSet;
		this.minLength = options.minLength;
		this.maxLength = options.maxLength;
		this.pattern = options.pattern;
		this.minExclusive = options.minExclusive;
		this.minInclusive = options.minInclusive;
		this.maxExclusive = options.maxExclusive;
		this.maxInclusive = options.maxInclusive;
		this.lessThan = options.lessThan;
		this.lessThanOrEquals = options.lessThanOrEquals;
		this.inversePath = options.inversePath;
		this.inverseOf = options.inverseOf;
		this.equivalentProperty = options.equivalentProperty;
		this.minCount = options.minCount;
		this.maxCount = options.maxCount;
		this.order = options.order;
		this.editor = options.editor;
		this.group = options.group;
		this.reifierShapes = options.reifierShapes;
		this.reificationRequired = options.reificationRequired;
	}

	get projectId(): NCName {
		return this.#projectId;
	}

	get propertyIri(): QName {
		return this.#propertyIri;
	}

	clone(): PropertyClass {
		return new PropertyClass({
			creator: this.creator?.clone(),
			created: this.created?.clone(),
			contributor: this.contributor?.clone(),
			modified: this.modified?.clone(),
			projectId: this.projectId.clone(),
			propertyIri: this.propertyIri.clone(),
			appliedToProperty: this.appliedToProperty?.clone(),
			type: new Set<OwlPropertyType>([...this.type]),
			subPropertyOf: this.subPropertyOf?.map((parent) => parent.clone()),
			toClass: this.toClass?.clone(),
			nodeKind: this.nodeKind?.clone(),
			datatype: this.datatype,
			name: this.name?.clone(),
			description: this.description?.clone(),
			languageIn: this.languageIn ? new Set<Language>([...this.languageIn]) : undefined,
			uniqueLang: this.uniqueLang,
			inSet: this.inSet ? new Set<string | number>([...this.inSet]) : undefined,
			minLength: this.minLength,
			maxLength: this.maxLength,
			pattern: this.pattern,
			minExclusive: this.minExclusive,
			minInclusive: this.minInclusive,
			maxExclusive: this.maxExclusive,
			maxInclusive: this.maxInclusive,
			lessThan: this.lessThan?.clone(),
			lessThanOrEquals: this.lessThanOrEquals?.clone(),
			inversePath: this.inversePath?.clone(),
			inverseOf: this.inverseOf?.clone(),
			equivalentProperty: this.equivalentProperty?.clone(),
			maxCount: this.maxCount,
			minCount: this.minCount,
			order: this.order,
			editor: this.editor?.clone(),
			group: this.group?.clone(),
			reifierShapes: this.reifierShapes ? [...this.reifierShapes] : undefined,
			reificationRequired: this.reificationRequired
		});
	}

	/** Decode API model fields while preserving omitted values and RDF policy metadata. */
	static fromOldapJson(json: any): PropertyClass {
		const creator = json?.creator ? new Iri(json.creator) : undefined;
		const created = json?.created ? new XsdDateTime(json.created) : undefined;
		const contributor = json?.contributor ? new Iri(json.contributor) : undefined;
		const modified = json?.modified ? new XsdDateTime(json.modified) : undefined;
		const projectId = new NCName(json.projectid);
		const propertyIri = new QName(json.iri);
		const type = new Set<OwlPropertyType>(
			(json?.type ?? [])
				.map((x: string) => string2OwlPropertyType(x))
				.filter((x: OwlPropertyType | undefined): x is OwlPropertyType => x !== undefined)
		);
		const appliedToProperty = optionalQName(json?.appliedToProperty);
		const rawParents = json?.subPropertyOf;
		const subPropertyOf =
			rawParents == null || rawParents === ''
				? undefined
				: [...new Set<string>(Array.isArray(rawParents) ? rawParents : [rawParents])].map(
						(parent) => new Iri(parent)
					);
		const toClass = optionalQName(json?.toClass);
		const nodeKind = optionalQName(json?.nodeKind);
		const datatype = xsdDatatypeFromString(json?.datatype);
		const name = LangString.fromJson(json?.name);
		const description = LangString.fromJson(json?.description);
		const languageIn = json?.languageIn
			? new Set<Language>(
					json.languageIn
						.map((x: string) => convertToLanguage(x))
						.filter((x: Language | undefined): x is Language => x !== undefined)
				)
			: undefined;
		const uniqueLang = json?.uniqueLang;
		const inSet = json?.inSet == null ? undefined : new Set<string | number>(json.inSet);
		const minLength = optionalNumber(json?.minLength);
		const maxLength = optionalNumber(json?.maxLength);
		const pattern = json?.pattern;
		const minExclusive = optionalNumber(json?.minExclusive);
		const minInclusive = optionalNumber(json?.minInclusive);
		const maxExclusive = optionalNumber(json?.maxExclusive);
		const maxInclusive = optionalNumber(json?.maxInclusive);
		const lessThan = optionalQName(json?.lessThan);
		const lessThanOrEquals = optionalQName(json?.lessThanOrEquals);
		const inversePath = optionalQName(json?.inversePath);
		const inverseOf = optionalQName(json?.inverseOf);
		const equivalentProperty = optionalQName(json?.equivalentProperty);
		const maxCount = optionalNumber(json?.maxCount);
		const minCount = optionalNumber(json?.minCount);
		const order = optionalNumber(json?.order);
		const group = optionalQName(json?.group);
		const editor = optionalQName(json?.editor);

		return new PropertyClass({
			creator: creator,
			created: created,
			contributor: contributor,
			modified: modified,
			projectId: projectId,
			propertyIri: propertyIri,
			appliedToProperty: appliedToProperty,
			type: type,
			subPropertyOf: subPropertyOf,
			toClass: toClass,
			nodeKind: nodeKind,
			datatype: datatype,
			name: name,
			description: description,
			languageIn: languageIn,
			uniqueLang: uniqueLang,
			inSet: inSet,
			minLength: minLength,
			maxLength: maxLength,
			pattern: pattern,
			minExclusive: minExclusive,
			minInclusive: minInclusive,
			maxExclusive: maxExclusive,
			maxInclusive: maxInclusive,
			lessThan: lessThan,
			lessThanOrEquals: lessThanOrEquals,
			inversePath: inversePath,
			inverseOf: inverseOf,
			equivalentProperty: equivalentProperty,
			minCount: minCount,
			maxCount: maxCount,
			order: order,
			editor: editor,
			group: group,
			reifierShapes: json?.reifierShapes ? [...json.reifierShapes] : undefined,
			reificationRequired: json?.reificationRequired ?? undefined
		});
	}
}
