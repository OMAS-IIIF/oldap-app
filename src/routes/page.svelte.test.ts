import '@testing-library/jest-dom/vitest';
import { test, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Page from './+page.svelte';
import { windowsStore } from '$lib/stores/windows';

beforeEach(() => windowsStore.set([]));

test('opens the desktop welcome window and closes it through its control', async () => {
	render(Page);
	const window = await screen.findByRole('dialog', { name: 'Hello' });
	expect(window).toHaveTextContent('Hello World');
	await fireEvent.click(screen.getByRole('button', { name: 'Close window' }));
	expect(screen.queryByRole('dialog', { name: 'Hello' })).not.toBeInTheDocument();
});
