import {
	currentAuthInfo,
	expireAuthenticatedSession,
	hasRefreshableSession,
	refreshAccessToken
} from '$lib/auth/accessToken';

export type AuthenticatedXhrOptions = {
	initialToken: string;
	headers?: Record<string, string>;
	onProgress?: (event: ProgressEvent<EventTarget>) => void;
	networkErrorMessage: string;
	abortErrorMessage: string;
};

/** Send an authenticated XHR upload and retry it once after a coordinated refresh. */
export function authenticatedXhrUpload(
	url: string,
	body: FormData,
	options: AuthenticatedXhrOptions
): Promise<XMLHttpRequest> {
	const send = (retried: boolean): Promise<XMLHttpRequest> =>
		new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.open('POST', url);
			Object.entries(options.headers ?? {}).forEach(([name, value]) =>
				xhr.setRequestHeader(name, value)
			);
			xhr.setRequestHeader(
				'Authorization',
				`Bearer ${currentAuthInfo()?.token ?? options.initialToken}`
			);
			if (options.onProgress) xhr.upload.onprogress = options.onProgress;
			xhr.onerror = () => reject(new Error(options.networkErrorMessage));
			xhr.onabort = () => reject(new Error(options.abortErrorMessage));
			xhr.onload = () => {
				if (xhr.status !== 401 || retried || !hasRefreshableSession()) {
					resolve(xhr);
					return;
				}

				void refreshAccessToken().then(
					() => send(true).then(resolve, reject),
					() => {
						expireAuthenticatedSession();
						resolve(xhr);
					}
				);
			};
			xhr.send(body);
		});

	return send(false);
}
