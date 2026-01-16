<!--
	@component

	This component implements the selection of the kind of property. Basically a property can be
	- a literal (PropType.LITERAL)
	- a pointer to another resource (PropType.LINK)
	- a pointer to a (hierarchical9 list entry (PropType.LIST)

-->
<script lang="ts">

	import DropdownMenu from '$lib/components/basic_gui/dropdown/DropdownMenu.svelte';
	import DropdownButton from '$lib/components/basic_gui/dropdown/DropdownButton.svelte';
	import DropdownLinkItem from '$lib/components/basic_gui/dropdown/DropdownLinkItem.svelte';
	import { onMount, untrack } from 'svelte';
	import { XsdDatatypes } from '$lib/oldap/enums/xsd_datatypes';
	import { PropType, propTypeFromString } from '$lib/oldap/enums/proptypes';
	import { api_get_config } from '$lib/helpers/api_config';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { apiClient } from '$lib/shared/apiClient';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import { OldapList } from '$lib/oldap/classes/list';
	import { convertToLanguage, Language } from '$lib/oldap/enums/language';
	import { languageTag } from '$lib/paraglide/runtime';


	let {
		/** @param {string} propjectid The project ID (shortname) */
		projectid,

		/** @param {string} propiri The full QName of the property  */
		propiri,

		/** @param {propType} proptype The type of the property, one of PropType.LITERAL, PropType.LINK or PropType.LIST */
		proptype = $bindable(PropType.LITERAL),

		/** @param {string} datatype Iri of the datatype, in the form of "xsd:<datatype>". Supported ate most XSD datatypes
		 *                           The datatype must be only defined for PropType.LITERAL, for all others it's undefined!
		 */
		datatype = $bindable(),

		/** @param {string} toClass If the property points to anoither resource, this param contains the class IRI */
		toClass = $bindable(),

		/** @param {string} label The label to be used for the field */
		label = 'PROPERTY',

		/** @param {string[]} all_res_list LIst of all resource Iri's that can be used for toClass */
		all_res_list,

		/** @param {string[]} all_lists_list List of all available list node classes */
		all_lists_list,

		/** @param {boolean} disabled True, if the field should be disabled */
		disabled = false
	}: {
		projectid: string,
		propiri: string,
		proptype: PropType,
		datatype?: string,
		toClass?: string,
		label: string,
		all_res_list: string[],
		all_lists_list: string[],
		disabled: boolean
	} = $props();

	let authinfo: AuthInfo | null = $authInfoStore;
	let lang = $state(languageTag());
	let langobj = $derived(convertToLanguage(lang) ?? Language.EN);

	let proptype_is_open = $state(false);

	let datatype_is_open = $state(false);
	let datatypeOptions = $state<string[]>([]);

	let reslink_is_open = $state(false);

	let list_is_open = $state(false);

	const types = Object.values(PropType);

	let hlists = $state<Record<string, OldapList>>({});

	let gaga = $state('');

	onMount(() => {
		console.log("LANGUAGEOBJECT: " + langobj);
		datatypeOptions = Object.values(XsdDatatypes);

		// Get hlists associated with the project
		const config_hlist_search = api_get_config(authinfo || new AuthInfo('', ''), {project: projectid});
		apiClient.getAdminhlistsearch(config_hlist_search).then(hlistiris => {
			const promises = hlistiris.map(hl => {
				const config_hlist_get = api_get_config(authinfo || new AuthInfo('', ''), {iri: hl});
				return apiClient.getAdminhlistget(config_hlist_get);
			});
			Promise.all(promises).then((results) => {
				let tmp: Record<string, OldapList> = {};
				results.forEach((hlistdata) => {
					const hlist = OldapList.fromOldapJson(hlistdata, true);
					tmp[hlist.nodeClassIri.toString()] = hlist;
				});
				hlists = tmp;
			}).catch(error => {
				errorInfoStore.set(process_api_error(error as Error));
			});
		}).catch(error => {
			errorInfoStore.set(process_api_error(error as Error));
		});

		if (propiri === 'new') {
			proptype = PropType.LITERAL;
		}
		else {
			if (datatype !== undefined) {
				proptype = PropType.LITERAL;
			}
			else if (toClass !== undefined) {
				//
				// distinguish between link to other resource or link to a list
				//
				if (all_res_list.includes(toClass)) {
					proptype = PropType.LINK;
				}
				else if (all_lists_list.includes(toClass)) {
					proptype = PropType.LIST;
				}
			}
			else {
				; // raise error – should never happen!
			}
		}
	});


	$effect(() => {
		if (proptype === PropType.LITERAL) {
			untrack(() => {
				if (datatype === undefined) {
					datatype = datatypeOptions[0];
				}
			});
		}
		else if (proptype === PropType.LINK) {
			untrack(() => {
				if (toClass === undefined) {
					toClass = all_res_list[0];
				}
			});
		}
		else if (proptype === PropType.LIST) {
			untrack(() => {
				if (toClass === undefined) {
					toClass = all_lists_list[0];
				}
			});
		}
	});

</script>

<div class="mt-3">
	<label for="proptypesel_id" class="block text-xs/4 font-medium text-input-label-fg dark:text-input-label-fg-dark">{label}</label>
	<DropdownButton bind:isOpen={proptype_is_open} buttonText={proptype} name="proptypesel" {disabled} class="text-xs">
		<DropdownMenu bind:isOpen={proptype_is_open} position="left" name="proptypesel" id="proptypesel_id">
			{#each types as type}
				<DropdownLinkItem bind:isOpen={proptype_is_open}
													value={propTypeFromString(type)}
													onclick={(x: PropType) => {proptype = x}}
													selected={type === proptype}>
					{type}
				</DropdownLinkItem>
			{/each}
		</DropdownMenu>
	</DropdownButton>
	{#if proptype === 'LITERAL'}
		<DropdownButton bind:isOpen={datatype_is_open} buttonText={datatype || datatypeOptions[0]} name="datatype" {disabled} class="text-xs">
			<DropdownMenu bind:isOpen={datatype_is_open} position="left" name="datatype">
				{#each datatypeOptions as dtype}
					<DropdownLinkItem bind:isOpen={datatype_is_open}
														value={dtype}
														onclick={() => {datatype = dtype}}
														selected={dtype === datatype}>
						{dtype}
					</DropdownLinkItem>
				{/each}
			</DropdownMenu>
		</DropdownButton>
	{:else if proptype === 'LINK'}
		<DropdownButton bind:isOpen={reslink_is_open} buttonText={toClass || all_res_list[0]} name="reslink" {disabled} class="text-xs">
			<DropdownMenu bind:isOpen={reslink_is_open} position="left" name="reslink">
				{#each all_res_list as res}
					<DropdownLinkItem bind:isOpen={reslink_is_open}
														onclick={() => {toClass = res}}
														selected={res === toClass}>
						{res}
					</DropdownLinkItem>
				{/each}
			</DropdownMenu>
		</DropdownButton>
	{:else if proptype === 'LIST'}
		<DropdownButton
			bind:isOpen={list_is_open}
			buttonText={hlists[toClass || all_lists_list[0]]?.prefLabel?.get(langobj) || hlists[toClass || all_lists_list[0]]?.oldapListId || all_lists_list[0]}
			name="listlink"
			{disabled}
			class="text-xs"
		>
			<DropdownMenu bind:isOpen={list_is_open} position="left" name="listlink">
				{#each all_lists_list as list}
					{#if hlists[list]}
						<DropdownLinkItem bind:isOpen={list_is_open}
															value={hlists[list].nodeClassIri.toString()}
															onclick={(val) => {toClass = val}}
															selected={hlists[list].nodeClassIri.toString() === toClass}>
							{hlists[list]?.prefLabel?.get(langobj) || hlists[list]?.oldapListId || list}
						</DropdownLinkItem>
					{/if}
				{/each}
			</DropdownMenu>
		</DropdownButton>

	{/if}

</div>
