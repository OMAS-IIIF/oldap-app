import { describe, expect, it } from 'vitest';
import { fulltextQueries, searchResults } from './searchResults';

describe('API search responses', () => {
	it('retains complete scalar resource IDs and normalizes property values', () => {
		expect(
			searchResults([
				{ iri: 'urn:uuid:example', resclass: 'shared:Thing', 'schema:name': ['Title@en'] }
			])
		).toEqual({ 'urn:uuid:example': { 'schema:name': ['Title@en'] } });
	});
	it('merges full-text rows for the same resource without duplicate values', () => {
		expect(
			searchResults([
				{ iri: 'urn:one', 'schema:name': 'Name' },
				{ iri: 'urn:one', 'schema:name': 'Name', 'schema:description': 'Description' },
				{ iri: 'urn:two', 'schema:name': 'Other' }
			])
		).toEqual({
			'urn:one': { 'schema:name': ['Name'], 'schema:description': ['Description'] },
			'urn:two': { 'schema:name': ['Other'] }
		});
	});
	it('accepts legacy singleton IDs and empty responses', () => {
		expect(searchResults([{ iri: ['urn:one'], 'schema:position': [2] }])).toEqual({
			'urn:one': { 'schema:position': ['2'] }
		});
		expect(searchResults([])).toEqual({});
	});
	it('uses the documented class parameter and leaves Unicode/space encoding to HTTP', () => {
		expect(fulltextQueries('chama:Book', 'Zürich & Basel', true)).toEqual({
			resClass: 'chama:Book',
			searchString: 'Zürich & Basel',
			countOnly: true
		});
	});
});
