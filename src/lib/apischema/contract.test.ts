import { expect, it } from 'vitest';
import * as schemas from './generated/zod.gen';

it('retains flat property patches, including zero, null and false', () => {
	const patch = {
		name: ['Title@en'],
		minCount: 0,
		maxCount: null,
		order: 1.5,
		editor: null,
		group: null,
		subPropertyOf: null,
		reifierShapes: [],
		reificationRequired: false
	};
	expect(schemas.zPostAdminDatamodelByProjectByResourceByPropertyBody.parse(patch)).toEqual(patch);
	const standalone = {
		subPropertyOf: null,
		nodeKind: 'sh:IRI',
		reifierShapes: [],
		reificationRequired: false
	};
	expect(schemas.zPostAdminDatamodelByProjectPropertyByPropertyBody.parse(standalone)).toEqual(
		standalone
	);
});

it('requires instance audit fields while preserving dynamic RDF values and roles', () => {
	const data = {
		'oldap:createdBy': ['urn:creator'],
		'oldap:lastModifiedBy': ['urn:creator'],
		'oldap:creationDate': ['2026-11-17T12:00:00Z'],
		'oldap:lastModificationDate': ['2026-11-17T12:00:00Z'],
		'test:title': ['Title'],
		'oldap:attachedToRole': { 'test:Reader': 'DATA_VIEW' }
	};
	expect(schemas.zInstanceData.parse(data)).toEqual(data);
	expect(schemas.zInstanceData.safeParse({ 'test:title': ['Title'] }).success).toBe(false);
});

it('retains literal and object create fields and enforces their exclusive type choice', () => {
	const literal = {
		datatype: 'xsd:string',
		name: ['Title@en'],
		minLength: 0,
		maxLength: 30,
		minCount: 0,
		maxCount: 1,
		order: 2.5,
		editor: 'dash:TextFieldEditor',
		reificationRequired: false
	};
	const object = {
		class: 'shared:ArchiveUnit',
		subPropertyOf: 'schema:about',
		minCount: 0,
		group: 'oldap:SystemGroup',
		reifierShapes: ['test:SourceShape']
	};
	expect(schemas.zPropertyCreate.parse(literal)).toEqual(literal);
	expect(schemas.zPropertyCreate.parse(object)).toEqual(object);
	expect(schemas.zPropertyCreate.safeParse({ name: ['Missing type@en'] }).success).toBe(false);
	expect(
		schemas.zPropertyCreate.safeParse({ datatype: 'xsd:string', class: 'shared:ArchiveUnit' })
			.success
	).toBe(false);
});

it('preserves resource summary metadata while requiring asserted types', () => {
	const summary = {
		iri: 'test:item',
		resclass: 'shared:Item',
		data: {
			'rdf:type': ['shared:Item'],
			'test:title': ['Title']
		}
	};
	expect(schemas.zResourceSummary.parse(summary)).toEqual(summary);
	expect(
		schemas.zResourceSummary.safeParse({ ...summary, data: { 'test:title': ['Title'] } }).success
	).toBe(false);
});

it('accepts and preserves multiple superproperties in flat writes', () => {
	const patch = { subPropertyOf: ['dc:coverage', 'dcterms:coverage'] };
	expect(schemas.zPostAdminDatamodelByProjectByResourceByPropertyBody.parse(patch)).toEqual(patch);
	expect(schemas.zPostAdminDatamodelByProjectPropertyByPropertyBody.parse(patch)).toEqual(patch);
	expect(schemas.zPropertyCreate.parse({ ...patch, datatype: 'xsd:string' })).toEqual({
		...patch,
		datatype: 'xsd:string'
	});
});

it('accepts timezone offsets in API audit timestamps without rewriting values', () => {
	const data = {
		'oldap:createdBy': ['urn:creator'],
		'oldap:lastModifiedBy': ['urn:creator'],
		'oldap:creationDate': ['2026-11-17T12:00:00+00:00'],
		'oldap:lastModificationDate': ['2026-11-17T13:00:00+01:00'],
		'test:title': ['Title']
	};
	expect(schemas.zInstanceData.parse(data)).toEqual(data);
	expect(
		schemas.zInstanceData.safeParse({ ...data, 'oldap:creationDate': ['not-a-date'] }).success
	).toBe(false);
});

it('preserves unspecified OpenAPI extension fields but rejects explicitly closed object extras', () => {
	const project = {
		projectIri: 'urn:test',
		projectShortName: 'test',
		futureMetadata: { preserved: true }
	};
	expect(schemas.zGetAdminProjectGetResponse.parse(project)).toEqual(project);
	expect(
		schemas.zPropertyCreate.safeParse({ datatype: 'xsd:string', unexpected: true }).success
	).toBe(false);
});

it('accepts deployed annotation type names and absolute property references', () => {
	const annotation = {
		iri: 'test:note',
		datatype: 'xsd:string',
		type: ['OwlAnnotationProperty'],
		lessThan: 'https://example.org/ns/upper',
		lessThanOrEquals: 'urn:test:upper'
	};
	expect(schemas.zProperty.parse(annotation)).toEqual(annotation);
	const inverse = {
		iri: 'test:parent',
		toClass: 'test:Item',
		inversePath: 'https://example.org/ns/child'
	};
	expect(schemas.zProperty.parse(inverse)).toEqual(inverse);
	expect(schemas.zPropertyReference.safeParse('not an iri').success).toBe(false);
});
