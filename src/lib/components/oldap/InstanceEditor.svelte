<!--
  - Copyright (©) 2026. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
  -->
<script lang="ts">

	import { languageTag } from '$lib/paraglide/runtime';

	let lang = $state(languageTag());
	let langobj = $derived(convertToLanguage(lang) ?? Language.EN);
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { DatamodelClass } from '$lib/oldap/classes/datamodel';
	import { datamodelStore } from '$lib/stores/datamodel';
	import type { OldapUser } from '$lib/oldap/classes/user';
	import { userStore } from '$lib/stores/user';
	import * as m from '$lib/paraglide/messages';
	import DropdownField from '$lib/components/basic_gui/inputs/DropdownField.svelte';
	import { onMount, untrack } from 'svelte';
	import { ResourceClass } from '$lib/oldap/classes/resource';
	import TextFieldData from '$lib/components/basic_gui/inputs/TextFieldData.svelte';
	import { XsdDatatypes } from '$lib/oldap/enums/xsd_datatypes';
	import { convertToLanguage, Language } from '$lib/oldap/enums/language';
	import DatePickerData from '$lib/components/basic_gui/inputs/DatePickerData.svelte';
	import { XsdDate } from '$lib/oldap/datatypes/xsd_date';
	import { apiClient } from '$lib/shared/apiClient';
	import { api_get_config } from '$lib/helpers/api_config';
	import type { Project } from '@playwright/test';
	import { projectStore } from '$lib/stores/project';
	import type { OldapProject } from '$lib/oldap/classes/project';
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';

	let {
		propertyIri,
	} : {
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

	const text_dtypes = [XsdDatatypes.xsdString, XsdDatatypes.NCName]
	const date_dtypes = [XsdDatatypes.date]

	let values = $state<Record<string, string[]>>({});

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
		untrack(() => {
			if (resources[selres]?.hasProperty !== undefined) {
				values = {};
				(resources[selres]?.hasProperty || []).forEach(hasprop => {
					if (propertyIri === undefined) { // we create a new instance...
						values[hasprop.property.propertyIri.toString()] = []
						if (hasprop?.minCount && hasprop.minCount > 0) {
							for (let i = 0; i < hasprop.minCount; i++) {
								values[hasprop.property.propertyIri.toString()].push('');
							}
						}
						else {
							values[hasprop.property.propertyIri.toString()].push('');
						}
					}
					else { // we want to edit an existing instance...
						values[hasprop.property.propertyIri.toString()] = []
						const get_data = api_get_config(authinfo || new AuthInfo('unknown', ''), {
							project: project?.projectIri?.toString() || '',
							instiri: propertyIri.toString() || '',
						});
						apiClient.getDataProjectInstiri(get_data).then(data => {
							(resources[selres]?.hasProperty || []).forEach(prop => {
								values[prop.property.propertyIri.toString()] = data[prop.property.propertyIri.toString()] as string[];
							});
						}).catch(err => {console.error(err)});
					}
				});
			}
		});

	});

	function add_resource() {
		console.log('add_resource dummy');
	}

	function modify_resource() {
		console.log('modify_resource dummy');
	}

	function cancel() {
		console.log('cancel dummy');
	}


</script>

<div>
	<form>
		<DropdownField
			items={res_list}
			id="allres_id"
			name="allprops"
			label="FROM RESOURCE TYPE"
			bind:selectedItem={selres}
		/>

		{#each resources[selres] ? resources[selres].hasProperty : [] as hasprop}
			{#if text_dtypes.includes(hasprop.property?.datatype || XsdDatatypes.xsdString)}
				<TextFieldData
					id="prop_id"
					name="prop_name"
					label={hasprop.property?.name?.get(langobj) || hasprop.property?.propertyIri.toString()}
					minCount={hasprop?.minCount || 0}
					maxCount={hasprop?.maxCount || Infinity}
					values={values[hasprop.property.propertyIri.toString()]}
				/>
			{:else if date_dtypes.includes(hasprop.property?.datatype || XsdDatatypes.date)}
				<DatePickerData
					id="prop_id"
					name="prop_name"
					label={hasprop.property?.name?.get(langobj) || hasprop.property?.propertyIri.toString()}
					minCount={hasprop?.minCount || 0}
					maxCount={hasprop?.maxCount || Infinity}
					values={values[hasprop.property.propertyIri.toString()]}
				/>
			{/if}
		{/each}
		<!--<div>
			<button
				class="px-3 py-1 rounded-md border bg-oldap-button text-white disabled:opacity-50"
				onpointerdown={(e) => e.stopPropagation()}
				onmousedown={(e) => e.stopPropagation()}
				onclick={() => {cancel()}}
			>CANCEL</button>
			{#if propertyIri === undefined}
				<button class="px-3 py-1 rounded-md border bg-oldap-button text-white disabled:opacity-50" onclick={add_resource}>ADD</button>
			{:else}
				<button class="px-3 py-1 rounded-md border bg-oldap-button text-white disabled:opacity-50" onclick={modify_resource}>MODIFY</button>
			{/if}
		</div> -->
		<div class="mt-8 pt-4 flex w-full justify-center items-center gap-3 border-t border-black/10">
			<button
				class="px-3 py-1 rounded-md border bg-oldap-button text-white disabled:opacity-50" onclick={() => cancel()}>CANCEL</button>
			{#if propertyIri === undefined}
				<button class="px-3 py-1 rounded-md border bg-oldap-button text-white disabled:opacity-50" onclick={() => {add_resource()}} >ADD</button>
			{:else}
				<button class="px-3 py-1 rounded-md border bg-oldap-button text-white disabled:opacity-50" onclick={() => 	{modify_resource()}} >MODIFY</button>
			{/if}
		</div>

	</form>
</div>
