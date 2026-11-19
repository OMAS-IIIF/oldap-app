import { describe, expect, it } from 'vitest';
import { optionalNumber, propertyDelta } from './propertyForm';

describe('property form serialization', () => {
	it('distinguishes unset, zero and invalid numeric controls', () => {
		expect(optionalNumber('')).toBeUndefined();
		expect(optionalNumber(undefined)).toBeUndefined();
		expect(optionalNumber('0')).toBe(0);
		expect(optionalNumber(0)).toBe(0);
		expect(() => optionalNumber('invalid')).toThrow();
	});
	it('produces flat use-site deltas including deletion and zero', () => {
		expect(
			propertyDelta({ minCount: 1, maxCount: 3, order: 1 }, { minCount: 0, order: 2 })
		).toEqual({ minCount: 0, maxCount: null, order: 2 });
	});
	it('changes inclusive bounds without retaining the exclusive bound', () => {
		expect(propertyDelta({ minExclusive: 0 }, { minInclusive: 0 })).toEqual({
			minExclusive: null,
			minInclusive: 0
		});
	});
	it('ignores set order and untouched fields, preserving source snapshots', () => {
		const before = { inSet: [2, 1], editor: 'dash:TextFieldEditor' };
		expect(propertyDelta(before, { inSet: [1, 2], editor: 'dash:TextFieldEditor' })).toEqual({});
		expect(before.inSet).toEqual([2, 1]);
	});
	it('allows adding and clearing language restrictions and allowed values', () => {
		expect(propertyDelta({}, { languageIn: ['en'] })).toEqual({ languageIn: ['en'] });
		expect(propertyDelta({ inSet: ['a'] }, {})).toEqual({ inSet: null });
	});
});

it('preserves explicit false and clears policy independently of other fields', () => {
	expect(
		propertyDelta(
			{ reifierShapes: ['shared:Source', 'test:Visit'], reificationRequired: true },
			{ reifierShapes: [], reificationRequired: false }
		)
	).toEqual({ reifierShapes: [], reificationRequired: false });
	expect(
		propertyDelta({ reifierShapes: [], reificationRequired: false }, { reifierShapes: [] })
	).toEqual({ reificationRequired: null });
	expect(
		propertyDelta(
			{ reifierShapes: ['test:Visit', 'shared:Source'], reificationRequired: false },
			{ reifierShapes: ['shared:Source', 'test:Visit'], reificationRequired: false }
		)
	).toEqual({});
});
