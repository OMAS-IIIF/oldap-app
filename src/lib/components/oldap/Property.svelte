<script lang="ts">

	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { OldapUser } from '$lib/oldap/classes/user';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { userStore } from '$lib/stores/user';
	import { onMount, tick } from 'svelte';
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
	import { goto_page } from '$lib/helpers/goto_page';
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';
	import LangstringField from '$lib/components/basic_gui/inputs/LangstringField.svelte';
	import { LangString } from '$lib/oldap/datatypes/langstring';

	let { propiri, projectid, topwin } : { propiri: string, projectid : string, topwin: HTMLElement } = $props();

	const ncname_pattern: RegExp = /^[A-Za-z_][A-Za-z0-9._-]*$/;

	const string_datatypes = ['xsd:string', 'rdf:langString', 'xsd:normalizedString'];
	const numeric_datatypes = [
		'xsd:integer', 'xsd:nonPositiveInteger', 'xsd:negativeInteger', 'xsd:nonNegativeInteger', 'xsd:positiveInteger',
		'xsd:long', 'xsd:int', 'xsd:short', 'xsd:byte', 'xsd:unsignedLong', 'xsd:unsignedInt', 'xsd:unsignedShort', 'xsd:unsignedByte',
		'xsd:decimal', 'xsd:double', 'xsd:float', 'xsd:dateTimeStamp', 'xsd:time',
	];
	const comparable_datatypes = [
		'xsd:integer', 'xsd:nonPositiveInteger', 'xsd:negativeInteger', 'xsd:nonNegativeInteger', 'xsd:positiveInteger',
		'xsd:long', 'xsd:int', 'xsd:short', 'xsd:byte', 'xsd:unsignedLong', 'xsd:unsignedInt', 'xsd:unsignedShort', 'xsd:unsignedByte',
		'xsd:decimal', 'xsd:double', 'xsd:float', 'xsd:dateTime', 'xsd:date', 'xsd:gYearMonth', 'xsd:gYear',
	];


	let authinfo: AuthInfo | null = $authInfoStore;
	let administrator = $state<OldapUser | null>(null);
	let property: PropertyClass | null = null;
	let prop = $state<PropertyClass | undefined>();

	let propertyIri = $state('');
	let subPropertyOf = $state('');
	let datatype = $state<string|undefined>();
	let toClass = $state<string|undefined>();
	let name_field: LangstringField;
	let name = $state<LangString | null>(null);
	let description_field: LangstringField;
	let description = $state<LangString | null>(null);


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


	function scrollToTop() {
		if (topwin) {
			topwin.scrollTo({ top: -1000, behavior: 'smooth' });
		}
	}


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
			name = prop?.name || null;
			description = prop?.description || null;
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
		else {
			subPropertyOf = 'NONE'
			datatype = 'xsd:string';
			toClass = undefined;
		}
		await tick();
		scrollToTop();
	});

	$effect(() => {
		//
		// if we select the property to be a sub-property, it must have the same data type as the ancestor property!
		//
		if (subPropertyOf !== 'NONE') {
			const ancestorprop = $datamodelStore?.standaloneProperties.find(p => p.propertyIri.toString() === subPropertyOf);
			datatype = ancestorprop?.datatype;
			toClass = ancestorprop?.toClass?.toString();
		} else {
			datatype = prop?.datatype;
			toClass = prop?.toClass?.toString();
		}
	});

	function add_property() {

	}

	function modify_property() {

	}


</script>

<div>
	<div>{propiri === 'new' ?  m.add_prop() : m.edit_prop()} <span class="italic">{propiri}</span> </div>
	<form class="max-w-128 min-w-96">
		<LabeledDivider>{m.basic_attr()}:</LabeledDivider>
		<Textfield type='text' label={m.prop_iri()} name="propiri" id="propdiri" placeholder="property IRI" required={true}
							 bind:value={propertyIri} pattern={ncname_pattern} disabled={propiri !== 'new'} />
		<DropdownField items={all_prop_list} id="allprops_id" name="allprops" label={m.subprop_of()} bind:selectedItem={subPropertyOf} />
		<PropTypeSelector label={m.property()} {propiri} bind:datatype={datatype} bind:toClass={toClass} disabled={subPropertyOf !== 'NONE'} />
		<LangstringField bind:this={name_field} label={m.name()} name="name" id="name" placeholder="name" value={name} />
		<LangstringField bind:this={description_field} label={m.description()} name="descritpion" id="description" placeholder="description" value={description} />
		<LabeledDivider>{m.restrictions()}:</LabeledDivider>
		{#if string_datatypes.includes(datatype || '')}
			<Textfield label={m.regex_pattern()} name="pattern" id="pattern" placeholder="pattern" type="text" bind:value={pattern} validate={isValidRegex}/>
			<Textfield label={m.min_length()} name="minlength" id="minlength" placeholder="min length" type="number" bind:value={min_length} />
			<Textfield label={m.max_length()} name="maxlength" id="maxlength" placeholder="max length" type="number" bind:value={max_length} />
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
					label={m.allowed_textvals()}
					placeholder={m.enter_text()}
				/>
			{/if}
		{/if}
		{#if numeric_datatypes.includes(datatype || '')}
			<AllowedValues
				bind:values={allowedNumbers}
				valueType="number"
				label={m.allowed_numvals()}
				placeholder={m.enter_num()}
			/>
		{/if}
		{#if comparable_datatypes.includes(datatype || '')}
			<Textfield label={m.min_val()} name="minValue" id="minValue" placeholder="min value" type="number" bind:value={min_value} />
			<Checkbox label={m.inclusive()} class="text-xs" bind:checked={min_inclusive} name="min_inclusive"/>
			<Textfield label={m.max_val()} name="maxValue" id="maxValue" placeholder="max value" type="number" bind:value={max_value} />
			<Checkbox label={m.inclusive()} class="text-xs" bind:checked={max_inclusive} name="max_inclusive"/>
		{/if}

		<div class="flex justify-center gap-4 mt-6">
			<Button class="mx-4 my-2" onclick={goto_page('/admin')}>{m.cancel()}</Button>
			{#if propiri === 'new'}
				<Button class="mx-4 my-2" onclick={() => add_property()}>{m.add()}</Button>
			{:else}
				<Button class="mx-4 my-2" onclick={() => modify_property()}>{m.modify()}</Button>
			{/if}
		</div>

	</form>
</div>