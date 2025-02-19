import { Iri } from '$lib/oldap/datatypes/xsd_iri';

export class OldapObject {
	#creator: Iri;
	#created: Date;
	#contributor: Iri;
	#modified: Date;

	constructor(creator: Iri, created: Date, contributor: Iri, modified: Date) {
		this.#creator = creator;
		this.#created = created;
		this.#contributor = contributor;
		this.#modified = modified;
	}

	get creator() {
		return this.#creator;
	}

	get created() {
		return this.#created;
	}

	get contributor() {
		return this.#contributor;
	}

	get modified() {
		return this.#modified;
	}
}