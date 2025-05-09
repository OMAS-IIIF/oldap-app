import { OldapObject } from '$lib/oldap/classes/object';
import { NCName } from '$lib/oldap/datatypes/xsd_ncname';
import { LangString } from '$lib/oldap/datatypes/langstring';
import { Iri } from '$lib/oldap/datatypes/xsd_iri';
import { OldapList } from '$lib/oldap/classes/list';

export class OldapListNode extends OldapObject {
	#oldapList: OldapList;
	#listNodeId: NCName;
	#label?: LangString;
	#definition?: LangString;
	#nodes: OldapListNode[];

	constructor(
		creator: Iri,
		created: Date,
		contributor: Iri,
		modified: Date,
		oldapList: OldapList,
		listNodeId: NCName,
		label?: LangString,
		definition?: LangString
	) {
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