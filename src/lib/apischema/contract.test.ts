import { expect, it } from 'vitest';
import { schemas } from './zod';

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
	expect(schemas.postAdmindatamodelProjectResourceProperty_Body.parse(patch)).toEqual(patch);
	const standalone = {
		subPropertyOf: null,
		nodeKind: 'sh:IRI',
		reifierShapes: [],
		reificationRequired: false
	};
	expect(schemas.postAdmindatamodelProjectpropertyProperty_Body.parse(standalone)).toEqual(
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
	expect(schemas.InstanceData.parse(data)).toEqual(data);
	expect(schemas.InstanceData.safeParse({ 'test:title': ['Title'] }).success).toBe(false);
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
	expect(schemas.PropertyCreate.parse(literal)).toEqual(literal);
	expect(schemas.PropertyCreate.parse(object)).toEqual(object);
	expect(schemas.PropertyCreate.safeParse({ name: ['Missing type@en'] }).success).toBe(false);
	expect(
		schemas.PropertyCreate.safeParse({ datatype: 'xsd:string', class: 'shared:ArchiveUnit' })
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
	expect(schemas.ResourceSummary.parse(summary)).toEqual(summary);
	expect(
		schemas.ResourceSummary.safeParse({ ...summary, data: { 'test:title': ['Title'] } }).success
	).toBe(false);
});

it('accepts and preserves multiple superproperties in flat writes', () => {
	const patch = { subPropertyOf: ['dc:coverage', 'dcterms:coverage'] };
	expect(schemas.postAdmindatamodelProjectResourceProperty_Body.parse(patch)).toEqual(patch);
	expect(schemas.postAdmindatamodelProjectpropertyProperty_Body.parse(patch)).toEqual(patch);
	expect(schemas.PropertyCreate.parse({ ...patch, datatype: 'xsd:string' })).toEqual({
		...patch,
		datatype: 'xsd:string'
	});
});
