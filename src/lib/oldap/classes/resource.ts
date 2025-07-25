import { OldapObject } from '$lib/oldap/classes/object';
import { Iri } from '$lib/oldap/datatypes/xsd_iri';
import { LangString } from '$lib/oldap/datatypes/langstring';

export type ResourceClassOptions = {
	creator: Iri,
	created: Date,
	contributor: Iri,
	modified: Date,
	iri: Iri,
	superclass?: Iri[],
	label?: LangString,
	comment?: LangString,
	closed?: boolean
};

export class ResourceClass extends OldapObject {
	#iri: Iri;
	#superclass?: Iri[];
	label?: LangString;
	comment?: LangString;
	closed?: boolean;

	constructor(options: ResourceClassOptions) {
		super(options.creator, options.created, options.contributor, options.modified);
		this.#iri = options.iri;
		this.#superclass = options.superclass;
		this.label = options.label;
		this.comment = options.comment;
		this.closed = options.closed;
	}

	get iri() {
		return this.#iri;
	}

	get superclass() {
		return this.#superclass;
	}

	static fromOldapJson(json: any): ResourceClass {
		const creator = new Iri(json.creator);
		const created = new Date(json.created);
		const contributor = new Iri(json.contributor);
		const modified = new Date(json.modified);
		const iri = new Iri(json.iri);
		const superclass = json.superclass?.map(x => new Iri(x)) //new Iri(json.superclass);
		const label = LangString.fromJson(json.label);
		const comment = LangString.fromJson(json.comment);
		const closed = json.closed;
		return new ResourceClass({
			creator: creator,
			created: created,
			contributor: contributor,
			modified: modified,
			iri: iri,
			superclass: superclass,
			label: label,
			comment: comment,
			closed: closed,
		});
	}
}