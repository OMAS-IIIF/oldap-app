import { OldapObject } from '$lib/oldap/classes/object';
import { NCName } from '$lib/oldap/datatypes/xsd_ncname';
import { LangString } from '$lib/oldap/datatypes/langstring';
import { Iri } from '$lib/oldap/datatypes/xsd_iri';


export class OldapList extends OldapObject {
	#oldapListId: NCName;
	#oldapListIri: Iri;
	#nodeClassIri: Iri;
	#nodeNamespaceIri: Iri;
	#nodePrefix: NCName;
	#prefLabel?: LangString;
	#definition?: LangString;
	nodes?: OldapListNode[];

	constructor(creator: Iri,
							created: Date,
							contributor: Iri,
							modified: Date,
							oldapListId: NCName,
							oldapListIri: Iri,
							nodeClassIri: Iri,
							nodeNamespaceIri: Iri,
							nodePrefix: NCName,
							prefLabel?: LangString,
							definition?: LangString) {
		super(creator, created, contributor, modified);
		this.#oldapListId = oldapListId;
		this.#oldapListIri = oldapListIri;
		this.#nodeClassIri = nodeClassIri;
		this.#nodeNamespaceIri = nodeNamespaceIri;
		this.#nodePrefix = nodePrefix;
		this.#prefLabel = prefLabel;
		this.#definition = definition;
	}

	get oldapListId() {
		return this.#oldapListId;
	}

	get oldapListIri(): Iri {
		return this.#oldapListIri;
	}

	get nodeNamespaceIri(): Iri {
		return this.#nodeNamespaceIri;
	}

	get nodeClassIri(): Iri {
		return this.#nodeClassIri;
	}

	get nodePrefix(): NCName {
		return this.#nodePrefix;
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
		const oldapListId = new NCName(json.oldapListId);
		const oldapListIri = new Iri(json.oldapListIri);
		const nodeClassIri = new Iri(json.nodeClassIri);
		const nodeNamespaceIri = new Iri(json.nodeNamespaceIri);
		const nodePrefix = new NCName(json.nodePrefix);
		const prefLabel = LangString.fromJson(json?.prefLabel);
		const definition = LangString.fromJson(json?.definition);
		return new OldapList(creator, created, contributor, modified, oldapListId, oldapListIri, nodeClassIri, nodeNamespaceIri, nodePrefix, prefLabel, definition);
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

export interface ApiNode {
	creator: string;
	created: string;
	contributor: string;
	modified: string;
	oldapListNodeId: string;
	prefLabel: string[];
	nodes: ApiNode[];
}
