import { OldapObject } from '$lib/oldap/classes/object';
import { NCName } from '$lib/oldap/datatypes/xsd_ncname';
import { Iri } from '$lib/oldap/datatypes/xsd_iri';
import { LangString } from '$lib/oldap/datatypes/langstring';

export class ExternalOntology extends OldapObject {
	#prefix: NCName;
	#namespaceIri: Iri;
	label?: LangString;
	comment?: LangString;

	constructor(creator: Iri,
							created: Date,
							contributor: Iri,
							modified: Date,
							prefix: NCName,
							namespaceIri: Iri,
							label?: LangString,
							comment?: LangString) {
		super(creator, created, contributor, modified);
		this.#prefix = prefix;
		this.#namespaceIri = namespaceIri;
		this.label = label;
		this.comment = comment;
	}

	get prefix() {
		return this.#prefix;
	}

	get namespaceIri() {
		return this.#namespaceIri;
	}

	static fromOldapJson(json: any): ExternalOntology {
		const creator = new Iri(json.creator);
		const created = new Date(json.created);
		const contributor = new Iri(json.contributor);
		const modified = new Date(json.modified);
		const prefix = new NCName(json.prefix);
		const namespaceIri = new Iri(json.namespaceIri);
		const label = LangString.fromJson(json?.label);
		const comment = LangString.fromJson(json?.comment);

		return new ExternalOntology(
			creator, created, contributor, modified, prefix,
			namespaceIri, label, comment
		);
	}


}