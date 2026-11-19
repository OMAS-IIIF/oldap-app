import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import AllowedValues from './AllowedValues.svelte';

describe('numeric allowed values', () => {
	it('adds and removes zero without treating it as an empty input', async () => {
		render(AllowedValues, {
			valueType: 'number',
			values: new Set<string | number>(),
			label: 'Allowed numbers'
		});
		await fireEvent.input(screen.getByRole('spinbutton'), { target: { value: '0' } });
		await fireEvent.click(screen.getByTitle('Wert hinzufügen'));
		expect(screen.getByText('0')).toBeInTheDocument();
		await fireEvent.click(screen.getByTitle('Wert entfernen'));
		expect(screen.queryByText('0')).not.toBeInTheDocument();
	});
});
