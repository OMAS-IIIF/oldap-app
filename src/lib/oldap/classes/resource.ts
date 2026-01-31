import { OldapObject } from '$lib/oldap/classes/object';
import { Iri } from '$lib/oldap/datatypes/xsd_iri';
import { LangString } from '$lib/oldap/datatypes/langstring';
import { NCName } from '$lib/oldap/datatypes/xsd_ncname';
import { PropertyClass } from '$lib/oldap/classes/property';

export interface HasProperty {
	maxCount?: number
	minCount?: number;
	order?: number;
	editor?: string;
	property: PropertyClass;
}

export type ResourceClassOptions = {
	creator: Iri,
	created: Date,
	contributor: Iri,
	modified: Date,
	projectid: NCName,
	iri: Iri,
	superclass?: Set<Iri>,
	label?: LangString,
	comment?: LangString,
	closed?: boolean,
	hasProperty?: HasProperty[]
};

export class ResourceClass extends OldapObject {
	#projectid: NCName;
	#iri: Iri;
	#superclass?: Set<Iri>;
	label?: LangString;
	comment?: LangString;
	closed?: boolean;
	hasProperty?: HasProperty[];

	constructor(options: ResourceClassOptions) {
		super(options.creator, options.created, options.contributor, options.modified);
		this.#projectid = options.projectid;
		this.#iri = options.iri;
		this.#superclass = options.superclass;
		this.label = options.label;
		this.comment = options.comment;
		this.closed = options.closed;
		this.hasProperty = options.hasProperty;
	}

	get projectid() {
		return this.#projectid;
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
		const projectid = new NCName(json.projectid);
		const iri = new Iri(json.iri);
		const superclass = new Set<Iri>(json.superclass?.map((x: string) => new Iri(x)))
		//const superclass = json.superclass?.map(x => new Iri(x)) //new Iri(json.superclass);
		const label = LangString.fromJson(json.label);
		const comment = LangString.fromJson(json.comment);
		const closed = json.closed;
		let hasProperty: HasProperty[] = []; // TODO: maybe we must make "undefined" as default value...
		if (json?.hasProperty && json?.hasProperty?.length > 0) {
			const hps: HasProperty[] = [];
			for (const tmphp of json.hasProperty) {
				const hp: HasProperty = {} as HasProperty;
				if (tmphp?.minCount) hp.minCount = parseInt(tmphp.minCount);
				if (tmphp?.maxCount) hp.maxCount = parseInt(tmphp.maxCount);
				if (tmphp?.order)	hp.order = parseFloat(tmphp.order);
				if (tmphp?.editor) hp.editor = tmphp.editor;
				tmphp.property = PropertyClass.fromOldapJson(tmphp.property);
				hp.property = tmphp.property;
				hps.push(hp)
			}
			hps.sort((a, b) => {
				// beide haben keine order → gleichgestellt
				if (a.order === undefined && b.order === undefined) return 0

				// a hat keine order → nach hinten
				if (a.order === undefined) return 1

				// b hat keine order → nach hinten
				if (b.order === undefined) return -1

				// beide haben order → nach Zahl sortieren
				return a.order - b.order
			});
			hasProperty = hps;
		}
		return new ResourceClass({
			creator: creator,
			created: created,
			contributor: contributor,
			modified: modified,
			projectid: projectid,
			iri: iri,
			superclass: superclass,
			label: label,
			comment: comment,
			closed: closed,
			hasProperty: hasProperty,
		});
	}

	clone() {
		const tmp = new ResourceClass({
			creator: this.creator.clone(),
			created: new Date(this.created.getTime()),
			contributor: this.contributor.clone(),
			modified: new Date(this.modified.getTime()),
			projectid: this.projectid.clone(),
			iri: this.iri.clone(),
			superclass: this.superclass ? new Set<Iri>([...this.superclass]?.map(x => x.clone())) : undefined,
			label: this.label?.clone(),
			comment: this.comment?.clone(),
			closed: this.closed,
			hasProperty: this.hasProperty?.map(x => {
				return {
					property: x.property.clone(),
					minCount: x.minCount,
					maxCount: x.maxCount,
					order: x.order,
					editor: x.editor,
				}
			})
		});
		return tmp;
	}
}