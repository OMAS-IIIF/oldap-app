import { defineEnvVars } from '@sveltejs/kit/env';

/** Public runtime origins. API resolution validates required values when used. */
export const variables = defineEnvVars({
	PUBLIC_API_URL: {
		public: true,
		schema: (value: string | undefined) => value,
		description: 'OLDAP API origin reachable from the browser.'
	},
	PUBLIC_MEDIASERVER_URL: {
		public: true,
		schema: (value: string | undefined) => value,
		description: 'Optional media service origin used for upload and asset operations.'
	}
});
