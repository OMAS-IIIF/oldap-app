import { OldapObject } from '$lib/oldap/classes/object';
import { NCName } from '$lib/oldap/datatypes/xsd_ncname';
import { LangString } from '$lib/oldap/datatypes/langstring';
import { Iri } from '$lib/oldap/datatypes/xsd_iri';

export class OldapListNode extends OldapObject {
	#listId: NCName;
	#nodeId: NCName;
	#iri: Iri;
	#prefLabel?: LangString;
	#definition?: LangString;
	nodes?: OldapListNode[];

	constructor(
		creator: Iri,
		created: Date,
		contributor: Iri,
		modified: Date,
		listId: NCName,
		nodeId: NCName,
		iri: Iri,
		prefLabel?: LangString,
		definition?: LangString
	) {
		super(creator, created, contributor, modified);
		this.#listId = listId;
		this.#nodeId = nodeId;
		this.#iri = iri;
		this.#prefLabel = prefLabel;
		this.#definition = definition;
		this.nodes = undefined;
	}

	get listId(): NCName {
		return this.#listId;
	}

	get nodeId(): NCName {
		return this.#nodeId;
	}

	get iri(): Iri {
		return this.#iri;
	}

	get prefLabel() {
		return this.#prefLabel;
	}

	get definition() {
		return this.#definition;
	}

	static fromOldapJson(json: any, oldapList: NCName): OldapListNode {
		const creator = new Iri(json.creator);
		const created = new Date(json.created);
		const contributor = new Iri(json.contributor);
		const modified = new Date(json.modified);
		const oldapListNodeId = new NCName(json.oldapListNodeId);
		const iri = new Iri(json.iri);
		const prefLabel = LangString.fromJson(json?.prefLabel);
		const definition = LangString.fromJson(json?.definition);
		const node = new OldapListNode(
			creator,
			created,
			contributor,
			modified,
			oldapList,
			oldapListNodeId,
			iri,
			prefLabel,
			definition
		);

		if (json.nodes && json.nodes.length > 0) {
			node.nodes = json.nodes.map(subnode => {
				return OldapListNode.fromOldapJson(subnode, oldapList);
			})
		}

		return node;
	}
}