<!--
Copyright

@component

This component is used to add or modify a property. This can be either a standalone property or
in relation with a resource class.

-->

<script lang="ts">

	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { OldapUser } from '$lib/oldap/classes/user';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { userStore } from '$lib/stores/user';
	import { onMount, tick, untrack } from 'svelte';
	import { OwlPropertyType, PropertyClass } from '$lib/oldap/classes/property';
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
	import LangstringField from '$lib/components/basic_gui/inputs/LangstringField.svelte';
	import { LangString } from '$lib/oldap/datatypes/langstring';
	import { convertToLanguage, getLanguageShortname, Language } from '$lib/oldap/enums/language';
	import { PropType } from '$lib/oldap/enums/proptypes';
	import DropdownButton from '$lib/components/basic_gui/dropdown/DropdownButton.svelte';
	import DropdownMenu from '$lib/components/basic_gui/dropdown/DropdownMenu.svelte';
	import DropdownLinkItem from '$lib/components/basic_gui/dropdown/DropdownLinkItem.svelte';
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
	import type { HasProperty } from '$lib/oldap/classes/resource';
	import { spinnerStore } from '$lib/stores/spinner';
	import LangtextareaField from '$lib/components/basic_gui/inputs/LangtextareaField.svelte';
	import { datamodelSharedStore } from '$lib/stores/datamodel_shared';
	import LangstringfieldNew from '$lib/components/basic_gui/inputs/LangstringfieldNew.svelte';
	import { locales } from '$lib/paraglide/runtime';

	interface PropertyData {
		subPropertyOf?: string,
		class?: string,
		datatype?: string,
		name?: string[] | Partial<Record<'add' | 'del', string[]>> | null,
		description?: string[] | Partial<Record<'add' | 'del', string[]>> | null,
		languageIn?: string[],
		uniqueLang?: boolean,
		inSet?: string[],
		minLength?: number | null,
		maxLength?: number | null,
		pattern?: string | null,
		minExclusive?: number | null,
		minInclusive?: number | null,
		maxExclusive?: number | null,
		maxInclusive?: number | null,
		inverseOf?: string,
		equivalentProperty?: string,
		statementProperty?: boolean,
		transitiveProperty?: boolean,
		symmetricProperty?: boolean,
		reflexiveProperty?: boolean,
		irreflexiveProperty?: boolean,
		functionalProperty?: boolean,
		inverseFunctionalProperty?: boolean,
		// transitive?: boolean, TODO: Implement later
		// symmetric?: boolean, TODO: Implement later
	}

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
	} : {
			propiri: string,
			resiri?: string,
			projectid : string,
			dialogstatus?: boolean,
			topwin?: HTMLElement,
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
	let prop = $state<PropertyClass>();
	let hasprop = $state<HasProperty>();

	let propertyIri = $state('');
	let prefix_is_open = $state(false);
	let prefix = $state('');
	let fragment = $state('');
	let all_prefixes = $state<string[]>([]);
	let subPropertyOf = $state('');
	let proptype = $state<PropType>(PropType.LITERAL);
	let datatype = $state<string|undefined>();
	let toClass = $state<string|undefined>();
	let name = $state<LangString>(new LangString());
	let orig_name: LangString = new LangString();
	let description = $state<LangString>(new LangString);
	let orig_description: LangString = new LangString();

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
	let inverseOf = $state('');
	let equivalentProperty = $state<string>('');
	let statementProperty = $state<boolean>(false);
	let transitiveProperty = $state<boolean>(false);
	let symmetricProperty = $state<boolean>(false);
	let reflexiveProperty = $state<boolean>(false);
	let irreflexiveProperty = $state<boolean>(false);
	let functionalProperty = $state<boolean>(false);
	let inverseFunctionalProperty = $state<boolean>(false);

	let allowedLanguages = $state<string[]>([]);
	let allowedStrings = $state<Set<string|number>>(new Set());
	let allowedNumbers = $state<Set<string|number>>(new Set());
	let datamodel = $state<DatamodelClass | null>(null);

	let minCount = $state<string>();
	let maxCount = $state<string>();
	let order = $state<string>();
	let gui_editor_hints = $state<string[]>([]);
	let editor = $state<string>('');

	let add_standalone_prop = $state(false);

	let confirmation_dialog: Confirmation;
	let confirmation_title = $state('');
	let confirmation_message = $state('');

	const languages = Array.from(locales).map(lang => convertToLanguage(lang) || Language.DE);

	authInfoStore.subscribe(data => {
		authinfo = data;
	});

	// userStore.subscribe((admin) => {
	// 	administrator = admin;
	// });

	datamodelStore.subscribe(data => {
		datamodel = data;
	});

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

		// first we check if are trying to modify a standalone property from within a resource. That not allowed!
		if (resiri && propiri !== 'new') {
			const tmp = datamodel?.standaloneProperties.find(p => p.propertyIri.toString() === propiri) ||
				$datamodelSharedStore?.standaloneProperties.find(p => p.propertyIri.toString() === propiri);
			if (tmp !== undefined) {
				add_standalone_prop = true;
			}
		}

		// filter the iri of the property from the list, because a property cannot be a subproperty of itself!
		all_prop_list = datamodel?.standaloneProperties.filter(p => p.propertyIri.toString() !== propiri).map(p => p.propertyIri.toString()) || [];
		const shared_prop_list = $datamodelSharedStore?.standaloneProperties.filter(p => p.propertyIri.toString() !== propiri).map(p => p.propertyIri.toString()) || [];
		all_prop_list = ['NONE', ...shared_prop_list, ...all_prop_list];

		all_prefixes = [$projectStore?.projectShortName.toString() || '']
		// if (administrator?.isRoot && projectid !== 'shared') {
		// 	all_prefixes = [...all_prefixes, 'shared'];
		// }
		all_prefixes = [...all_prefixes, 'skos', 'schema', 'dcterms']
		let extontos: string[] = []
		datamodel?.externalOntologies.forEach(x => extontos.push(x.prefix.toString()));
		all_prefixes = [...all_prefixes, ...extontos];

		// get the list of all resource classes that can be the target of a link. These are Resources
		// that are not list nodes! A list node always has the super-class 'oldap:OldapListNode'
		const tmp_resources = datamodel?.resources.filter(x => {
			if (x.superclass) {
				const gaga = [...x.superclass].map(s => s.toString()) || [];
				return !gaga.includes('oldap:OldapListNode');
			}
			else {
				return true;
			}
		}) || [];
		all_res_list = tmp_resources.map(r => r.iri.toString()) ?? [];

		// get the list of hierarchical lists that are available
		const tmp_lists = datamodel?.resources.filter(x => {
			if (x.superclass) {
				const gaga = [...x.superclass].map(s => s.toString()) || [];
				return gaga.includes('oldap:OldapListNode');
			}
			else {
				return false;
			}
		}) || [];
		all_lists_list = tmp_lists.map(r => r.iri.toString()) ?? [];

		if (propiri === 'new') {
			// initialize a new property to be added to reasonable values...

			prefix = $projectStore?.projectShortName.toString() || '';
			fragment = '';
			subPropertyOf = 'NONE';
			datatype = 'xsd:string';
			toClass = undefined;
			inverseOf = 'NONE';
			equivalentProperty = 'NONE';
			statementProperty = false;
			transitiveProperty = false;
			symmetricProperty = false;
			reflexiveProperty = false;
			irreflexiveProperty = false;
			functionalProperty = false;
			inverseFunctionalProperty = false;
		}
		else {
		  const tmp = QName.createQName(propiri);
			prefix = tmp.prefix.toString();
			fragment = tmp.fragment.toString();
			if (resiri) {
				const res = datamodel?.resources.find(r => r.iri.toString() === resiri);
				if (res) {
					hasprop = res?.hasProperty?.find(p => p.property.propertyIri.toString() === propiri);
					prop = hasprop?.property;
				}
			}
			else {
				prop = datamodel?.standaloneProperties.find(p => p.propertyIri.toString() === propiri);
			}
			subPropertyOf = prop?.subPropertyOf?.toString() || 'NONE';
			datatype = prop?.datatype;
			toClass = prop?.toClass?.toString();
			inverseOf = prop?.inverseOf?.toString() || 'NONE';
			equivalentProperty = prop?.equivalentProperty?.toString() || 'NONE';
			statementProperty = OwlPropertyType.StatementProperty in (prop?.ptype || new Set());
			transitiveProperty = OwlPropertyType.TransitiveProperty in (prop?.ptype || new Set());
			symmetricProperty = OwlPropertyType.SymmetricProperty in (prop?.ptype || new Set());
			reflexiveProperty = OwlPropertyType.ReflexiveProperty in (prop?.ptype || new Set());
			irreflexiveProperty = OwlPropertyType.IrreflexiveProperty in (prop?.ptype || new Set());
			functionalProperty = OwlPropertyType.FunctionalProperty in (prop?.ptype || new Set());
			inverseFunctionalProperty = OwlPropertyType.InverseFunctionalProperty in (prop?.ptype || new Set());
		}
		await tick();
		scrollToTop();
	});

	/**
	 * This callback is fired on initialization, and if the subPropertyOf changes...
	 */
	$effect(() => {
		//
		// if we select the property to be a sub-property, it must have the same data type as the ancestor property!
		//
		if (subPropertyOf === 'NONE') {
			untrack(() => {
				if (propiri === 'new') {
					datatype = 'xsd:string';
					toClass = undefined;
					editor = gui_editor_hints[0]
				} else {
					subPropertyOf = prop?.subPropertyOf?.toString() || 'NONE'
					datatype = prop?.datatype;
					toClass = prop?.toClass?.toString();
					name = prop?.name || new LangString();
					orig_name = name.clone()
					description = prop?.description || new LangString();
					orig_description = description.clone();
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
					if (prop?.inSet) {
						allowedStrings = new Set(Array.from(prop.inSet, x => x.toString()));
					}
					minCount = hasprop?.minCount?.toString();
					maxCount = hasprop?.maxCount?.toString();
					order = hasprop?.order?.toString();
					editor = hasprop?.editor?.toString() || gui_editor_hints[0];
				}
			});
		} else {
			const ancestorprop = datamodel?.standaloneProperties.find(p => p.propertyIri.toString() === subPropertyOf);
			untrack(() => {
				datatype = ancestorprop?.datatype;
				toClass = ancestorprop?.toClass?.toString();
			});
		}
		untrack(() => {
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
		});
	});

	$effect(() => {
		let _ = datatype;
		untrack(() => {
			if (datatype === 'rdf:langString') {
				gui_editor_hints = ['None', 'dash:TextFieldWithLangEditor', 'dash:TextAreaWithLangEditor']
				//editor = gui_editor_hints[0];
			} else if (datatype === 'xsd:string') {
				gui_editor_hints=['None', 'dash:TextFieldEditor', 'dash:TextAreaEditor']
				//editor = gui_editor_hints[0];
			}
			else {
				gui_editor_hints = [];
			}
			editor = hasprop?.editor || gui_editor_hints[0];
		})
	});

	const add_property = async () => {
		confirmation_title = m.add_property();
		confirmation_message = m.confirm_property_add({propiri: prefix + ":" + fragment});
		const ok = await confirmation_dialog.open();
		if (!ok) return;

		const propname = name.map((lang, val) => `${val}@${getLanguageShortname(lang)}`);
		const propdescription = description.map((lang, val) => `${val}@${getLanguageShortname(lang)}`);

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

		interface AddPropertyData extends PropertyData {
			minCount?: number, // only used when resiri is given, non-standalone property!
			maxCount?: number, // only used when resiri is given, non-standalone property!
			order?: number, // only used when resiri is given, non-standalone property!
			editor?: string, // only used when resiri is given, non-standalone property!
		}

		let propertydata: AddPropertyData = {
			subPropertyOf: subPropertyOf.length > 0 && subPropertyOf !== 'NONE' ? subPropertyOf : undefined
		};

		if (resiri) {
			const minCountNum = Number(minCount);
			propertydata.minCount = !isNaN(minCountNum) ? minCountNum : undefined;
			const maxCountNum = Number(maxCount);
			propertydata.maxCount = !isNaN(maxCountNum) ? maxCountNum : undefined;
			const orderNum = Number(order);
			propertydata.order = !isNaN(orderNum) ? orderNum : undefined;
			const editorStr = editor;
			propertydata.editor = (editorStr?.length || 0) > 0 ? editorStr : undefined;
		}
		propertydata.name = propname.length && (propname?.length > 0) ? propname : undefined;
		propertydata.description = propdescription.length && (propdescription?.length > 0) ? propdescription : undefined;
		if (proptype === PropType.LITERAL) {
			propertydata.datatype = datatype;
			if (string_datatypes.includes(datatype || '')) {
				const minLengthNum = Number(min_length);
				propertydata.minLength = !isNaN(minLengthNum) ? minLengthNum : undefined;
				const maxLengthNum = Number(max_length);
				propertydata.maxLength = !isNaN(maxLengthNum) ? maxLengthNum : undefined;
				propertydata.pattern = pattern.length > 0 ? pattern : undefined;
				propertydata.inSet = inSet.length > 0 ? inSet : undefined;
				if (datatype === 'rdf:langString') {
					propertydata.languageIn = allowedLanguages.length > 0 ? allowedLanguages : undefined;
					propertydata.uniqueLang = true; // TODO: add GUI element for this!
				}
			}
			else if (comparable_datatypes.includes(datatype || '')) {
				const minExclusiveNum = Number(minExclusive);
				propertydata.minExclusive = !isNaN(minExclusiveNum) ? minExclusiveNum : undefined;
				const minInclusiveNum = Number(minInclusive);
				propertydata.minInclusive = !isNaN(minInclusiveNum) ? minInclusiveNum : undefined;
				const maxExclusiveNum = Number(maxExclusive);
				propertydata.maxExclusive = !isNaN(maxExclusiveNum) ? maxExclusiveNum : undefined;
				const maxInclusiveNum = Number(maxInclusive);
				propertydata.maxInclusive = !isNaN(maxInclusiveNum) ? maxInclusiveNum : undefined;
			}
		}
		else if (proptype === PropType.LINK) {
			propertydata.class = toClass;
		}
		else if (proptype === PropType.LIST) {
			propertydata.class = toClass;
		}
		propertyIri = prefix + ':' + fragment;
		if (authinfo) {
			if (resiri) {
				// TODO: Implement adding a property to a resource!
				const property_put = api_notget_config(authinfo, {project: projectid, resource: resiri, property: propertyIri});
				spinnerStore.set(m.res_add_property({resiri: resiri}));
				apiClient.putAdmindatamodelProjectResourceProperty(propertydata, property_put).then(() => {
					// we changed a property, so we need to update the datamodel by re-reading it!
					let project = $projectStore;
					const dm_config = api_config(authinfo as AuthInfo, { project: project?.projectShortName.toString() || '' });
					return apiClient.getAdmindatamodelProject(dm_config);
				}).then((jsonresult) => {
					const datamodel = DatamodelClass.fromOldapJson(jsonresult);
					datamodelStore.set(datamodel); // set the datamodelStore so the reactive mechanisms of svelte will update the UI!
					spinnerStore.set(null);
					successInfoStore.set('!' + m.prop_add_success({propiri: propertyIri}));
					dialogstatus = false;
				}).catch((error) => {
					errorInfoStore.set(process_api_error(error as Error));
					spinnerStore.set(null);
				});
			}
			else {
				const property_put = api_notget_config(authinfo, {project: projectid, property: propertyIri});
				apiClient.putAdmindatamodelProjectpropertyProperty(propertydata, property_put).then(() => {
					successInfoStore.set(m.prop_add_success({propiri: propertyIri}));
					refreshPropertiesListNow();
				}).catch((error) => {
					errorInfoStore.set(process_api_error(error as Error));
				});
			}
		}
	}

	const modify_property = async () => {
		if (!prop) return;
		confirmation_title = m.mod_property();
		confirmation_message = m.confirm_prop_mod({property: prefix + ":" + fragment});
		const ok = await confirmation_dialog.open();
		if (!ok) return;

		let propertydata: PropertyData = {};

		let propertydataWithResiri: {
			property?: PropertyData,
			minCount?: number | null, // only used when resiri is given, non-standalone property!
			maxCount?: number | null, // only used when resiri is given, non-standalone property!
			order?: number | null, // only used when resiri is given, non-standalone property!
			editor?: string | null,  // only used when resiri is given, non-standalone property!
		} = {};


		if (subPropertyOf !== prop?.subPropertyOf?.toString() && subPropertyOf !== 'NONE') {
			propertydata.subPropertyOf = subPropertyOf
		}
		const tmp_modname = name.modify_data(orig_name || null);
		if (tmp_modname !== undefined) {
			propertydata.name = tmp_modname;
		}
		const tmp_moddescription = description?.modify_data(orig_description || null);
		if (tmp_moddescription !== undefined) {
			propertydata.description = tmp_moddescription;
		}
		if (proptype === PropType.LITERAL) {
			if (prop.datatype !== datatype) {
				propertydata.datatype = datatype;
			}
			if (string_datatypes.includes(datatype || '')) {
				if (prop?.minLength && min_length?.length === 0) {
					propertydata.minLength = null;
				}
				const min_length_number = Number(min_length);
				if (!Number.isNaN(min_length_number) && prop.minLength !== min_length_number) {
					propertydata.minLength = min_length_number;
				}

				if (prop?.maxLength && max_length?.length === 0) {
					propertydata.maxLength = null;
				}
				const max_length_number = Number(max_length);
				if (!Number.isNaN(max_length_number) && prop.maxLength !== max_length_number) {
					propertydata.maxLength = max_length_number;
				}
			} else if (comparable_datatypes.includes(datatype || '')) {
				if (prop?.minExclusive && min_value?.length === 0) {
					propertydata.minExclusive = null;
				}
				const min_value_number = Number(min_value);
				if (!Number.isNaN(min_value_number) && prop.minExclusive !== min_value_number) {
					propertydata.minExclusive = min_value_number;
				}

				if (prop?.minInclusive && min_value?.length === 0) {
					propertydata.minInclusive = null;
				}
				if (!Number.isNaN(min_value_number) && prop.minInclusive !== min_value_number) {
					propertydata.minInclusive = min_value_number;
				}

				if (prop?.maxExclusive && max_value?.length === 0) {
					propertydata.maxExclusive = null;
				}
				const max_value_number = Number(max_value);
				if (!Number.isNaN(max_value_number) && prop.maxExclusive !== max_value_number) {
					propertydata.maxExclusive = max_value_number;
				}

				if (prop?.maxInclusive && max_value?.length === 0) {
					propertydata.maxInclusive = null;
				}
				if (!Number.isNaN(max_value_number) && prop.maxInclusive !== max_value_number) {
					propertydata.maxInclusive = max_value_number;
				}
			}
		} else if (proptype === PropType.LINK || proptype === PropType.LIST) {
			if (prop.toClass !== toClass) {
				propertydata.class = toClass;
			}
		}

		if (resiri) {
			if (Object.keys(propertydata).length !== 0) {
				propertydataWithResiri.property = propertydata;
			}
			else {
				propertydataWithResiri.property = undefined;
			}
			if (hasprop?.minCount && minCount?.length === 0) {
				propertydataWithResiri.minCount = null;
			}
			const minCount_number = Number(minCount);
			if (!isNaN(minCount_number) && hasprop?.minCount !== minCount_number) {
				propertydataWithResiri.minCount = minCount_number;
			}

			if (hasprop?.maxCount && maxCount?.length === 0) {
				propertydataWithResiri.maxCount = null;
			}
			const maxCount_number = Number(maxCount);
			if (!isNaN(maxCount_number) && hasprop?.maxCount !== maxCount_number) {
				propertydataWithResiri.maxCount = maxCount_number;
			}

			if (hasprop?.order && order?.length === 0) {
				propertydataWithResiri.order = null;
			}
			const order_number = Number(order);
			if (!isNaN(order_number) && hasprop?.order !== order_number) {
				propertydataWithResiri.order = order_number;
			}

			if (hasprop?.editor && editor?.length === 0) {
				propertydataWithResiri.editor = null;
			}
			if (hasprop?.editor !== editor) {
				propertydataWithResiri.editor = editor;
			}
		}

		propertyIri = prop.propertyIri.toString();
		if (authinfo) {
			if (resiri) {
				const property_post = api_notget_config(authinfo, {
					project: projectid,
					resource: resiri,
					property: propertyIri
				});
				spinnerStore.set(m.adding_prop_spinner({resiri: resiri}));
				apiClient.postAdmindatamodelProjectResourceProperty(propertydataWithResiri, property_post).then(() => {
					successInfoStore.set('!' + m.prop_add_success({ propiri: propertyIri }));
					dialogstatus = false;
				}).then(() => {
					// we changed a property, so we need to update the datamodel by re-reading it!
					let project = $projectStore;
					const dm_config = api_config(authinfo as AuthInfo, { project: project?.projectShortName.toString() || '' });
					return apiClient.getAdmindatamodelProject(dm_config);
				}).then((jsonresult) => {
					const datamodel = DatamodelClass.fromOldapJson(jsonresult);
					datamodelStore.set(datamodel); // set the datamodelStore so the reactive mechanisms of svelte will update the UI!
					spinnerStore.set(null);
				}).catch((error) => {
					errorInfoStore.set(process_api_error(error as Error));
					spinnerStore.set(null);
				});
			} else {
				const property_post = api_notget_config(authinfo, {
					project: projectid,
					property: propertyIri
				});
				apiClient.postAdmindatamodelProjectpropertyProperty(propertydata, property_post).then(() => {
					successInfoStore.set(m.prop_add_success({ propiri: propertyIri }));
					refreshPropertiesListNow();
				}).catch((error) => {
					errorInfoStore.set(process_api_error(error as Error));
				});
			}
		}
	}


</script>

<!--
The property IRI consists of a prefix (usually the project shortname) or a common prefix like "dcterms", "schema" etc.
and the actual property id (which is a xs:NCName
-->
{#snippet prefixes()}
	<DropdownButton bind:isOpen={prefix_is_open} buttonText={prefix} name="prefixselsel" disabled={propiri !== 'new' || add_standalone_prop} class="text-xs">
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
	<form class="max-w-128 min-w-64">
		<LabeledDivider>{m.basic_attr()}:</LabeledDivider>
		<Textfield type='text' label={m.prop_iri()} name="fragment" id="fragment" placeholder="property ID" required={true}
							 bind:value={fragment} pattern={ncname_pattern} disabled={propiri !== 'new' || add_standalone_prop}
							 additional_snippet={prefixes}
		/>
		{#if !add_standalone_prop}
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
			<LangstringfieldNew
				label={m.name()}
				name="name"
				id="name"
				languages={languages}
				placeholder="name"
				bind:value={name}
			/>
			<LangstringfieldNew
				label={m.description()}
				name="description"
				id="description"
				languages={languages}
				placeholder="description"
				input_type="textarea"
				bind:value={description}
			/>
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
		{/if}
		{#if resiri !== undefined}
			<LabeledDivider>HAS PROPERTY PARAMS:</LabeledDivider>
			<Numberfield label="minCount" bind:value={minCount} min={0.0} step={1.0} name="minCount" placeholder="undefined"/>
			<Numberfield label="maxCount" bind:value={maxCount} min={0.0} step={1.0} name="maxCount" placeholder="undefined"/>
			<Numberfield label="order" bind:value={order} name="order" min={0.0} step={0.1} placeholder="undefined"/>
		{/if}
		<LabeledDivider>OWL STUFF</LabeledDivider>
		<DropdownField items={all_prop_list} id="allprops_id2" name="allprops" label="INVERSE OF" bind:selectedItem={inverseOf} />
		<DropdownField items={all_prop_list} id="allprops_id3" name="allprops" label="EQUIVALEND_PROPERTY" bind:selectedItem={equivalentProperty} />
		<Checkbox label="Statement property" position="right" bind:checked={statementProperty} name="statementProperty"/>
		<Checkbox label="Transitive property" position="right" bind:checked={transitiveProperty} name="transitiveProperty"/>
		<Checkbox label="Symmetric property" position="right" bind:checked={symmetricProperty} name="symmetricProperty"/>
		<Checkbox label="Reflexive property" position="right" bind:checked={reflexiveProperty} name="reflexiveProperty"/>
		<Checkbox label="Irreflexive property" position="right" bind:checked={irreflexiveProperty} name="irreflexiveProperty"/>
		<Checkbox label="Functional property" position="right" bind:checked={functionalProperty} name="functionalProperty"/>
		<Checkbox label="Inverse functional property" position="right" bind:checked={inverseFunctionalProperty} name="inverseFunctionalProperty"/>
		{#if gui_editor_hints.length > 0}
			<LabeledDivider>GUI HINTS</LabeledDivider>
			{editor}
			<DropdownField items={gui_editor_hints} label="GUI_HINTS" id="gui_hints" name="gui_hints" bind:selectedItem={editor}/>
		{/if}

		<div class="flex justify-center gap-4 mt-6">
			{#if dialogstatus !== undefined}
				<Button class="mx-4 my-2" onclick={() => {dialogstatus = false}}>{m.cancel()}</Button>
			{:else}
				<Button class="mx-4 my-2" onclick={goto_page('/admin')}>{m.cancel()}</Button>
			{/if}
			{#if propiri === 'new' || prop === undefined} <!-- prop === undefined: We're starting from the resource page -->
				<Button class="mx-4 my-2" onclick={() => add_property()}>{m.add()}</Button>
			{:else}
				<Button class="mx-4 my-2" onclick={() => modify_property()}>{m.modify()}</Button>
			{/if}
		</div>

	</form>
</div>

<Confirmation bind:this={confirmation_dialog} title={confirmation_title}>
	{confirmation_message}
</Confirmation>

