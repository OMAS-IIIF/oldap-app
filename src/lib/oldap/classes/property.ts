import { OldapObject } from '$lib/oldap/classes/object';
import { Iri } from '$lib/oldap/datatypes/xsd_iri';
import { xsdDatatypeFromString, XsdDatatypes } from '$lib/oldap/enums/xsd_datatypes';
import { LangString } from '$lib/oldap/datatypes/langstring';
import { convertToLanguage, Language } from '$lib/oldap/enums/language';

export type PropertyClassOptions = {
	propertyIri: Iri;
	creator: Iri,
	created: Date,
	contributor: Iri,
	modified: Date,
	subPropertyOf?: Iri;
	toClass?: Iri;
	datatype?: XsdDatatypes;
	name?: LangString;
	description?: LangString;
	languageIn: Set<Language>;
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
}

export class PropertyClass extends OldapObject {
	#propertyIri: Iri
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

	constructor({
								propertyIri, creator, created, contributor, modified, subPropertyOf, toClass, datatype,
								name, description, languageIn, uniqueLang, inSet, minLength, maxLength, pattern,
								minExclusive, minInclusive, maxExclusive, maxInclusive, lessThan, lessThanOrEquals
							}: PropertyClassOptions) {
		super(creator, created, contributor, modified);
		this.#propertyIri = propertyIri;
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
	}

	get propertyIri() {
		return this.#propertyIri;
	}

	static fromOldapJson(json: any): PropertyClass {
		const creator = new Iri(json.creator);
		const created = new Date(json.created);
		const contributor = new Iri(json.contributor);
		const modified = new Date(json.modified);
		const propertyIri = new Iri(json.iri);
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

		return new PropertyClass({
			creator: creator,
			created: created,
			contributor: contributor,
			modified: modified,
			propertyIri: propertyIri,
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
			lessThanOrEquals: lessThanOrEquals
		});

	}
}