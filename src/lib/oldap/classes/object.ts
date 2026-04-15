import { Iri } from '$lib/oldap/datatypes/xsd_iri';
import type { XsdDateTime } from '$lib/oldap/datatypes/xsd_datetime';

export class OldapObject {
	#creator?: Iri;
	#created?: XsdDateTime;
	#contributor?: Iri;
	#modified?: XsdDateTime;

	constructor(creator?: Iri, created?: XsdDateTime, contributor?: Iri, modified?: XsdDateTime) {
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