import { OldapObject } from '$lib/oldap/classes/object';
import { Iri } from '$lib/oldap/datatypes/xsd_iri';
import { xsdDatatypeFromString, XsdDatatypes } from '$lib/oldap/enums/xsd_datatypes';
import { LangString } from '$lib/oldap/datatypes/langstring';
import { convertToLanguage, Language } from '$lib/oldap/enums/language';
import { NCName } from '$lib/oldap/datatypes/xsd_ncname';
import { DataPermission } from '$lib/oldap/enums/data_permissions';
import { QName } from '$lib/oldap/datatypes/xsd_qname';
import { XsdDateTime } from '$lib/oldap/datatypes/xsd_datetime';

export enum OwlPropertyType {
	AnnotationProperty = 'owl:AnnotationProperty',
	DataProperty = 'owl:DatatypeProperty',
	ObjectProperty = 'owl:ObjectProperty',
	TransitiveProperty = 'owl:TransitiveProperty',
	SymmetricProperty = 'owl:SymmetricProperty',
	ReflexiveProperty = 'owl:ReflexiveProperty',
	IrreflexiveProperty = 'owl:IrreflexiveProperty',
	FunctionalProperty = 'owl:FunctionalProperty',
	InverseFunctionalProperty = 'owl:InverseFunctionalProperty',
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
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	return Object.entries(DataPermission).find(([_, v]) => v === value)?.[1] as OwlPropertyType | undefined;
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
		'InverseFunctionalProperty',
	];

	return (allowed.includes(value as OwlPropertyTypeApi)
		? (value as OwlPropertyTypeApi)
		: undefined);
}

export function owlPropertyTypeValue2string(value: OwlPropertyTypeApi) {
	return value;
}

export function owlPropertyTypeAsString(value: OwlPropertyType) {
	const name = Object.keys(OwlPropertyType).find(
		key => OwlPropertyType[key as keyof typeof OwlPropertyType] === value
	);
	return name;
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
	subPropertyOf?: QName;
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
	inverseOf?: QName;
	equivalentProperty?: QName;
	minCount?: number;
	maxCount?: number;
	order?: number;
	editor?: QName;
	group?: QName;
};

export class PropertyClass extends OldapObject {
	#projectId: NCName;
	#propertyIri: QName;
	appliedToProperty?: QName;
	type: Set<OwlPropertyType>;
	subPropertyOf?: QName;
	toClass?: QName;
	nodeKind?: QName;
	datatype?: XsdDatatypes;
	name?: LangString;
	description?: LangString;
	languageIn?: Set<Language>;
	uniqueLang?: boolean;
	inSet?: Set<string | number>
	minLength?: number;
	maxLength?: number;
	pattern?: string;
	minExclusive?: number;
	minInclusive?: number;
	maxExclusive?: number;
	maxInclusive?: number;
	lessThan?: QName;
	lessThanOrEquals?: QName;
	inverseOf?: QName;
	equivalentProperty?: QName;
	minCount?: number;
	maxCount?: number;
	order?: number;
	editor?: QName;
	group?: QName;


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
		this.inverseOf = options.inverseOf;
		this.equivalentProperty = options.equivalentProperty;
		this.minCount = options.minCount;
		this.maxCount = options.maxCount;
		this.order = options.order;
		this.editor = options.editor;
		this.group = options.group;
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
			subPropertyOf: this.subPropertyOf?.clone(),
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
			inverseOf: this.inverseOf?.clone(),
			equivalentProperty: this.equivalentProperty?.clone(),
			maxCount: this.maxCount,
			minCount: this.minCount,
			order: this.order,
			editor: this.editor?.clone(),
			group: this.group?.clone()
		});
	}

	static fromOldapJson(json: any): PropertyClass {
		const creator = new Iri(json?.creator);
		const created = new XsdDateTime(json.created);
		const contributor = new Iri(json.contributor);
		const modified = new XsdDateTime(json.modified);
		const projectId = new NCName(json.projectid);
		const propertyIri = new QName(json.iri);
		const type = new Set<OwlPropertyType>(
			(json?.type ?? [])
				.map((x: string) => string2OwlPropertyType(x))
				.filter((x: OwlPropertyType | undefined): x is OwlPropertyType => x !== undefined)
		);
		const appliedToProperty = json?.appliedToProperty ? new QName(json.appliedToProperty) : undefined;
		const subPropertyOf = new QName(json?.subPropertyOf);
		const toClass = new QName(json?.toClass);
		const nodeKind = new QName(json?.nodeKind);
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
		const inSet = new Set<string | number>(json?.inSet);
		const minLength = parseInt(json?.minLength);
		const maxLength = parseInt(json?.maxLength);
		const pattern = json?.pattern;
		const minExclusive = json?.minExclusive;
		const minInclusive = json?.minInclusive;
		const maxExclusive = json?.maxExclusive;
		const maxInclusive = json?.maxInclusive;
		const lessThan = new QName(json?.lessThan);
		const lessThanOrEquals = new QName(json?.lessThanOrEquals);
		const inverseOf = new QName(json?.inverseOf);
		const equivalentProperty = new QName(json?.equivalentProperty);
		const maxCount = json?.maxCount;
		const minCount = json?.minCount;
		const order = json?.order;
		const group = json?.group;
		const editor = json?.editor ? QName.createQName(json?.editor) : undefined;

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
			inverseOf: inverseOf,
			equivalentProperty: equivalentProperty,
			minCount: minCount,
			maxCount: maxCount,
			order: order,
			editor: editor,
			group: group,
		});
	}
}
