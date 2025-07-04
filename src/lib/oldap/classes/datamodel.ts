import { OldapObject } from '$lib/oldap/classes/object';
import { Iri } from '$lib/oldap/datatypes/xsd_iri';
import { NCName } from '$lib/oldap/datatypes/xsd_ncname';
import { PropertyClass } from '$lib/oldap/classes/property';
import { ResourceClass } from '$lib/oldap/classes/resource';

export type DatamodelClassOptions = {
	creator: Iri,
	created: Date,
	contributor: Iri,
	modified: Date,
	projectid: NCName,
	standaloneProperties: PropertyClass[],
	resouces: ResourceClass[]
}

export class DatamodelClass extends OldapObject {
	#projectid: NCName;
	#standaloneProperties: PropertyClass[];
	#resouces: ResourceClass[];

	constructor(options: DatamodelClassOptions) {
		super(options.creator, options.created, options.contributor, options.modified);
		this.#projectid = options.projectid;
		this.#standaloneProperties = options.standaloneProperties;
		this.#resouces = options.resouces;
	}

	get projectid() {
		return this.#projectid;
	}

	get standaloneProperties() {
		return this.#standaloneProperties;
	}

	get resouces() {
		return this.#resouces;
	}

	static fromOldapJson(json: any): DatamodelClass {
		const creator = new Iri(json.creator);
		const created = new Date(json.created);
		const contributor = new Iri(json.contributor);
		const modified = new Date(json.modified);
		const projectid = new NCName(json.project);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		const standaloneProperties = json.standaloneProperties.map(prop => PropertyClass.fromOldapJson(prop));
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		const resources = json.resources.map(res => ResourceClass.fromOldapJson(res));
		return new DatamodelClass({
			creator: creator,
			created: created,
			contributor: contributor,
			modified: modified,
			projectid: projectid,
			standaloneProperties: standaloneProperties,
			resouces: resources
		});
	}
}