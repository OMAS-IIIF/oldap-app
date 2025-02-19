import { OldapError } from '$lib/oldap/errors/OldapError';

export class OldapErrorApiFailure  extends OldapError {
	constructor(message: string) {
		super(message);
		this.name = this.constructor.name;

		Object.setPrototypeOf(this, OldapErrorApiFailure.prototype);
	}
}
