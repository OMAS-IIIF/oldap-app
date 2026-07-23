/**
 * Append the short-lived media capability JWT expected by protected media endpoints.
 *
 * Media JWTs belong in the `token` query parameter because browser-managed image,
 * video, and IIIF requests cannot reliably attach an Authorization header.
 */
export function withMediaToken(url: string, mediaToken?: string | null): string {
	const cleanToken = mediaToken?.trim();
	if (!cleanToken) return url;

	const parsed = new URL(url);
	parsed.searchParams.set('token', cleanToken);
	return parsed.toString();
}

/** Build the URL for a named derivative while preserving the media capability JWT. */
export function mediaAssetDerivativeUrl(
	assetUrl: string,
	derivativeName: string,
	mediaToken?: string | null
): string {
	const parsed = new URL(assetUrl);
	parsed.searchParams.set('derivative', derivativeName);
	return withMediaToken(parsed.toString(), mediaToken);
}
