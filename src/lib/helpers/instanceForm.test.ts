import { expect, it } from 'vitest';
import {
	instanceFormValues,
	instanceFormChanges,
	instanceEditableProperties
} from './instanceForm';
import { LangString } from '$lib/oldap/datatypes/langstring';
import { XsdDate } from '$lib/oldap/datatypes/xsd_date';
import { schemas } from '$lib/apischema/zod';
import { OldapList } from '$lib/oldap/classes/list';

it('serializes editable values without granting or replacing roles', () => {
	expect(
		instanceFormValues({
			title: ['Title'],
			date: [new XsdDate('2026-11-04')],
			label: LangString.fromStringArray(['Titel@de']),
			'oldap:attachedToRole': ['test:Admin']
		})
	).toEqual({ title: ['Title'], date: ['2026-11-04'], label: ['Titel@de'] });
});
it('updates changed fields, deletes cleared values and preserves unseen metadata', () => {
	expect(
		instanceFormChanges(
			{ title: ['Old'], subject: ['A', 'B'], obsolete: ['Old'], hidden: ['Keep'] },
			{ title: ['New'], subject: ['B', 'A'], obsolete: [] }
		)
	).toEqual({ title: ['New'], obsolete: null });
});
it('retains RDF fields while requiring the declared instance metadata', () => {
	const metadata = {
		'oldap:createdBy': ['urn:creator'],
		'oldap:lastModifiedBy': ['urn:creator'],
		'oldap:creationDate': ['2026-11-04T12:00:00Z'],
		'oldap:lastModificationDate': ['2026-11-04T12:00:00Z']
	};
	expect(
		schemas.InstanceData.parse({ ...metadata, 'test:title': ['Title'] })['test:title']
	).toEqual(['Title']);
	expect(schemas.InstanceData.safeParse({ 'test:title': ['Title'] }).success).toBe(false);
});
it('reads list identifiers both as full IRIs and QNames', () => {
	for (const iri of ['https://example.org/list', 'test:List']) {
		const list = OldapList.fromOldapJson({
			oldapListId: 'List',
			iri,
			nodeClassIri: 'test:Node',
			nodeNamespaceIri: 'https://example.org/list#',
			nodePrefix: 'test'
		});
		expect(list.iri.toString()).toBe(iri);
		expect(list.nodeNamespaceIri.toString()).toBe('https://example.org/list#');
	}
});

import { jsonToRole } from '$lib/oldap/classes/user';
it('accepts omitted optional roles without breaking session restoration', () => {
	expect(jsonToRole(undefined)).toEqual({});
	expect(jsonToRole(null)).toEqual({});
});

import { PropertyClass } from '$lib/oldap/classes/property';

it('retains reverse-path metadata through cloning and excludes it from editable fields', () => {
	const direct = PropertyClass.fromOldapJson({ projectid: 'test', iri: 'test:title', order: 2 });
	const first = PropertyClass.fromOldapJson({ projectid: 'test', iri: 'test:first', order: 1 });
	const reverse = PropertyClass.fromOldapJson({
		projectid: 'test',
		iri: 'test:children',
		inversePath: 'test:parent'
	});
	const legacy = PropertyClass.fromOldapJson({
		projectid: 'test',
		iri: 'test:legacy',
		inverseOf: 'test:parent'
	});
	const cloned = reverse.clone();
	expect(cloned.inversePath?.toString()).toBe('test:parent');
	expect(cloned.inversePath).not.toBe(reverse.inversePath);
	const properties = [direct, reverse, legacy, first];
	expect(instanceEditableProperties(properties)).toEqual([first, direct]);
	expect(properties).toEqual([direct, reverse, legacy, first]);
});
