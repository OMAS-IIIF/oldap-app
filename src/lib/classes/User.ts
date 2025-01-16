export class User {
	#userid: string | null;
	#givenName: string | null;
	#familyName: string | null;
	#email: string | null;
	#token: string | null;

	constructor(userid: string | null = null,
							givenName: string | null = null,
							familyName: string | null = null,
							email: string | null = null,
							token: string | null = null) {
		this.#userid = userid;
		this.#givenName = givenName;
		this.#familyName = familyName;
		this.#email = email;
		this.#token = token;
	}

	get token() {
		return this.#token;
	}

	get userid() {
		return this.#userid;
	}

	get givenName() {
		return this.#givenName;
	}

	get familyName() {
		return this.#familyName;
	}

	get email() {
		return this.#email;
	}
}