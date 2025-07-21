<script lang="ts">

	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { OldapUser } from '$lib/oldap/classes/user';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { userStore } from '$lib/stores/user';
	import { onMount } from 'svelte';
	import { PropertyClass } from '$lib/oldap/classes/property';
	import Textfield from '$lib/components/basic_gui/inputs/Textfield.svelte';
	import { datamodelStore } from '$lib/stores/datamodel';
	import DropdownField from '$lib/components/basic_gui/inputs/DropdownField.svelte';
	import { XsdDatatypes } from '$lib/oldap/enums/xsd_datatypes';
	import PropTypeSelector from '$lib/components/oldap/PropTypeSelector.svelte';

	let { propiri, projectid } : { propiri: string, projectid : string } = $props();

	const ncname_pattern: RegExp = /^[A-Za-z_][A-Za-z0-9._-]*$/;

	let authinfo: AuthInfo | null = $authInfoStore;
	let administrator = $state<OldapUser | null>(null);
	let property: PropertyClass | null = null;
	let prop = $state<PropertyClass | undefined>();

	let propertyIri = $state('');
	let subPropertyOf = $state('');
	let datatype = $state<string|undefined>();
	let toClass = $state<string|undefined>();

	let all_prop_list = $state<string[]>([]);
	//let datatypeOptions = $state<string[]>([]);
	//let all_res_list = $state<string[]>([]);

	authInfoStore.subscribe(data => {
		authinfo = data;
	});

	userStore.subscribe((admin) => {
		administrator = admin;
	});

/*
	function scrollToTop() {
		if (topwin) {
			topwin.scrollTo({ top: -1000, behavior: 'smooth' });
		}
	}
*/

	onMount(async () => {
		if (!authinfo) return;

		console.log("PROPIRI: ", propiri);
		console.log("PROJECTID: ", projectid);

		// filter the iri of the property from the list, because a property cannot be a subproperty of itself!
		all_prop_list = $datamodelStore?.standaloneProperties.filter(p => p.propertyIri.toString() !== propiri).map(p => p.propertyIri.toString()) || [];
		all_prop_list.push('NONE');

		if (propiri !== 'new') {
			prop = $datamodelStore?.standaloneProperties.find(p => p.propertyIri.toString() === propiri);
			propertyIri = prop?.propertyIri.toString() || '';
			subPropertyOf = prop?.subPropertyOf?.toString() || 'NONE'
			datatype = prop?.datatype;
			toClass = prop?.toClass?.toString();
		}
	});

	$effect(() => {
		//
		// if we select the property to be a sub-property, it must have the same data type as the ancestor property!
		//
		if (subPropertyOf !== 'NONE') {
			const ancestorprop = $datamodelStore?.standaloneProperties.find(p => p.propertyIri.toString() === subPropertyOf);
			datatype = ancestorprop?.datatype;
			toClass = ancestorprop?.toClass?.toString();
			console.log("DATATYPE/CLASS: ", $state.snapshot(datatype), $state.snapshot(toClass));
		} else {
			datatype = prop?.datatype;
			toClass = prop?.toClass?.toString();
		}
	});

</script>
<div>
	<div>{propiri === 'new' ?  'ADD PROPERTY' : 'EDIT PROPERTY'} {propiri} </div>
	<form class="max-w-128 min-w-96">
		<Textfield type='text' label="PROPIRI" name="propiri" id="propdiri" placeholder="property IRI" required={true}
							 bind:value={propertyIri} pattern={ncname_pattern} disabled={propiri !== 'new'} />
		{#if propiri === 'new'}
			<br />
		{:else}
			<DropdownField items={all_prop_list} id="allprops_id" name="allprops" label="SUBPROP OF" bind:selectedItem={subPropertyOf} />
			<PropTypeSelector {propiri} bind:datatype={datatype} bind:toClass={toClass} disabled={subPropertyOf !== 'NONE'} />
		{/if}
	</form>
</div>