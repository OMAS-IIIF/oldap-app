import { OldapObject } from '$lib/oldap/classes/object';
import { NCName } from '$lib/oldap/datatypes/xsd_ncname';
import { LangString } from '$lib/oldap/datatypes/langstring';
import { Iri } from '$lib/oldap/datatypes/xsd_iri';
import { OldapListNode } from '$lib/oldap/classes/listnode';

export class OldapList extends OldapObject {
	#oldapListId: NCName;
	#iri: Iri;
	#nodeClassIri: Iri;
	#nodeNamespaceIri: Iri;
	#nodePrefix: NCName;
	#prefLabel?: LangString;
	#definition?: LangString;
	nodes?: OldapListNode[];

	constructor(
		creator: Iri,
		created: Date,
		contributor: Iri,
		modified: Date,
		oldapListId: NCName,
		iri: Iri,
		nodeClassIri: Iri,
		nodeNamespaceIri: Iri,
		nodePrefix: NCName,
		prefLabel?: LangString,
		definition?: LangString
	) {
		super(creator, created, contributor, modified);
		this.#oldapListId = oldapListId;
		this.#iri = iri;
		this.#nodeClassIri = nodeClassIri;
		this.#nodeNamespaceIri = nodeNamespaceIri;
		this.#nodePrefix = nodePrefix;
		this.#prefLabel = prefLabel;
		this.#definition = definition;
		this.nodes = undefined;
	}

	get oldapListId() {
		return this.#oldapListId;
	}

	get iri(): Iri {
		return this.#iri;
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

	static fromOldapJson(json: any, list_only: boolean = false): OldapList {
		const creator = new Iri(json.creator);
		const created = new Date(json.created);
		const contributor = new Iri(json.contributor);
		const modified = new Date(json.modified);
		const oldapListId = new NCName(json.oldapListId);
		const iri = new Iri(json.iri);
		const nodeClassIri = new Iri(json.nodeClassIri);
		const nodeNamespaceIri = new Iri(json.nodeNamespaceIri);
		const nodePrefix = new NCName(json.nodePrefix);
		const prefLabel = LangString.fromJson(json?.prefLabel);
		const definition = LangString.fromJson(json?.definition);
		const hlist =  new OldapList(
			creator,
			created,
			contributor,
			modified,
			oldapListId,
			iri,
			nodeClassIri,
			nodeNamespaceIri,
			nodePrefix,
			prefLabel,
			definition
		);
		if (list_only) {
			return hlist;
		}
		if (json.nodes && json.nodes.length > 0) {
			hlist.nodes = json.nodes.map(node => {
				console.log("=====>", json.hlist);
				return OldapListNode.fromOldapJson(node, json.hlist);
			})
		}
		return hlist;
	}
}

