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
	import { api_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import { spinnerStore } from '$lib/stores/spinner';
	import TableRow from '$lib/components/basic_gui/table/TableRow.svelte';
	import { PropertyClass } from '$lib/oldap/classes/property';
	import { Download, Pencil, Trash2 } from '@lucide/svelte';
	import { DatamodelClass } from '$lib/oldap/classes/datamodel';
	import { datamodelStore } from '$lib/stores/datamodel';
	import { on } from 'svelte/events';
	import { onMount } from 'svelte';

	let { table_height, project = null }: {
		table_height: number,
		project: OldapProject | null,
	} = $props();

	let prop_list = $state<string[]>([]);
	let properties = $state<Record<string, PropertyClass>>({});

	let lang = $state(languageTag());
	let langobj = $derived(convertToLanguage(lang) ?? Language.EN);

	let confirmation_dialog: Confirmation;
	let confirmation_title = $state('');
	let confirmation_for_sname = $state('');


	onMount(() => {
		prop_list = [];
		const datamodel = $datamodelStore;
		for (const property of (datamodel?.standaloneProperties || [])) {
			properties[property.propertyIri.toString()] = property;
			prop_list.push(property.propertyIri.toString() || 'XXXX');
		}
	});

	let headers: string[] = $state([
		"PROJECT",
		"NAME",
		"DATATYPE",
		m.action()]);

</script>

{#snippet actions()}
	<div class="flex flex-row items-center justify-end gap-4">
		<span><Button class="text-xs" onclick={goto_page("/admin/property")}>{m.add_property()}</Button></span>
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
										disabled={properties[propiri]?.projectId.toString() === 'shared'}>
							<Pencil size="16" strokeWidth="1" />
						</Button>
						<Button round={true} onclick={() => {}} disabled={properties[propiri]?.projectId.toString() === 'shared'}>
							<Trash2 size="16" strokeWidth="1" />
						</Button>
					</div>
				</TableItem>
			</TableRow>
		{/each}
	</TableBody>
</Table>
