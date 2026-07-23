export type RefreshRetryOptions<T> = {
	request: () => Promise<T>;
	isUnauthorized: (result: T) => boolean;
	canRefresh: () => boolean;
	refresh: () => Promise<unknown>;
	onRefreshFailure: () => void;
};

/** Execute a request and retry it no more than once after a successful refresh. */
export async function retryOnceAfterUnauthorized<T>(options: RefreshRetryOptions<T>): Promise<T> {
	const firstResult = await options.request();
	if (!options.isUnauthorized(firstResult) || !options.canRefresh()) return firstResult;

	try {
		await options.refresh();
	} catch {
		options.onRefreshFailure();
		return firstResult;
	}

	return options.request();
}
