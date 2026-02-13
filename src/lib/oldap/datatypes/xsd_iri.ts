// Define a branded type for IRI
//export type Iri = string & { __type: 'Iri' };

// Regular expression for basic IRI validation (can be expanded for stricter rules)

import { QName } from '$lib/oldap/datatypes/xsd_qname';
import { NCName } from '$lib/oldap/datatypes/xsd_ncname';
import { OldapErrorInvalidValue } from '$lib/oldap/errors/OldapErrorInvalidValue';

export class Iri {
	#iri: string | QName | null = null;
	#representation: 'FULL' | 'QNAME' | null = null;

	constructor(iri?: string);
	constructor(qname: QName);
	constructor(prefix: string, fragment: string);
	constructor(prefix: NCName, fragment: NCName);
	constructor(iri?: string | QName | NCName, fragment?: string | NCName) {
		if (iri === undefined) {
			this.#iri = null;
		} else if (typeof iri === 'string' && fragment === undefined) {
			const parts = iri.split(':');
			if (parts[0] === 'http' || parts[0] === 'https' || parts[0] === 'urn') {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const parsed = new URL(iri);
				this.#iri = iri;
				this.#representation = 'FULL';
			} else {
				if (parts.length != 2) {
					throw new OldapErrorInvalidValue(`Invalid IRI format: "${iri}"`);
				}
				this.#iri = iri;
				this.#representation = 'QNAME';
			}
		} else if (iri instanceof QName && fragment === undefined) {
			this.#iri = iri;
			this.#representation = 'QNAME';
		} else if (typeof iri === 'string' && typeof fragment === 'string') {
			const p = new NCName(iri);
			const f = new NCName(fragment);
			this.#iri = new QName(p, f);
			this.#representation = 'QNAME';
		} else if (iri instanceof NCName && fragment instanceof NCName) {
			this.#iri = new QName(iri, fragment);
			this.#representation = 'QNAME';
		} else {
			throw new Error('Invalid IRI format: iri=' + iri + ' fragment=' + fragment);
		}
	}

	[Symbol.toPrimitive](hint: string) {
		if (hint === 'string') {
			return this.toString();
		}
		return null; // Default fallback
	}

	toString(): string {
		if (typeof this.#iri === 'string') {
			return this.#iri;
		} else {
			return this.#iri?.toString() ?? '';
		}
	}

	get iri() {
		return this.#iri;
	}

	get prefix(): NCName | undefined {
		if (this.#representation === 'QNAME') {
			const tmp = this.#iri as QName;
			return tmp.prefix;
		} else {
			return undefined;
		}
	}

	get fragment(): NCName | undefined {
		if (this.#representation === 'QNAME') {
			const tmp = this.#iri as QName;
			return tmp.fragment;
		} else {
			return undefined;
		}
	}

	get representation() {
		return this.#representation;
	}

	clone(): Iri {
		if (this.#representation === 'QNAME') {
			return new Iri(this.#iri as QName);
		} else if (this.#representation === 'FULL') {
			return new Iri(this.#iri as string);
		} else {
			return new Iri();
		}
	}
}
