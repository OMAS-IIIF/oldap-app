import { describe, expect, it } from 'vitest';

import { mediaAssetDerivativeUrl, withMediaToken } from '$lib/shared/mediaUrl';

describe('withMediaToken', () => {
	it('adds an encoded media capability token', () => {
		expect(withMediaToken('https://media.example/asset/42', 'header.payload/signature')).toBe(
			'https://media.example/asset/42?token=header.payload%2Fsignature'
		);
	});

	it('replaces an existing token instead of duplicating it', () => {
		expect(withMediaToken('https://media.example/asset/42?token=stale', 'fresh')).toBe(
			'https://media.example/asset/42?token=fresh'
		);
	});

	it('does not change public media URLs without a token', () => {
		expect(withMediaToken('https://media.example/asset/42', undefined)).toBe(
			'https://media.example/asset/42'
		);
	});
});

describe('mediaAssetDerivativeUrl', () => {
	it('preserves query parameters and adds the derivative before the media token', () => {
		expect(
			mediaAssetDerivativeUrl('https://media.example/asset/42?download=1', 'thumb256.jpg', 'jwt')
		).toBe('https://media.example/asset/42?download=1&derivative=thumb256.jpg&token=jwt');
	});
});
