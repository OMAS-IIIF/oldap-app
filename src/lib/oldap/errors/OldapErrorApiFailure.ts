import { OldapError } from '$lib/oldap/errors/OldapError';

export class OldapErrorApiFailure  extends OldapError {
	name: string;
	code?: string;
	statusText?: string;
	statusNumber?: number;

	constructor(message: string, code? : string, statusText?: string, statusNumber?: number) {
		super(message);
		this.name = this.constructor.name;
		this.code = code;
		this.statusText = statusText;
		this.statusNumber = statusNumber;

		Object.setPrototypeOf(this, OldapErrorApiFailure.prototype);
	}
}
