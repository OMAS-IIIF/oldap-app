import md5 from 'crypto-js/md5';

export function getGravatarUrl(email: string, size: number = 200): string {
	// Convert email to lowercase and trim whitespace
	const trimmedEmail = email.trim().toLowerCase();

	// Generate MD5 hash of the email
	const hash = md5(trimmedEmail).toString();

	// Construct the Gravatar URL with optional size parameter
	return `https://www.gravatar.com/avatar/${hash}?s=${size}`;
}
