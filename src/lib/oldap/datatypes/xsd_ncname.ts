import { OldapErrorInvalidValue } from '$lib/oldap/errors/OldapErrorInvalidValue';


export class NCName {
	#ncname: string;

	constructor(ncname: string) {
		if (!/^[A-Za-z_][A-Za-z0-9_.-]*$/.test(ncname)) {
			throw new OldapErrorInvalidValue('Invalid NCName format: ' + ncname);
		}
		this.#ncname = ncname
	}

	[Symbol.toPrimitive](hint: string) {
		if (hint === "string") {
			return this.toString();
		}
		return null; // Default fallback
	}

	toString() {
		return this.#ncname;
	}

	get ncname(): string {
		return this.#ncname;
	}

	clone(): NCName {
		return new NCName(this.#ncname);
	}
}
