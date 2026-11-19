import { expect, test, type Page } from '@playwright/test';

type Shape = { iri: string; properties: Record<string, unknown>[] };

/** In-memory HTTP fixture. No credentials or writes reach an external service. */
async function modelApi(page: Page) {
	const stamp = '2026-11-17T12:00:00Z';
	const metadata = {
		creator: 'urn:test:admin',
		contributor: 'urn:test:admin',
		created: stamp,
		modified: stamp
	};
	const property: Record<string, unknown> = {
		...metadata,
		projectid: 'test',
		iri: 'test:title',
		datatype: 'xsd:string',
		name: ['Title@en'],
		order: 0
	};
	const localShape: Shape = {
		iri: 'test:SourceShape',
		properties: [
			{
				iri: 'test:source',
				datatype: 'xsd:string',
				name: ['Source@en'],
				minCount: 0,
				maxCount: 1,
				pattern: '^https:',
				uniqueLang: false
			}
		]
	};
	const sharedShape: Shape = {
		iri: 'shared:EvidenceShape',
		properties: [
			{
				iri: 'shared:source',
				toClass: 'shared:Document',
				minCount: 1,
				name: ['Source@en', 'Quelle@de']
			}
		]
	};
	const state = {
		shapes: [localShape],
		property,
		propertyWrites: [] as Record<string, unknown>[],
		shapeWrites: [] as { method: string; iri: string; body: Record<string, unknown> }[],
		deleted: [] as string[],
		failProperty: 0,
		failShape: 0,
		failRefreshAfterWrite: false
	};
	const token = `e30.${Buffer.from(JSON.stringify({ sub: 'tester' })).toString('base64url')}.test`;
	await page.route('https://oldap.test/**', async (route) => {
		const path = decodeURIComponent(new URL(route.request().url()).pathname);
		const method = route.request().method();
		let json: unknown;
		if (path === '/admin/auth/refresh') json = { accessToken: token };
		else if (path === '/admin/user/tester')
			json = {
				...metadata,
				userId: 'tester',
				userIri: 'urn:test:admin',
				familyName: 'Tester',
				givenName: 'Test',
				email: 'test@example.org',
				isActive: true,
				inProjects: [
					{ project: 'urn:test:project', permissions: ['oldap:ADMIN_CREATE', 'oldap:ADMIN_MODEL'] }
				]
			};
		else if (path === '/admin/project/get')
			json = {
				...metadata,
				projectIri: 'urn:test:project',
				projectShortName: 'test',
				namespaceIri: 'https://example.org/test#',
				label: ['Test@en'],
				projectStart: '2026-01-01'
			};
		else if (path === '/admin/hlist/search') json = [];
		else if (path === '/admin/datamodel/test/test:Book/test:title' && method === 'POST') {
			const patch = route.request().postDataJSON();
			state.propertyWrites.push(patch);
			if (state.failProperty) {
				await route.fulfill({
					status: state.failProperty,
					json: { message: 'Property policy is in use' }
				});
				return;
			}
			for (const [key, value] of Object.entries(patch)) {
				if (value === null) delete property[key];
				else property[key] = value;
			}
			json = { message: 'Updated' };
		} else if (/^\/admin\/datamodel\/[^/]+\/reifier-shape\//.test(path)) {
			const iri = path.split('/').at(-1)!;
			const shape = [...state.shapes, sharedShape].find((entry) => entry.iri === iri);
			if (method === 'GET') json = shape;
			else {
				const body = method === 'DELETE' ? {} : route.request().postDataJSON();
				state.shapeWrites.push({ method, iri, body });
				if (state.failShape) {
					await route.fulfill({ status: state.failShape, json: { message: 'Shape is in use' } });
					return;
				}
				if (method === 'DELETE') {
					state.deleted.push(iri);
					state.shapes = state.shapes.filter((entry) => entry.iri !== iri);
					await route.fulfill({ status: 204 });
					return;
				}
				const result = { iri, properties: body.properties ?? shape?.properties ?? [] };
				state.shapes = [...state.shapes.filter((entry) => entry.iri !== iri), result];
				await route.fulfill({ status: method === 'PUT' ? 201 : 200, json: result });
				return;
			}
		} else if (/^\/admin\/datamodel\/[^/]+$/.test(path)) {
			const project = path.split('/').at(-1);
			if (project === 'test' && state.failRefreshAfterWrite && state.shapeWrites.length > 0) {
				await route.fulfill({
					status: 503,
					json: { message: 'Model read temporarily unavailable' }
				});
				return;
			}
			json = {
				project,
				externalOntologies:
					project === 'test'
						? [
								{
									...metadata,
									prefix: 'ext',
									namespaceIri: 'https://example.org/evidence#',
									label: ['Evidence@en']
								}
							]
						: [],
				reifierShapes:
					project === 'test' ? state.shapes : project === 'shared' ? [sharedShape] : [],
				annotationProperties:
					project === 'test'
						? [{ ...property, reifierShapes: undefined, reificationRequired: undefined }]
						: [],
				resources:
					project === 'test'
						? [
								{
									...metadata,
									projectid: 'test',
									iri: 'test:Book',
									label: ['Book@en'],
									superclass: ['oldap:Thing'],
									properties: [property]
								}
							]
						: []
			};
		} else throw new Error(`Unexpected fixture request: ${method} ${path}`);
		await route.fulfill({ json });
	});
	return state;
}

async function openModel(page: Page) {
	await page.goto('/en');
	await expect(page.getByTitle('Resource class')).toHaveValue('test:Book');
	await page.getByRole('button', { name: 'Administration', exact: true }).click();
}

async function openProperty(page: Page) {
	await page.getByRole('row').filter({ hasText: 'Book' }).getByRole('button').first().click();
	await page.getByRole('row').filter({ hasText: 'Title' }).getByRole('button').nth(1).click();
	return page
		.locator('form')
		.filter({ has: page.getByPlaceholder('property ID', { exact: true }) });
}

/** The shared popup must be actionable above the still-open native editor. */
async function dismissError(page: Page, message: string, escape = false) {
	const popup = page.getByRole('alertdialog', { name: 'ERROR', exact: true });
	await expect(popup).toContainText(message);
	if (escape) await popup.press('Escape');
	else await popup.getByRole('button', { name: 'close', exact: true }).click();
	await expect(popup).toHaveCount(0);
}

async function confirm(page: Page) {
	await page
		.getByRole('dialog')
		.filter({ has: page.getByRole('button', { name: 'OK', exact: true }) })
		.getByRole('button', { name: 'OK', exact: true })
		.click();
}

test('assigns local and shared shapes to a reusable property use, preserves false and clears policy', async ({
	page
}) => {
	const state = await modelApi(page);
	await openModel(page);
	const editor = await openProperty(page);
	await editor.getByRole('checkbox', { name: 'test:SourceShape', exact: true }).check();
	await editor.getByRole('checkbox', { name: 'shared:EvidenceShape', exact: true }).check();
	await editor
		.getByRole('combobox', { name: 'Require reification', exact: true })
		.selectOption('false');
	await editor.getByRole('button', { name: 'Modify', exact: true }).click();
	await confirm(page);
	await expect.poll(() => state.propertyWrites.length).toBe(1);
	expect(state.propertyWrites[0]).toEqual({
		reifierShapes: ['test:SourceShape', 'shared:EvidenceShape'],
		reificationRequired: false
	});
	await expect(page.getByRole('heading', { name: 'Success', exact: true })).toBeVisible();
	await page.getByRole('button', { name: 'close', exact: true }).click();
	await page.getByRole('row').filter({ hasText: 'Title' }).getByRole('button').nth(1).click();
	await expect(
		editor.getByRole('combobox', { name: 'Require reification', exact: true })
	).toHaveValue('false');
	await expect(
		editor.getByRole('checkbox', { name: 'shared:EvidenceShape', exact: true })
	).toBeChecked();
	await editor.getByRole('checkbox', { name: 'test:SourceShape', exact: true }).uncheck();
	await editor.getByRole('checkbox', { name: 'shared:EvidenceShape', exact: true }).uncheck();
	await editor
		.getByRole('combobox', { name: 'Require reification', exact: true })
		.selectOption('unset');
	await editor.getByRole('button', { name: 'Modify', exact: true }).click();
	await confirm(page);
	await expect.poll(() => state.propertyWrites.length).toBe(2);
	expect(state.propertyWrites[1]).toEqual({ reifierShapes: [], reificationRequired: null });
});

test('policy conflicts retain the draft and cancellation leaves the model unchanged', async ({
	page
}) => {
	const state = await modelApi(page);
	state.failProperty = 409;
	await openModel(page);
	const editor = await openProperty(page);
	await editor.getByRole('checkbox', { name: 'test:SourceShape', exact: true }).check();
	await editor
		.getByRole('combobox', { name: 'Require reification', exact: true })
		.selectOption('true');
	await editor.getByRole('button', { name: 'Modify', exact: true }).click();
	await confirm(page);
	await expect(page.getByRole('heading', { name: 'ERROR', exact: true })).toBeVisible();
	await page.getByRole('button', { name: 'close', exact: true }).last().click();
	await expect(
		editor.getByRole('checkbox', { name: 'test:SourceShape', exact: true })
	).toBeChecked();
	await expect(
		editor.getByRole('combobox', { name: 'Require reification', exact: true })
	).toHaveValue('true');
	await editor.getByRole('button', { name: 'Cancel', exact: true }).click();
	await page.getByRole('row').filter({ hasText: 'Title' }).getByRole('button').nth(1).click();
	await expect(
		editor.getByRole('checkbox', { name: 'test:SourceShape', exact: true })
	).not.toBeChecked();
	await expect(
		editor.getByRole('combobox', { name: 'Require reification', exact: true })
	).toHaveValue('unset');
});

test('creates, edits and deletes shapes while preserving untouched field constraints', async ({
	page
}) => {
	const state = await modelApi(page);
	await openModel(page);
	const panel = page.getByRole('region', { name: 'Reifier shapes', exact: true });
	await panel.getByRole('button', { name: 'New reifier shape', exact: true }).click();
	let dialog = page.getByRole('dialog', { name: 'New reifier shape', exact: true });
	await dialog
		.getByRole('textbox', { name: 'Shape identifier', exact: true })
		.fill('ConfidenceShape');
	await dialog.getByRole('button', { name: 'Add field', exact: true }).click();
	await dialog.getByRole('textbox', { name: 'Field identifier 1', exact: true }).fill('confidence');
	await dialog.getByRole('combobox', { name: 'Prefix 1', exact: true }).selectOption('ext');
	await dialog
		.getByRole('combobox', { name: 'Data type 1', exact: true })
		.selectOption('xsd:decimal');
	await dialog.getByRole('spinbutton', { name: 'Minimum values 1', exact: true }).fill('0');
	await dialog.getByRole('spinbutton', { name: 'Maximum values 1', exact: true }).fill('1');
	await dialog.getByRole('textbox', { name: 'Name 1', exact: true }).fill('Confidence');
	await dialog.getByRole('button', { name: 'Save shape', exact: true }).click();
	await expect(dialog).toHaveCount(0);
	expect(state.shapeWrites[0]).toEqual({
		method: 'PUT',
		iri: 'test:ConfidenceShape',
		body: {
			properties: [
				{
					iri: 'ext:confidence',
					datatype: 'xsd:decimal',
					minCount: 0,
					maxCount: 1,
					name: ['Confidence@en']
				}
			]
		}
	});
	await expect(panel.getByRole('row').filter({ hasText: 'test:ConfidenceShape' })).toBeVisible();

	await panel
		.getByRole('row')
		.filter({ hasText: 'test:SourceShape' })
		.getByRole('button', { name: 'Modify', exact: true })
		.click();
	dialog = page.getByRole('dialog', { name: 'Reifier shape', exact: true });
	await expect(
		dialog.getByRole('spinbutton', { name: 'Maximum values 1', exact: true })
	).toHaveValue('1');
	await dialog.getByRole('spinbutton', { name: 'Maximum values 1', exact: true }).fill('2');
	await dialog.getByRole('button', { name: 'Add field', exact: true }).click();
	await dialog.getByRole('textbox', { name: 'Field identifier 2', exact: true }).fill('document');
	await dialog.getByRole('combobox', { name: 'Property 2', exact: true }).selectOption('link');
	await dialog.getByRole('textbox', { name: 'Target class 2', exact: true }).fill('test:Book');
	await dialog.getByRole('button', { name: 'Save shape', exact: true }).click();
	await expect(dialog).toHaveCount(0);
	expect(state.shapeWrites[1]).toEqual({
		method: 'POST',
		iri: 'test:SourceShape',
		body: {
			properties: [
				{
					iri: 'test:source',
					datatype: 'xsd:string',
					name: ['Source@en'],
					minCount: 0,
					maxCount: 2,
					pattern: '^https:',
					uniqueLang: false
				},
				{ iri: 'test:document', class: 'test:Book' }
			]
		}
	});
	await panel
		.getByRole('row')
		.filter({ hasText: 'test:SourceShape' })
		.getByRole('button', { name: 'Modify', exact: true })
		.click();
	await expect(dialog.getByRole('textbox', { name: 'Target class 2', exact: true })).toHaveValue(
		'test:Book'
	);
	await dialog.getByRole('button', { name: 'Remove field', exact: true }).nth(1).click();
	await dialog.getByRole('button', { name: 'Save shape', exact: true }).click();
	await expect(dialog).toHaveCount(0);
	expect(state.shapeWrites[2].body.properties as unknown[]).toHaveLength(1);
	expect(state.shapeWrites[2].body.properties).toEqual(
		(state.shapeWrites[1].body.properties as unknown[]).slice(0, 1)
	);
	await panel
		.getByRole('row')
		.filter({ hasText: 'test:ConfidenceShape' })
		.getByRole('button', { name: 'Delete shape', exact: true })
		.click();
	await page
		.getByRole('dialog', { name: 'Delete shape', exact: true })
		.getByRole('button', { name: 'Delete shape', exact: true })
		.click();
	await expect.poll(() => state.deleted).toEqual(['test:ConfidenceShape']);
	await expect(panel.getByRole('row').filter({ hasText: 'test:ConfidenceShape' })).toHaveCount(0);
});

for (const status of [403, 409]) {
	test(`shape failure ${status} retains the draft and shared definitions stay read-only`, async ({
		page
	}) => {
		const state = await modelApi(page);
		state.failShape = status;
		await openModel(page);
		const panel = page.getByRole('region', { name: 'Reifier shapes', exact: true });
		const row = panel.getByRole('row').filter({ hasText: 'test:SourceShape' });
		await row.getByRole('button', { name: 'Modify', exact: true }).click();
		const dialog = page.getByRole('dialog', { name: 'Reifier shape', exact: true });
		await dialog.getByRole('spinbutton', { name: 'Maximum values 1', exact: true }).fill('2');
		await dialog.getByRole('button', { name: 'Save shape', exact: true }).click();
		await dismissError(page, 'Shape is in use', status === 403);
		await expect(
			dialog.getByRole('spinbutton', { name: 'Maximum values 1', exact: true })
		).toHaveValue('2');
		await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
		await row.getByRole('button', { name: 'Modify', exact: true }).click();
		await expect(
			dialog.getByRole('spinbutton', { name: 'Maximum values 1', exact: true })
		).toHaveValue('1');
		await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
		await row.getByRole('button', { name: 'Delete shape', exact: true }).click();
		await page
			.getByRole('dialog', { name: 'Delete shape', exact: true })
			.getByRole('button', { name: 'Delete shape', exact: true })
			.click();
		await dismissError(page, 'Shape is in use', status === 403);
		await expect(row).toBeVisible();
		const sharedRow = panel.getByRole('row').filter({ hasText: 'shared:EvidenceShape' });
		await expect(sharedRow.getByRole('button', { name: 'Delete shape', exact: true })).toHaveCount(
			0
		);
		await sharedRow.getByRole('button', { name: 'View shape', exact: true }).click();
		await expect(dialog.getByRole('textbox', { name: 'Target class 1', exact: true })).toHaveValue(
			'shared:Document'
		);
		await expect(
			dialog.getByRole('textbox', { name: 'Target class 1', exact: true })
		).toBeDisabled();
		await expect(dialog.getByRole('button', { name: 'Save shape', exact: true })).toHaveCount(0);
		expect(state.shapeWrites.every((write) => write.iri.startsWith('test:'))).toBe(true);
	});
}

test('refresh retries never repeat a committed shape update or delete', async ({ page }) => {
	const state = await modelApi(page);
	await openModel(page);
	const panel = page.getByRole('region', { name: 'Reifier shapes', exact: true });
	const row = panel.getByRole('row').filter({ hasText: 'test:SourceShape' });
	await row.getByRole('button', { name: 'Modify', exact: true }).click();
	const dialog = page.getByRole('dialog', { name: 'Reifier shape', exact: true });
	await dialog.getByRole('spinbutton', { name: 'Maximum values 1', exact: true }).fill('2');
	state.failRefreshAfterWrite = true;
	await dialog.getByRole('button', { name: 'Save shape', exact: true }).click();
	await dismissError(page, 'The change was saved');
	await expect(dialog.getByRole('button', { name: 'Save shape', exact: true })).toHaveCount(0);
	state.failRefreshAfterWrite = false;
	await dialog.getByRole('button', { name: 'Refresh model', exact: true }).click();
	await expect(dialog).toHaveCount(0);
	expect(state.shapeWrites.map((write) => write.method)).toEqual(['POST']);
	state.failRefreshAfterWrite = true;
	await row.getByRole('button', { name: 'Delete shape', exact: true }).click();
	await page
		.getByRole('dialog', { name: 'Delete shape', exact: true })
		.getByRole('button', { name: 'Delete shape', exact: true })
		.click();
	await dismissError(page, 'The change was saved');
	await expect(row.getByRole('button', { name: 'Delete shape', exact: true })).toBeDisabled();
	state.failRefreshAfterWrite = false;
	await panel.getByRole('button', { name: 'Refresh model', exact: true }).click();
	await expect(row).toHaveCount(0);
	expect(state.shapeWrites.map((write) => write.method)).toEqual(['POST', 'DELETE']);
});

test('a cancelled shape load cannot open a stale error popup over another editor', async ({
	page
}) => {
	await modelApi(page);
	let release!: () => void;
	const pending = new Promise<void>((resolve) => {
		release = resolve;
	});
	let requested = false;
	await page.route('https://oldap.test/admin/datamodel/test/reifier-shape/*', async (route) => {
		requested = true;
		await pending;
		await route.fulfill({ status: 503, json: { message: 'Discarded editor load failed' } });
	});
	await openModel(page);
	const panel = page.getByRole('region', { name: 'Reifier shapes', exact: true });
	await panel
		.getByRole('row')
		.filter({ hasText: 'test:SourceShape' })
		.getByRole('button', { name: 'Modify', exact: true })
		.click();
	await expect.poll(() => requested).toBe(true);
	const editor = page.getByRole('dialog', { name: 'Reifier shape', exact: true });
	await editor.getByRole('button', { name: 'Cancel', exact: true }).click();
	await panel
		.getByRole('row')
		.filter({ hasText: 'shared:EvidenceShape' })
		.getByRole('button', { name: 'View shape', exact: true })
		.click();
	await expect(editor.getByRole('textbox', { name: 'Target class 1', exact: true })).toHaveValue(
		'shared:Document'
	);
	const response = page.waitForResponse((response) =>
		response.url().includes('/test/reifier-shape/')
	);
	release();
	await (await response).finished();
	await expect(page.getByRole('alertdialog', { name: 'ERROR', exact: true })).toHaveCount(0);
	await expect(editor.getByRole('textbox', { name: 'Target class 1', exact: true })).toHaveValue(
		'shared:Document'
	);
});

test('edits and clears an annotation superproperty in the shape editor', async ({ page }) => {
	const state = await modelApi(page);
	await openModel(page);
	const panel = page.getByRole('region', { name: 'Reifier shapes', exact: true });
	const open = async () => {
		await panel
			.getByRole('row')
			.filter({ hasText: 'test:SourceShape' })
			.getByRole('button', { name: 'Modify', exact: true })
			.click();
		return page.getByRole('dialog', { name: 'Reifier shape', exact: true });
	};
	let dialog = await open();
	await dialog
		.getByRole('combobox', { name: 'Superproperty prefix 1', exact: true })
		.selectOption('dcterms');
	await dialog.getByRole('textbox', { name: 'subPropertyOf 1', exact: true }).fill('source');
	await dialog.getByRole('button', { name: 'Save shape', exact: true }).click();
	await expect(dialog).toHaveCount(0);
	expect(state.shapes[0].properties[0].subPropertyOf).toBe('dcterms:source');
	dialog = await open();
	await expect(dialog.getByRole('textbox', { name: 'subPropertyOf 1', exact: true })).toHaveValue(
		'source'
	);
	await dialog.getByRole('textbox', { name: 'subPropertyOf 1', exact: true }).fill('references');
	await dialog.getByRole('button', { name: 'Save shape', exact: true }).click();
	await expect(dialog).toHaveCount(0);
	expect(state.shapes[0].properties[0].subPropertyOf).toBe('dcterms:references');
	dialog = await open();
	await dialog.getByRole('textbox', { name: 'subPropertyOf 1', exact: true }).fill('');
	await dialog.getByRole('button', { name: 'Save shape', exact: true }).click();
	await expect(dialog).toHaveCount(0);
	expect(state.shapes[0].properties[0]).not.toHaveProperty('subPropertyOf');
	expect(state.shapes[0].properties[0].pattern).toBe('^https:');
});
