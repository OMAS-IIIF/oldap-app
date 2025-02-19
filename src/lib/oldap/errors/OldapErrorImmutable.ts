import { OldapError } from '$lib/oldap/errors/OldapError';

export class OldapErrorImmutable  extends OldapError {
	constructor(message: string) {
		super(message);
		this.name = this.constructor.name;

		Object.setPrototypeOf(this, OldapErrorImmutable.prototype);
	}
}
