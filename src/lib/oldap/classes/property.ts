import { OldapObject } from '$lib/oldap/classes/object';
import { Iri } from '$lib/oldap/datatypes/xsd_iri';
import { xsdDatatypeFromString, XsdDatatypes } from '$lib/oldap/enums/xsd_datatypes';
import { LangString } from '$lib/oldap/datatypes/langstring';
import { convertToLanguage, Language } from '$lib/oldap/enums/language';
import { NCName } from '$lib/oldap/datatypes/xsd_ncname';
import { DataPermission } from '$lib/oldap/enums/data_permissions';
import { QName } from '$lib/oldap/datatypes/xsd_qname';

export enum OwlPropertyType {
	OwlDataProperty = 'owl:DatatypeProperty',
	OwlObjectProperty = 'owl:ObjectProperty',
	StatementProperty = 'rdf:Property',
	TransitiveProperty = 'owl:TransitiveProperty',
	SymmetricProperty = 'owl:SymmetricProperty',
	ReflexiveProperty = 'owl:ReflexiveProperty',
	IrreflexiveProperty = 'owl:IrreflexiveProperty',
	FunctionalProperty = 'owl:FunctionalProperty',
	InverseFunctionalProperty = 'owl:InverseFunctionalProperty',
}

export function stringToOwlPropertyType(value: string): OwlPropertyType | undefined {
	return Object.entries(DataPermission).find(([_, v]) => v === value)?.[1] as OwlPropertyType | undefined;
}

export function owlPropertyTypeAsString(value: OwlPropertyType) {
	const name = Object.keys(OwlPropertyType).find(
		key => OwlPropertyType[key as keyof typeof OwlPropertyType] === value
	);
	return name;
}

export type PropertyClassOptions = {
	projectId: NCName;
	propertyIri: Iri;
	ptype: Set<OwlPropertyType>;
	creator: Iri,
	created: Date,
	contributor: Iri,
	modified: Date,
	subPropertyOf?: Iri;
	toClass?: Iri;
	datatype?: XsdDatatypes;
	name?: LangString;
	description?: LangString;
	languageIn?: Set<Language>;
	uniqueLang?: boolean;
	inSet?: Set<string|number>
	minLength?: number;
	maxLength?: number;
	pattern?: string;
	minExclusive?: number;
	minInclusive?: number;
	maxExclusive?: number;
	maxInclusive?: number;
	lessThan?: Iri;
	lessThanOrEquals?: Iri;
	inverseOf?: Iri;
	equivalentProperty?: Iri;
	editor?: QName;
}

export class PropertyClass extends OldapObject {
	#projectId: NCName;
	#propertyIri: Iri;
	ptype: Set<OwlPropertyType>;
	subPropertyOf?: Iri;
	toClass?: Iri;
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
	lessThan?: Iri;
	lessThanOrEquals?: Iri;
	inverseOf?: Iri;
	equivalentProperty?: Iri;
	editor?: QName;


	constructor({
								creator, created, contributor, modified, projectId, propertyIri, ptype, subPropertyOf, toClass, datatype,
								name, description, languageIn, uniqueLang, inSet, minLength, maxLength, pattern,
								minExclusive, minInclusive, maxExclusive, maxInclusive, lessThan, lessThanOrEquals,
								inverseOf, equivalentProperty, editor
							}: PropertyClassOptions) {
		super(creator, created, contributor, modified);
		this.#projectId = projectId;
		this.#propertyIri = propertyIri;
		this.ptype = ptype;
		this.subPropertyOf = subPropertyOf;
		this.toClass = toClass;
		this.datatype = datatype;
		this.name = name;
		this.description = description;
		this.languageIn = languageIn;
		this.uniqueLang = uniqueLang;
		this.inSet = inSet;
		this.minLength = minLength;
		this.maxLength = maxLength;
		this.pattern = pattern;
		this.minExclusive = minExclusive;
		this.minInclusive = minInclusive;
		this.maxExclusive = maxExclusive;
		this.maxInclusive = maxInclusive;
		this.lessThan = lessThan;
		this.lessThanOrEquals = lessThanOrEquals;
		this.inverseOf = inverseOf;
		this.equivalentProperty = equivalentProperty;
		this.editor = editor;
	}

	get projectId(): NCName {
		return this.#projectId;
	}

	get propertyIri(): Iri {
		return this.#propertyIri;
	}

	clone(): PropertyClass {
		return new PropertyClass({
			creator: this.creator.clone(),
			created: new Date(this.created.getTime()),
			contributor: this.contributor.clone(),
			modified: new Date(this.modified.getTime()),
			projectId: this.projectId.clone(),
			propertyIri: this.propertyIri.clone(),
			ptype: this.ptype,
			subPropertyOf: this.subPropertyOf?.clone(),
			toClass: this.toClass?.clone(),
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
			editor: this.editor?.clone(),
		})
	}

	static fromOldapJson(json: any): PropertyClass {
		const creator = new Iri(json.creator);
		const created = new Date(json.created);
		const contributor = new Iri(json.contributor);
		const modified = new Date(json.modified);
		const projectId = new NCName(json.projectid);
		const propertyIri = new Iri(json.iri);
		const ptype = new Set<OwlPropertyType>(json?.ptype?.map((x) => stringToOwlPropertyType(x))); // TODO !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		const subPropertyOf: Iri = new Iri(json?.subPropertyOf);
		const toClass = new Iri(json?.toClass);
		const datatype = xsdDatatypeFromString(json?.datatype);
		const name = LangString.fromJson(json?.name);
		const description = LangString.fromJson(json?.description);
		const languageIn = json?.languageIn ? new Set<Language>(json.languageIn.map((x) => convertToLanguage(x))) : undefined;
		const uniqueLang = json?.uniqueLang;
		const inSet = new Set<string | number>(json?.inSet);
		const minLength = parseInt(json?.minLength);
		const maxLength = parseInt(json?.maxLength);
		const pattern = json?.pattern;
		const minExclusive = json?.minExclusive;
		const minInclusive = json?.minInclusive;
		const maxExclusive = json?.maxExclusive;
		const maxInclusive = json?.maxInclusive;
		const lessThan = new Iri(json?.lessThan);
		const lessThanOrEquals = new Iri(json?.lessThanOrEquals);
		const inverseOf = new Iri(json?.inverseOf);
		const equivalentProperty = json?.equivalentProperty;
		const editor = json?.editor ? QName.createQName(json?.editor) : undefined;

		return new PropertyClass({
			creator: creator,
			created: created,
			contributor: contributor,
			modified: modified,
			projectId: projectId,
			propertyIri: propertyIri,
			ptype: ptype, // TODO: !!!!!!!!!!!!!!!!!!!!!!!!!!
			subPropertyOf: subPropertyOf,
			toClass: toClass,
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
			editor: editor,
		});

	}
}