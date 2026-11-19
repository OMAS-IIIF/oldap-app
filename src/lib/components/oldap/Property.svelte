<!--
Copyright

@component

This component is used to add or modify a property. This can be either a standalone property or
in relation with a resource class.

-->

<script lang="ts">
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { onMount, tick, untrack } from 'svelte';
	import { PropertyClass } from '$lib/oldap/classes/property';
	import ReificationPolicy from './ReificationPolicy.svelte';
	import Textfield from '$lib/components/basic_gui/inputs/Textfield.svelte';
	import { datamodelStore } from '$lib/stores/datamodel';
	import DropdownField from '$lib/components/basic_gui/inputs/DropdownField.svelte';
	import PropTypeSelector from '$lib/components/oldap/PropTypeSelector.svelte';
	import LabeledDivider from '$lib/components/basic_gui/inputs/LabeledDivider.svelte';
	import Checkbox from '$lib/components/basic_gui/checkbox/Checkbox.svelte';
	import AllowedLangSelector from '$lib/components/oldap/AllowedLangSelector.svelte';
	import * as m from '$lib/paraglide/messages';
	import AllowedValues from '$lib/components/oldap/AllowedValues.svelte';
	import { goto_page } from '$lib/helpers/goto_page';
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';
	import { LangString } from '$lib/oldap/datatypes/langstring';
	import { convertToLanguage, getLanguageShortname, Language } from '$lib/oldap/enums/language';
	import { PropType } from '$lib/oldap/enums/proptypes';
	import DropdownButton from '$lib/components/basic_gui/dropdown/DropdownButton.svelte';
	import DropdownMenu from '$lib/components/basic_gui/dropdown/DropdownMenu.svelte';
	import DropdownLinkItem from '$lib/components/basic_gui/dropdown/DropdownLinkItem.svelte';
	import { Iri } from '$lib/oldap/datatypes/xsd_iri';
	import { QName } from '$lib/oldap/datatypes/xsd_qname';
	import { projectStore } from '$lib/stores/project';
	import { api_config, api_notget_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import { successInfoStore } from '$lib/stores/successinfo';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import { refreshPropertiesListNow } from '$lib/stores/refresh_propertieslist.svelte';
	import { DatamodelClass } from '$lib/oldap/classes/datamodel';
	import Confirmation from '$lib/components/basic_gui/dialogs/Confirmation.svelte';
	import Numberfield from '$lib/components/basic_gui/inputs/Numberfield.svelte';
	import { spinnerStore } from '$lib/stores/spinner';
	import { datamodelSharedStore } from '$lib/stores/datamodel_shared';
	import LangstringfieldNew from '$lib/components/basic_gui/inputs/LangstringfieldNew.svelte';
	import { locales } from '$lib/paraglide/runtime';
	import { optionalNumber, propertyDelta, type PropertyWrite } from '$lib/helpers/propertyForm';
	import { datamodelOldapStore } from '$lib/stores/datamodel_oldap';

	let {
		/** @param {string} propiri The IRI of the property, or the string 'new' */
		propiri,

		/** @param {string} resiri The IRI of the resource class, (NOTE: only for non-standalone properties) */
		resiri,

		/** @param {string} projectid The project ID (shortname) */
		projectid,

		dialogstatus = $bindable(),

		/** @param {HTMLElement} topwin The top HTML that is used to scroll to the top */
		topwin
	}: {
		propiri: string;
		resiri?: string;
		projectid: string;
		dialogstatus?: boolean;
		topwin?: HTMLElement;
	} = $props();

	//const ncnameOrQname_pattern: RegExp = /^([A-Za-z_][\w.-]*(:[A-Za-z_][\w.-]*)?)$/;
	const ncname_pattern: RegExp = /^[A-Za-z_][A-Za-z0-9._-]*$/;

	const string_datatypes = [
		'xsd:string',
		'rdf:langString',
		'xsd:normalizedString',
		'xsd:QName',
		'xsd:token',
		'xsd:name',
		'xsd:NCName',
		'xsd:NMTOKEN',
		'xsd:ID',
		'xsd:IDREF'
	];
	const numeric_datatypes = [
		'xsd:integer',
		'xsd:nonPositiveInteger',
		'xsd:negativeInteger',
		'xsd:nonNegativeInteger',
		'xsd:positiveInteger',
		'xsd:long',
		'xsd:int',
		'xsd:short',
		'xsd:byte',
		'xsd:unsignedLong',
		'xsd:unsignedInt',
		'xsd:unsignedShort',
		'xsd:unsignedByte',
		'xsd:decimal',
		'xsd:double',
		'xsd:float'
	];
	// Temporal bounds need typed controls; leave their metadata untouched here.
	const comparable_datatypes = [
		'xsd:integer',
		'xsd:nonPositiveInteger',
		'xsd:negativeInteger',
		'xsd:nonNegativeInteger',
		'xsd:positiveInteger',
		'xsd:long',
		'xsd:int',
		'xsd:short',
		'xsd:byte',
		'xsd:unsignedLong',
		'xsd:unsignedInt',
		'xsd:unsignedShort',
		'xsd:unsignedByte',
		'xsd:decimal',
		'xsd:double',
		'xsd:float'
	];

	let authinfo = $derived($authInfoStore);
	let prop = $state<PropertyClass>();

	let propertyIri = $state('');
	let propiri_prefix_is_open = $state(false);
	let propiri_prefix = $state('');
	let propiri_fragment = $state('');
	let all_prefixes = $state<string[]>([]);

	/** Independent parent rows retain every direct relation, including absolute IRIs. */
	type ParentRow = { prefix: string; fragment: string; full: boolean; open: boolean };
	function parentRow(value = ''): ParentRow {
		const separator = value.indexOf(':');
		const full = /^(https?:|urn:)/.test(value);
		return {
			prefix: separator < 0 || full ? projectid : value.slice(0, separator),
			fragment: full || separator < 0 ? value : value.slice(separator + 1),
			full,
			open: false
		};
	}
	let canEditParents = $derived(propiri === 'new' || propiri.split(':')[0] === projectid);
	let parentRows = $state<ParentRow[]>([parentRow()]);
	let parentIris = $derived([
		...new Set(
			parentRows
				.filter((row) => row.fragment.trim())
				.map((row) => (row.full ? row.fragment.trim() : `${row.prefix}:${row.fragment.trim()}`))
		)
	]);
	let subPropertyOf = $derived(parentIris.length === 1 ? parentIris[0] : 'NONE');
	let proptype = $state<PropType>(PropType.LITERAL);
	let datatype = $state<string | undefined>();
	let toClass = $state<string | undefined>();
	let name = $state<LangString>(new LangString());

	let description = $state<LangString>(new LangString());

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
	let allowedStrings = $state<Set<string | number>>(new Set());
	let allowedNumbers = $state<Set<string | number>>(new Set());
	let datamodel = $derived($datamodelStore);

	let minCount = $state<string>();
	let maxCount = $state<string>();
	let order = $state<string>();
	let gui_editor_hints = $state<string[]>([]);
	let editor = $state<string>('');

	let add_standalone_prop = $state(false);
	let reifierShapes = $state<string[]>([]);
	let reificationRequired = $state<boolean | undefined>();

	let baseline: PropertyWrite = {};
	let previousAncestor = 'NONE';
	let inferParentType = $state(true);
	let ready = $state(false);
	let loadError = $state('');
	let confirmation_dialog: Confirmation;
	let confirmation_title = $state('');
	let confirmation_message = $state('');

	const languages = Array.from(locales).map((lang) => convertToLanguage(lang) || Language.DE);

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

		// first we check if are trying to modify an annotation property from within a resource. That not allowed!
		if (resiri) {
			if (propiri !== 'new') {
				const tmp = models
					.flatMap((model) => model.annotationProperties)
					.find((p) => p.propertyIri.toString() === propiri);
				if (tmp !== undefined) {
					add_standalone_prop = true;
				}
			}
		}

		all_prefixes = [$projectStore?.projectShortName.toString() || ''];
		// if (administrator?.isRoot && projectid !== 'shared') {
		// 	all_prefixes = [...all_prefixes, 'shared'];
		// }
		all_prefixes = [...all_prefixes, 'skos', 'schema', 'dcterms'];
		let extontos: string[] = [];
		datamodel?.externalOntologies.forEach((x) => extontos.push(x.prefix.toString()));
		all_prefixes = [...all_prefixes, ...extontos];

		// get the list of all resource classes that can be the target of a link. These are Resources
		// that are not list nodes! A list node always has the super-class 'oldap:OldapListNode'
		all_res_list = [
			...new Set(
				models
					.flatMap((model) => model.resources)
					.filter(
						(r) => ![...(r.superclass ?? [])].some((s) => s.toString() === 'oldap:OldapListNode')
					)
					.map((r) => r.iri.toString())
			)
		];

		// get the list of hierarchical lists that are available
		all_lists_list = [
			...new Set(
				models
					.flatMap((model) => model.resources)
					.filter((r) =>
						[...(r.superclass ?? [])].some((s) => s.toString() === 'oldap:OldapListNode')
					)
					.map((r) => r.iri.toString())
			)
		];
		all_prefixes = [
			...new Set([
				...all_prefixes,
				'oldap',
				'shared',
				...knownProperties.map((p) => p.propertyIri.prefix?.toString() ?? '')
			])
		].filter(Boolean);

		if (propiri === 'new') {
			// initialize a new property to be added to reasonable values...

			propiri_prefix = $projectStore?.projectShortName.toString() || '';
			propiri_fragment = '';

			parentRows = [parentRow()];
			datatype = 'xsd:string';
			toClass = undefined;
			editor = gui_editor_hints[0];
		} else {
			const tmp = new QName(propiri);
			propiri_prefix = tmp.prefix?.toString() || '';
			propiri_fragment = tmp.fragment?.toString() || '';
			if (resiri) {
				const res = datamodel?.resources.find((r) => r.iri.toString() === resiri);
				if (res) {
					prop = res?.properties?.find((p) => p.propertyIri.toString() === propiri);
				}
			} else {
				prop = datamodel?.annotationProperties.find((p) => p.propertyIri.toString() === propiri);
			}
			parentRows = prop?.subPropertyOf?.length
				? prop.subPropertyOf.map((parent) => parentRow(parent.toString()))
				: [parentRow()];
			if (!prop && !add_standalone_prop) {
				loadError = `Property ${propiri} is not available in the current model.`;
				return;
			}
			prop = prop?.clone();
			datatype = prop?.datatype;
			toClass = qnameValue(prop?.toClass);
			name = prop?.name?.clone() ?? new LangString();
			description = prop?.description?.clone() ?? new LangString();
			pattern = prop?.pattern ?? '';
			min_length = prop?.minLength?.toString();
			max_length = prop?.maxLength?.toString();
			min_value = (prop?.minInclusive ?? prop?.minExclusive)?.toString();
			min_inclusive = prop?.minInclusive !== undefined;
			max_value = (prop?.maxInclusive ?? prop?.maxExclusive)?.toString();
			max_inclusive = prop?.maxInclusive !== undefined;
			allowedLanguages = [...(prop?.languageIn ?? [])].map((l) =>
				getLanguageShortname(l)!.toUpperCase()
			);
			allowedStrings = new Set(prop?.inSet ?? []);
			allowedNumbers = new Set(prop?.inSet ?? []);
			minCount = prop?.minCount?.toString();
			maxCount = prop?.maxCount?.toString();
			order = prop?.order?.toString();
			editor = qnameValue(prop?.editor) ?? 'None';
			reifierShapes = [...(prop?.reifierShapes ?? [])];
			reificationRequired = prop?.reificationRequired;
		}
		proptype = datatype
			? PropType.LITERAL
			: all_lists_list.includes(toClass ?? '')
				? PropType.LIST
				: PropType.LINK;
		baseline = formValues();
		previousAncestor = subPropertyOf;
		ready = true;
		await tick();
		scrollToTop();
	});

	/** Normalize optional references, including older empty QName objects. */
	function qnameValue(value?: QName): string | undefined {
		return value && !value.isEmpty ? value.toString() : undefined;
	}
	const models = $derived(
		[datamodel, $datamodelSharedStore, $datamodelOldapStore].filter(
			(model): model is DatamodelClass => model !== null
		)
	);
	const knownProperties = $derived(
		models.flatMap((model) => [
			...model.annotationProperties,
			...model.resources.flatMap((resource) => resource.properties ?? [])
		])
	);
	function parentSuggestions(prefix: string): string[] {
		return [
			...new Set(
				knownProperties
					.filter(
						(p) =>
							p.propertyIri.prefix?.toString() === prefix && p.propertyIri.toString() !== propiri
					)
					.map((p) => p.propertyIri.fragment!.toString())
			)
		];
	}
	// Preserve local constraints once multiple parents are involved; there is no unique inherited type.
	$effect(() => {
		const ancestorIri = subPropertyOf;
		if (parentIris.length > 1) inferParentType = false;
		if (!inferParentType) return;
		if (!ready) return;
		untrack(() => {
			if (ancestorIri === previousAncestor) return;
			previousAncestor = ancestorIri;
			if (ancestorIri === 'NONE') return;
			const ancestor = knownProperties.find((p) => p.propertyIri.toString() === ancestorIri);
			if (ancestor) {
				datatype = ancestor.datatype;
				toClass = qnameValue(ancestor.toClass);
				proptype = datatype
					? PropType.LITERAL
					: all_lists_list.includes(toClass ?? '')
						? PropType.LIST
						: PropType.LINK;
			}
		});
	});
	function getGuiEditorHints(datatype?: string): string[] {
		if (datatype === 'rdf:langString') {
			return ['None', 'dash:TextFieldWithLangEditor', 'dash:TextAreaWithLangEditor'];
		}
		if (datatype === 'xsd:string') {
			return ['None', 'dash:TextFieldEditor', 'dash:TextAreaEditor'];
		}
		return [];
	}

	$effect(() => {
		gui_editor_hints = getGuiEditorHints(datatype);
	});

	/** Serialize only exposed fields; unedited metadata never enters write payloads. */
	function formValues(): PropertyWrite {
		const values: PropertyWrite = {};
		if (!add_standalone_prop) {
			for (const parent of parentIris) {
				if (/^(https?:|urn:)/.test(parent)) new Iri(parent);
				else new QName(parent);
			}
			values.subPropertyOf = parentIris.length > 1 ? [...parentIris] : parentIris[0];
			values.name = name
				.filter((lang, value) => value.trim() !== '')
				.map(([lang, value]) => `${value}@${getLanguageShortname(lang)}`);
			values.description = description
				.filter((lang, value) => value.trim() !== '')
				.map(([lang, value]) => `${value}@${getLanguageShortname(lang)}`);
			if (!values.name.length) values.name = undefined;
			if (!values.description.length) values.description = undefined;
			values.datatype = proptype === PropType.LITERAL ? datatype : undefined;
			values.class = proptype !== PropType.LITERAL ? toClass : undefined;
			if (proptype === PropType.LITERAL && string_datatypes.includes(datatype ?? '')) {
				values.minLength = optionalNumber(min_length);
				values.maxLength = optionalNumber(max_length);
				values.pattern = pattern || undefined;
				if (datatype === 'rdf:langString')
					values.languageIn = allowedLanguages.length
						? [...new Set(allowedLanguages.map((language) => language.toLowerCase()))]
						: undefined;
				else values.inSet = allowedStrings.size ? [...allowedStrings] : undefined;
			}
			if (proptype === PropType.LITERAL && numeric_datatypes.includes(datatype ?? ''))
				values.inSet = allowedNumbers.size ? [...allowedNumbers] : undefined;
			if (proptype === PropType.LITERAL && comparable_datatypes.includes(datatype ?? '')) {
				values[min_inclusive ? 'minInclusive' : 'minExclusive'] = optionalNumber(min_value);
				values[max_inclusive ? 'maxInclusive' : 'maxExclusive'] = optionalNumber(max_value);
			}
		}
		if (resiri) {
			// Policy belongs to this resource use, including uses of standalone properties.
			values.reifierShapes = [...new Set(reifierShapes)];
			values.reificationRequired = reificationRequired;
			values.minCount = optionalNumber(minCount);
			values.maxCount = optionalNumber(maxCount);
			values.order = optionalNumber(order);
			values.editor = editor && editor !== 'None' ? editor : undefined;
		}
		return values;
	}

	/** Reload the authoritative project model after a successful model write. */
	async function refreshModel() {
		if (!authinfo) return;
		const result = await apiClient.getAdmindatamodelProject(
			api_config(authinfo, { project: projectid })
		);
		const model = DatamodelClass.fromOldapJson(result);
		datamodelStore.set(model);
		if (projectid === 'shared') datamodelSharedStore.set(model);
		if (projectid === 'oldap') datamodelOldapStore.set(model);
	}

	const add_property = async () => {
		confirmation_title = m.add_property();
		confirmation_message = m.confirm_property_add({
			propiri: propiri_prefix + ':' + propiri_fragment
		});
		const ok = await confirmation_dialog.open();
		if (!ok) return;

		let propertydata: { [K in keyof PropertyWrite]: Exclude<PropertyWrite[K], null> };
		try {
			propertydata = Object.fromEntries(
				Object.entries(formValues()).filter(([, value]) => value != null)
			);
		} catch (error) {
			errorInfoStore.set(process_api_error(error as Error));
			return;
		}
		propertyIri = propiri_prefix + ':' + propiri_fragment;
		if (authinfo) {
			if (resiri) {
				const property_put = api_notget_config(authinfo, {
					project: projectid,
					resource: resiri,
					property: propertyIri
				});
				spinnerStore.set(m.res_add_property({ resiri: resiri }));
				apiClient
					.putAdmindatamodelProjectResourceProperty(propertydata, property_put)
					.then(refreshModel)
					.then(() => {
						spinnerStore.set(null);
						successInfoStore.set('!' + m.prop_add_success({ propiri: propertyIri }));
						dialogstatus = false;
					})
					.catch((error) => {
						errorInfoStore.set(process_api_error(error as Error));
						spinnerStore.set(null);
					});
			} else {
				const property_put = api_notget_config(authinfo, {
					project: projectid,
					property: propertyIri
				});
				apiClient
					.putAdmindatamodelProjectpropertyProperty(propertydata, property_put)
					.then(refreshModel)
					.then(() => {
						successInfoStore.set(m.prop_add_success({ propiri: propertyIri }));
						refreshPropertiesListNow();
					})
					.catch((error) => {
						errorInfoStore.set(process_api_error(error as Error));
					});
			}
		}
	};

	const modify_property = async () => {
		if (!prop) return;
		let propertydata: PropertyWrite;
		try {
			propertydata = propertyDelta(baseline, formValues());
		} catch (error) {
			errorInfoStore.set(process_api_error(error as Error));
			return;
		}
		if (Object.keys(propertydata).length === 0) return;
		confirmation_title = m.mod_property();
		confirmation_message = m.confirm_prop_mod({
			property: propiri_prefix + ':' + propiri_fragment
		});
		const ok = await confirmation_dialog.open();
		if (!ok) return;

		propertyIri = prop.propertyIri.toString();
		if (authinfo) {
			if (resiri) {
				const property_post = api_notget_config(authinfo, {
					project: projectid,
					resource: resiri,
					property: propertyIri
				});
				spinnerStore.set(m.adding_prop_spinner({ resiri: resiri }));
				apiClient
					.postAdmindatamodelProjectResourceProperty(propertydata, property_post)
					.then(refreshModel)
					.then(() => {
						successInfoStore.set('!' + m.prop_add_success({ propiri: propertyIri }));
						dialogstatus = false;
						spinnerStore.set(null);
					})
					.catch((error) => {
						errorInfoStore.set(process_api_error(error as Error));
						spinnerStore.set(null);
					});
			} else {
				const property_post = api_notget_config(authinfo, {
					project: projectid,
					property: propertyIri
				});
				apiClient
					.postAdmindatamodelProjectpropertyProperty(propertydata, property_post)
					.then(refreshModel)
					.then(() => {
						baseline = formValues();
						successInfoStore.set(m.prop_add_success({ propiri: propertyIri }));
						refreshPropertiesListNow();
					})
					.catch((error) => {
						errorInfoStore.set(process_api_error(error as Error));
					});
			}
		}
	};
</script>

<!--
The property IRI consists of a prefix (usually the project shortname) or a common prefix like "dcterms", "schema" etc.
and the actual property id (which is a xs:NCName
-->
{#snippet propiri_prefixes()}
	<DropdownButton
		bind:isOpen={propiri_prefix_is_open}
		buttonText={propiri_prefix}
		name="prefixselsel"
		disabled={propiri !== 'new' || add_standalone_prop}
		class="text-xs"
	>
		<DropdownMenu
			bind:isOpen={propiri_prefix_is_open}
			position="left"
			name="prefixselsel"
			id="prefixselsel_id"
		>
			{#each all_prefixes as p (p)}
				<DropdownLinkItem
					bind:isOpen={propiri_prefix_is_open}
					onclick={() => {
						propiri_prefix = p;
						propiri_prefix_is_open = false;
					}}
					selected={p === propiri_prefix}
				>
					{p}
				</DropdownLinkItem>
			{/each}
		</DropdownMenu>
	</DropdownButton>
{/snippet}

{#snippet proj_prefix()}
	<span class="text-xs">{$projectStore?.projectShortName.toString() || ''}:</span>
{/snippet}

<div>
	<div>
		{propiri === 'new' ? m.add_prop() : m.edit_prop()} <span class="italic">{propiri}</span>
	</div>
	<form class="max-w-128 min-w-64" onsubmit={(event) => event.preventDefault()}>
		{#if loadError}<p role="alert">{loadError}</p>{/if}
		<fieldset disabled={!ready || !!loadError}>
			<LabeledDivider>{m.basic_attr()}:</LabeledDivider>
			<Textfield
				type="text"
				label={m.prop_iri()}
				name="fragment"
				id="fragment"
				placeholder="property ID"
				required={true}
				bind:value={propiri_fragment}
				pattern={ncname_pattern}
				disabled={propiri !== 'new' || add_standalone_prop}
				additional_snippet={resiri ? proj_prefix : propiri_prefixes}
			/>
			{#if !add_standalone_prop}
				{#each parentRows as row, index}
					{#snippet parentPrefix()}
						<DropdownButton
							bind:isOpen={row.open}
							buttonText={row.prefix}
							disabled={!canEditParents}
							name={`parent-prefix-${index}`}
							class="text-xs"
						>
							<DropdownMenu
								bind:isOpen={row.open}
								position="left"
								name={`parent-prefix-${index}`}
								id={`parent-prefix-${index}`}
							>
								{#each [...new Set([...all_prefixes, row.prefix])] as prefix}
									<DropdownLinkItem
										bind:isOpen={row.open}
										onclick={() => {
											row.prefix = prefix;
											row.open = false;
										}}
										selected={prefix === row.prefix}>{prefix}</DropdownLinkItem
									>
								{/each}
							</DropdownMenu>
						</DropdownButton>
					{/snippet}
					<div class="flex items-end gap-2">
						<div class="grow">
							<Textfield
								type="text"
								label={m.subprop_of()}
								name={index === 0 ? 'subprop' : `subprop-${index}`}
								id={index === 0 ? 'subprop' : `subprop-${index}`}
								placeholder="subPropertyOf fragment"
								required={false}
								bind:value={row.fragment}
								disabled={!canEditParents}
								pattern={row.full ? undefined : ncname_pattern}
								suggestions={row.full ? [] : parentSuggestions(row.prefix)}
								additional_snippet={row.full ? undefined : parentPrefix}
							/>
						</div>
						{#if canEditParents && parentRows.length > 1}<button
								type="button"
								class="oldap-button mb-2"
								title={m.superproperty_remove()}
								onclick={() => (parentRows = parentRows.filter((_, i) => i !== index))}>−</button
							>{/if}
					</div>
				{/each}
				<button
					type="button"
					class="oldap-button mb-2"
					disabled={!canEditParents}
					title={m.superproperty_add()}
					onclick={() => (parentRows = [...parentRows, parentRow()])}>+</button
				>

				<PropTypeSelector
					label={m.property()}
					{projectid}
					{propiri}
					bind:proptype
					bind:datatype
					bind:toClass
					{all_res_list}
					{all_lists_list}
					disabled={inferParentType && parentIris.length === 1}
				/>
				<LangstringfieldNew
					label={m.name()}
					name="name"
					id="name"
					{languages}
					placeholder="name"
					bind:value={name}
				/>
				<LangstringfieldNew
					label={m.description()}
					name="description"
					id="description"
					{languages}
					placeholder="description"
					input_type="textarea"
					bind:value={description}
				/>
				{#if proptype === PropType.LITERAL}
					<LabeledDivider>{m.restrictions()}:</LabeledDivider>
					{#if string_datatypes.includes(datatype || '')}
						<Textfield
							label={m.regex_pattern()}
							name="pattern"
							id="pattern"
							placeholder="pattern"
							type="text"
							bind:value={pattern}
							validate={isValidRegex}
						/>
						<Textfield
							label={m.min_length()}
							name="minlength"
							id="minlength"
							placeholder="min length"
							type="number"
							bind:value={min_length}
						/>
						<Textfield
							label={m.max_length()}
							name="maxlength"
							id="maxlength"
							placeholder="max length"
							type="number"
							bind:value={max_length}
						/>
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
						<Textfield
							label={m.min_val()}
							name="minValue"
							id="minValue"
							placeholder="min value"
							type="number"
							bind:value={min_value}
						/>
						<Checkbox
							label={m.inclusive()}
							class="text-xs"
							bind:checked={min_inclusive}
							name="min_inclusive"
						/>
						<Textfield
							label={m.max_val()}
							name="maxValue"
							id="maxValue"
							placeholder="max value"
							type="number"
							bind:value={max_value}
						/>
						<Checkbox
							label={m.inclusive()}
							class="text-xs"
							bind:checked={max_inclusive}
							name="max_inclusive"
						/>
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
			{/if}
			{#if resiri !== undefined}
				<ReificationPolicy
					shapes={[$datamodelStore, $datamodelSharedStore].flatMap(
						(model) => model?.reifierShapes ?? []
					)}
					bind:selected={reifierShapes}
					bind:required={reificationRequired}
				/>
				<LabeledDivider>HAS PROPERTY PARAMS:</LabeledDivider>
				<Numberfield
					label="minCount"
					bind:value={minCount}
					min={0.0}
					step={1.0}
					name="minCount"
					placeholder="undefined"
				/>
				<Numberfield
					label="maxCount"
					bind:value={maxCount}
					min={0.0}
					step={1.0}
					name="maxCount"
					placeholder="undefined"
				/>
				<Numberfield
					label="order"
					bind:value={order}
					name="order"
					min={0.0}
					step={0.1}
					placeholder="undefined"
				/>
			{/if}
			{#if gui_editor_hints.length > 0 && resiri}
				<LabeledDivider>GUI HINTS</LabeledDivider>
				<DropdownField
					items={gui_editor_hints}
					label="GUI_HINTS"
					id="gui_hints"
					name="gui_hints"
					bind:selectedItem={editor}
				/>
			{/if}

			<div class="mt-6 flex justify-center gap-4">
				{#if dialogstatus !== undefined}
					<Button
						class="mx-4 my-2"
						onclick={() => {
							dialogstatus = false;
						}}>{m.cancel()}</Button
					>
				{:else}
					<Button class="mx-4 my-2" onclick={goto_page('/admin')}>{m.cancel()}</Button>
				{/if}
				{#if propiri === 'new' || prop === undefined}
					<!-- prop === undefined: We're starting from the resource page -->
					<Button class="mx-4 my-2" onclick={() => add_property()}>{m.add()}</Button>
				{:else}
					<Button class="mx-4 my-2" onclick={() => modify_property()}>{m.modify()}</Button>
				{/if}
			</div>
		</fieldset>
	</form>
</div>

<Confirmation bind:this={confirmation_dialog} title={confirmation_title}>
	{confirmation_message}
</Confirmation>
