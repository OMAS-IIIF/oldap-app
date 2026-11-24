<!--
  - Copyright (©) 2026. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
  -->
<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import * as m from '#lib/paraglide/messages.js';
	import { errorInfoStore } from '#lib/stores/errorinfo.ts';
	import { process_api_error } from '#lib/helpers/process_api_error.ts';
	import { searchResults } from '#lib/helpers/searchResults.ts';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { convertToLanguage, Language } from '#lib/oldap/enums/language.ts';
	import { AuthInfo } from '#lib/oldap/classes/authinfo.ts';
	import { authInfoStore } from '#lib/stores/authinfo.ts';
	import { authenticatedFetch } from '#lib/auth/authenticatedFetch.ts';
	import { datamodelStore } from '#lib/stores/datamodel.ts';
	import { projectStore } from '#lib/stores/project.ts';
	import DropdownField from '#lib/components/basic_gui/inputs/DropdownField.svelte';
	import {
		Pencil,
		Trash2,
		List,
		ChevronLeft,
		ChevronRight,
		ChevronsLeft,
		ChevronsRight
	} from '@lucide/svelte';
	import { api_config } from '#lib/helpers/api_config.ts';
	import { apiClient } from '#lib/shared/apiClient.ts';
	import SelectMutiple from '#lib/components/basic_gui/inputs/SelectMutiple.svelte';
	import { extractLang, LangString } from '#lib/oldap/datatypes/langstring.ts';
	import { createWindow } from '#lib/stores/windows.ts';
	import InstanceEditor from '#lib/components/oldap/InstanceEditor.svelte';
	import { is_mediaobject } from '#lib/helpers/is_mediaobject.ts';
	import * as publicEnv from '$app/env/public';
	import { MediaObject } from '#lib/oldap/classes/mediaobject.ts';
	import IIIFViewer from '#lib/components/basic_gui/IIIFViewer.svelte';
	import VideoViewer from '#lib/components/basic_gui/VideoViewer.svelte';
	import { mediaAssetDerivativeUrl, withMediaToken } from '#lib/shared/mediaUrl.ts';

	type Values = (string | number | boolean | null)[];
	type Result = Record<string, Record<string, Values | MediaObject | null>>;

	let lang = $state(getLocale());
	let langobj = $derived(convertToLanguage(lang) ?? Language.EN);

	// Auto-subscriptions end when the desktop window closes.
	const authinfo = $derived($authInfoStore);
	const userId = $derived(authinfo?.userid);
	const project = $derived($projectStore);
	const projectId = $derived(project?.projectShortName.toString());
	const datamodel = $derived(
		$datamodelStore?.projectid.toString() === projectId ? $datamodelStore : null
	);
	const res_list = $derived([
		...new Set(
			(datamodel?.resources ?? [])
				.filter(
					(resource) =>
						![...(resource.superclass ?? [])].some(
							(parent) => parent.toString() === 'oldap:OldapListNode'
						)
				)
				.map((resource) => resource.iri.toString())
		)
	]);
	let selres = $state('');
	const resource = $derived(datamodel?.resources.find((item) => item.iri.toString() === selres));
	const is_mo = $derived(is_mediaobject(resource));
	// Inherited/reused properties may repeat an IRI. Keep one choice per predicate,
	// and sort a copy so this viewer never changes the shared data model.
	const all_props = $derived(
		new Set([
			...new Map(
				[...(resource?.properties ?? [])]
					.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))
					.map((prop) => [
						prop.propertyIri.toString(),
						{
							key: prop.propertyIri.toString(),
							label: prop.name?.get(langobj)
						}
					])
			).values()
		])
	);
	let selprops = $state<Set<string>>(new Set());
	let resultColumns = $state<string[]>([]);
	const pageSize = 25;
	let pageIndex = $state(0);
	let count = $state(0);
	const pageCount = $derived(Math.max(1, Math.ceil(count / pageSize)));
	// Center five page numbers on the current page, clamping at either boundary.
	const firstPage = $derived(Math.max(0, Math.min(pageIndex - 2, pageCount - 5)));
	const visiblePages = $derived(
		Array.from({ length: Math.min(5, pageCount) }, (_, i) => firstPage + i)
	);
	const pageButtonClass =
		'flex h-8 min-w-8 items-center justify-center px-2 text-sm tabular-nums transition-colors focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-35';
	const idlePageClass = 'hover:bg-indigo-50 dark:hover:bg-indigo-950 disabled:hover:bg-transparent';
	let results = $state<Result>({});
	let loading = $state(false);
	let completed = $state(false);
	let requestVersion = 0;
	onDestroy(() => {
		requestVersion++;
	});

	$effect(() => {
		if (!res_list.includes(selres)) selres = res_list[0] ?? '';
	});

	// Invalidate on identity changes, not token refreshes or equivalent model reloads.
	$effect(() => {
		void [selres, projectId, userId];
		untrack(() => {
			requestVersion++;
			selprops = new Set();
			resultColumns = [];
			results = {};
			count = 0;
			pageIndex = 0;
			completed = false;
			loading = false;
		});
	});

	const mediaurl = publicEnv.PUBLIC_MEDIASERVER_URL;

	function safe_iiif_url(
		assetId: string,
		region: string,
		size: string,
		angle: number,
		format: string,
		mediaToken?: string
	): string {
		const url = new URL(
			`${mediaurl}/iiif/3/${assetId}/${region}/${size}/${Math.round(angle)}/${format}`
		);
		return withMediaToken(url.toString(), mediaToken);
	}

	function safe_videothumb_url(assetId: string, size: '128' | '256', mediaToken?: string): string {
		return mediaAssetDerivativeUrl(
			`${mediaurl}/asset/${assetId}/derived`,
			`thumb${size}.jpg`,
			mediaToken
		);
	}

	function safe_video_url(assetId: string): string {
		return new URL(`${mediaurl}/asset/${assetId}`).toString();
	}

	/** Preserve literal text: numeric strings must not be guessed to be dates. */
	function formatCellValue(value: string | number | boolean | null): string {
		return value === null ? '' : String(value);
	}

	function cellValues(
		row: Record<string, Values | MediaObject | null> | undefined,
		prop: string
	): (string | number | boolean | null)[] {
		const value = row?.[prop];
		return Array.isArray(value) ? value : [];
	}

	function openEditor(iri: string) {
		createWindow('Edit Instance', editInstance, [iri] as [string], {
			x: 220,
			y: 80,
			width: 400,
			height: 600
		});
	}

	function openIIIFViewer(iri: string) {
		if (!(
			results[iri]['mo'] &&
			results[iri]['mo'] instanceof MediaObject &&
			results[iri]['mo']?.type == 'dcmitype:StillImage'
		))
			return;
		const base_url = `${mediaurl}/iiif/3/${results[iri]['mo']?.assetId}`;
		const mediaToken = results[iri]['mo']?.mediaToken;
		createWindow(
			results[iri]['mo'].originalName,
			iiifViewer,
			[base_url, mediaToken] as [string, string | undefined],
			{ x: 50, y: 50, width: 600, height: 500 }
		);
	}

	function openVideoViewer(iri: string) {
		if (!(
			results[iri]['mo'] &&
			results[iri]['mo'] instanceof MediaObject &&
			results[iri]['mo']?.type == 'dcmitype:MovingImage'
		))
			return;
		const video_url = safe_video_url(results[iri]['mo']?.assetId);
		const mediaToken = results[iri]['mo']?.mediaToken;
		createWindow(
			results[iri]['mo'].originalName,
			videoViewer,
			[video_url, mediaToken, results[iri]['mo'].originalName] as [
				string,
				string | undefined,
				string
			],
			{ x: 50, y: 50, width: 820, height: 620 }
		);
	}

	function deleteInstance(iri: string) {
		const ok = window.confirm(`Do you really want to delete item ${iri}?`);
		if (!ok) return;

		const delete_data = api_config(authinfo || new AuthInfo('unknown', ''), {
			project: project?.projectShortName?.toString() || '',
			instiri: iri
		});
		apiClient
			.deleteDataByProjectByInstiri(delete_data)
			.then(() => {
				delete results[iri];
				window.alert('Instance deleted successfully');
			})
			.catch((err) => {
				window.alert('Error deleting instance: ' + err.message);
			});
		console.log('delete instance', iri);
	}

	async function deleteAsset(url: string, accessToken?: string): Promise<Response> {
		return authenticatedFetch(url, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
			}
		});
	}

	async function deleteMediaObject(iri: string) {
		const ok = window.confirm(`Do you really want to delete item ${iri}?`);
		if (!ok) return;

		console.log('delete mediaobject', iri);
		const mo = results[iri];

		if (mo && mo['mo'] instanceof MediaObject) {
			const assetId = mo['mo'].assetId;
			const token = authinfo?.token || '';
			const url = `${publicEnv.PUBLIC_MEDIASERVER_URL}/upload/${assetId}`;
			deleteAsset(url, token)
				.then(() => {
					delete results[iri];
					window.alert('MediaObject deleted successfully');
				})
				.catch((err) => {
					window.alert('Error deleting instance: ' + err.message);
				});
		}
	}

	/** Fetch a 25-row page and a fresh total, clamping pages when data was removed.
	 * Navigation retains the submitted columns; Retrieve applies the current choices.
	 * Publish page/rows atomically on success so failures leave a retryable current page.
	 * Closed windows and changed contexts must not receive late results/errors. */
	async function do_search(requestedPage = 0, fresh = true) {
		if (!authinfo || !datamodel || !project || !selres || loading) return;
		const version = ++requestVersion;
		const credentials = authinfo;
		const projectId = project.projectShortName.toString();
		const classId = selres;
		const columns = fresh
			? selprops.size
				? [...selprops]
				: ['oldap:creationDate']
			: [...resultColumns];
		const media = is_mo;
		const language = langobj;
		loading = true;
		try {
			const config = {
				...api_config(credentials),
				path: { project: projectId }
			};
			const fetchPage = (page: number) =>
				apiClient.getDataOfclassByProject({
					...config,
					query: {
						resClass: classId,
						countOnly: false,
						includeProperties: columns,
						limit: pageSize,
						offset: page * pageSize
					}
				});
			// Independent reads share one network wait; neither depends on the other's response.
			const [countResponse, requestedData] = await Promise.all([
				apiClient.getDataOfclassByProject({
					...config,
					query: { resClass: classId, countOnly: true }
				}),
				fetchPage(requestedPage)
			]);
			if (version !== requestVersion) return;
			if (Array.isArray(countResponse) || !('count' in countResponse)) {
				throw new Error('Invalid instance count response');
			}
			const targetPage = Math.min(
				requestedPage,
				Math.max(0, Math.ceil(countResponse.count / pageSize) - 1)
			);
			// Only a shrinking total needs an additional read of the corrected last page.
			const data = targetPage === requestedPage ? requestedData : await fetchPage(targetPage);
			if (version !== requestVersion) return;
			if (!Array.isArray(data)) throw new Error('Invalid instance list response');
			const rows: Result = {};
			for (const [iri, properties] of Object.entries(searchResults(data))) {
				const row: Result[string] = {};
				for (const [predicate, values] of Object.entries(properties)) {
					row[predicate] =
						values.length && values.every((value) => extractLang(value))
							? [LangString.fromStringArray(values).get(language)]
							: values;
				}
				rows[iri] = row;
			}
			if (media) {
				// Bound fan-out to five requests, avoiding both serial waits and a 25-request burst.
				const iris = Object.keys(rows);
				for (let start = 0; start < iris.length; start += 5) {
					if (version !== requestVersion) return;
					await Promise.all(
						iris.slice(start, start + 5).map(async (iri) => {
							try {
								rows[iri].mo = MediaObject.fromOldapJson(
									await apiClient.getDataMediaobjectIriByIri(
										api_config(credentials, { iri: iri })
									)
								);
							} catch (cause) {
								// A missing preview must not hide the resource itself.
								console.error(`Could not load mediaobject details for "${iri}"`, cause);
							}
						})
					);
				}
			}
			if (version !== requestVersion) return;
			resultColumns = columns;
			results = rows;
			count = countResponse.count;
			pageIndex = targetPage;
			completed = true;
		} catch (cause) {
			if (version === requestVersion) errorInfoStore.set(process_api_error(cause as Error));
		} finally {
			if (version === requestVersion) loading = false;
		}
	}
</script>

<div aria-busy={loading}>
	<form>
		<DropdownField
			items={res_list}
			id="allres_id"
			name="allres"
			label="FROM RESOURCE TYPE"
			bind:selectedItem={selres}
			disabled={loading || !res_list.length}
		/>
		<SelectMutiple
			selectables={all_props}
			label="SHOW PROPERTIES"
			bind:values={selprops}
			disabled={loading || !selres}
		/>

		<div class="mt-4 flex items-center gap-2">
			<button
				type="button"
				class="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
				onclick={() => do_search()}
				disabled={loading || !selres || !authinfo}
			>
				<List size={16} />
				{loading ? 'Loading…' : 'Retrieve'}
			</button>
		</div>
	</form>
	<hr />
	{#if completed}
		<div class="mt-2" role="status">Found {count} instances</div>
		{#if count > 0}
			<nav
				aria-label={m.instances_pagination()}
				class="my-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2"
			>
				<div
					class="inline-flex overflow-hidden rounded-md border border-indigo-200 bg-white text-slate-700 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
				>
					<button
						type="button"
						class="{pageButtonClass} {idlePageClass}"
						aria-label={m.instances_first_page()}
						title={m.instances_first_page()}
						disabled={loading || pageIndex === 0}
						onclick={() => do_search(0, false)}><ChevronsLeft size={16} /></button
					>
					<button
						type="button"
						class="{pageButtonClass} {idlePageClass}"
						aria-label={m.instances_previous_page()}
						title={m.instances_previous_page()}
						disabled={loading || pageIndex === 0}
						onclick={() => do_search(pageIndex - 1, false)}><ChevronLeft size={16} /></button
					>
					{#if firstPage > 0}<span
							aria-hidden="true"
							class="flex h-8 items-center px-1 text-slate-400">…</span
						>{/if}
					{#each visiblePages as page (page)}
						<button
							type="button"
							class="{pageButtonClass} {page === pageIndex
								? 'bg-indigo-600 font-semibold text-white dark:bg-indigo-500'
								: idlePageClass}"
							aria-label={m.instances_go_to_page({ page: page + 1 })}
							aria-current={page === pageIndex ? 'page' : undefined}
							disabled={loading}
							onclick={() => {
								if (page !== pageIndex) void do_search(page, false);
							}}>{page + 1}</button
						>
					{/each}
					{#if firstPage + visiblePages.length < pageCount}<span
							aria-hidden="true"
							class="flex h-8 items-center px-1 text-slate-400">…</span
						>{/if}
					<button
						type="button"
						class="{pageButtonClass} {idlePageClass}"
						aria-label={m.instances_next_page()}
						title={m.instances_next_page()}
						disabled={loading || pageIndex + 1 >= pageCount}
						onclick={() => do_search(pageIndex + 1, false)}><ChevronRight size={16} /></button
					>
					<button
						type="button"
						class="{pageButtonClass} {idlePageClass}"
						aria-label={m.instances_last_page()}
						title={m.instances_last_page()}
						disabled={loading || pageIndex + 1 >= pageCount}
						onclick={() => do_search(pageCount - 1, false)}><ChevronsRight size={16} /></button
					>
				</div>
				<span class="text-xs text-slate-500 dark:text-slate-400"
					>{m.instances_page({ page: pageIndex + 1, pages: pageCount })}</span
				>
			</nav>
			{#if Object.keys(results).length > 0}
				<div class="text-sm">
					{m.instances_range({
						first: pageIndex * pageSize + 1,
						last: pageIndex * pageSize + Object.keys(results).length,
						count
					})}
				</div>
			{/if}
		{/if}

		{#if Object.keys(results).length > 0}
			<div class="mt-2 overflow-x-auto">
				<table class="min-w-full table-auto border-collapse text-sm">
					<thead>
						<tr class="border-b">
							{#if is_mo}
								<th class="px-2 py-2 text-left font-medium">Preview</th>
							{/if}
							{#each resultColumns as prop (prop)}
								<th class="px-2 py-2 text-left font-medium"
									>{Array.from(all_props || []).find((x) => x.key === prop)?.label || prop}</th
								>
							{/each}
							<th class="px-2 py-2 text-left font-medium">Actions</th>
						</tr>
					</thead>

					<tbody>
						{#each Object.entries(results) as [iri, row] (iri)}
							<tr class="border-b align-top">
								{#if is_mo}
									{#if row['mo'] && row['mo'] instanceof MediaObject}
										<td class="px-2 py-2 align-top">
											{#if row['mo'].type == 'dcmitype:StillImage'}
												{@const iiifurl = safe_iiif_url(
													row['mo'].assetId,
													'full',
													'!128,128',
													0,
													'default.jpg',
													row['mo'].mediaToken
												)}
												<button
													type="button"
													class="rounded p-1 hover:bg-gray-100"
													onclick={() => openIIIFViewer(iri)}
												>
													<img src={iiifurl} alt="Preview" class="h-24 w-24 object-cover" />
													{row['mo'].originalName}
												</button>
											{:else if row['mo'].type == 'dcmitype:MovingImage'}
												{@const thumburl = safe_videothumb_url(
													row['mo'].assetId,
													'128',
													row['mo'].mediaToken
												)}
												<button
													type="button"
													class="rounded p-1 hover:bg-gray-100"
													onclick={() => openVideoViewer(iri)}
												>
													<img src={thumburl} alt="Preview" class="h-24 w-24 object-cover" />
													{row['mo'].originalName}
												</button>
											{/if}
										</td>
									{:else}
										<td class="px-2 py-2 align-top">&nbsp;</td>
									{/if}
								{/if}
								{#each resultColumns as prop (prop)}
									<td class="px-2 py-2 align-top">
										<div class="flex flex-col gap-1">
											{#each cellValues(row, prop) as v}
												<div class="break-words whitespace-pre-wrap">{formatCellValue(v)}</div>
											{/each}
										</div>
									</td>
								{/each}

								<td class="px-2 py-2 align-top">
									<div class="flex items-center gap-2">
										<button
											type="button"
											class="rounded p-1 hover:bg-gray-100"
											title="Edit"
											onclick={() => openEditor(iri)}
										>
											<Pencil size={16} />
										</button>
										{#if row['mo'] && row['mo'] instanceof MediaObject}
											{@const may_delete = row['mo'].permval >= 5}
											{row['mo'].permval}
											<button
												type="button"
												class="rounded p-1 hover:bg-gray-100 {may_delete
													? ''
													: 'cursor-not-allowed opacity-50'}"
												title="Delete"
												onclick={() => deleteMediaObject(iri)}
												disabled={!may_delete}
											>
												<Trash2 size={16} />
											</button>
										{:else}
											<button
												type="button"
												class="rounded p-1 hover:bg-gray-100"
												title="Delete"
												onclick={() => deleteInstance(iri)}
											>
												<Trash2 size={16} />
											</button>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{/if}
</div>

{#snippet editInstance(iri: string)}
	<InstanceEditor propertyIri={iri} />
{/snippet}

{#snippet iiifViewer(baseUrl: string, mediaToken: string | undefined)}
	<IIIFViewer {baseUrl} {mediaToken}></IIIFViewer>
{/snippet}

{#snippet videoViewer(src: string, mediaToken: string | undefined, title: string)}
	<VideoViewer {src} {mediaToken} {title}></VideoViewer>
{/snippet}
