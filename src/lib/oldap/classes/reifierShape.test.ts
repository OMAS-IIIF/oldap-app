import { describe, expect, it } from 'vitest';
import { DatamodelClass } from './datamodel';
import { reifierFieldToWrite, reifierShapeFromJson, reifierShapeToWrite } from './reifierShape';

describe('named reifier shape contracts', () => {
	it('preserves complete field constraints across read and full replacement', () => {
		const field = {
			iri: 'test:value',
			subPropertyOf: 'dcterms:source',
			datatype: 'xsd:string',
			nodeKind: 'sh:Literal',
			type: ['FunctionalProperty'],
			name: ['Value@en', 'Wert@de'],
			description: ['Keep@en'],
			languageIn: ['en', 'de'],
			uniqueLang: false,
			inSet: ['one', 'two'],
			minLength: 0,
			maxLength: 10,
			pattern: '.*',
			minExclusive: 0,
			minInclusive: 0,
			maxExclusive: 2.5,
			maxInclusive: 3,
			minCount: 0,
			maxCount: 2,
			order: 0,
			group: 'test:Group',
			editor: 'dash:TextFieldEditor'
		};
		const source = {
			iri: 'test:Shape',
			created: '2026-11-17T12:00:00Z',
			properties: [
				{ ...field, projectid: 'test', creator: 'urn:creator' },
				{ iri: 'test:source', toClass: 'shared:Source', minCount: 0 }
			]
		};
		const shape = reifierShapeFromJson(source);
		expect(reifierShapeToWrite(shape)).toEqual({
			properties: [field, { iri: 'test:source', class: 'shared:Source', minCount: 0 }]
		});
		(shape.properties[0].name as string[]).push('Changed@en');
		expect(field.name).toEqual(['Value@en', 'Wert@de']);
	});

	it('retains all parents through a detached full replacement and validates each reference', () => {
		const parents = ['dc:coverage', 'dcterms:coverage', 'https://example.org/parent'];
		const field = { iri: 'test:temporal', datatype: 'xsd:string', subPropertyOf: parents };
		const shape = reifierShapeFromJson({ iri: 'test:Shape', properties: [field] });
		expect(reifierShapeToWrite(shape).properties[0].subPropertyOf).toEqual(parents);
		(shape.properties[0].subPropertyOf as string[]).push('test:parent');
		expect(parents).toHaveLength(3);
		for (const invalid of [
			['dc:coverage', ''],
			['dc:coverage', 'no prefix'],
			['dc:coverage', 'bad:local name']
		]) {
			expect(() => reifierFieldToWrite({ ...field, subPropertyOf: invalid })).toThrow();
		}
		expect(reifierFieldToWrite({ ...field, subPropertyOf: [] }).subPropertyOf).toEqual([]);
	});

	it('keeps absent optional declarations absent and explicit false/zero present', () => {
		expect(
			reifierFieldToWrite({
				iri: 'test:field',
				datatype: 'rdf:langString',
				name: 'Label@en',
				uniqueLang: false,
				minCount: 0,
				inSet: []
			})
		).toEqual({
			iri: 'test:field',
			datatype: 'rdf:langString',
			name: ['Label@en'],
			uniqueLang: false,
			minCount: 0,
			inSet: []
		});
		expect(reifierFieldToWrite({ iri: 'test:field', datatype: 'xsd:string' })).toEqual({
			iri: 'test:field',
			datatype: 'xsd:string'
		});
		expect(reifierShapeToWrite({ properties: [] })).toEqual({ properties: [] });
	});

	it('retains unsupported read constraints but refuses to erase them through replacement', () => {
		for (const extra of [
			{ inversePath: 'test:parent' },
			{ lessThan: 'test:other' },
			{ reificationRequired: false },
			{ reifierShapes: ['test:Nested'] },
			{ futureConstraint: 'keep' }
		]) {
			const field = { iri: 'test:field', datatype: 'xsd:string', ...extra };
			const shape = reifierShapeFromJson({ iri: 'test:Shape', properties: [field] });
			expect(shape.properties[0]).toEqual(field);
			expect(() => reifierShapeToWrite(shape)).toThrow('unsupported annotation field constraint');
		}
	});

	it('rejects invalid type choices, cardinalities and duplicate field identities', () => {
		for (const field of [
			{ iri: 'test:field' },
			{ iri: 'test:field', datatype: 'xsd:string', class: 'test:Thing' },
			{ iri: 'test:field', datatype: 'xsd:string', minCount: -1 },
			{ iri: 'test:field', datatype: 'xsd:string', minCount: 2, maxCount: 1 },
			{ iri: 'test:field', datatype: 'xsd:string', order: NaN }
		]) {
			expect(() => reifierFieldToWrite(field)).toThrow();
		}
		const field = { iri: 'test:field', datatype: 'xsd:string' };
		expect(() => reifierShapeToWrite({ properties: [field, field] })).toThrow('Duplicate');
	});

	it('rejects lossy numeric integer enumerations without coercing exact lexical values', () => {
		const field = { iri: 'test:amount', datatype: 'xsd:decimal', inSet: [2.5] };
		expect(reifierFieldToWrite(field).inSet).toEqual([2.5]);
		for (const datatype of ['xsd:integer', 'xsd:unsignedLong', 'xsd:positiveInteger']) {
			expect(() => reifierFieldToWrite({ ...field, datatype })).toThrow('safe integers');
			expect(() =>
				reifierFieldToWrite({ ...field, datatype, inSet: [Number.MAX_SAFE_INTEGER + 1] })
			).toThrow('safe integers');
		}
		expect(
			reifierFieldToWrite({ ...field, datatype: 'xsd:integer', inSet: [0, '9007199254740993'] })
				.inSet
		).toEqual([0, '9007199254740993']);
	});

	it('loads model-owned shapes separately and accepts older snapshots without shapes', () => {
		const model = {
			project: 'test',
			externalOntologies: [],
			annotationProperties: [],
			resources: []
		};
		expect(DatamodelClass.fromOldapJson(model).reifierShapes).toEqual([]);
		const shape = {
			iri: 'test:Shape',
			properties: [{ iri: 'test:field', datatype: 'xsd:string' }]
		};
		expect(
			DatamodelClass.fromOldapJson({ ...model, reifierShapes: [shape] }).reifierShapes
		).toEqual([shape]);
	});
});
