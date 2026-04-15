import { OldapObject } from '$lib/oldap/classes/object';
import { Iri } from '$lib/oldap/datatypes/xsd_iri';
import { NCName } from '$lib/oldap/datatypes/xsd_ncname';
import { PropertyClass } from '$lib/oldap/classes/property';
import { ResourceClass } from '$lib/oldap/classes/resource';
import { ExternalOntology } from '$lib/oldap/classes/extonto';
import { XsdDateTime } from '$lib/oldap/datatypes/xsd_datetime';

export type DatamodelClassOptions = {
	creator: Iri;
	created: XsdDateTime;
	contributor: Iri;
	modified: XsdDateTime;
	projectid: NCName;
	externalOntologies: ExternalOntology[];
	annotationProperties: PropertyClass[];
	resources: ResourceClass[];
};

export class DatamodelClass extends OldapObject {
	#projectid: NCName;
	#externalOntologies: ExternalOntology[];
	#annotationProperties: PropertyClass[];
	#resouces: ResourceClass[];

	constructor(options: DatamodelClassOptions) {
		super(options.creator, options.created, options.contributor, options.modified);
		this.#projectid = options.projectid;
		this.#externalOntologies = options.externalOntologies;
		this.#annotationProperties = options.annotationProperties;
		this.#resouces = options.resources;
	}

	get projectid() {
		return this.#projectid;
	}

	get externalOntologies() {
		return this.#externalOntologies;
	}

	get annotationProperties() {
		return this.#annotationProperties;
	}

	get resources() {
		return this.#resouces;
	}

	is_annotation_property(property: PropertyClass) {
		const tmp = this.#annotationProperties.filter(p => p.propertyIri.toString() === property.propertyIri.toString());
		return tmp.length > 0;
	}

	static fromOldapJson(json: any): DatamodelClass {
		const creator = new Iri(json.creator);
		const created = new XsdDateTime(json.created);
		const contributor = new Iri(json.contributor);
		const modified = new XsdDateTime(json.modified);
		const projectid = new NCName(json.project);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		const externalOntologies = json.externalOntologies.map(ext => ExternalOntology.fromOldapJson(ext));
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		const annotationProperties = json.annotationProperties.map((prop) =>
			PropertyClass.fromOldapJson(prop)
		);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		const resources = json.resources.map(res => ResourceClass.fromOldapJson(res));
		return new DatamodelClass({
			creator: creator,
			created: created,
			contributor: contributor,
			modified: modified,
			projectid: projectid,
			externalOntologies: externalOntologies,
			annotationProperties: annotationProperties,
			resources: resources
		});
	}
}