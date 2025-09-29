import { createApiClient } from '$lib/apischema/zod';
import { dev } from '$app/environment';

export const apiUrl = dev ? import.meta.env.VITE_API_DEV_URL : import.meta.env.VITE_API_PROD_URL;

//export const apiClient = createApiClient(apiUrl);


type ApiClient = ReturnType<typeof createApiClient>;

let clientPromise: Promise<ApiClient> | null = null;

async function getClient(): Promise<ApiClient> {
	if (!clientPromise) {
		clientPromise = fetch('/config.json')
			.then((res) => {
				if (!res.ok) throw new Error(`Failed to load config.json: ${res.status}`);
				return res.json();
			})
			.then((config) => createApiClient(config.apiUrl));
	}
	return clientPromise;
}

type AsyncApiClient = {
	[K in keyof ApiClient]: ApiClient[K] extends (...args: infer A) => infer R
		? (...args: A) => Promise<Awaited<R>>
		: never;
};

export const apiClient: AsyncApiClient = new Proxy({} as any, {
	get(_, prop: string) {
		return async (...args: any[]) => {
			const client = await getClient();
			const fn = (client as any)[prop];
			if (typeof fn !== 'function') {
				throw new Error(`${prop} is not a function on ApiClient`);
			}
			return fn(...args);
		};
	}
});