<script lang="ts">

	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { OldapUser } from '$lib/oldap/classes/user';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { userStore } from '$lib/stores/user';
	import { onMount } from 'svelte';
	import { PropertyClass } from '$lib/oldap/classes/property';
	import Textfield from '$lib/components/basic_gui/inputs/Textfield.svelte';
	import { datamodelStore } from '$lib/stores/datamodel';

	let { propiri, projectid } : { propiri: string, projectid : string } = $props();

	const ncname_pattern: RegExp = /^[A-Za-z_][A-Za-z0-9._-]*$/;

	let authinfo: AuthInfo | null = $authInfoStore;
	let administrator = $state<OldapUser | null>(null);
	let property: PropertyClass | null = null;

	let propertyIri = $state('');

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

		if (propiri !== 'new') {
			const prop = $datamodelStore?.standaloneProperties.find(p => p.propertyIri.toString() === propiri);
			propertyIri = prop?.propertyIri.toString() || 'XXX';
		}
	});

</script>
<div>
	<div>{propiri === 'new' ?  'ADD PROPERTY' : 'EDIT PROPERTY'} {propiri} </div>
	<form class="max-w-128 min-w-96">
		<Textfield type='text' label="PROPID" name="propid" id="propdid" placeholder="property ID" required={true}
							 bind:value={propertyIri} pattern={ncname_pattern} disabled={propiri !== 'new'} />
	</form>
</div>