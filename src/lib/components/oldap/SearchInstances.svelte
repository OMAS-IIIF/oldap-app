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
	import { Search } from '@lucide/svelte';
	import { api_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import SelectMutiple from '$lib/components/basic_gui/inputs/SelectMutiple.svelte';
	import TableRow from '$lib/components/basic_gui/table/TableRow.svelte';

	let lang = $state(getLocale());
	let langobj = $derived(convertToLanguage(lang) ?? Language.EN);

	let authinfo = $state<AuthInfo | null>(null);
	let datamodel = $state<DatamodelClass | null>(null);
	let user = $state<OldapUser | null>(null);
	let project = $state<OldapProject | null>(null);

	const languages = Array.from(locales).map(lang => convertToLanguage(lang));

	let res_list = $state<string[]>([]);
	let res_prefixes = $state<Record<string, string>>({});
	let resources = $state<Record<string, ResourceClass>>({});
	let selected_resource = $state<string>('');

	let selres = $state<string>('');

	let all_props = $state<Set<{key: string, label?: string}>>();
	let selprops = $state<Set<string>>(new Set());
	let count = $state(0);
	let results = $state<Record<string, string[]>>({});

	let searchstring = $state('');

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

	type ApiRes =
		| Record<string, Record<string, unknown>>   // “passthrough object”
		| { count?: number }
		| undefined;

	function normalizeToRecordOfStringArrays(
		res: ApiRes,
		pickField?: string // optional: which field inside each object holds the strings
	): Record<string, string[]> {
		if (!res || isCountResponse(res)) return {};

		const out: Record<string, string[]> = {};

		for (const [key, value] of Object.entries(res)) {
			// If each entry is an object and you need a specific property from it:
			const payload = pickField ? (value as any)?.[pickField] : value;

			out[key] = toStringArray(payload);
		}

		return out;
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
				return apiClient.getDataofclassProject(allofclass_get_config)
			}).then(res => {
				const r = normalizeToRecordOfStringArrays(res);
				Object.entries(r).forEach(([iri, vals]) => {
					results[iri] = [ ...vals]
				})
				console.log('got 1 ', res);
				console.log('got 2 ', r);
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

	onMount(async () => {
		const tmp_res = datamodel?.resources.filter(x => {
			const gaga = x?.superclass ? [...x.superclass].map(s => s.toString()) : [];
			return !gaga.includes('oldap:OldapListNode');
		}) || [];
		let tmp_list = [];
		let tmp_prefixes: Record<string, string> = {};
		let tmp_resources: Record<string, ResourceClass> = {};
		//const datamodel = $datamodelStore;
		for (const res of tmp_res) {
			tmp_resources[res.iri.toString()] = res
			tmp_list.push(res.iri.toString() || 'XXXX');
			tmp_prefixes[res.iri.toString()] = res.iri.toString();
		}
		res_list = tmp_list
		res_prefixes = tmp_prefixes
		resources = tmp_resources;
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
		<div> Found {count} instances</div>
		<table>
			<thead>
			{#each Array.from(selprops) as prop (prop) }
				<th>{prop}</th>
			{/each}
			</thead>
			<tbody>
			{#each Object.entries(results) as [prop, tmp] (prop)}
				<tr>
					{#each tmp as val (val) }
						<td>{val}</td>
					{/each}
				</tr>
			{/each}
			</tbody>
		</table>
	{/if}
</div>
