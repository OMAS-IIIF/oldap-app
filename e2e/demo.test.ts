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
	type: ['owl:DatatypeProperty'],
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
