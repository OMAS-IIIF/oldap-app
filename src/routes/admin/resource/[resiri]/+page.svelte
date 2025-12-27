<!--
  - Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
-->
<script lang="ts">

	//import Property from '$lib/components/oldap/Property.svelte';
	import type { PageProps } from './$types';
	import { projectStore } from '$lib/stores/project';
	import * as m from '$lib/paraglide/messages';
	import { datamodelStore } from '$lib/stores/datamodel';
	import type { DatamodelClass } from '$lib/oldap/classes/datamodel';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { onMount } from 'svelte';
	import { languageTag } from '$lib/paraglide/runtime';
	import { convertToLanguage, getLanguageShortname, Language } from '$lib/oldap/enums/language';
	import SelectMutiple from '$lib/components/basic_gui/inputs/SelectMutiple.svelte';
	import LangstringField from '$lib/components/basic_gui/inputs/LangstringField.svelte';
	import { LangString } from '$lib/oldap/datatypes/langstring';
	import { userStore } from '$lib/stores/user';
	import { OldapUser } from '$lib/oldap/classes/user';
	import Togglefield from '$lib/components/basic_gui/inputs/Togglefield.svelte';
	import { type HasProperty, ResourceClass } from '$lib/oldap/classes/resource';
	import Table from '$lib/components/basic_gui/table/Table.svelte';
	import DropdownButton from '$lib/components/basic_gui/dropdown/DropdownButton.svelte';
	import DropdownMenu from '$lib/components/basic_gui/dropdown/DropdownMenu.svelte';
	import DropdownButtonItem from '$lib/components/basic_gui/dropdown/DropdownButtonItem.svelte';
	import TableHeader from '$lib/components/basic_gui/table/TableHeader.svelte';
	import TableColumnTitle from '$lib/components/basic_gui/table/TableColumnTitle.svelte';
	import TableBody from '$lib/components/basic_gui/table/TableBody.svelte';
	import TableItem from '$lib/components/basic_gui/table/TableItem.svelte';
	import TableRow from '$lib/components/basic_gui/table/TableRow.svelte';
	import { goto_page } from '$lib/helpers/goto_page';
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';
	import { Pencil, Trash2 } from '@lucide/svelte';
	import DialogWin from '$lib/components/basic_gui/dialogs/DialogWin.svelte';
	import Property from '$lib/components/oldap/Property.svelte';
	import { Iri } from '$lib/oldap/datatypes/xsd_iri';
	import ToolInfo from '$lib/components/basic_gui/ToolInfo.svelte';
	import Confirmation from '$lib/components/basic_gui/dialogs/Confirmation.svelte';
	import DropdownLinkItem from '$lib/components/basic_gui/dropdown/DropdownLinkItem.svelte';
	import Textfield from '$lib/components/basic_gui/inputs/Textfield.svelte';
	import { QName } from '$lib/oldap/datatypes/xsd_qname';
	import { api_notget_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import { successInfoStore } from '$lib/stores/successinfo';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import { refreshResourcesListNow } from '$lib/stores/refresh_resourceslist.svelte';
	import { datamodelSharedStore } from '$lib/stores/datamodel_shared';

	let { data } : PageProps = $props();

	let lang = $state(languageTag());
	let langobj = $derived(convertToLanguage(lang) ?? Language.EN);

	let topwin = $state<HTMLElement>();

	let authinfo: AuthInfo | null = $authInfoStore;
	let administrator = $state<OldapUser | null>(null);

	let datamodel = $state<DatamodelClass | null>(null);
	let projectid = $state<string>('');

	let all_res_set = $state<Set<{key: string, label?: string}>>(new Set());
	let prefix_is_open = $state(false);
	let prefix = $state('');
	let fragment = $state('');
	let all_prefixes = $state<string[]>([]);
	let superclasses = $state<Set<string>>(new Set());
	let res = $state<ResourceClass | null>(null);
	let label_field: LangstringField;
	let label = $state<LangString | null>(null);
	let comment_field: LangstringField;
	let comment = $state<LangString | null>(null);
	let closed = $state(false);

	let addPropOpen = $state(false);
	let propEditIsOpen = $state(false);
	let propEditPropIri = $state('');

	let confirmation_dialog: Confirmation;
	let confirmation_title = $state('');
	let confirmation_message = $state('');

	const ncname_pattern: RegExp = /^[A-Za-z_][A-Za-z0-9._-]*$/;

	authInfoStore.subscribe(data => {
		authinfo = data;
	});

	userStore.subscribe((admin) => {
		administrator = admin;
	});

	projectStore.subscribe(project => {
		projectid = project?.projectShortName.toString() || '';
	});

	datamodelStore.subscribe(data => {
		datamodel = data;
	});

	$effect(() => {
		const tmp_resources = datamodel?.resources.filter(x => {
			const gaga = x?.superclass ? [...x.superclass].map(s => s.toString()) : [];
			return !gaga.includes('oldap:OldapListNode');
		}) || [];
		res = tmp_resources.find(r => r.iri.toString() === data.resiri) || null;
	});

	onMount(async () => {
		//
		// get the list of all resource classes that can be a superclass of the resource we are editing
		//
		const tmp_resources = datamodel?.resources.filter(x => {
			const gaga = x?.superclass ? [...x.superclass].map(s => s.toString()) : [];
			return !gaga.includes('oldap:OldapListNode');
		}) || [];
		const shared_resources = $datamodelSharedStore?.resources.filter(x => {
			const gaga = x?.superclass ? [...x.superclass].map(s => s.toString()) : [];
			return !gaga.includes('oldap:OldapListNode');
		}) || [];
		const tmp_resources_all = [...tmp_resources, ...shared_resources];
		all_res_set = new Set(tmp_resources_all.filter(r => r.iri.toString() !== data.resiri).map(r => {return {key: r.iri.toString(), label: r.label?.get(langobj)}}));

		//
		// get all prefixes that can be used for resource IRIs. This is the prefix of the project
		// and the prefixes of the external ontologies
		//
		all_prefixes = [$projectStore?.projectShortName.toString() || '']
		all_prefixes = [...all_prefixes, 'skos', 'schema', 'dcterms']
		let extontos: string[] = []
		datamodel?.externalOntologies.forEach(x => extontos.push(x.prefix.toString()));
		all_prefixes = [...all_prefixes, ...extontos];

		if (data.resiri !== 'new') {
			// we are editing an existing resource
			res = tmp_resources.find(r => r.iri.toString() === data.resiri) || null;
			if (res) {
				superclasses = res.superclass ? new Set<string>([...res.superclass].filter(s => s.toString() !== 'oldap:Thing').map(s => s.toString())) : new Set<string>();
				label = res.label || null;
				comment = res.comment || null;
				closed = res.closed || true;
				const tmp = QName.createQName(res.iri.toString());
				prefix = tmp.prefix.toString();
				fragment = tmp.fragment.toString();
			}
		}
		else {
			// we are creating a new resource
			prefix = $projectStore?.projectShortName.toString() || '';
			fragment = '';
		}
	});

	const propinfo_as_html = (prop: HasProperty) => {
		let result = '<h1>' + prop.property.propertyIri.toString() + '</h1>';
		result += '<table class="table-auto w-full">';
		result += '<thead><tr><th>field</th><th> </th></th><th>value</th></tr></thead>';
		result += '<tbody>';
		for (const [key, value] of Object.entries(prop)) {
			if (key === 'property') {
				for (const [key2, value2] of Object.entries(value)) {
					if (value2) {
						if (value2 instanceof Iri) {
							if (value2.iri === null) {
								continue;
							}
							result += '<tr><td>' + key2 + '</td><td> : </td></td><td>' + value2.iri + '</td></tr>';
						}
						else if (value2 instanceof LangString) {
							if (value2.length() == 0) {
								continue;
							}
							result += '<tr><td>' + key2 + '</td><td> : </td><td>' + value2.get(langobj) + '</td></tr>';
						}
						else if (value2 instanceof Set) {
							if (value2.size == 0) {
								continue;
							}
							result += '<tr><td>' + key2 + '</td><td> : </td><td>' + [...value2].join(", ") + '</td></tr>';
						}
						else {
							result += '<tr><td>' + key2 + '</td><td> : </td><td>' + value2.toString() + '</td></tr>';
						}
					}
				}
				continue
			}
			if (value && value !== null) {
				result += '<tr><td>' + key + '</td><td> : </td><td>' + value + '</td></tr>';
			}
		}
		result += '</tbody>'
		result += '</table>';
		return result;
	}

	const add_resource = async () => {
		confirmation_title = m.add_res();
		confirmation_message = m.add_res_question();
		const ok = await confirmation_dialog.open();
		if (!ok) return;

		const label = label_field?.get_value().map((lang, val) => `${val}@${getLanguageShortname(lang)}`);
		const comment = comment_field?.get_value().map((lang, val) => `${val}@${getLanguageShortname(lang)}`);

		let resourcedata: {
			superclass?: string[],
			label?: string[],
			comment?: string[],
			closed?: boolean
		} = {
			superclass: superclasses.size > 0 ?  Array.from(superclasses) : undefined,
			label: label?.length > 0 ? label : undefined,
			comment: comment?.length > 0 ? comment : undefined,
			closed: closed
		}
		const resourceIri = prefix + ':' + fragment;
		if (authinfo) {
			const resource_put = api_notget_config(authinfo, {project: projectid, resource: resourceIri});
			apiClient.putAdmindatamodelProjectResource(resourcedata, resource_put).then(() => {
				refreshResourcesListNow();
				successInfoStore.set(m.add_res_success({resiri: resourceIri}));
			}).catch((error) => {
				errorInfoStore.set(process_api_error(error as Error));
			});
		}
	}

	const modify_resource = async () => {
		confirmation_title = m.modify_resource();
		confirmation_message = m.conf_mod_resource({resiri: res?.iri.toString() || ""});
		const ok = await confirmation_dialog.open();
		if (!ok) return;

		let resourcedata: {
			// superclass?: string[] | Partial<Record<'add'|'del', string[]>> | null,
			label?: string[] | Partial<Record<'add'|'del', string[]>> | null,
			comment?: string[] | Partial<Record<'add'|'del', string[]>> | null,
			closed?: boolean
		} = {};

		const new_label = label_field.get_value();
		const tmp_modlabel = new_label.modify_data(res?.label || null);
		if (tmp_modlabel !== undefined) {
			resourcedata.label = new_label.modify_data(res?.label || null);
		}

		const new_comment = comment_field.get_value();
		const tmp_modcomment = new_comment.modify_data(res?.comment || null);
		if (tmp_modcomment !== undefined) {
			resourcedata.comment = new_comment.modify_data(res?.comment || null);
		}

		const resourceIri = prefix + ':' + fragment;
		if (authinfo) {
			const resource_post = api_notget_config(authinfo, {project: projectid, resource: resourceIri});
			apiClient.postAdmindatamodelProjectResource(resourcedata, resource_post).then(() => {
				refreshResourcesListNow();
				successInfoStore.set(m.mod_res_success({resiri: resourceIri}));
			}).catch((error) => {
				errorInfoStore.set(process_api_error(error as Error));
			});
		}
	}

	const add_property = (iri: string) => {
		propEditPropIri = iri;
		propEditIsOpen = true;
	}

	const modify_property = (iri: string) => {
		propEditPropIri = iri;
		propEditIsOpen = true;
	}

	const remove_property = () => {

	}

</script>

<!--
The resource IRI consists of a prefix (usually the project shortname) or a common prefix like "dcterms", "schema" etc.
and the actual property id (which is a xs:NCName
-->
{#snippet prefixes()}
	<DropdownButton bind:isOpen={prefix_is_open} buttonText={prefix} name="prefixselsel" disabled={data.resiri !== 'new'} class="text-xs">
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


{#snippet actions()}
	<div class="flex flex-row items-center justify-end gap-4">
		<span>
			<DropdownButton bind:isOpen={addPropOpen} buttonText="Add property" name="add-prop-menu" class="text-xs">
				<DropdownMenu bind:isOpen={addPropOpen} name="add-prop-menu" id="add-prop-menu-id" size="" transparent={false}>
					<DropdownButtonItem bind:isOpen={addPropOpen} onclick={() => {add_property('new')}}>NEW PROPERTY</DropdownButtonItem>
					{#each datamodel?.standaloneProperties || [] as prop}
						<DropdownButtonItem bind:isOpen={addPropOpen} onclick={() => {add_property(prop.propertyIri.toString())}}>{prop.propertyIri.toString()}</DropdownButtonItem>
					{/each}
				</DropdownMenu>
			</DropdownButton>
		</span>
	</div>
{/snippet}

<div class="absolute top-0 left-0 right-0 bottom-0 overflow-auto flex flex-col justify-center items-center" bind:this={topwin}>
	<div>{data.resiri !== 'new' ? `${m.edit_res()} ${data.resiri}`  : m.add_res()}</div>
	<form class="max-w-128">
		<Textfield type='text' label={m.prop_iri()} name="fragment" id="fragment" placeholder="resource ID" required={true}
							 bind:value={fragment} pattern={ncname_pattern} disabled={data.resiri !== 'new'}
							 additional_snippet={prefixes}
		/>

		<SelectMutiple label={m.superclasses()} selectables={all_res_set} bind:values={superclasses} disabled={data.resiri !== 'new'}/>
		<LangstringField bind:this={label_field} label={m.label()} name="label" id="label" placeholder="label_id" value={label} />
		<LangstringField bind:this={comment_field} label={m.comment()} name="comment" id="comment_id" placeholder="comment" value={comment} />
		<Togglefield label={m.is_closed()} id="closed_id" bind:toggle_state={closed} />

		{#if data.resiri !== 'new'}
			<Table label={m.properties()} description={m.properties_desc()} padding={false} action_elements={actions}>
				<TableHeader>
					<TableColumnTitle>PROPERTY</TableColumnTitle>
					<TableColumnTitle>STANDALONE</TableColumnTitle>
					<TableColumnTitle>{m.action()}</TableColumnTitle>
				</TableHeader>
				<TableBody>
					{#each res?.hasProperty || [] as prop}
						<TableRow>
							<TableItem>
								<ToolInfo content={propinfo_as_html(prop)}
								>
									{prop.property?.name?.get(langobj) || prop.property.propertyIri.toString()}
								</ToolInfo>
							</TableItem>
							<TableItem>{datamodel?.is_standalone_property(prop.property)  ? 'yes' : 'no'}</TableItem>
							<TableItem>
								<!--<Button round={true} onclick={() => modify_property(prop.property.propertyIri.toString())} disabled={datamodel?.is_standalone_property(prop.property)}>-->
								<Button round={true} onclick={() => modify_property(prop.property.propertyIri.toString())}>
									<Pencil size="16" strokeWidth="1" />
								</Button>

								<Button round={true} onclick={() => remove_property()}>
									<Trash2 size="16" strokeWidth="1" />
								</Button>

							</TableItem>

						</TableRow>
					{/each}
				</TableBody>
			</Table>
		{/if}

		<div class="flex justify-center gap-4 mt-6">
			<Button class="mx-4 my-2" onclick={goto_page('/admin')}>{m.cancel()}</Button>
			{#if data?.resiri === 'new'}
				<Button class="mx-4 my-2" onclick={() => add_resource()}>{m.add()}</Button>
			{:else}
				<Button class="mx-4 my-2" onclick={() => modify_resource()}>{m.modify()}</Button>
			{/if}
		</div>
	</form>
</div>

<DialogWin bind:isopen={propEditIsOpen} title={m.add_prop_to_res({resiri: data.resiri})}>
	<Property propiri={propEditPropIri} resiri={data.resiri} {projectid} bind:dialogstatus={propEditIsOpen}/>
</DialogWin>

<Confirmation bind:this={confirmation_dialog} title={confirmation_title}>
	{confirmation_message}
</Confirmation>




