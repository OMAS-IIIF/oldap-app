import { OldapObject } from '$lib/oldap/classes/object';
import { NCName } from '$lib/oldap/datatypes/xsd_ncname';
import { LangString } from '$lib/oldap/datatypes/langstring';
import { Iri } from '$lib/oldap/datatypes/xsd_iri';

export class OldapList extends OldapObject {
	#hlistId: NCName;
	#hlistIri: Iri;
	#nodeClassIri: Iri;
	#nodeNamespaceIri: Iri;
	#prefLabel?: LangString;
	#definition?: LangString;

	constructor(creator: Iri,
							created: Date,
							contributor: Iri,
							modified: Date,
							hlistId: NCName,
							hlistIri: Iri,
							nodeClassIri: Iri,
							prefLabel?: LangString,
							definition?: LangString) {
		super(creator, created, contributor, modified);
		this.#hlistId = hlistId;
		this.#hlistIri = hlistIri;
		this.#nodeClassIri = nodeClassIri;
		this.#prefLabel = prefLabel;
		this.#definition = definition;
	}

	get hlistId() {
		return this.#hlistId;
	}

	get nodeClassIri() {
		return this.#nodeClassIri;
	}

	get prefLabel() {
		return this.#prefLabel;
	}

	get definition() {
		return this.#definition;
	}

	static fromOldapJson(json: any): OldapList {
		const creator = new Iri(json.creator);
		const created = new Date(json.created);
		const contributor = new Iri(json.contributor);
		const modified = new Date(json.modified);
		const hlistId = new NCName(json.hlistId);
		const hlistIri = new Iri(json.hlistIri);
		const nodeClassIri = new Iri(json.nodeClassIri);
		const prefLabel = LangString.fromJson(json?.prefLabel);
		const definition = LangString.fromJson(json?.definition);
		return new OldapList(creator, created, contributor, modified, hlistId, hlistIri, nodeClassIri, prefLabel, definition);
	}
}

export class OldapListNode extends OldapObject {
	#oldapList: OldapList;
	#listNodeId: NCName;
	#label?: LangString;
	#definition?: LangString;
	#nodes: OldapListNode[];

	constructor(creator: Iri,
							created: Date,
							contributor: Iri,
							modified: Date,
							oldapList: OldapList,
							listNodeId: NCName,
							label?: LangString,
							definition?: LangString) {
		super(creator, created, contributor, modified);
		this.#oldapList = oldapList;
		this.#listNodeId = listNodeId;
		this.#label = label;
		this.#definition = definition;
		this.#nodes = [];
	}

	get oldapList() {
		return this.#oldapList;
	}

	get listNodeId() {
		return this.#listNodeId;
	}

	get label() {
		return this.#label;
	}

	get definition() {
		return this.#definition;
	}

	addNode(node: OldapListNode) {
		this.#nodes.push(node);
	}
}