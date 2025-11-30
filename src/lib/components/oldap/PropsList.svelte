<script lang="ts">

	import { goto_page } from '$lib/helpers/goto_page';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';
	import Table from '$lib/components/basic_gui/table/Table.svelte';
	import TableColumnTitle from '$lib/components/basic_gui/table/TableColumnTitle.svelte';
	import TableHeader from '$lib/components/basic_gui/table/TableHeader.svelte';
	import TableBody from '$lib/components/basic_gui/table/TableBody.svelte';
	import TableItem from '$lib/components/basic_gui/table/TableItem.svelte';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { languageTag } from '$lib/paraglide/runtime';
	import { convertToLanguage, Language } from '$lib/oldap/enums/language';
	import Confirmation from '$lib/components/basic_gui/dialogs/Confirmation.svelte';
	import { authInfoStore } from '$lib/stores/authinfo';
	import type { OldapProject } from '$lib/oldap/classes/project';
	import { api_notget_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import TableRow from '$lib/components/basic_gui/table/TableRow.svelte';
	import { PropertyClass } from '$lib/oldap/classes/property';
	import { Pencil, Plus, Trash2 } from '@lucide/svelte';
	import { DatamodelClass } from '$lib/oldap/classes/datamodel';
	import { datamodelStore } from '$lib/stores/datamodel';
	import { refreshPropertiesList, refreshPropertiesListNow } from '$lib/stores/refresh_propertieslist.svelte';
	import Tooltip from '$lib/components/basic_gui/tooltip/Tooltip.svelte';
	import { datamodelSharedStore } from '$lib/stores/datamodel_shared';

	let { table_height, project = null }: {
		table_height: number,
		project: OldapProject | null,
	} = $props();

	let authinfo = $state<AuthInfo | null>($authInfoStore);

	let prop_list = $state<string[]>([]);
	let properties = $state<Record<string, PropertyClass>>({});

	let lang = $state(languageTag());
	let langobj = $derived(convertToLanguage(lang) ?? Language.EN);

	let datamodel = $state<DatamodelClass | null>(null);

	let confirmation_dialog: Confirmation;
	let confirmation_title = $state('');
	let confirmation_for_prop = $state('');

	datamodelStore.subscribe(dm => {
		datamodel = dm;
	});

	$effect(() => {
		const _ = $refreshPropertiesList;
		let tmp_list = [];
		let tmp_properties: Record<string, PropertyClass> = {};
		for (const property of (datamodel?.standaloneProperties || [])) {
			tmp_properties[property.propertyIri.toString()] = property;
			tmp_list.push(property.propertyIri.toString() || '');
		}
		if ((datamodel?.projectid.toString() !== 'shared') && (datamodel?.projectid.toString() !== 'oldap')) {
			for (const property of ($datamodelSharedStore?.standaloneProperties || [])) {
				tmp_properties[property.propertyIri.toString()] = property;
				tmp_list.push(property.propertyIri.toString() || '');
			}
		}
		prop_list = tmp_list
		properties = tmp_properties;
	});

	const delete_standalone = async (propIri: string) => {
		confirmation_for_prop = propIri;
		confirmation_title = m.delete_standalone_property();
		const ok = await confirmation_dialog.open();

		if (ok && authinfo) {
			const prop_delete = api_notget_config(authinfo, {
				project: project?.projectShortName.toString() || '',
				property: propIri
			})
			apiClient.deleteAdmindatamodelProjectpropertyProperty(undefined, prop_delete).then(() => {
				delete properties[propIri];
				prop_list = prop_list.filter((id) => id !== propIri);
			}).catch((err) => {
				errorInfoStore.set(process_api_error(err as Error));
			});
		}
	}

	let headers: string[] = $state([
		m.project(),
		m.name(),
		m.datatype(),
		m.action()]);

</script>

{#snippet actions()}
	<div class="flex flex-row items-center justify-end gap-4">
		<Tooltip text={m.add_property()}>
			<Button round={true} class="text-xs" onclick={goto_page("/admin/property", {projectid: project?.projectIri.toString() || ''})}>
				<Plus size="16" strokeWidth="1" />
			</Button>
		</Tooltip>
	</div>
{/snippet}

<Table height={table_height} title={m.standalone_props()}
			 description={m.props_to_reuse()}
			 action_elements={actions}>
	<TableHeader>
		{#each headers as header}
			<TableColumnTitle>{header}</TableColumnTitle>
		{/each}
	</TableHeader>
	<TableBody>
		{#each prop_list as propiri}
			<TableRow>
				<TableItem>{properties[propiri]?.projectId.toString() }</TableItem>
				<TableItem>{properties[propiri]?.name?.get(langobj) || propiri }</TableItem>
				<TableItem>{properties[propiri]?.datatype}</TableItem>
				<TableItem>
					<div class="flex flex-row items-center justify-left gap-2">
						<Button round={true}
										onclick={goto_page(`/admin/property/${encodeURIComponent(propiri)}`, {projectid: project?.projectIri.toString() || ''})}
										disabled={properties[propiri]?.projectId.toString() === 'shared' && project?.projectShortName.toString() !== 'shared'}>
							<Pencil size="16" strokeWidth="1" />
						</Button>
						<Button round={true} onclick={() => delete_standalone(propiri)} disabled={properties[propiri]?.projectId.toString() === 'shared' && project?.projectShortName.toString() !== 'shared'}>
							<Trash2 size="16" strokeWidth="1" />
						</Button>
					</div>
				</TableItem>
			</TableRow>
		{/each}
	</TableBody>
</Table>

<Confirmation bind:this={confirmation_dialog} title={confirmation_title}>
	{m.delete_standalone_confirm({propiri: confirmation_for_prop})}
</Confirmation>
