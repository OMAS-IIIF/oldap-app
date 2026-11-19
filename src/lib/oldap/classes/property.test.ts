import { describe, expect, it } from 'vitest';
import { OwlPropertyType, PropertyClass } from './property';

const identity = { projectid: 'test', iri: 'test:title' };

describe('property model decoding', () => {
	it('keeps omitted constraints absent instead of creating phantom QNames or NaN', () => {
		const property = PropertyClass.fromOldapJson(identity);
		for (const field of [
			'subPropertyOf',
			'toClass',
			'nodeKind',
			'lessThan',
			'lessThanOrEquals',
			'inversePath',
			'inverseOf',
			'equivalentProperty',
			'group',
			'editor',
			'minLength',
			'maxLength',
			'created',
			'modified',
			'inSet'
		] as const) {
			expect(property[field], field).toBeUndefined();
		}
		expect(property.clone().subPropertyOf).toBeUndefined();
	});

	it('preserves zero, decimal constraints, API types and cloneable GUI metadata', () => {
		const property = PropertyClass.fromOldapJson({
			...identity,
			type: ['TransitiveProperty', 'owl:FunctionalProperty', 'OwlAnnotationProperty'],
			minCount: 0,
			minLength: 0,
			maxLength: '12',
			minInclusive: 0,
			order: 1.5,
			group: 'oldap:SystemGroup',
			editor: 'oldap:Textfield'
		});
		expect(property.minCount).toBe(0);
		expect(property.minLength).toBe(0);
		expect(property.maxLength).toBe(12);
		expect(property.minInclusive).toBe(0);
		expect(property.order).toBe(1.5);
		expect(property.type).toEqual(
			new Set([
				OwlPropertyType.TransitiveProperty,
				OwlPropertyType.FunctionalProperty,
				OwlPropertyType.AnnotationProperty
			])
		);
		expect(property.clone().group?.toString()).toBe('oldap:SystemGroup');
		expect(property.clone().group).not.toBe(property.group);
	});

	it('retains explicit false and independently clones passive reifier shape references', () => {
		const property = PropertyClass.fromOldapJson({
			...identity,
			reifierShapes: ['test:Visit', 'https://example.org/SourceShape'],
			reificationRequired: false
		});
		const clone = property.clone();
		expect(clone.reificationRequired).toBe(false);
		expect(clone.reifierShapes).toEqual(property.reifierShapes);
		clone.reifierShapes?.push('test:Other');
		expect(property.reifierShapes).toHaveLength(2);
		expect(PropertyClass.fromOldapJson(identity).reificationRequired).toBeUndefined();
	});
});

it('retains every direct superproperty and clones parent collections independently', () => {
	const parents = ['dc:coverage', 'dcterms:coverage', 'https://example.org/coverage'];
	const property = PropertyClass.fromOldapJson({
		...identity,
		subPropertyOf: [...parents, parents[0]]
	});
	expect(property.subPropertyOf?.map(String)).toEqual(parents);
	const clone = property.clone();
	clone.subPropertyOf?.pop();
	expect(property.subPropertyOf?.map(String)).toEqual(parents);
	expect(clone.subPropertyOf?.[0]).not.toBe(property.subPropertyOf?.[0]);
	expect(
		PropertyClass.fromOldapJson({ ...identity, subPropertyOf: 'dc:coverage' }).subPropertyOf?.map(
			String
		)
	).toEqual(['dc:coverage']);
});
