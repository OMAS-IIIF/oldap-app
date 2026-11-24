import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, it } from 'vitest';
import { datamodelStore } from '#lib/stores/datamodel.ts';
import { datamodelOldapStore } from '#lib/stores/datamodel_oldap.ts';
import { datamodelSharedStore } from '#lib/stores/datamodel_shared.ts';
import { projectStore } from '#lib/stores/project.ts';
import { DatamodelClass } from '#lib/oldap/classes/datamodel.ts';
import { reifierFieldToWrite } from '#lib/oldap/classes/reifierShape.ts';
import Harness from './ReifierFieldEditorHarness.svelte';
import * as m from '#lib/paraglide/messages.js';

const draft = () => JSON.parse(screen.getByTestId('field-value').textContent ?? '{}');
const control = (label: string) => screen.getByLabelText(`${label} 1`);

beforeEach(() => {
	projectStore.set(null);
	datamodelStore.set(null);
	datamodelOldapStore.set(null);
	datamodelSharedStore.set(null);
});

const model = (project: string, prefix: string) =>
	DatamodelClass.fromOldapJson({
		project,
		externalOntologies: [{ prefix, namespaceIri: `https://example.org/${prefix}/` }],
		annotationProperties: [],
		resources: []
	});

describe('reifier field constraints', () => {
	it('edits and clears the shared parent without changing field constraints', async () => {
		datamodelStore.set(model('test', 'external'));
		render(Harness, {
			initial: {
				iri: 'test:source',
				datatype: 'xsd:string',
				minCount: 1,
				subPropertyOf: 'dcterms:source'
			}
		});
		expect(control('subPropertyOf')).toHaveValue('source');
		await fireEvent.change(control(m.reifier_parent_prefix()), { target: { value: 'schema' } });
		await fireEvent.input(control('subPropertyOf'), { target: { value: 'citation' } });
		expect(reifierFieldToWrite(draft())).toMatchObject({
			subPropertyOf: 'schema:citation',
			minCount: 1
		});
		await fireEvent.input(control('subPropertyOf'), { target: { value: '' } });
		expect(reifierFieldToWrite(draft())).not.toHaveProperty('subPropertyOf');
	});

	it('preserves and edits every parent independently, including full IRIs', async () => {
		datamodelStore.set(model('test', 'external'));
		render(Harness, {
			initial: {
				iri: 'test:source',
				datatype: 'xsd:string',
				minCount: 1,
				subPropertyOf: ['dcterms:source', 'https://example.org/parent']
			}
		});
		expect(control('subPropertyOf')).toHaveValue('source');
		expect(screen.getByLabelText('subPropertyOf 1.2')).toHaveValue('https://example.org/parent');
		await fireEvent.input(control(m.reifier_min_count()), { target: { value: '2' } });
		expect(reifierFieldToWrite(draft()).subPropertyOf).toEqual([
			'dcterms:source',
			'https://example.org/parent'
		]);
		await fireEvent.click(screen.getByRole('button', { name: m.superproperty_add() }));
		await fireEvent.input(screen.getByLabelText('subPropertyOf 1.3'), {
			target: { value: 'ancestor' }
		});
		expect(reifierFieldToWrite(draft())).toMatchObject({
			subPropertyOf: ['dcterms:source', 'https://example.org/parent', 'test:ancestor'],
			minCount: 2
		});
		await fireEvent.click(screen.getByLabelText(`${m.superproperty_remove()} 1.2`));
		expect(reifierFieldToWrite(draft()).subPropertyOf).toEqual(['dcterms:source', 'test:ancestor']);
	});

	it('shows all foreign parents without allowing hierarchy changes', () => {
		datamodelStore.set(model('test', 'external'));
		render(Harness, {
			initial: {
				iri: 'dcterms:temporal',
				datatype: 'xsd:string',
				subPropertyOf: ['dc:coverage', 'dcterms:coverage']
			}
		});
		expect(control('subPropertyOf')).toHaveValue('coverage');
		expect(control('subPropertyOf')).toBeDisabled();
		expect(screen.getByLabelText('subPropertyOf 1.2')).toBeDisabled();
		expect(screen.queryByRole('button', { name: m.superproperty_add() })).not.toBeInTheDocument();
		expect(reifierFieldToWrite(draft()).subPropertyOf).toEqual(['dc:coverage', 'dcterms:coverage']);
	});

	it('does not allow changing a foreign predicate hierarchy', () => {
		datamodelStore.set(model('test', 'external'));
		render(Harness, {
			initial: { iri: 'shared:source', datatype: 'xsd:string', subPropertyOf: 'dcterms:source' }
		});
		expect(control('subPropertyOf')).toBeDisabled();
		expect(control(m.reifier_parent_prefix())).toBeDisabled();
		expect(draft().subPropertyOf).toBe('dcterms:source');
	});

	it('selects loaded external prefixes and round-trips one canonical field IRI', async () => {
		datamodelStore.set(model('test', 'external'));
		datamodelOldapStore.set(model('oldap', 'baseExternal'));
		datamodelSharedStore.set(model('shared', 'sharedExternal'));
		render(Harness, { initial: { iri: 'test:source', datatype: 'xsd:string' } });
		const prefix = control(m.reifier_prefix()) as HTMLSelectElement;
		expect(Array.from(prefix.options, (option) => option.value)).toEqual([
			'test',
			'oldap',
			'shared',
			'skos',
			'schema',
			'dcterms',
			'external',
			'baseExternal',
			'sharedExternal'
		]);
		expect(control(m.reifier_field_iri())).toHaveValue('source');
		await fireEvent.change(prefix, { target: { value: 'external' } });
		expect(draft().iri).toBe('external:source');
		await fireEvent.input(control(m.reifier_field_iri()), { target: { value: 'citation' } });
		expect(prefix).toHaveValue('external');
		expect(reifierFieldToWrite(draft()).iri).toBe('external:citation');
	});

	it('preserves unknown prefixes and disables both identifier parts for shared viewing', () => {
		render(Harness, { readonly: true, initial: { iri: 'unloaded:field', datatype: 'xsd:string' } });
		expect(control(m.reifier_prefix())).toHaveValue('unloaded');
		expect(control(m.reifier_prefix())).toBeDisabled();
		expect(control(m.reifier_field_iri())).toHaveValue('field');
		expect(control(m.reifier_field_iri())).toBeDisabled();
		expect(reifierFieldToWrite(draft()).iri).toBe('unloaded:field');
	});

	it('edits decimal/zero bounds and enumeration without losing untouched metadata', async () => {
		render(Harness, {
			initial: {
				iri: 'test:amount',
				datatype: 'xsd:decimal',
				minInclusive: 0,
				maxExclusive: 5.5,
				order: 0,
				editor: 'dash:TextFieldEditor',
				type: ['FunctionalProperty']
			}
		});
		await fireEvent.input(control(m.reifier_max_exclusive()), { target: { value: '7.25' } });
		await fireEvent.input(screen.getByLabelText(`${m.allowed_numvals()}:`), {
			target: { value: '0' }
		});
		await fireEvent.click(screen.getByTitle('Wert hinzufügen'));
		expect(draft()).toMatchObject({
			minInclusive: 0,
			maxExclusive: 7.25,
			inSet: [0],
			order: 0,
			editor: 'dash:TextFieldEditor',
			type: ['FunctionalProperty']
		});
		await fireEvent.input(control(m.reifier_min_inclusive()), { target: { value: '' } });
		expect(draft()).not.toHaveProperty('minInclusive');
	});

	it('preserves tri-state uniqueness and updates permitted languages explicitly', async () => {
		render(Harness, {
			initial: {
				iri: 'test:label',
				datatype: 'rdf:langString',
				uniqueLang: false,
				languageIn: ['de'],
				name: ['Label@en', 'Titel@de']
			}
		});
		expect(control(m.reifier_unique_language())).toHaveValue('false');
		await fireEvent.change(control(m.reifier_unique_language()), { target: { value: '' } });
		expect(draft()).not.toHaveProperty('uniqueLang');
		await fireEvent.change(control(m.reifier_unique_language()), { target: { value: 'false' } });
		await fireEvent.click(screen.getByLabelText(m.allowed_langs_sel()));
		await fireEvent.click(screen.getByRole('button', { name: /^EN English/ }));
		expect(draft()).toMatchObject({
			uniqueLang: false,
			languageIn: ['de', 'en'],
			name: ['Label@en', 'Titel@de']
		});
	});

	it('clears incompatible constraints only after explicit type changes', async () => {
		render(Harness, {
			initial: {
				iri: 'test:value',
				datatype: 'rdf:langString',
				minLength: 2,
				pattern: '.+',
				languageIn: ['de'],
				uniqueLang: false,
				inSet: ['a'],
				nodeKind: 'sh:Literal',
				minCount: 0,
				name: ['Value@en'],
				group: 'test:Group'
			}
		});
		await fireEvent.change(control(m.datatype()), { target: { value: 'xsd:decimal' } });
		expect(draft()).not.toHaveProperty('pattern');
		expect(draft()).not.toHaveProperty('languageIn');
		expect(draft()).not.toHaveProperty('inSet');
		await fireEvent.input(control(m.reifier_min_inclusive()), { target: { value: '0' } });
		await fireEvent.change(control(m.property()), { target: { value: 'link' } });
		expect(draft()).not.toHaveProperty('minInclusive');
		expect(draft()).not.toHaveProperty('nodeKind');
		expect(draft()).not.toHaveProperty('datatype');
		expect(draft()).toMatchObject({
			class: '',
			minCount: 0,
			name: ['Value@en'],
			group: 'test:Group'
		});
	});

	it('retains compatible languages but clears them for unsupported string subtypes', async () => {
		render(Harness, {
			initial: {
				iri: 'test:label',
				datatype: 'rdf:langString',
				languageIn: ['de'],
				uniqueLang: false,
				minLength: 1,
				pattern: '.+',
				name: ['Label@en'],
				inSet: ['a']
			}
		});
		await fireEvent.change(control(m.datatype()), { target: { value: 'xsd:string' } });
		expect(draft()).toMatchObject({ languageIn: ['de'], uniqueLang: false });
		await fireEvent.change(control(m.datatype()), { target: { value: 'xsd:token' } });
		expect(draft()).not.toHaveProperty('languageIn');
		expect(draft()).not.toHaveProperty('uniqueLang');
		expect(draft()).toMatchObject({
			minLength: 1,
			pattern: '.+',
			name: ['Label@en'],
			inSet: ['a']
		});
		expect(screen.queryByLabelText(`${m.reifier_unique_language()} 1`)).not.toBeInTheDocument();
		expect(screen.queryByLabelText(m.allowed_langs_sel())).not.toBeInTheDocument();
	});

	it('allows viewing another label language while shared fields remain read-only', async () => {
		render(Harness, {
			readonly: true,
			initial: { iri: 'test:label', datatype: 'xsd:string', name: ['Label@en', 'Titel@de'] }
		});
		expect(control(m.name())).toBeDisabled();
		expect(control(m.datatype())).toBeDisabled();
		expect(control(m.lang())).not.toBeDisabled();
		await fireEvent.change(control(m.lang()), { target: { value: 'de' } });
		expect(control(m.name())).toHaveValue('Titel');
	});
});
