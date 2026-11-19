import { expect, test as base, type Page, type Locator } from '@playwright/test';

const test = base.extend<{ pageErrors: string[] }>({
	pageErrors: [
		async ({ page }, use, info) => {
			const errors: string[] = [];
			page.on('pageerror', (error) => errors.push(error.message));
			await use(errors);
			if (errors.length)
				await info.attach('browser-errors', { body: errors.join('\n'), contentType: 'text/plain' });
			expect(errors).toEqual([]);
		},
		{ auto: true }
	]
});

// All network boundaries use disposable fixtures; these workflows never contact real data.
const stamp = '2026-11-18T00:00:00Z';
const audit = {
	creator: 'urn:test:admin',
	contributor: 'urn:test:admin',
	created: stamp,
	modified: stamp
};
const project = {
	...audit,
	projectIri: 'urn:test:project',
	projectShortName: 'test',
	namespaceIri: 'https://example.org/test#',
	label: ['Test@en'],
	projectStart: '2026-01-01'
};
const token = `e30.${Buffer.from(JSON.stringify({ sub: 'tester' })).toString('base64url')}.test`;
const property = (iri: string, label: string) => ({
	...audit,
	projectid: 'test',
	iri,
	datatype: 'xsd:string',
	name: [`${label}@en`],
	order: 0
});
const resources = [
	{
		...audit,
		projectid: 'test',
		iri: 'test:Book',
		superclass: ['oldap:Thing'],
		label: ['Book@en'],
		properties: [property('test:title', 'Title'), property('test:title', 'Title')]
	},
	{
		...audit,
		projectid: 'test',
		iri: 'test:Article',
		superclass: ['oldap:Thing'],
		label: ['Article@en'],
		properties: [property('test:headline', 'Headline'), property('test:summary', 'Summary')]
	}
];

test.beforeEach(async ({ page }) => {
	await page.route('https://oldap.test/**', async (route) => {
		const url = new URL(route.request().url());
		let json: unknown;
		if (url.pathname === '/admin/auth/refresh') json = { accessToken: token };
		else if (url.pathname === '/admin/user/tester')
			json = {
				...audit,
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
			json = {
				project: url.pathname.split('/').at(-1),
				externalOntologies: [],
				annotationProperties: [],
				reifierShapes: [],
				resources: url.pathname.endsWith('/test') ? resources : []
			};
		else if (url.pathname === '/admin/hlist/search') json = [];
		else throw new Error(`Unexpected API call: ${route.request().method()} ${url.pathname}`);
		await route.fulfill({ json });
	});
});

async function openList(page: Page) {
	await page.goto('/en');
	await expect(page.getByTitle('Resource class')).toHaveValue('test:Book');
	await page.getByRole('button', { name: 'List Instances', exact: true }).click();
	return page.getByRole('dialog', { name: 'List Instances', exact: true });
}

test('opens List Instances without a reactive failure and retains a second class', async ({
	page
}) => {
	const window = await openList(page);
	await expect(window).toBeVisible();
	await window.getByRole('button', { name: 'Title', exact: true }).click();
	await expect(window.getByRole('menuitem', { name: 'Title', exact: true })).toHaveCount(1);
	await window.getByRole('button', { name: 'Title', exact: true }).click();
	await window.getByRole('button', { name: 'test:Book', exact: true }).click();
	await window.getByRole('menuitem', { name: 'test:Article', exact: true }).click();
	await expect(window.getByRole('button', { name: 'test:Article', exact: true })).toBeVisible();
	await expect(window.getByRole('button', { name: 'Headline', exact: true })).toBeVisible();
	await window.getByTitle('Wert hinzufügen').click();
	await expect(window.getByTitle('Wert entfernen')).toHaveCount(1);
	await expect(window.getByRole('button', { name: 'test:Article', exact: true })).toBeVisible();
	const before = await window.boundingBox();
	const title = await window.getByText('List Instances', { exact: true }).boundingBox();
	expect(before).not.toBeNull();
	expect(title).not.toBeNull();
	await page.mouse.move(title!.x + 30, title!.y + 8);
	await page.mouse.down();
	await page.mouse.move(title!.x + 90, title!.y + 48, { steps: 5 });
	await page.mouse.up();
	await expect.poll(async () => (await window.boundingBox())!.x).toBeGreaterThan(before!.x + 30);
	await expect(window.getByRole('button', { name: 'test:Article', exact: true })).toBeVisible();
});

async function chooseArticle(window: Locator) {
	await window.getByRole('button', { name: 'test:Book', exact: true }).click();
	await window.getByRole('menuitem', { name: 'test:Article', exact: true }).click();
	await expect(window.getByRole('button', { name: 'Headline', exact: true })).toBeVisible();
	await window.getByTitle('Wert hinzufügen').click();
}

test('retrieves scalar IDs, keeps numeric text intact, then shows empty and recoverable errors', async ({
	page
}) => {
	let mode: 'results' | 'empty' | 'error' = 'results';
	const requests: URL[] = [];
	await page.route('https://oldap.test/data/ofclass/test?*', async (route) => {
		const url = new URL(route.request().url());
		requests.push(url);
		if (mode === 'error' && url.searchParams.get('countOnly') === 'false') {
			await route.fulfill({ status: 500, json: { message: 'Instance list unavailable' } });
		} else
			await route.fulfill({
				json:
					url.searchParams.get('countOnly') === 'true'
						? { count: mode === 'empty' ? 0 : 2 }
						: mode === 'empty'
							? []
							: [{ iri: 'urn:test:article', resclass: 'test:Article', 'test:headline': '42' }]
			});
	});
	const window = await openList(page);
	await chooseArticle(window);
	await window.getByRole('button', { name: 'Retrieve', exact: true }).click();
	await expect(window.getByRole('status')).toHaveText('Found 2 instances');
	await expect(window.getByText('Showing 1–1 of 2 instances.', { exact: true })).toBeVisible();
	await expect(window.getByRole('cell', { name: '42', exact: true })).toBeVisible();
	await expect(window.getByTitle('Edit', { exact: true })).toHaveCount(1);
	expect(requests).toHaveLength(2);
	expect(requests.map((url) => url.searchParams.get('resClass'))).toEqual([
		'test:Article',
		'test:Article'
	]);
	const countRequest = requests.find((url) => url.searchParams.get('countOnly') === 'true');
	const listRequest = requests.find((url) => url.searchParams.get('countOnly') === 'false');
	expect(countRequest).toBeDefined();
	expect(listRequest).toBeDefined();
	expect(listRequest!.searchParams.getAll('includeProperties[]')).toEqual(['test:headline']);
	expect(listRequest!.searchParams.get('limit')).toBe('25');
	expect(listRequest!.searchParams.get('offset')).toBe('0');
	// Opening the editor must use the complete scalar identifier, not its first character.
	await page.route('https://oldap.test/data/test/*', async (route) => {
		expect(decodeURIComponent(new URL(route.request().url()).pathname)).toBe(
			'/data/test/urn:test:article'
		);
		await route.fulfill({
			json: {
				'rdf:type': ['test:Article'],
				'test:headline': ['42'],
				'oldap:createdBy': ['urn:test:admin'],
				'oldap:lastModifiedBy': ['urn:test:admin'],
				'oldap:creationDate': [stamp],
				'oldap:lastModificationDate': [stamp]
			}
		});
	});
	await window.getByTitle('Edit', { exact: true }).click();
	const editor = page.getByRole('dialog', { name: 'Edit Instance', exact: true });
	await expect(editor.getByRole('textbox').first()).toHaveValue('42');
	await editor.getByRole('button', { name: 'Close window' }).click();
	mode = 'empty';
	await window.getByRole('button', { name: 'Retrieve', exact: true }).click();
	await expect(window.getByRole('status')).toHaveText('Found 0 instances');
	await expect(window.getByRole('table')).toHaveCount(0);
	mode = 'error';
	await window.getByRole('button', { name: 'Retrieve', exact: true }).click();
	const popup = page.getByRole('alertdialog', { name: 'ERROR', exact: true });
	await expect(popup).toContainText('Instance list unavailable');
	await popup.getByRole('button', { name: 'close', exact: true }).click();
	await expect(window.getByRole('button', { name: 'Retrieve', exact: true })).toBeEnabled();
	await expect(window.getByRole('button', { name: 'test:Article', exact: true })).toBeVisible();
	mode = 'results';
	await window.getByRole('button', { name: 'Retrieve', exact: true }).click();
	await expect(window.getByRole('cell', { name: '42', exact: true })).toBeVisible();
});

test('keeps the chosen class and properties through transparent token refresh', async ({
	page
}) => {
	let unauthorized = true;
	let refreshes = 0;
	page.on('request', (request) => {
		if (new URL(request.url()).pathname === '/admin/auth/refresh') refreshes++;
	});
	const requests: URL[] = [];
	await page.route('https://oldap.test/data/ofclass/test?*', async (route) => {
		const url = new URL(route.request().url());
		requests.push(url);
		if (unauthorized) {
			unauthorized = false;
			await route.fulfill({ status: 401, json: { message: 'Expired access token' } });
		} else
			await route.fulfill({
				json:
					url.searchParams.get('countOnly') === 'true'
						? { count: 1 }
						: [{ iri: 'urn:test:article', 'test:headline': 'Refreshed session' }]
			});
	});
	const window = await openList(page);
	await chooseArticle(window);
	await window.getByRole('button', { name: 'Retrieve', exact: true }).click();
	await expect(window.getByRole('cell', { name: 'Refreshed session' })).toBeVisible();
	await expect(window.getByRole('button', { name: 'test:Article', exact: true })).toBeVisible();
	expect(refreshes).toBe(2);
	expect(requests).toHaveLength(3);
	expect(
		requests
			.filter((url) => url.searchParams.get('countOnly') === 'false')
			.at(-1)!
			.searchParams.getAll('includeProperties[]')
	).toEqual(['test:headline']);
});

test('ignores a late failed request after its list window is closed', async ({ page }) => {
	let release!: () => void;
	const held = new Promise<void>((resolve) => {
		release = resolve;
	});
	await page.route('https://oldap.test/data/ofclass/test?*', async (route) => {
		await held;
		await route.fulfill({ status: 500, json: { message: 'Late instance failure' } });
	});
	const window = await openList(page);
	const requested = page.waitForRequest(
		(request) => new URL(request.url()).pathname === '/data/ofclass/test'
	);
	await window.getByRole('button', { name: 'Retrieve', exact: true }).click();
	await requested;
	await window.getByRole('button', { name: 'Close window' }).click();
	const response = page.waitForResponse(
		(value) => new URL(value.url()).pathname === '/data/ofclass/test'
	);
	release();
	await response;
	await page.getByRole('button', { name: 'List Instances', exact: true }).click();
	await expect(
		page
			.getByRole('dialog', { name: 'List Instances', exact: true })
			.getByRole('button', { name: 'test:Book', exact: true })
	).toBeVisible();
	await expect(page.getByRole('alertdialog', { name: 'ERROR' })).toHaveCount(0);
});

test('pages all 61 instances, retains failed pages and applies changed columns only on Retrieve', async ({
	page
}) => {
	const requests: URL[] = [];
	let failNext = false;
	await page.route('https://oldap.test/data/ofclass/test?*', async (route) => {
		const url = new URL(route.request().url());
		requests.push(url);
		const article = url.searchParams.get('resClass') === 'test:Article';
		const total = article ? 61 : 1;
		if (url.searchParams.get('countOnly') === 'true') {
			await route.fulfill({ json: { count: total } });
			return;
		}
		if (failNext) {
			failNext = false;
			await route.fulfill({ status: 500, json: { message: 'Page temporarily unavailable' } });
			return;
		}
		const offset = Number(url.searchParams.get('offset'));
		const limit = Number(url.searchParams.get('limit'));
		const columns = url.searchParams.getAll('includeProperties[]');
		const rows = Array.from(
			{ length: Math.min(limit, Math.max(0, total - offset)) },
			(_, index) => {
				const number = String(offset + index + 1).padStart(3, '0');
				return {
					iri: `urn:test:${article ? 'article' : 'book'}:${number}`,
					...Object.fromEntries(
						columns.map((column) => [
							column,
							column === 'test:summary'
								? `Summary ${number}`
								: `${article ? 'Article' : 'Book'} ${number}`
						])
					)
				};
			}
		);
		await route.fulfill({ json: rows });
	});
	const window = await openList(page);
	await chooseArticle(window);
	const previous = window.getByRole('button', { name: 'Previous page', exact: true });
	const next = window.getByRole('button', { name: 'Next page', exact: true });
	const retrieve = window.getByRole('button', { name: 'Retrieve', exact: true });
	await retrieve.click();
	await expect(window.getByText('Page 1 of 3', { exact: true })).toBeVisible();
	await expect(window.getByText('Showing 1–25 of 61 instances.', { exact: true })).toBeVisible();
	await expect(window.locator('tbody tr')).toHaveCount(25);
	await expect(previous).toBeDisabled();
	await expect(next).toBeEnabled();
	await next.click();
	await expect(window.getByText('Page 2 of 3', { exact: true })).toBeVisible();
	await expect(window.getByText('Showing 26–50 of 61 instances.', { exact: true })).toBeVisible();
	await expect(window.getByRole('cell', { name: 'Article 026', exact: true })).toBeVisible();
	await next.click();
	await expect(window.getByText('Page 3 of 3', { exact: true })).toBeVisible();
	await expect(window.getByText('Showing 51–61 of 61 instances.', { exact: true })).toBeVisible();
	await expect(window.locator('tbody tr')).toHaveCount(11);
	await expect(next).toBeDisabled();
	await previous.click();
	await expect(window.getByText('Page 2 of 3', { exact: true })).toBeVisible();
	// New selected columns are a draft until Retrieve; paging uses the last successful query.
	await expect(window.getByRole('button', { name: 'Summary', exact: true })).toBeVisible();
	await window.getByTitle('Wert hinzufügen').click();
	failNext = true;
	await next.click();
	const popup = page.getByRole('alertdialog', { name: 'ERROR', exact: true });
	await expect(popup).toContainText('Page temporarily unavailable');
	await popup.getByRole('button', { name: 'close', exact: true }).click();
	await expect(window.getByText('Page 2 of 3', { exact: true })).toBeVisible();
	await expect(window.locator('tbody tr')).toHaveCount(25);
	await expect(window.getByRole('cell', { name: 'Article 026', exact: true })).toBeVisible();
	await expect(window.getByRole('columnheader', { name: 'Summary', exact: true })).toHaveCount(0);
	await next.click();
	await expect(window.getByText('Page 3 of 3', { exact: true })).toBeVisible();
	await expect(window.getByRole('columnheader', { name: 'Summary', exact: true })).toHaveCount(0);
	const pagingRequests = requests.filter((url) => url.searchParams.get('countOnly') === 'false');
	expect(pagingRequests.map((url) => url.searchParams.get('offset'))).toEqual([
		'0',
		'25',
		'50',
		'25',
		'50',
		'50'
	]);
	expect(pagingRequests.every((url) => url.searchParams.get('limit') === '25')).toBe(true);
	expect(
		pagingRequests.every(
			(url) =>
				JSON.stringify(url.searchParams.getAll('includeProperties[]')) ===
				JSON.stringify(['test:headline'])
		)
	).toBe(true);
	await retrieve.click();
	await expect(window.getByText('Page 1 of 3', { exact: true })).toBeVisible();
	await expect(window.getByRole('columnheader', { name: 'Summary', exact: true })).toBeVisible();
	await expect(window.getByRole('cell', { name: 'Summary 001', exact: true })).toBeVisible();
	await next.click();
	await expect(window.getByText('Page 2 of 3', { exact: true })).toBeVisible();
	await window.getByRole('button', { name: 'test:Article', exact: true }).click();
	await window.getByRole('menuitem', { name: 'test:Book', exact: true }).click();
	await expect(window.getByRole('table')).toHaveCount(0);
	await window.getByTitle('Wert hinzufügen').click();
	await retrieve.click();
	await expect(window.getByText('Page 1 of 1', { exact: true })).toBeVisible();
	await expect(window.getByRole('cell', { name: 'Book 001', exact: true })).toBeVisible();
	await expect(previous).toBeDisabled();
	await expect(next).toBeDisabled();
	const listRequests = requests.filter((url) => url.searchParams.get('countOnly') === 'false');
	expect(listRequests.at(-1)!.searchParams.get('offset')).toBe('0');
	expect(listRequests.at(-1)!.searchParams.get('resClass')).toBe('test:Book');
	expect(listRequests.at(-1)!.searchParams.getAll('includeProperties[]')).toEqual(['test:title']);
	expect(requests.filter((url) => url.searchParams.get('countOnly') === 'true')).toHaveLength(
		listRequests.length
	);
});

test('clamps pagination when the server total shrinks and handles an empty result', async ({
	page
}) => {
	let total = 61;
	const offsets: number[] = [];
	await page.route('https://oldap.test/data/ofclass/test?*', async (route) => {
		const url = new URL(route.request().url());
		if (url.searchParams.get('countOnly') === 'true') {
			await route.fulfill({ json: { count: total } });
			return;
		}
		const offset = Number(url.searchParams.get('offset'));
		offsets.push(offset);
		await route.fulfill({
			json: Array.from({ length: Math.max(0, Math.min(25, total - offset)) }, (_, index) => ({
				iri: `urn:test:article:${offset + index + 1}`,
				'test:headline': `Article ${offset + index + 1}`
			}))
		});
	});
	const window = await openList(page);
	await chooseArticle(window);
	await window.getByRole('button', { name: 'Retrieve', exact: true }).click();
	await expect(window.getByText('Page 1 of 3', { exact: true })).toBeVisible();
	await window.getByRole('button', { name: 'Next page', exact: true }).click();
	await expect(window.getByText('Page 2 of 3', { exact: true })).toBeVisible();
	total = 26;
	await window.getByRole('button', { name: 'Next page', exact: true }).click();
	await expect(window.getByText('Page 2 of 2', { exact: true })).toBeVisible();
	await expect(window.getByText('Showing 26–26 of 26 instances.', { exact: true })).toBeVisible();
	await expect(window.locator('tbody tr')).toHaveCount(1);
	await expect(window.getByRole('cell', { name: 'Article 26', exact: true })).toBeVisible();
	await expect(window.getByRole('button', { name: 'Next page', exact: true })).toBeDisabled();
	expect(offsets).toEqual([0, 25, 50, 25]);
	total = 0;
	await window.getByRole('button', { name: 'Previous page', exact: true }).click();
	await expect(window.getByRole('status')).toHaveText('Found 0 instances');
	await expect(window.getByRole('table')).toHaveCount(0);
	expect(offsets.at(-1)).toBe(0);
});

test('starts the requested page before the count response is released', async ({ page }) => {
	let releaseCount!: () => void;
	const listStarted = new Promise<void>((resolve) => {
		releaseCount = resolve;
	});
	let countSent = false;
	let overlap = false;
	await page.route('https://oldap.test/data/ofclass/test?*', async (route) => {
		const url = new URL(route.request().url());
		if (url.searchParams.get('countOnly') === 'true') {
			// A serial implementation cannot progress: only the page request releases this response.
			await listStarted;
			countSent = true;
			await route.fulfill({ json: { count: 1 } });
		} else {
			overlap = !countSent;
			releaseCount();
			await route.fulfill({
				json: [{ iri: 'urn:test:article:parallel', 'test:headline': 'Concurrent result' }]
			});
		}
	});
	const window = await openList(page);
	await chooseArticle(window);
	await window.getByRole('button', { name: 'Retrieve', exact: true }).click();
	await expect.poll(() => overlap).toBe(true);
	await expect(window.getByRole('cell', { name: 'Concurrent result', exact: true })).toBeVisible();
	await expect(window.getByRole('status')).toHaveText('Found 1 instances');
});

test('loads media details in bounded concurrent batches and retains a row with missing details', async ({
	page
}) => {
	const mediaClass = {
		...audit,
		projectid: 'test',
		iri: 'test:Media',
		superclass: ['shared:MediaObject'],
		properties: [property('test:title', 'Media title')]
	};
	await page.route('https://oldap.test/admin/datamodel/test', (route) =>
		route.fulfill({
			json: {
				project: 'test',
				externalOntologies: [],
				annotationProperties: [],
				reifierShapes: [],
				resources: [...resources, mediaClass]
			}
		})
	);
	await page.route('https://oldap.test/data/ofclass/test?*', (route) =>
		route.fulfill({
			json:
				new URL(route.request().url()).searchParams.get('countOnly') === 'true'
					? { count: 12 }
					: Array.from({ length: 12 }, (_, index) => ({
							iri: `urn:test:media:${index + 1}`,
							'test:title': `Media ${String(index + 1).padStart(2, '0')}`
						}))
		})
	);
	let active = 0;
	let maximum = 0;
	let requested = 0;
	let completed = 0;
	const releases: (() => void)[] = [];
	await page.route('https://oldap.test/data/mediaobject/iri/*', async (route) => {
		const iri = decodeURIComponent(new URL(route.request().url()).pathname.split('/').at(-1)!);
		requested++;
		active++;
		maximum = Math.max(maximum, active);
		await new Promise<void>((resolve) => {
			releases.push(resolve);
		});
		if (iri === 'urn:test:media:7')
			await route.fulfill({ status: 404, json: { message: 'MediaObject not found' } });
		else
			await route.fulfill({
				json: {
					...audit,
					iri,
					graph: 'test',
					'dcterms:type': 'dcmitype:Text',
					'oldap:attachedToRole': [],
					permval: 1,
					'shared:assetId': iri,
					'shared:derivativeName': '',
					'shared:originalMimeType': 'text/plain',
					'shared:originalName': iri,
					'shared:protocol': 'http',
					'shared:serverUrl': 'https://media.invalid'
				}
			});
		active--;
		completed++;
	});
	const window = await openList(page);
	await window.getByRole('button', { name: 'test:Book', exact: true }).click();
	await window.getByRole('menuitem', { name: 'test:Media', exact: true }).click();
	await expect(window.getByRole('button', { name: 'Media title', exact: true })).toBeVisible();
	await window.getByTitle('Wert hinzufügen').click();
	await window.getByRole('button', { name: 'Retrieve', exact: true }).click();
	// Hold all in-flight responses. A serial loader cannot reach five; an unbounded loader exceeds five.
	for (const expected of [5, 10, 12]) {
		await expect.poll(() => requested).toBe(expected);
		await page.evaluate(
			() =>
				new Promise<void>((resolve) =>
					requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
				)
		);
		expect(requested).toBe(expected);
		expect(active).toBe(expected === 12 ? 2 : 5);
		releases.splice(0).forEach((release) => release());
	}
	await expect(window.getByRole('status')).toHaveText('Found 12 instances');
	await expect(window.locator('tbody tr')).toHaveCount(12);
	await expect(window.getByRole('cell', { name: 'Media 07', exact: true })).toBeVisible();
	await expect(window.locator('button[title="Delete"]:disabled')).toHaveCount(11);
	await expect(page.getByRole('alertdialog', { name: 'ERROR' })).toHaveCount(0);
	expect(maximum).toBe(5);
	expect(completed).toBe(12);
});

for (const pages of [5, 10]) {
	test(`compact page controls navigate ${pages} pages with centered numbers and bounded jumps`, async ({
		page
	}) => {
		const offsets: number[] = [];
		await page.route('https://oldap.test/data/ofclass/test?*', async (route) => {
			const url = new URL(route.request().url());
			if (url.searchParams.get('countOnly') === 'true') {
				await route.fulfill({ json: { count: pages * 25 } });
				return;
			}
			const offset = Number(url.searchParams.get('offset'));
			offsets.push(offset);
			expect(url.searchParams.get('limit')).toBe('25');
			await route.fulfill({
				json: Array.from({ length: 25 }, (_, index) => ({
					iri: `urn:test:article:${offset + index + 1}`,
					'test:headline': `Article ${offset + index + 1}`
				}))
			});
		});
		const window = await openList(page);
		await chooseArticle(window);
		await window.getByRole('button', { name: 'Retrieve', exact: true }).click();
		const controls = window.getByRole('navigation', { name: 'Resource pages', exact: true });
		const numbered = controls.getByRole('button', { name: /^Go to page \d+$/ });
		const first = controls.getByRole('button', { name: 'First page', exact: true });
		const last = controls.getByRole('button', { name: 'Last page', exact: true });
		await expect(numbered).toHaveText(['1', '2', '3', '4', '5']);
		await expect(
			controls.getByRole('button', { name: 'Go to page 1', exact: true })
		).toHaveAttribute('aria-current', 'page');
		await expect(first).toBeDisabled();
		await expect(
			controls.getByRole('button', { name: 'Previous page', exact: true })
		).toBeDisabled();
		await expect(last).toBeEnabled();
		await expect(controls.getByText('…', { exact: true })).toHaveCount(pages === 10 ? 1 : 0);
		const middle = pages === 10 ? 5 : 3;
		await controls.getByRole('button', { name: `Go to page ${middle}`, exact: true }).click();
		await expect(window.getByText(`Page ${middle} of ${pages}`, { exact: true })).toBeVisible();
		await expect(numbered).toHaveText(
			pages === 10 ? ['3', '4', '5', '6', '7'] : ['1', '2', '3', '4', '5']
		);
		await expect(controls.locator('[aria-current="page"]')).toHaveCount(1);
		await expect(
			controls.getByRole('button', { name: `Go to page ${middle}`, exact: true })
		).toHaveAttribute('aria-current', 'page');
		await expect(controls.getByText('…', { exact: true })).toHaveCount(pages === 10 ? 2 : 0);
		await expect(first).toBeEnabled();
		await expect(
			window.getByRole('cell', { name: `Article ${(middle - 1) * 25 + 1}`, exact: true })
		).toBeVisible();
		await last.click();
		await expect(window.getByText(`Page ${pages} of ${pages}`, { exact: true })).toBeVisible();
		await expect(numbered).toHaveText(
			pages === 10 ? ['6', '7', '8', '9', '10'] : ['1', '2', '3', '4', '5']
		);
		await expect(
			controls.getByRole('button', { name: `Go to page ${pages}`, exact: true })
		).toHaveAttribute('aria-current', 'page');
		await expect(controls.getByText('…', { exact: true })).toHaveCount(pages === 10 ? 1 : 0);
		await expect(last).toBeDisabled();
		await expect(controls.getByRole('button', { name: 'Next page', exact: true })).toBeDisabled();
		await first.click();
		await expect(window.getByText(`Page 1 of ${pages}`, { exact: true })).toBeVisible();
		await expect(numbered).toHaveText(['1', '2', '3', '4', '5']);
		await expect(first).toBeDisabled();
		await expect(
			controls.getByRole('button', { name: 'Previous page', exact: true })
		).toBeDisabled();
		expect(offsets).toEqual([0, (middle - 1) * 25, (pages - 1) * 25, 0]);
	});
}
