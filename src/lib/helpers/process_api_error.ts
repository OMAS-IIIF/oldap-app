import axios from 'axios';
import { OldapError } from '#lib/oldap/errors/OldapError.ts';
import { OldapErrorApiFailure } from '#lib/oldap/errors/OldapErrorApiFailure.ts';



export function process_api_error(error: Error): OldapError {
	if (axios.isAxiosError(error)) {
		let message = `${error.message} (${error.code})`;
		if (error.response) {
			message += `: ${error.response?.data?.message as string}`
		}
		return new OldapErrorApiFailure(message, error.code, error.response?.statusText, error.response?.status);
	}
	return new OldapError(error.message);
}