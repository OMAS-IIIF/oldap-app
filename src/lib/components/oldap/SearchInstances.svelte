<!--
  - Copyright (©) 2026. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
  -->
<script lang="ts">
	import { locales, getLocale } from '$lib/paraglide/runtime';
	import { convertToLanguage, Language } from '$lib/oldap/enums/language';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { DatamodelClass } from '$lib/oldap/classes/datamodel';
	import type { OldapUser } from '$lib/oldap/classes/user';
	import type { OldapProject } from '$lib/oldap/classes/project';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { userStore } from '$lib/stores/user';
	import { datamodelStore } from '$lib/stores/datamodel';
	import { projectStore } from '$lib/stores/project';
	import DropdownField from '$lib/components/basic_gui/inputs/DropdownField.svelte';
	import { ResourceClass } from '$lib/oldap/classes/resource';
	import { onMount } from 'svelte';
	import { Search, Pencil, Trash2 } from '@lucide/svelte';
	import { api_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import SelectMutiple from '$lib/components/basic_gui/inputs/SelectMutiple.svelte';
	import { extractLang, LangString } from '$lib/oldap/datatypes/langstring';
	import { createWindow } from '$lib/stores/windows.svelte';
	import InstanceEditor from '$lib/components/oldap/InstanceEditor.svelte';

	type Result = Record<string, Record<string, (string|number|boolean|null)[] | null>>;

	let lang = $state(getLocale());
	let langobj = $derived(convertToLanguage(lang) ?? Language.EN);

	let authinfo = $state<AuthInfo | null>(null);
	let datamodel = $state<DatamodelClass | null>(null);
	let user = $state<OldapUser | null>(null);
	let project = $state<OldapProject | null>(null);

	const languages = Array.from(locales).map(lang => convertToLanguage(lang));

	let res_list = $state<string[]>([]);
	//let resources = $state<Record<string, ResourceClass>>({});
	let selected_resource = $state<string>('');

	let selres = $state<string>('');

	let all_props = $state<Set<{key: string, label?: string}>>();
	let selprops = $state<Set<string>>(new Set());
	let count = $state(0);
	let results = $state<Result>({});

	let searchstring = $state('');
	let edit_instiri = $state<string | undefined>(undefined);

	// type guards and their helpers
	function isCountResponse(x: unknown): x is { count?: number } {
		return !!x && typeof x === "object" && "count" in x && Object.keys(x as any).length <= 1;
	}

	function toStringArray(v: unknown): string[] {
		if (v == null) return [];

		if (Array.isArray(v)) {
			return v
				.filter((x): x is string => typeof x === "string")
				.map((s) => s);
		}

		if (typeof v === "string") return [v];

		// Sometimes APIs return e.g. { value: "x" } or { values: [...] }
		if (typeof v === "object") {
			const o = v as Record<string, unknown>;
			if (typeof o.value === "string") return [o.value];
			if (Array.isArray(o.values)) return o.values.filter((x): x is string => typeof x === "string");
		}

		return [];
	}

	function formatCellValue(v: string | number | boolean | null): string {
		if (v === null) return '';
		if (typeof v === 'boolean') return v ? 'true' : 'false';
		return String(v);
	}

	function cellValues(row: Record<string, (string | number | boolean | null)[]> | undefined, prop: string): (string | number | boolean | null)[] {
		return row?.[prop] ?? [];
	}

	function openEditor(iri: string) {
		console.log('open editor for', iri);
		edit_instiri = iri;
		createWindow('Edit Instance', editInstance, { x: 220, y: 80, width: 400, height: 600 });
	}

	function deleteInstance(iri: string) {
		// TODO: wire to your real delete endpoint (and probably ask for confirmation)
		const ok = window.confirm(`Do you really want to delete item ${iri}?`);
		if (!ok) return;

		const delete_data = api_config(authinfo || new AuthInfo('unknown', ''), {
			project: encodeURIComponent(project?.projectShortName?.toString() || ''),
			instiri: encodeURIComponent(iri)
		})
		apiClient.deleteDataProjectInstiri(undefined, delete_data).then(res => {
			delete results[iri];
			window.alert('Instance deleted successfully');
		}).catch(err => {
			window.alert('Error deleting instance: ' + err.message);
		});
		console.log('delete instance', iri);
	}

	function do_search(searchstring: string) {
		if (!authinfo || !datamodel) return;
		if (!project) return;
		if (searchstring) {
			console.log('search for ', searchstring);
		} else {
			const allofclass_count_config = api_config(authinfo,{
				project: encodeURIComponent(project?.projectShortName?.toString())
			}, {
				resClass: selres,
				countOnly: true
			});
			apiClient.getDataofclassProject(allofclass_count_config).then(res => {
				count = Number(res.count) || 0;
				if (!authinfo || !datamodel) return;
				if (!project) return;
				if (selprops.size == 0) {
					selprops.add('oldap:creationDate');
				}
				let allofclass_get_config = api_config(
					authinfo,
					{
						project: encodeURIComponent(project?.projectShortName?.toString())
					},
					{
						resClass: selres,
						...(selprops ? { includeProperties: Array.from(selprops) } : {})
					}
				);
				console.log("allofclass_get_config", allofclass_get_config);
				return apiClient.getDataofclassProject(allofclass_get_config)
			}).then(data => {
				console.log('data', data);
				// The API returns ApiRes: Record<prop, primitive[]>[]
				results = {};
				for (const d of (data as Record<string, string[]>[]) || []) {
					const iri = d['iri'][0];
					results[iri] = {};
					for (const [prop, values] of Object.entries(d)) {
						if (prop === 'iri') continue;

						let is_langstring = true;
						for (const v of values) {
							if (!extractLang(v)) is_langstring = false;
						}
						if (is_langstring) {
							results[iri][prop] = [LangString.fromStringArray(values).get(langobj)];
						}
						else {
							results[iri][prop] = values.map(v => v.toString());
						}
					}
				}

			})

		}
	}

	//
	// setup all necessary stores...
	//
	authInfoStore.subscribe(ai => {authinfo = ai as AuthInfo | null});
	userStore.subscribe((u) => { user = u as OldapUser | null});
	datamodelStore.subscribe(data => { datamodel = data });
	projectStore.subscribe(proj => { project = proj });

	// onMount(async () => {
	// 	const tmp_res = datamodel?.resources.filter(x => {
	// 		const gaga = x?.superclass ? [...x.superclass].map(s => s.toString()) : [];
	// 		return !gaga.includes('oldap:OldapListNode');
	// 	}) || [];
	// 	let tmp_list = [];
	// 	//let tmp_resources: Record<string, ResourceClass> = {};
	// 	//const datamodel = $datamodelStore;
	// 	for (const res of tmp_res) {
	// 		//tmp_resources[res.iri.toString()] = res
	// 		tmp_list.push(res.iri.toString() || 'XXXX');
	// 	}
	// 	res_list = tmp_list
	// 	//resources = tmp_resources;
	// 	selected_resource = tmp_list[0];
	// });

	$effect(() => {
		const tmp_res = datamodel?.resources.filter(x => {
			const gaga = x?.superclass ? [...x.superclass].map(s => s.toString()) : [];
			return !gaga.includes('oldap:OldapListNode');
		}) || [];
		let tmp_list = [];
		for (const res of tmp_res) {
			tmp_list.push(res.iri.toString() || 'XXXX');
		}
		res_list = tmp_list
		selected_resource = tmp_list[0];
	});

	$effect(() => {
		console.log('effect', $state.snapshot(selected_resource));
		selres = selected_resource;
	});

	$effect(() => {
		let resdata = datamodel?.resources.find(x => x.iri.toString() === selres);
		if (resdata?.hasProperty) {
			all_props = new Set(resdata.hasProperty.sort((a, b) => (a.order || 9999) - (b.order || 9999)).map((hp) => ({
				key: hp.property.propertyIri.toString(),
				label: hp.property.name?.get(langobj)
			})));
		}
	});


</script>
<div>
	<form>
		<DropdownField
			items={res_list}
			id="allres_id"
			name="allres"
			label="FROM RESOURCE TYPE"
			bind:selectedItem={selres}
		/>
		<SelectMutiple
			selectables={all_props}
			label="SHOW PROPERTIES"
			bind:values={selprops}
		/>

		<div class="mt-4 flex items-center gap-2">
			<input
				type="text"
				placeholder="Search…"
				class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
				bind:value={searchstring}
				onkeydown={(e) => e.key === 'Enter' && do_search(searchstring)}
			/>

			<button
				type="button"
				class="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
				onclick={() => do_search(searchstring)}
			>
				<Search size={16} />
				Search
			</button>
		</div>
	</form>
	<hr />
	{#if count > 0}
		<div class="mt-2">Found {count} instances</div>

		<div class="mt-2 overflow-x-auto">
			<table class="min-w-full table-auto border-collapse text-sm">
				<thead>
					<tr class="border-b">
						{#each Array.from(selprops) as prop (prop)}
							<th class="px-2 py-2 text-left font-medium">{Array.from(all_props || []).find(x => x.key === prop)?.label || prop}</th>
						{/each}
						<th class="px-2 py-2 text-left font-medium">Actions</th>
					</tr>
				</thead>

				<tbody>
					{#each Object.entries(results) as [iri, row] (iri)}
						<tr class="border-b align-top">
							{#each Array.from(selprops) as prop (prop)}
								<td class="px-2 py-2 align-top">
									<div class="flex flex-col gap-1">
										{#each cellValues(row, prop) as v (formatCellValue(v))}
											<div class="whitespace-pre-wrap break-words">{formatCellValue(v)}</div>
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

									<button
										type="button"
										class="rounded p-1 hover:bg-gray-100"
										title="Delete"
										onclick={() => deleteInstance(iri)}
									>
										<Trash2 size={16} />
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

{#snippet editInstance()}
	<InstanceEditor propertyIri={edit_instiri} />
{/snippet}
