import { NCName } from '$lib/oldap/datatypes/xsd_ncname';
import { OldapErrorInvalidValue } from '$lib/oldap/errors/OldapErrorInvalidValue';

export class QName {
	#prefix: NCName
	#fragment: NCName

	constructor(prefix: NCName, fragment: NCName) {
		this.#prefix = prefix;
		this.#fragment = fragment;
	}

	[Symbol.toPrimitive](hint: string) {
		if (hint === "string") {
			return this.toString();
		}
		return null; // Default fallback
	}

	get prefix(): NCName {
		return this.#prefix;
	}

	get fragment(): NCName {
		return this.#fragment;
	}


	toString() {
		return this.#prefix.toString() + ':' + this.#fragment.toString();
	}

	static createQName(qname: string): QName {
		const parts = qname.split(':')
		if (parts.length != 2) {
			throw new OldapErrorInvalidValue(`Invalid QName format: "${qname}"`)
		}
		if (parts[0] === 'http' || parts[0] === 'https' || parts[0] === 'urn') {
			throw new OldapErrorInvalidValue("Invalid QName format: prefix may not be \"http\", \"https\" or \"urn\"")
		}
		let p: NCName;
		try {
			p = new NCName(parts[0]);
		}
		catch (e) {
			throw new OldapErrorInvalidValue(`Invalid QName format: prefix "${parts[0]}" is invalid: ${e}`)
		}
		let f: NCName;
		try {
			f = new NCName(parts[1]);
		}
		catch (e) {
			throw new OldapErrorInvalidValue(`Invalid QName format: fragment "${parts[1]}" is invalid: ${e}`)
		}
		return new QName(p, f);
	}

	clone(): QName {
		return new QName(this.#prefix.clone(), this.#fragment.clone());
	}
}

