import { expect, test } from '@playwright/test';

// No real credentials or writes: HTTP contracts are mocked at the browser boundary.
const stamp = '2026-11-04T12:00:00Z';
const metadata = {
	creator: 'urn:test:admin',
	contributor: 'urn:test:admin',
	created: stamp,
	modified: stamp
};
const project = {
	...metadata,
	projectIri: 'urn:test:project',
	projectShortName: 'test',
	namespaceIri: 'https://example.org/test#',
	label: ['Test@en'],
	projectStart: '2026-01-01'
};
const token = `e30.${Buffer.from(JSON.stringify({ sub: 'tester' })).toString('base64url')}.test`;
const prop = {
	...metadata,
	projectid: 'test',
	iri: 'test:title',
	// The API omits the implicit datatype/object property kinds from type.
	type: [],
	datatype: 'xsd:string',
	name: ['Title@en'],
	order: 0
};
const model = {
	project: 'test',
	externalOntologies: [],
	annotationProperties: [],
	resources: [
		{
			...metadata,
			projectid: 'test',
			iri: 'test:Book',
			superclass: ['oldap:Thing'],
			label: ['Book@en'],
			properties: [prop]
		}
	]
};

test.beforeEach(async ({ page }) => {
	await page.route('https://oldap.test/**', async (route) => {
		const url = new URL(route.request().url());
		let json: unknown = {};
		if (url.pathname === '/admin/auth/refresh') json = { accessToken: token };
		else if (url.pathname === '/admin/user/tester')
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
		else if (url.pathname === '/admin/project/get') json = project;
		else if (url.pathname.startsWith('/admin/datamodel/'))
			json =
				route.request().method() === 'POST'
					? { message: 'Updated' }
					: {
							...model,
							project: url.pathname.split('/').at(-1),
							resources: url.pathname.endsWith('/test') ? model.resources : []
						};
		else if (url.pathname === '/data/textsearch/test')
			json =
				url.searchParams.get('countOnly') === 'true'
					? { count: 1 }
					: [{ iri: 'urn:test:book', resclass: 'test:Book', 'test:title': 'Zürich & Basel' }];
		else if (url.pathname === '/admin/hlist/search') json = [];
		else if (
			route.request().method() === 'POST' &&
			decodeURIComponent(url.pathname) === '/data/test/urn:test:book'
		)
			json = { message: 'Updated' };
		else if (
			url.pathname === '/data/test/urn:test:book' ||
			decodeURIComponent(url.pathname) === '/data/test/urn:test:book'
		)
			json = {
				'rdf:type': ['test:Book'],
				'test:title': ['Zürich & Basel'],
				'oldap:createdBy': ['urn:test:admin'],
				'oldap:lastModifiedBy': ['urn:test:admin'],
				'oldap:creationDate': [stamp],
				'oldap:lastModificationDate': [stamp]
			};
		else throw new Error(`Unexpected API call: ${route.request().method()} ${url.pathname}`);
		await route.fulfill({ json });
	});
});

test('restored session displays the user avatar before and after reload', async ({ page }) => {
	await page.route('https://www.gravatar.com/avatar/**', (route) =>
		route.fulfill({
			contentType: 'image/svg+xml',
			body: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="blue"/></svg>'
		})
	);
	await page.goto('/en');
	const avatar = page.locator('img.avatar');
	await expect(avatar).toBeVisible();
	const source = await avatar.getAttribute('src');
	expect(source).toMatch(/^https:\/\/www\.gravatar\.com\/avatar\/[^?]+\?s=200&d=identicon$/);
	await expect.poll(() => avatar.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(40);
	await page.reload();
	await expect(avatar).toBeVisible();
	await expect(avatar).toHaveAttribute('src', source!);
	await expect.poll(() => avatar.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(40);
});

test('desktop window can be closed', async ({ page }) => {
	await page.goto('/en');
	const welcome = page.getByRole('dialog', { name: 'Hello', exact: true });
	await expect(welcome).toBeVisible();
	await welcome.getByRole('button', { name: 'Close window' }).click();
	await expect(welcome).toHaveCount(0);
});

for (const status of [200, 403]) {
	test(`restored session searches and edits with update status ${status}`, async ({ page }) => {
		const searches: string[] = [];
		page.on('request', (request) => {
			if (request.url().includes('/data/textsearch/test')) searches.push(request.url());
		});
		if (status === 403)
			await page.route('https://oldap.test/data/test/*', async (route) => {
				if (route.request().method() === 'POST')
					await route.fulfill({ status: 403, json: { message: 'Permission denied' } });
				else await route.fallback();
			});
		await page.goto('/en');
		await expect(page.getByTitle('Resource class')).toHaveValue('test:Book');
		const request = page.waitForRequest(
			(r) =>
				r.url().includes('/data/textsearch/test') &&
				new URL(r.url()).searchParams.get('countOnly') === 'false'
		);
		await page.getByPlaceholder('Search text').fill('Zürich & Basel');
		await page.getByPlaceholder('Search text').press('Enter');
		const query = new URL((await request).url()).searchParams;
		expect(query.get('searchString')).toBe('Zürich & Basel');
		expect(query.get('resClass')).toBe('test:Book');
		const results = page.getByRole('dialog', { name: 'Search', exact: true });
		await expect(results.getByText('Zürich & Basel', { exact: true })).toBeVisible();
		await expect(results.getByText('Found 1 instances')).toBeVisible();
		// Edit uses the complete RDF identifier, not the first letter or array index.
		const detail = page.waitForRequest(
			(r) => decodeURIComponent(new URL(r.url()).pathname) === '/data/test/urn:test:book'
		);
		await results.getByTitle('Edit', { exact: true }).click();
		await detail;
		const editor = page.getByRole('dialog', { name: 'Edit Instance' });
		await expect(editor.getByRole('textbox').first()).toHaveValue('Zürich & Basel');
		await editor.getByRole('textbox').first().fill('Edited title');
		const update = page.waitForRequest(
			(r) =>
				r.method() === 'POST' &&
				decodeURIComponent(new URL(r.url()).pathname) === '/data/test/urn:test:book'
		);
		await editor.getByRole('button', { name: 'MODIFY', exact: true }).click();
		expect((await update).postDataJSON()).toEqual({ 'test:title': ['Edited title'] });
		if (status === 200)
			await expect(editor.getByRole('button', { name: 'CLOSE', exact: true })).toBeVisible();
		else {
			await expect(editor.getByRole('alert')).toBeVisible();
			await expect(editor.getByRole('button', { name: 'MODIFY', exact: true })).toBeEnabled();
			expect(await editor.getByRole('textbox').first().inputValue()).toBe('Edited title');
		}
		expect(searches).toHaveLength(2);
	});
}

test('model editor submits QName hierarchy changes without replacing its base class', async ({
	page
}) => {
	await page.goto('/en');
	await expect(page.getByTitle('Resource class')).toHaveValue('test:Book');
	await page.getByRole('button', { name: 'Administration', exact: true }).click();
	const row = page.getByRole('row').filter({ hasText: 'Book' });
	await row.getByRole('button').first().click();
	await page.getByRole('button', { name: 'Add item', exact: true }).click();
	await page.getByPlaceholder('Value 1', { exact: true }).fill('Parent');
	await page.getByRole('button', { name: 'Modify', exact: true }).click();
	const update = page.waitForRequest(
		(r) =>
			r.method() === 'POST' &&
			decodeURIComponent(new URL(r.url()).pathname).endsWith('/test/test:Book')
	);
	await page
		.getByRole('dialog', { name: 'Modify resource', exact: true })
		.getByRole('button', { name: 'OK', exact: true })
		.click();
	expect((await update).postDataJSON().superclass).toEqual({ add: ['test:Parent'] });
});

for (const status of [200, 403]) {
	test(`property editor opens repeated properties and submits a flat patch (${status})`, async ({
		page
	}) => {
		const errors: string[] = [];
		page.on('pageerror', (error) => errors.push(error.message));
		const editable = { ...prop, minLength: 1, minCount: 1, maxCount: 3 };
		const localModel = {
			...model,
			resources: [
				{ ...model.resources[0], properties: [editable] },
				{
					...model.resources[0],
					iri: 'test:Article',
					label: ['Article@en'],
					properties: [{ ...prop }]
				}
			]
		};
		const patches: Record<string, unknown>[] = [];
		await page.route('https://oldap.test/admin/datamodel/**', async (route) => {
			const path = decodeURIComponent(new URL(route.request().url()).pathname);
			if (path === '/admin/datamodel/test' && route.request().method() === 'GET') {
				await route.fulfill({ json: localModel });
			} else if (
				path === '/admin/datamodel/test/test:Book/test:title' &&
				route.request().method() === 'POST'
			) {
				const patch = route.request().postDataJSON();
				patches.push(patch);
				// Mirror the current API's flat-patch boundary, not the historical wrapper.
				if (!Object.keys(patch).length || 'property' in patch)
					await route.fulfill({ status: 400, json: { message: 'Expected a nonempty flat patch' } });
				else if (status === 403)
					await route.fulfill({ status, json: { message: 'Permission denied' } });
				else {
					// The real serializer omits constraints removed by a null patch.
					for (const [key, value] of Object.entries(patch)) {
						if (value === null) delete (editable as Record<string, unknown>)[key];
						else (editable as Record<string, unknown>)[key] = value;
					}
					await route.fulfill({ json: { message: 'Updated' } });
				}
			} else await route.fallback();
		});
		await page.goto('/en');
		await expect(page.getByTitle('Resource class')).toHaveValue('test:Book');
		await page.getByRole('button', { name: 'Administration', exact: true }).click();
		await page.getByRole('row').filter({ hasText: 'Book' }).getByRole('button').first().click();
		const titleRow = page.getByRole('row').filter({ hasText: 'Title' });
		await titleRow.getByRole('button').nth(1).click();
		const editor = page
			.locator('form')
			.filter({ has: page.locator('input[placeholder="property ID"]') });
		await expect(editor.locator('input[name="name"]')).toHaveValue('Title');
		await expect(editor.getByRole('button', { name: 'xsd:string', exact: true })).toBeEnabled();
		await expect(page.getByText('OWL STUFF', { exact: true })).toHaveCount(0);
		await expect(page.getByText('Statement property', { exact: true })).toHaveCount(0);
		await editor.locator('input[name="minlength"]').fill('0');
		await editor.locator('input[name="minCount"]').fill('0');
		await editor.locator('input[name="maxCount"]').fill('');
		await editor.locator('input[name="order"]').fill('2');
		await editor.getByRole('button', { name: 'Modify', exact: true }).click();
		await page
			.getByRole('dialog')
			.filter({ has: page.getByRole('button', { name: 'OK', exact: true }) })
			.getByRole('button', { name: 'OK', exact: true })
			.click();
		await expect.poll(() => patches.length).toBe(1);
		expect(patches[0]).toEqual({ minLength: 0, minCount: 0, maxCount: null, order: 2 });
		if (status === 200) {
			await expect(page.getByRole('heading', { name: 'Success', exact: true })).toBeVisible();
			await page.getByRole('button', { name: 'close', exact: true }).click();
			await titleRow.getByRole('button').nth(1).click();
			await expect(editor.locator('input[name="minCount"]')).toHaveValue('0');
			await expect(editor.locator('input[name="maxCount"]')).toHaveValue('');
			await expect(editor.locator('input[name="order"]')).toHaveValue('2');
		} else {
			await expect(page.getByRole('heading', { name: 'ERROR', exact: true })).toBeVisible();
			await page.getByRole('button', { name: 'close', exact: true }).last().click();
			await expect(editor.locator('input[name="minCount"]')).toHaveValue('0');
			await editor.getByRole('button', { name: 'Cancel', exact: true }).click();
			await titleRow.getByRole('button').nth(1).click();
			await expect(editor.locator('input[name="minCount"]')).toHaveValue('1');
			await expect(editor.locator('input[name="maxCount"]')).toHaveValue('3');
		}
		// Editing multilingual values must remain local until a successful save.
		await editor.locator('input[name="name"]').fill('Unsaved title');
		await editor.getByRole('button', { name: 'Cancel', exact: true }).click();
		await expect(titleRow).toBeVisible();
		await titleRow.getByRole('button').nth(1).click();
		await expect(editor.locator('input[name="name"]')).toHaveValue('Title');
		expect(errors).toEqual([]);
	});
}

test('standalone property changes use the current flat contract', async ({ page }) => {
	const standalone = {
		...prop,
		iri: 'test:baseTitle',
		name: ['@home@en', 'Titel@de'],
		pattern: '^[A-Z].*'
	};
	let patch: Record<string, unknown> | undefined;
	await page.route('https://oldap.test/admin/datamodel/**', async (route) => {
		const path = decodeURIComponent(new URL(route.request().url()).pathname);
		if (path === '/admin/datamodel/test' && route.request().method() === 'GET')
			await route.fulfill({ json: { ...model, annotationProperties: [standalone] } });
		else if (
			path === '/admin/datamodel/test/property/test:baseTitle' &&
			route.request().method() === 'POST'
		) {
			patch = route.request().postDataJSON();
			Object.assign(standalone, patch);
			await route.fulfill({ json: { message: 'Updated' } });
		} else await route.fallback();
	});
	await page.goto('/en');
	await expect(page.getByTitle('Resource class')).toHaveValue('test:Book');
	await page.getByRole('button', { name: 'Administration', exact: true }).click();
	await page.getByRole('row').filter({ hasText: '@home' }).getByRole('button').first().click();
	const editor = page
		.locator('form')
		.filter({ has: page.locator('input[placeholder="property ID"]') });
	await expect(editor.locator('input[name="name"]')).toHaveValue('@home');
	await editor
		.getByRole('group', { name: 'Language', exact: true })
		.first()
		.getByRole('button', { name: 'de', exact: true })
		.click();
	await editor.locator('input[name="name"]').fill('Neuer Titel');
	await editor.locator('input[name="pattern"]').fill('');
	await editor.locator('input[name="maxlength"]').fill('80');
	await editor.getByRole('button', { name: 'Modify', exact: true }).click();
	await page
		.getByRole('dialog')
		.filter({ has: page.getByRole('button', { name: 'OK', exact: true }) })
		.getByRole('button', { name: 'OK', exact: true })
		.click();
	await expect
		.poll(() => patch)
		.toEqual({ pattern: null, maxLength: 80, name: ['@home@en', 'Neuer Titel@de'] });
	await expect(page.getByRole('heading', { name: 'Success', exact: true })).toBeVisible();
});

test('changing an ancestor and changing back restores the type without an update', async ({
	page
}) => {
	let writes = 0;
	const parentA = { ...prop, iri: 'test:parentA' };
	const parentB = { ...prop, iri: 'test:parentB', datatype: 'xsd:int' };
	await page.route('https://oldap.test/admin/datamodel/**', async (route) => {
		if (route.request().method() === 'POST') writes++;
		if (new URL(route.request().url()).pathname === '/admin/datamodel/test')
			await route.fulfill({
				json: {
					...model,
					annotationProperties: [parentA, parentB],
					resources: [
						{ ...model.resources[0], properties: [{ ...prop, subPropertyOf: 'test:parentA' }] }
					]
				}
			});
		else await route.fallback();
	});
	await page.goto('/en');
	await expect(page.getByTitle('Resource class')).toHaveValue('test:Book');
	await page.getByRole('button', { name: 'Administration', exact: true }).click();
	await page.getByRole('row').filter({ hasText: 'Book' }).getByRole('button').first().click();
	await page.getByRole('row').filter({ hasText: 'Title' }).getByRole('button').nth(1).click();
	const editor = page
		.locator('form')
		.filter({ has: page.locator('input[placeholder="property ID"]') });
	await expect(editor.getByRole('button', { name: 'xsd:string', exact: true })).toBeDisabled();
	await editor.locator('input[name="subprop"]').fill('parentB');
	await expect(editor.getByRole('button', { name: 'xsd:int', exact: true })).toBeDisabled();
	await editor.locator('input[name="subprop"]').fill('parentA');
	await expect(editor.getByRole('button', { name: 'xsd:string', exact: true })).toBeDisabled();
	await editor.getByRole('button', { name: 'Modify', exact: true }).click();
	await expect(page.getByRole('button', { name: 'OK', exact: true })).toHaveCount(0);
	expect(writes).toBe(0);
});

test('multiple superproperties open intact and survive unrelated property edits', async ({
	page
}) => {
	const parents = ['dc:coverage', 'dcterms:coverage'];
	const editable = { ...prop, subPropertyOf: parents, minCount: 1 };
	const patches: Record<string, unknown>[] = [];
	await page.route('https://oldap.test/admin/datamodel/**', async (route) => {
		const path = decodeURIComponent(new URL(route.request().url()).pathname);
		if (path === '/admin/datamodel/test' && route.request().method() === 'GET') {
			await route.fulfill({
				json: {
					...model,
					annotationProperties: [{ ...prop, iri: 'dc:coverage', datatype: 'xsd:int' }],
					resources: [{ ...model.resources[0], properties: [editable] }]
				}
			});
		} else if (
			path === '/admin/datamodel/test/test:Book/test:title' &&
			route.request().method() === 'POST'
		) {
			const patch = route.request().postDataJSON();
			patches.push(patch);
			// The real serializer omits constraints removed by a null patch.
					for (const [key, value] of Object.entries(patch)) {
						if (value === null) delete (editable as Record<string, unknown>)[key];
						else (editable as Record<string, unknown>)[key] = value;
					}
			await route.fulfill({ json: { message: 'Updated' } });
		} else await route.fallback();
	});
	await page.goto('/en');
	await expect(page.getByTitle('Resource class')).toHaveValue('test:Book');
	await page.getByRole('button', { name: 'Administration', exact: true }).click();
	await page.getByRole('row').filter({ hasText: 'Book' }).getByRole('button').first().click();
	const titleRow = page.getByRole('row').filter({ hasText: 'Title' });
	await titleRow.getByRole('button').nth(1).click();
	const editor = page
		.locator('form')
		.filter({ has: page.locator('input[placeholder="property ID"]') });
	await expect(editor.locator('input[name="subprop"]')).toHaveValue('coverage');
	await expect(editor.locator('input[name="subprop-1"]')).toHaveValue('coverage');
	await expect(editor.getByRole('button', { name: 'dc', exact: true })).toBeVisible();
	await expect(editor.getByRole('button', { name: 'dcterms', exact: true })).toBeVisible();
	await editor.locator('input[name="minCount"]').fill('0');
	await editor.getByRole('button', { name: 'Modify', exact: true }).click();
	await page.getByRole('button', { name: 'OK', exact: true }).click();
	await expect.poll(() => patches.length).toBe(1);
	expect(patches[0]).toEqual({ minCount: 0 });
	expect(editable.subPropertyOf).toEqual(parents);
	await expect(page.getByRole('heading', { name: 'Success', exact: true })).toBeVisible();
	await page.getByRole('button', { name: 'close', exact: true }).click();
	await titleRow.getByRole('button').nth(1).click();
	await editor.getByTitle('Add superproperty', { exact: true }).click();
	await editor.locator('input[name="subprop-2"]').fill('extraParent');
	await editor.getByRole('button', { name: 'Modify', exact: true }).click();
	await page.getByRole('button', { name: 'OK', exact: true }).click();
	await expect.poll(() => patches.length).toBe(2);
	expect(patches[1]).toEqual({ subPropertyOf: [...parents, 'test:extraParent'] });
	await expect(page.getByRole('heading', { name: 'Success', exact: true })).toBeVisible();
	await page.getByRole('button', { name: 'close', exact: true }).click();
	await titleRow.getByRole('button').nth(1).click();
	await editor.getByTitle('Remove superproperty', { exact: true }).nth(2).click();
	await editor.getByTitle('Remove superproperty', { exact: true }).nth(1).click();
	await expect(editor.getByRole('button', { name: 'xsd:string', exact: true })).toBeEnabled();
	await editor.getByRole('button', { name: 'Modify', exact: true }).click();
	await page.getByRole('button', { name: 'OK', exact: true }).click();
	await expect.poll(() => patches.length).toBe(3);
	expect(patches[2]).toEqual({ subPropertyOf: 'dc:coverage' });
});

test('locale navigation and reload preserve the restored session', async ({ page }) => {
	const failures: string[] = [];
	page.on('pageerror', (error) => failures.push(error.message));
	await page.goto('/en');
	await expect(page.locator('img.avatar')).toBeVisible();
	await page.locator('button.lang-menu').click();
	await page.getByRole('menuitem', { name: 'de', exact: true }).click();
	await expect(page).toHaveURL(/\/de\/?$/);
	await expect(page.locator('html')).toHaveAttribute('lang', 'de');
	await expect(page.locator('img.avatar')).toBeVisible();
	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('lang', 'de');
	await expect(page.locator('img.avatar')).toBeVisible();
	expect(failures).toEqual([]);
});
