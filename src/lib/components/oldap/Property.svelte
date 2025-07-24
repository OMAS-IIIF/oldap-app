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
	import LabeledDivider from '$lib/components/basic_gui/inputs/LabeledDivider.svelte';
	import Checkbox from '$lib/components/basic_gui/checkbox/Checkbox.svelte';
	import AllowedLangSelector from '$lib/components/oldap/AllowedLangSelector.svelte';
	import * as m from '$lib/paraglide/messages';
	import AllowedValues from '$lib/components/oldap/AllowedValues.svelte';

	let { propiri, projectid } : { propiri: string, projectid : string } = $props();

	const ncname_pattern: RegExp = /^[A-Za-z_][A-Za-z0-9._-]*$/;

	const string_datatypes = ['xsd:string', 'rdf:langString', 'xsd:normalizedString'];
	const numeric_datatypes = [
		'xsd:integer', 'xsd:nonPositiveInteger', 'xsd:negativeInteger', 'xsd:nonNegativeInteger', 'xsd:positiveInteger',
		'xsd:long', 'xsd:int', 'xsd:short', 'xsd:byte', 'xsd:unsignedLong', 'xsd:unsignedInt', 'xsd:unsignedShort', 'xsd:unsignedByte',
		'xsd:decimal', 'xsd:double', 'xsd:float'
	];

	let authinfo: AuthInfo | null = $authInfoStore;
	let administrator = $state<OldapUser | null>(null);
	let property: PropertyClass | null = null;
	let prop = $state<PropertyClass | undefined>();

	let propertyIri = $state('');
	let subPropertyOf = $state('');
	let datatype = $state<string|undefined>();
	let toClass = $state<string|undefined>();

	let all_prop_list = $state<string[]>([]);

	let min_length = $state<string>('0');
	let max_length = $state<string>('0');
	let pattern = $state<string>('');
	let min_value = $state<string | undefined>(undefined);
	let min_inclusive = $state<boolean>(false);
	let max_value = $state<string | undefined>(undefined);
	let max_inclusive = $state<boolean>(false);
	let allowedLanguages = $state<string[]>([]);
	let allowedStrings = $state<Set<string|number>>(new Set());
	let allowedNumbers = $state<Set<string|number>>(new Set());


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

	function isValidRegex(pattern?: string): [boolean, string] {
		if (!pattern) return [true, 'OK'];
		try {
			new RegExp(pattern);
			return [true, 'OK'];
		} catch (e) {
			return [false, 'Invalid regex: ' + (e as Error).message];
		}
	}

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
			pattern = prop?.pattern?.toString() || '';
			min_length = prop?.minLength?.toString() || '0';
			max_length = prop?.maxLength?.toString() || '0';
			if (prop?.minExclusive) {
				min_value = prop?.minExclusive?.toString() || '0';
				min_inclusive = false;
			}
			else if (prop?.minInclusive) {
				min_value = prop?.minInclusive?.toString() || '0';
				min_inclusive = true;
			}
			if (prop?.maxExclusive) {
				max_value = prop?.maxExclusive?.toString() || '0';
				max_inclusive = false;
			}
			else if (prop?.minInclusive) {
				max_value = prop?.maxInclusive?.toString() || '0';
				max_inclusive = true;
			}
			if (prop?.languageIn) {
				allowedLanguages = Array.from(prop.languageIn).map(l => l.toString());
			}
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

	$effect(() => {
		console.log("LANGLANG: ", $state.snapshot(allowedLanguages));
	});

</script>

<div>
	<div>{propiri === 'new' ?  'ADD PROPERTY' : 'EDIT PROPERTY'} {propiri} </div>
	<form class="max-w-128 min-w-96">
		<LabeledDivider>BASIC ATTRIBUTES:</LabeledDivider>
		<Textfield type='text' label="PROPIRI" name="propiri" id="propdiri" placeholder="property IRI" required={true}
							 bind:value={propertyIri} pattern={ncname_pattern} disabled={propiri !== 'new'} />
		<DropdownField items={all_prop_list} id="allprops_id" name="allprops" label="SUBPROP OF" bind:selectedItem={subPropertyOf} />
		<PropTypeSelector {propiri} bind:datatype={datatype} bind:toClass={toClass} disabled={subPropertyOf !== 'NONE'} />
		<LabeledDivider>RESTRICTIONS:</LabeledDivider>
		{#if string_datatypes.includes(datatype || '')}
			<Textfield label="PATTERN" name="pattern" id="pattern" placeholder="pattern" type="text" bind:value={pattern} validate={isValidRegex}/>
			<Textfield label="MIN_LENGTH" name="minlength" id="minlength" placeholder="min length" type="number" bind:value={min_length} />
			<Textfield label="MAX_LENGTH" name="maxlength" id="maxlength" placeholder="max length" type="number" bind:value={max_length} />
			{#if datatype === 'rdf:langString'}
				<AllowedLangSelector
					bind:selectedLanguages={allowedLanguages}
					label={m.allowed_langs_sel()}
					id="allowed-languages"
					name="allowedLanguages"
					placeholder={m.sel_lang()}
					searchLabel={m.search_lang()}
				/>
			{:else}
				<AllowedValues
					bind:values={allowedStrings}
					valueType="string"
					label="Erlaubte Textwerte"
					placeholder="Text eingeben..."
				/>
			{/if}
		{/if}
		{#if numeric_datatypes.includes(datatype || '')}
			<Textfield label="MINIMUM VALUE" name="minValue" id="minValue" placeholder="min value" type="number" bind:value={min_value} />
			<Checkbox label="INCLUSIVE" class="text-xs" bind:checked={min_inclusive} name="min_inclusive"/>
			<Textfield label="MAXIMUM VALUE" name="maxValue" id="maxValue" placeholder="max value" type="number" bind:value={max_value} />
			<Checkbox label="INCLUSIVE" class="text-xs" bind:checked={max_inclusive} name="max_inclusive"/>
			<AllowedValues
				bind:values={allowedNumbers}
				valueType="number"
				label="Erlaubte Zahlenwerte"
				placeholder="Zahl eingeben..."
			/>
		{/if}
	</form>
</div>