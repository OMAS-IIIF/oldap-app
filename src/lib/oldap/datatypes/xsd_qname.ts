import { NCName } from '$lib/oldap/datatypes/xsd_ncname';
import { OldapErrorInvalidValue } from '$lib/oldap/errors/OldapErrorInvalidValue';

export class QName {
	#prefix: NCName | null = null;
	#fragment: NCName | null = null;

	constructor(prefix?: NCName | string, fragment?: NCName | string) {
		function parseNCName(value?: string): NCName | null {
			if (value === undefined || value === null) {
				return null;
			}
			try {
				return new NCName(value);
			} catch (e) {
				throw new OldapErrorInvalidValue(
					`Invalid QName format: prefix "${value}" is invalid: ${e}`
				);
			}
		}

		if (fragment === undefined) {
			if (prefix === undefined) {
				this.#prefix = null;
				this.#fragment = null;
			} else {
				if (typeof prefix !== 'string') {
					throw new OldapErrorInvalidValue(`Invalid QName format: prefix "${prefix}" is invalid:`);
				}
				const parts = prefix.split(':');
				if (parts.length != 2) {
					throw new OldapErrorInvalidValue(`Invalid QName format: "${prefix}"`);
				}
				if (parts[0] === 'http' || parts[0] === 'https' || parts[0] === 'urn') {
					throw new OldapErrorInvalidValue(
						'Invalid QName format: prefix may not be "http", "https" or "urn"'
					);
				}
				this.#prefix = parseNCName(parts[0]);
				this.#fragment = parseNCName(parts[1]);
			}
		} else {
			if (prefix instanceof NCName) {
				this.#prefix = prefix;
			} else {
				this.#prefix = parseNCName(prefix);
			}
			if (fragment instanceof NCName) {
				this.#fragment = fragment;
			}
		}
	}

	[Symbol.toPrimitive](hint: string) {
		if (hint === 'string') {
			return this.toString();
		}
		return null; // Default fallback
	}

	get prefix(): NCName | null {
		return this.#prefix;
	}

	get fragment(): NCName | null {
		return this.#fragment;
	}

	get isEmpty(): boolean {
		return this.#prefix === null;
	}

	equals(other: QName | null | undefined): boolean {
		if (!other) return false;

		const p1 = this.#prefix?.toString();
		const p2 = other.#prefix?.toString();

		const f1 = this.#fragment?.toString();
		const f2 = other.#fragment?.toString();

		return p1 === p2 && f1 === f2;
	}

	toString() {
		return this.#prefix?.toString() + ':' + this.#fragment?.toString();
	}

	static createQName(qname: string): QName {
		const parts = qname.split(':');
		if (parts.length != 2) {
			throw new OldapErrorInvalidValue(`Invalid QName format: "${qname}"`);
		}
		if (parts[0] === 'http' || parts[0] === 'https' || parts[0] === 'urn') {
			throw new OldapErrorInvalidValue(
				'Invalid QName format: prefix may not be "http", "https" or "urn"'
			);
		}
		let p: NCName;
		try {
			p = new NCName(parts[0]);
		} catch (e) {
			throw new OldapErrorInvalidValue(
				`Invalid QName format: prefix "${parts[0]}" is invalid: ${e}`
			);
		}
		let f: NCName;
		try {
			f = new NCName(parts[1]);
		} catch (e) {
			throw new OldapErrorInvalidValue(
				`Invalid QName format: fragment "${parts[1]}" is invalid: ${e}`
			);
		}
		return new QName(p, f);
	}

	clone(): QName {
		return new QName(this.#prefix?.clone(), this.#fragment?.clone());
	}
}

