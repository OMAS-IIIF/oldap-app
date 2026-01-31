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
	</form>
</div>