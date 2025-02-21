import { error } from '@sveltejs/kit';



export class AuthInfo {
	userid: string;
	token: string;

	constructor(userid: string, token: string) {
		this.userid = userid;
		this.token = token;
	}

	toString(): string {
		return JSON.stringify(this)
	}

	static fromString(json_data?: string | null): AuthInfo {
		try {
			const tmp = JSON.parse(json_data || '');
			return new AuthInfo(tmp.userid, tmp.token);
		}
		catch(err) {
			throw error(400, {message: `Could not parse auth info: ${err}`});
		}
	}

}