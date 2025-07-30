<!--
Copyright

@component
-->

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
	import { getLanguageShortname } from '$lib/oldap/enums/language';
	import { PropType, propTypeFromString } from '$lib/oldap/enums/proptypes';
	import DropdownButton from '$lib/components/basic_gui/dropdown/DropdownButton.svelte';
	import DropdownMenu from '$lib/components/basic_gui/dropdown/DropdownMenu.svelte';
	import DropdownLinkItem from '$lib/components/basic_gui/dropdown/DropdownLinkItem.svelte';
	import { QName } from '$lib/oldap/datatypes/xsd_qname';
	import { projectStore } from '$lib/stores/project';
	import { api_notget_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import { successInfoStore } from '$lib/stores/successinfo';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import { refreshPropertiesListNow } from '$lib/stores/refresh_propertieslist.svelte';
	import { DatamodelClass } from '$lib/oldap/classes/datamodel';

	let {
		/** @param {string} propiri The IRI of the property, or the string 'new' */
		propiri,

		/** @param {string} projectid The project ID (shortname) */
		projectid,

		/** @param {HTMLElement} topwin The top HTML that is been used to scroll to the top */
		topwin
	} : {
			propiri: string,
			projectid : string,
			topwin: HTMLElement
		} = $props();

	//const ncnameOrQname_pattern: RegExp = /^([A-Za-z_][\w.-]*(:[A-Za-z_][\w.-]*)?)$/;
	const ncname_pattern: RegExp = /^[A-Za-z_][A-Za-z0-9._-]*$/;

	const string_datatypes = [
		'xsd:string', 'rdf:langString', 'xsd:normalizedString', 'xsd:QName', 'xsd:token', 'xsd:name', 'xsd:NCName',
		'xsd:NMTOKEN', 'xsd:ID', 'xsd:IDREF'
	];
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
	let prefix_is_open = $state(false);
	let prefix = $state('');
	let fragment = $state('');
	let all_prefixes = $state<string[]>([]);
	let subPropertyOf = $state('');
	let proptype = $state<PropType>(PropType.LITERAL);
	let datatype = $state<string|undefined>();
	let toClass = $state<string|undefined>();
	let name_field: LangstringField;
	let name = $state<LangString | null>(null);
	let description_field: LangstringField;
	let description = $state<LangString | null>(null);


	let all_prop_list = $state<string[]>([]);
	let all_res_list = $state<string[]>([]);
	let all_lists_list = $state<string[]>([]);

	let min_length = $state<string | undefined>();
	let max_length = $state<string | undefined>();
	let pattern = $state<string>('');
	let min_value = $state<string | undefined>(undefined);
	let min_inclusive = $state<boolean>(false);
	let max_value = $state<string | undefined>(undefined);
	let max_inclusive = $state<boolean>(false);
	let allowedLanguages = $state<string[]>([]);
	let allowedStrings = $state<Set<string|number>>(new Set());
	let allowedNumbers = $state<Set<string|number>>(new Set());
	let datamodel = $state<DatamodelClass | null>(null);

	authInfoStore.subscribe(data => {
		authinfo = data;
	});

	userStore.subscribe((admin) => {
		administrator = admin;
	});

	datamodelStore.subscribe(data => {
		datamodel = data;
	})

	function scrollToTop() {
		if (topwin) {
			topwin.scrollTo({ top: -1000, behavior: 'smooth' });
		}
	}

	/**
	 * Tests whether a given string is a valid regular expression pattern.
	 *
	 * @param {string} [pattern] The string to be evaluated as a potential regular expression. If no pattern is provided,
	 * the function will return true with an "OK" message.
	 * @return {[boolean, string]} Returns a tuple where the first element is a boolean indicating if the pattern is valid,
	 * and the second element is a string providing feedback or error details.
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

	/**
	 * Initialize the component when it's being mounted
	 */
	onMount(async () => {
		if (!authinfo) return;

		// filter the iri of the property from the list, because a property cannot be a subproperty of itself!
		all_prop_list = datamodel?.standaloneProperties.filter(p => p.propertyIri.toString() !== propiri).map(p => p.propertyIri.toString()) || [];
		all_prop_list = ['NONE', ...all_prop_list];
		all_prefixes = [$projectStore?.projectShortName.toString() || '', 'shared', 'dc', 'dcterms', 'skos', 'schema', 'cidoc']

		// get the list of all resource classes that can be the target of a link
		const tmp_resources = datamodel?.resouces.filter(x => {
			const gaga = x?.superclass?.map(s => s.toString()) || [];
			return !gaga.includes('oldap:OldapListNode');
		}) || [];
		all_res_list = tmp_resources.map(r => r.iri.toString()) ?? [];

		// get the list of hierarchical lists that are available
		const tmp_lists = datamodel?.resouces.filter(x => {
			const gaga = x?.superclass?.map(s => s.toString()) || [];
			return gaga.includes('oldap:OldapListNode');
		}) || [];
		all_lists_list = tmp_lists.map(r => r.iri.toString()) ?? [];

		if (propiri === 'new') {
			// initialize a new property to be added to reasonable values...
			console.log("Property.svelte: onMount (NEW)");

			prefix = $projectStore?.projectShortName.toString() || '';
			fragment = '';
			subPropertyOf = 'NONE'
			datatype = 'xsd:string';
			toClass = undefined;
		}
		else {
		  const tmp = QName.createQName(propiri);
			prefix = tmp.prefix.toString();
			fragment = tmp.fragment.toString();
			prop = datamodel?.standaloneProperties.find(p => p.propertyIri.toString() === propiri);
			subPropertyOf = prop?.subPropertyOf?.toString() || 'NONE';
			//propertyIri = prop?.propertyIri.toString() || '';
		}
		await tick();
		scrollToTop();
	});

	/**
	 * This callback is fired on initialization and if the subPropertyOf changes...
	 */
	$effect(() => {
		//
		// if we select the property to be a sub-property, it must have the same data type as the ancestor property!
		//
		if (subPropertyOf === 'NONE') {
			if (propiri === 'new') {
				datatype = 'xsd:string';
				toClass = undefined;
			} else {
				subPropertyOf = prop?.subPropertyOf?.toString() || 'NONE'
				datatype = prop?.datatype;
				toClass = prop?.toClass?.toString();
				name = prop?.name || null;
				description = prop?.description || null;
				pattern = prop?.pattern?.toString() || '';
				min_length = prop?.minLength?.toString();
				max_length = prop?.maxLength?.toString();
				if (prop?.minExclusive) {
					min_value = prop?.minExclusive?.toString() || '0';
					min_inclusive = false;
				} else if (prop?.minInclusive) {
					min_value = prop?.minInclusive?.toString() || '0';
					min_inclusive = true;
				}
				if (prop?.maxExclusive) {
					max_value = prop?.maxExclusive?.toString() || '0';
					max_inclusive = false;
				} else if (prop?.minInclusive) {
					max_value = prop?.maxInclusive?.toString() || '0';
					max_inclusive = true;
				}
				if (prop?.languageIn) {
					allowedLanguages = Array.from(prop.languageIn).map(l => l.toString());
				}
			}
		} else {
			const ancestorprop = datamodel?.standaloneProperties.find(p => p.propertyIri.toString() === subPropertyOf);
			datatype = ancestorprop?.datatype;
			toClass = ancestorprop?.toClass?.toString();
			if (datatype !== undefined) {
				proptype = PropType.LITERAL;
			} else if (toClass !== undefined) {
				//
				// distinguish between link to other resource or link to a list
				//
				if (all_res_list.includes(toClass)) {
					proptype = PropType.LINK;
				} else if (all_lists_list.includes(toClass)) {
					proptype = PropType.LIST;
				}
			}
		}
	});

	function add_property() {
		const name = name_field.get_value().map((lang, val) => `${val}@${getLanguageShortname(lang)}`);
		const description = description_field.get_value().map((lang, val) => `${val}@${getLanguageShortname(lang)}`);

		//const inSet = allowedStrings.size > 0 ? Array.from(allowedStrings.values()) : allowedNumbers.size > 0 ? Array.from(allowedNumbers.values()) : [];

		let inSet: string[] = [];
		if (string_datatypes.includes(datatype || '')) {
			inSet = allowedStrings.size > 0 ? Array.from(allowedStrings.values()).map(p => p.toString()) : [];
		}
		else if (numeric_datatypes.includes(datatype || '')) {
			inSet = allowedStrings.size > 0 ? Array.from(allowedStrings.values()).map(p => p.toString()) : [];
		}
		let minExclusive: number | undefined = undefined;
		let minInclusive: number | undefined = undefined;
		let maxExclusive: number | undefined = undefined;
		let maxInclusive: number | undefined = undefined;
		if (min_value) {
			if (min_inclusive) {
				minInclusive = Number(min_value);
			}
			else {
				minExclusive = Number(min_value);
			}
		}
		if (max_value) {
			if (max_inclusive) {
				maxInclusive = Number(max_value);
			}
			else {
				maxExclusive = Number(max_value);
			}
		}

		let propertydata: {
			subpropertyOf?: string,
			class?: string,
			datatype?: string,
			name?: string[],
			description?: string[],
			languageIn?: string[],
			uniqueLang?: boolean,
			inSet?: string[],
			minLength?: number,
			maxLength?: number,
			pattern?: string,
			minExclusive?: number,
			minInclusive?: number,
			maxExclusive?: number,
			maxInclusive?: number,
			// transitive?: boolean, TODO: Implement later
			// inverse?: boolean, TODO: Implement later
			// symmetric?: boolean, TODO: Implement later
		} = {
			subpropertyOf: subPropertyOf.length > 0 && subPropertyOf !== 'NONE' ? subPropertyOf : undefined
		};
		if (proptype === PropType.LITERAL) {
			propertydata.datatype = datatype;
			propertydata.name = name.length > 0 ? name : undefined;
			propertydata.description = description.length > 0 ? description : undefined;
			if (string_datatypes.includes(datatype || '')) {
				propertydata.minLength = min_length ? Number(min_length) : undefined;
				propertydata.maxLength = min_length ? Number(max_length) : undefined;
				propertydata.pattern = pattern.length > 0 ? pattern : undefined;
				propertydata.inSet = inSet.length > 0 ? inSet : undefined;
				if (datatype === 'rdf:langString') {
					propertydata.languageIn = allowedLanguages.length > 0 ? allowedLanguages : undefined;
					propertydata.uniqueLang = true; // TODO: add GUI element for this!
				}
			}
			else if (comparable_datatypes.includes(datatype || '')) {
				propertydata.minExclusive = minExclusive;
				propertydata.minInclusive = minInclusive;
				propertydata.maxExclusive = maxExclusive;
				propertydata.maxInclusive = maxInclusive;
			}
		}
		else if (proptype === PropType.LINK) {
			propertydata.class = toClass;
			propertydata.name = name.length > 0 ? name : undefined;
			propertydata.description = description.length > 0 ? description : undefined;
		}
		else if (proptype === PropType.LIST) {
			propertydata.class = toClass;
			propertydata.name = name.length > 0 ? name : undefined;
			propertydata.description = description.length > 0 ? description : undefined;
		}
		propertyIri = prefix + ':' + fragment;
		if (authinfo) {
			const property_put = api_notget_config(authinfo, {project: projectid, property: propertyIri});
			console.log(property_put);
			apiClient.putAdmindatamodelProjectpropertyProperty(propertydata, property_put).then(res => {
				console.log(res);
				successInfoStore.set(`Property "${propertyIri}" added successfully!`);
				refreshPropertiesListNow()
			}).catch((error) => {
				errorInfoStore.set(process_api_error(error as Error));
			});
		}
	}

	function modify_property() {

	}


</script>

<!--
The property IRI consists of a prefix (usually the project shortname) or a common prefix like "dcterms", "schema" etc.
and the actual property id (which is a xs:NCName
-->
{#snippet prefixes()}
	<DropdownButton bind:isOpen={prefix_is_open} buttonText={prefix} name="prefixselsel" disabled={propiri !== 'new'} class="text-xs">
		<DropdownMenu bind:isOpen={prefix_is_open} position="left" name="prefixselsel" id="prefixselsel_id">
			{#each all_prefixes as p}
				<DropdownLinkItem bind:isOpen={prefix_is_open}
													onclick={() => {prefix = p; prefix_is_open = false;}}
													selected={p === prefix}>
					{p}
				</DropdownLinkItem>
			{/each}
		</DropdownMenu>
	</DropdownButton>
{/snippet}

<div>
	<div>{propiri === 'new' ?  m.add_prop() : m.edit_prop()} <span class="italic">{propiri}</span> </div>
	<form class="max-w-128 min-w-96">
		<LabeledDivider>{m.basic_attr()}:</LabeledDivider>
		<Textfield type='text' label={m.prop_iri()} name="fragment" id="fragment" placeholder="property ID" required={true}
							 bind:value={fragment} pattern={ncname_pattern} disabled={propiri !== 'new'}
							 additional_snippet={prefixes}
		/>
		<DropdownField items={all_prop_list} id="allprops_id" name="allprops" label={m.subprop_of()} bind:selectedItem={subPropertyOf} />
		<PropTypeSelector
			label={m.property()}
			{projectid}
			{propiri}
			bind:proptype={proptype}
			bind:datatype={datatype}
			bind:toClass={toClass}
			{all_res_list}
			{all_lists_list}
			disabled={subPropertyOf !== 'NONE'} />
		<LangstringField bind:this={name_field} label={m.name()} name="name" id="name" placeholder="name" value={name} />
		<LangstringField bind:this={description_field} label={m.description()} name="descritpion" id="description" placeholder="description" value={description} />
		{#if proptype === PropType.LITERAL}
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
			{#if comparable_datatypes.includes(datatype || '')}
				<Textfield label={m.min_val()} name="minValue" id="minValue" placeholder="min value" type="number" bind:value={min_value} />
				<Checkbox label={m.inclusive()} class="text-xs" bind:checked={min_inclusive} name="min_inclusive"/>
				<Textfield label={m.max_val()} name="maxValue" id="maxValue" placeholder="max value" type="number" bind:value={max_value} />
				<Checkbox label={m.inclusive()} class="text-xs" bind:checked={max_inclusive} name="max_inclusive"/>
			{/if}
			{#if numeric_datatypes.includes(datatype || '')}
				<AllowedValues
					bind:values={allowedNumbers}
					valueType="number"
					label={m.allowed_numvals()}
					placeholder={m.enter_num()}
				/>
			{/if}
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
