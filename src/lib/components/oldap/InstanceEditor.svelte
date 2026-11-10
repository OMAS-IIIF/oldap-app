<!--
  - Copyright (©) 2026. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
  -->
<script lang="ts">
	import {
		instanceFormValues,
		instanceFormChanges,
		instanceEditableProperties
	} from '$lib/helpers/instanceForm';
	let originalValues: Record<string, string[]> = {};
	let saveError = $state('');
	let saving = $state(false);
	import { locales, getLocale } from '$lib/paraglide/runtime';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { DatamodelClass } from '$lib/oldap/classes/datamodel';
	import { datamodelStore } from '$lib/stores/datamodel';
	import type { OldapUser } from '$lib/oldap/classes/user';
	import { userStore } from '$lib/stores/user';
	import DropdownField from '$lib/components/basic_gui/inputs/DropdownField.svelte';
	import { getContext, onMount, untrack } from 'svelte';
	import { ResourceClass } from '$lib/oldap/classes/resource';
	import type { PropertyClass } from '$lib/oldap/classes/property';
	import TextFieldData from '$lib/components/basic_gui/inputs/TextFieldData.svelte';
	import { XsdDatatypes } from '$lib/oldap/enums/xsd_datatypes';
	import { convertToLanguage, Language } from '$lib/oldap/enums/language';
	import DatePickerData from '$lib/components/basic_gui/inputs/DatePickerData.svelte';
	import { XsdDate } from '$lib/oldap/datatypes/xsd_date';
	import { apiClient } from '$lib/shared/apiClient';
	import { api_config, api_get_config, api_notget_config } from '$lib/helpers/api_config';
	import { projectStore } from '$lib/stores/project';
	import type { OldapProject } from '$lib/oldap/classes/project';
	import { LangString } from '$lib/oldap/datatypes/langstring';
	import LangstringfieldNew from '$lib/components/basic_gui/inputs/LangstringfieldNew.svelte';
	import { OldapList } from '$lib/oldap/classes/list';
	import HlistSelectorData from '$lib/components/basic_gui/inputs/HlistSelectorData.svelte';

	let lang = $state(getLocale());
	let langobj = $derived(convertToLanguage(lang) ?? Language.EN);

	type DataTypes = string | XsdDate | null;

	type InputFieldInstance = {
		get_value: () => DataTypes[];
	};

	let {
		propertyIri
	}: {
		propertyIri?: string;
	} = $props();

	let authinfo = $state<AuthInfo | null>(null);
	let datamodel = $state<DatamodelClass | null>(null);
	let user = $state<OldapUser | null>(null);
	let project = $state<OldapProject | null>(null);

	let res_list = $state<string[]>([]);
	let res_prefixes = $state<Record<string, string>>({});
	let resources = $state<Record<string, ResourceClass>>({});
	let selected_resource = $state<string>('');

	let selres = $state<string>('');
	let hasprops = $state<PropertyClass[]>([]);

	const text_dtypes = [XsdDatatypes.xsdString, XsdDatatypes.NCName];
	const langstr_dtypes = [XsdDatatypes.langString];
	const date_dtypes = [XsdDatatypes.date];

	let input_fields = $state<Record<string, InputFieldInstance | undefined>>({});
	let values = $state<Record<string, any>>({});
	let hlists = $state<Record<string, OldapList>>({});

	let success = $state<boolean | undefined>(undefined);

	const languages = Array.from(locales)
		.map((lang) => convertToLanguage(lang))
		.filter((lang): lang is Language => lang !== undefined);

	//
	// setup all necessary stores...
	//
	authInfoStore.subscribe((ai) => {
		authinfo = ai as AuthInfo | null;
	});
	userStore.subscribe((u) => {
		user = u as OldapUser | null;
	});
	datamodelStore.subscribe((data) => {
		datamodel = data;
	});
	projectStore.subscribe((proj) => {
		project = proj;
	});

	function toLangString(value: DataTypes, lang: Language = Language.EN): LangString {
		if (typeof value === 'string') {
			return new LangString({ [lang]: value });
		} else if (value instanceof LangString) {
			return value;
		} else {
			throw new Error(`invalid datatype: cannot convert "${value}" to LangString`);
		}
	}

	function toXsdDate(value: DataTypes) {
		if (typeof value === 'string') {
			return new XsdDate(value);
		} else if (value instanceof XsdDate) {
			return value;
		} else {
			throw new Error(`invalid datatype: cannot convert "${value}" to XsdDate`);
		}
	}

	function toString(value: DataTypes) {
		if (typeof value === 'string') {
			return value;
		} else {
			throw new Error(`invalid datatype: cannot convert "${value}" to string`);
		}
	}

	function normalizeHlistPayload(raw: any): any {
		if (!raw || typeof raw !== 'object') return raw;

		const normalizeNode = (node: any): any => {
			if (!node || typeof node !== 'object') return node;
			const n = { ...node };
			if (n.oldapListNodeId === undefined && n.nodeid !== undefined) {
				n.oldapListNodeId = n.nodeid;
			}
			if (Array.isArray(n.nodes)) {
				n.nodes = n.nodes.map((child: any) => normalizeNode(child));
			}
			return n;
		};

		const out = { ...raw };
		if (out.oldapListId === undefined && out.hlistId !== undefined) {
			out.oldapListId = out.hlistId;
		}
		if (out.hlist === undefined && out.oldapListId !== undefined) {
			out.hlist = out.oldapListId;
		}
		if (Array.isArray(out.nodes)) {
			out.nodes = out.nodes.map((node: any) => normalizeNode(node));
		}
		return out;
	}

	async function resolveHlistId(rawResult: string): Promise<string | null> {
		const token = (rawResult || '').trim();
		if (!token) return null;
		if (!token.includes(':') && !token.includes('/')) {
			return token;
		}

		try {
			const cfg = api_get_config(authinfo || new AuthInfo('', ''), { iri: token });
			const meta = await apiClient.getAdminhlistget(cfg);
			const hlistId = (meta as any)?.hlistId || (meta as any)?.oldapListId;
			if (hlistId) return hlistId.toString();
		} catch {
			// fallback below
		}

		const tail = token.split('/').pop() || token.split(':').pop() || '';
		return tail.trim().length > 0 ? tail.trim() : null;
	}

	onMount(async () => {
		const tmp_res =
			datamodel?.resources.filter((x) => {
				const gaga = x?.superclass ? [...x.superclass].map((s) => s.toString()) : [];
				return !gaga.includes('oldap:OldapListNode');
			}) || [];
		let tmp_list = [];
		let tmp_prefixes: Record<string, string> = {};
		let tmp_resources: Record<string, ResourceClass> = {};
		//const datamodel = $datamodelStore;
		for (const res of tmp_res) {
			tmp_resources[res.iri.toString()] = res;
			tmp_list.push(res.iri.toString() || 'XXXX');
			tmp_prefixes[res.iri.toString()] = res.iri.toString();
		}
		res_list = tmp_list;
		res_prefixes = tmp_prefixes;
		resources = tmp_resources;
		selected_resource = tmp_list[0];

		try {
			const projectShortName = project?.projectShortName?.toString() || '';
			if (projectShortName) {
				const config_hlist_search = api_get_config(authinfo || new AuthInfo('', ''), {
					project: projectShortName
				});
				const hlist_iris = await apiClient.getAdminhlistsearch(config_hlist_search);
				const hlist_promises = (hlist_iris || []).map(async (hliri: string) => {
					const hlist_id = await resolveHlistId(hliri);
					if (!hlist_id) return null;
					const config_hlist_full = api_config(authinfo || new AuthInfo('', ''), {
						project: projectShortName,
						hlistid: hlist_id
					});
					const hlist_data = await apiClient.getAdminhlistProjectHlistid(config_hlist_full);
					const hlist_obj = OldapList.fromOldapJson(normalizeHlistPayload(hlist_data), false);
					return hlist_obj;
				});
				const hlist_results = await Promise.all(hlist_promises);
				let tmp_hlists: Record<string, OldapList> = {};
				for (const hlist of hlist_results) {
					if (hlist) {
						tmp_hlists[hlist.nodeClassIri.toString()] = hlist;
					}
				}
				hlists = tmp_hlists;
			}
		} catch (err) {
			console.error('Unable to load hierarchical lists:', err);
		}

		if (propertyIri) {
			values = {};
			const get_data = api_config(authinfo || new AuthInfo('unknown', ''), {
				project: project?.projectShortName.toString() || '',
				instiri: encodeURIComponent(propertyIri.toString() || '')
			});
			apiClient
				.getDataProjectInstiri(get_data)
				.then((data) => {
					selres = data && data['rdf:type'] ? data['rdf:type'][0]?.toString() : '';
					hasprops = instanceEditableProperties(resources[selres]?.properties || []);
					for (const prop of hasprops) {
						if (data[prop.propertyIri.toString()] === undefined) {
							if (prop.datatype === XsdDatatypes.langString) {
								values[prop.propertyIri.toString()] = new LangString();
							} else {
								values[prop.propertyIri.toString()] = [];
							}
							continue;
						}
						if (prop.propertyIri.toString() !== 'oldap:attachedToRole') {
							switch (prop.datatype) {
								case XsdDatatypes.xsdString:
									values[prop.propertyIri.toString()] = data[
										prop.propertyIri.toString()
									] as Array<string>;
									break;
								case XsdDatatypes.date:
									values[prop.propertyIri.toString()] = (
										data[prop.propertyIri.toString()] as Array<string>
									).map((x) => new XsdDate(x));
									break;
								case XsdDatatypes.langString:
									values[prop.propertyIri.toString()] = LangString.fromStringArray(
										data[prop.propertyIri.toString()] as Array<string>
									);
									break;
								default:
									values[prop.propertyIri.toString()] = data[
										prop.propertyIri.toString()
									] as Array<string>;
							}
						}
					}
					originalValues = instanceFormValues(values);
				})
				.catch((err) => {
					saveError = err.message;
				});
		}
	});

	$effect(() => {
		console.log('effect', $state.snapshot(selected_resource));
		selres = selected_resource;
	});

		$effect(() => {
			const _ = selres; // effect must run if selres changes
			if (propertyIri) return;
			untrack(() => {
				if (resources[selres]?.properties !== undefined) {
				hasprops = instanceEditableProperties(resources[selres]?.properties || []);
					values = {};
					hasprops.forEach((hasprop) => {
						const propIri = hasprop.propertyIri.toString();
						const min = hasprop?.minCount && hasprop.minCount > 0 ? hasprop.minCount : 0;
						input_fields[propIri] = undefined;

						switch (hasprop.datatype) {
							case XsdDatatypes.langString:
								values[propIri] = new LangString();
								break;
							case XsdDatatypes.date:
								values[propIri] = [];
								for (let j = 0; j < min; j++) {
									values[propIri] = [...(values[propIri] as []), new XsdDate()];
								}
								break;
							case XsdDatatypes.xsdString:
							default:
								values[propIri] = [];
								for (let j = 0; j < min; j++) {
									values[propIri] = [...(values[propIri] as []), ''];
								}
						}
					});
				}
			});
		});

	function add_resource() {
		let data: Record<string, (string | null)[]> = {};
		hasprops.forEach((hasprop) => {
			const propname = hasprop.propertyIri.toString();
			if (values[propname] instanceof LangString) {
				data[hasprop.propertyIri.toString()] = values[propname].toApi();
			}
			if (
				Array.isArray(values[propname]) &&
				values[propname].length > 0 &&
				values[propname][0] instanceof XsdDate
			) {
				data[hasprop.propertyIri.toString()] = (
					values[hasprop.propertyIri.toString()] as XsdDate[]
				).map((x) => x.toApi());
			}
			if (
				Array.isArray(values[propname]) &&
				values[propname].length > 0 &&
				typeof values[propname][0] === 'string'
			) {
				data[hasprop.propertyIri.toString()] = values[
					hasprop.propertyIri.toString()
				] as string[];
			}
		});
		const put_config = api_notget_config(authinfo || new AuthInfo('unknown', ''), {
			project: encodeURIComponent(project?.projectIri?.toString() || ''),
			resclass: encodeURIComponent(selres || '')
		});
		console.log('PUT DATA:', data);
		apiClient
			.putDataProjectResclass(data, put_config)
			.then((res) => {
				console.log('add_resource success', res);
				success = true;
			})
			.catch((err) => {
				success = false;
				console.error(err);
			});
	}

	/** Save content edits through the existing API; never replace unseen fields. */
	async function modify_resource() {
		if (!authinfo || !project || !propertyIri || saving) return;
		const changes = instanceFormChanges(originalValues, instanceFormValues(values));
		if (!Object.keys(changes).length) { success = true; return; }
		saving = true;
		saveError = '';
		try {
			await apiClient.postDataProjectInstiri(changes, api_notget_config(authinfo, {
				project: project.projectShortName.toString(),
				instiri: encodeURIComponent(propertyIri)
			}));
			success = true;
		} catch (error) {
			saveError = error instanceof Error ? error.message : String(error);
		} finally {
			saving = false;
		}
	}

	type WindowCtx = { close: () => void };

	const windowCtx = getContext<WindowCtx>('window');
</script>

<div>
	<form onsubmit={(event) => event.preventDefault()}>
		{#if saveError}<p role="alert">{saveError}</p>{/if}
		<DropdownField
			items={res_list}
			id="allres_id"
			name="allprops"
			label="FROM RESOURCE TYPE"
			disabled={propertyIri !== undefined}
			bind:selectedItem={selres}
		/>

		{#each hasprops as hasprop (hasprop.propertyIri.toString())}
			{@const propname = hasprop.propertyIri.toString()}
			{#if values[propname]}
				{#if hasprop?.datatype === XsdDatatypes.xsdString}
					<TextFieldData
						id={hasprop?.propertyIri?.fragment?.toString() || 'prop_id'}
						name="prop_name"
						label={hasprop?.name?.get(langobj) || hasprop?.propertyIri.toString()}
						minCount={hasprop?.minCount || 0}
						maxCount={hasprop?.maxCount || Infinity}
						bind:values={values[propname]}
						bind:this={input_fields[hasprop.propertyIri.toString()]}
					/>
				{:else if hasprop?.datatype === XsdDatatypes.date}
					<DatePickerData
						id={hasprop?.propertyIri?.fragment?.toString() || 'prop_id'}
						name="prop_name"
						label={hasprop?.name?.get(langobj) || hasprop?.propertyIri.toString()}
						minCount={hasprop?.minCount || 0}
						maxCount={hasprop?.maxCount || Infinity}
						bind:values={values[propname]}
						bind:this={input_fields[hasprop.propertyIri.toString()]}
					/>
				{:else if hasprop?.datatype === XsdDatatypes.langString && values[propname] instanceof LangString}
					<LangstringfieldNew
						id={hasprop?.propertyIri?.fragment?.toString() || 'prop_id'}
						name="prop_name"
						placeholder="Enter a value"
						{languages}
						input_type={hasprop.editor?.toString() === 'dash:TextFieldWithLangEditor' ? 'input' : 'textarea'}
						label={hasprop?.name?.get(langobj) || hasprop?.propertyIri.toString()}
						bind:value={values[propname]}
					/>
				{:else if hasprop?.toClass && hlists[hasprop.toClass.toString()]}
					<HlistSelectorData
						id={hasprop?.propertyIri?.fragment?.toString() || 'prop_id'}
						name="prop_name"
						label={hasprop?.name?.get(langobj) || hasprop?.propertyIri.toString()}
						minCount={hasprop?.minCount || 0}
						maxCount={hasprop?.maxCount || Infinity}
						hlist={hlists[hasprop.toClass.toString()]}
						bind:values={values[propname]}
						bind:this={input_fields[hasprop.propertyIri.toString()]}
					/>
				{/if}
			{:else}
				loading...
			{/if}
		{/each}

		<div class="mt-8 flex w-full items-center justify-center gap-3 border-t border-black/10 pt-4">
			{#if success === undefined}
				<button type="button" disabled={saving}
					class="bg-oldap-button rounded-md border px-3 py-1 text-white disabled:opacity-50"
					onclick={windowCtx.close}>CANCEL</button
				>
				{#if propertyIri === undefined}
					<button type="button" disabled={saving}
						class="bg-oldap-button rounded-md border px-3 py-1 text-white disabled:opacity-50"
						onclick={() => {
							add_resource();
						}}>ADD</button
					>
				{:else}
					<button type="button" disabled={saving}
						class="bg-oldap-button rounded-md border px-3 py-1 text-white disabled:opacity-50"
						onclick={() => {
							modify_resource();
						}}>MODIFY</button
					>
				{/if}
			{:else if success}
				<button type="button" disabled={saving}
					class="bg-oldap-button rounded-md border px-3 py-1 text-white disabled:opacity-50"
					onclick={windowCtx.close}>CLOSE</button
				>
			{:else if !success}
				<button type="button" disabled={saving}
					class="bg-oldap-button rounded-md border px-3 py-1 text-white disabled:opacity-50"
					onclick={windowCtx.close}>CLOSE</button
				>
			{/if}
		</div>
	</form>
</div>
