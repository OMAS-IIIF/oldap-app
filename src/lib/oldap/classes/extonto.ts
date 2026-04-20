import { OldapObject } from '$lib/oldap/classes/object';
import { NCName } from '$lib/oldap/datatypes/xsd_ncname';
import { Iri } from '$lib/oldap/datatypes/xsd_iri';
import { LangString } from '$lib/oldap/datatypes/langstring';
import { XsdDateTime } from '$lib/oldap/datatypes/xsd_datetime';

export class ExternalOntology extends OldapObject {
	#prefix: NCName;
	#namespaceIri: Iri;
	label?: LangString;
	comment?: LangString;
	proposedResourceClass?: NCName[];
	proposedDatatypePropertyClass?: NCName[];
	proposedObjectPropertyClass?: NCName[];

	constructor(
		creator: Iri,
		created: XsdDateTime,
		contributor: Iri,
		modified: XsdDateTime,
		prefix: NCName,
		namespaceIri: Iri,
		label?: LangString,
		comment?: LangString,
		proposedResourceClass?: NCName[],
		proposedDatatypePropertyClass?: NCName[],
		proposedObjectPropertyClass?: NCName[]
	) {
		super(creator, created, contributor, modified);
		this.#prefix = prefix;
		this.#namespaceIri = namespaceIri;
		this.label = label;
		this.comment = comment;
		this.proposedResourceClass = proposedResourceClass;
		this.proposedDatatypePropertyClass = proposedDatatypePropertyClass;
		this.proposedObjectPropertyClass = proposedObjectPropertyClass;
	}

	get prefix() {
		return this.#prefix;
	}

	get namespaceIri() {
		return this.#namespaceIri;
	}

	static fromOldapJson(json: any): ExternalOntology {
		const creator = new Iri(json.creator);
		const created = new XsdDateTime(json.created);
		const contributor = new Iri(json.contributor);
		const modified = new XsdDateTime(json.modified);
		const prefix = new NCName(json.prefix);
		const namespaceIri = new Iri(json.namespaceIri);
		const label = LangString.fromJson(json?.label);
		const comment = LangString.fromJson(json?.comment);
		const proposedResourceClass = json?.proposedResourceClass ? json.proposedResourceClass.map(x => new NCName(x)) : undefined;
		const proposedDatatypePropertyClass = json?.proposedDatatypePropertyClass ? json.proposedDatatypePropertyClass.map(x => new NCName(x)) : undefined;
		const proposedObjectPropertyClass = json?.proposedObjectPropertyClass ? json.proposedObjectPropertyClass.map(x => new NCName(x)) : undefined;

		return new ExternalOntology(
			creator,
			created,
			contributor,
			modified,
			prefix,
			namespaceIri,
			label,
			comment,
			proposedResourceClass,
			proposedDatatypePropertyClass,
			proposedObjectPropertyClass,
		);
	}
}