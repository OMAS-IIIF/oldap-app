import { OldapObject } from '$lib/oldap/classes/object';
import { Iri } from '$lib/oldap/datatypes/xsd_iri';
import { LangString } from '$lib/oldap/datatypes/langstring';
import { NCName } from '$lib/oldap/datatypes/xsd_ncname';
import { PropertyClass } from '$lib/oldap/classes/property';
import { XsdDateTime } from '$lib/oldap/datatypes/xsd_datetime';
import { QName } from '$lib/oldap/datatypes/xsd_qname';

export type ResourceClassOptions = {
	creator?: Iri,
	created?: XsdDateTime,
	contributor?: Iri,
	modified?: XsdDateTime,
	projectid: NCName,
	iri: QName,
	superclass?: Set<QName>,
	label?: LangString,
	comment?: LangString,
	closed?: boolean,
	properties?: PropertyClass[]
};

export class ResourceClass extends OldapObject {
	#projectid: NCName;
	#iri: QName;
	#superclass?: Set<QName>;
	label?: LangString;
	comment?: LangString;
	closed?: boolean;
	properties?: PropertyClass[];

	constructor(options: ResourceClassOptions) {
		super(options.creator, options.created, options.contributor, options.modified);
		this.#projectid = options.projectid;
		this.#iri = options.iri;
		this.#superclass = options.superclass;
		this.label = options.label;
		this.comment = options.comment;
		this.closed = options.closed;
		this.properties = options.properties;
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
		const created = new XsdDateTime(json.created);
		const contributor = new Iri(json.contributor);
		const modified = new XsdDateTime(json.modified);
		const projectid = new NCName(json.projectid);
		const iri = new QName(json.iri);
		const superclass = new Set<QName>(json.superclass?.map((x: string) => new QName(x)));
		//const superclass = json.superclass?.map(x => new Iri(x)) //new Iri(json.superclass);
		const label = LangString.fromJson(json.label);
		const comment = LangString.fromJson(json.comment);
		const closed = json.closed;
		const properties: PropertyClass[] = []; // TODO: maybe we must make "undefined" as default value...

		if (json?.properties && json?.properties?.length > 0) {
			json.properties.forEach((prop: any) => {
				const property = PropertyClass.fromOldapJson(prop);
				properties.push(property);
			});
			properties.sort((a, b) => {
				// beide haben keine order → gleichgestellt
				if (a.order === undefined && b.order === undefined) return 0;

				// a hat keine order → nach hinten
				if (a.order === undefined) return 1;

				// b hat keine order → nach hinten
				if (b.order === undefined) return -1;

				// beide haben order → nach Zahl sortieren
				return a.order - b.order;
			});
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
			properties: properties,
		});
	}

	clone() {
		const tmp = new ResourceClass({
			creator: this.creator?.clone(),
			created:this.created?.clone(),
			contributor: this.contributor?.clone(),
			modified: this.modified?.clone(),
			projectid: this.projectid.clone(),
			iri: this.iri.clone(),
			superclass: this.superclass
				? new Set<QName>([...this.superclass]?.map((x) => x.clone()))
				: undefined,
			label: this.label?.clone(),
			comment: this.comment?.clone(),
			closed: this.closed,
			properties: this.properties?.map(x => x.clone()),
		});
		return tmp;
	}
}