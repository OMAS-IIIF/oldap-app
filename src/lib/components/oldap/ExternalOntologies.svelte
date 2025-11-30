<script lang="ts">

	import type { OldapProject } from '$lib/oldap/classes/project';
	import { languageTag } from '$lib/paraglide/runtime';
	import { convertToLanguage, Language } from '$lib/oldap/enums/language';
	import { DatamodelClass } from '$lib/oldap/classes/datamodel';
	import { datamodelStore } from '$lib/stores/datamodel';
	import * as m from '$lib/paraglide/messages';
	import { goto_page } from '$lib/helpers/goto_page';
	import Tooltip from '$lib/components/basic_gui/tooltip/Tooltip.svelte';
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';
	import { Pencil, Plus, Trash2 } from '@lucide/svelte';
	import Table from '$lib/components/basic_gui/table/Table.svelte';
	import TableColumnTitle from '$lib/components/basic_gui/table/TableColumnTitle.svelte';
	import TableItem from '$lib/components/basic_gui/table/TableItem.svelte';
	import TableBody from '$lib/components/basic_gui/table/TableBody.svelte';
	import TableHeader from '$lib/components/basic_gui/table/TableHeader.svelte';
	import TableRow from '$lib/components/basic_gui/table/TableRow.svelte';
	import { ExternalOntology } from '$lib/oldap/classes/extonto';
	import { projectStore } from '$lib/stores/project';
	import { api_notget_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import Confirmation from '$lib/components/basic_gui/dialogs/Confirmation.svelte';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { authInfoStore } from '$lib/stores/authinfo';

	let { table_height, project = null }: {
		table_height: number,
		project: OldapProject | null,
	} = $props();

	let authinfo = $state<AuthInfo | null>($authInfoStore);

	let exonto: ExternalOntology;
	let onto_list = $state<string[]>([]);
	let ontologies = $state<Record<string, ExternalOntology>>({});

	let lang = $state(languageTag());
	let langobj = $derived(convertToLanguage(lang) ?? Language.EN);

	let confirmation_dialog: Confirmation;
	let confirmation_title = $state('');
	let confirmation_for_prefix = $state('');

	let datamodel = $state<DatamodelClass | null>(null);


	datamodelStore.subscribe(dm => {
		datamodel = dm;
		console.log("datamodel changed", dm);
	});

	projectStore.subscribe(proj => {
		project = proj;
	});

	$effect(() => {
		//const _ = $refreshPropertiesList;
		console.log("ExternalOntologies: $effect() called", datamodel);
		let tmp_list = [];
		let tmp_extontos: Record<string, ExternalOntology> = {};
		//const datamodel = $datamodelStore;
		if (!datamodel?.externalOntologies || datamodel.externalOntologies.length === 0) {
			onto_list = [];
			ontologies = {};
		}
		else {
			for (const extonto of (datamodel?.externalOntologies || [])) {
				tmp_extontos[extonto.prefix.toString()] = extonto;
				tmp_list.push(extonto.prefix.toString() || '');
				onto_list = tmp_list
				ontologies = tmp_extontos;
			}
		}
	});

	const delete_extonto = async (prefix: string) => {
		confirmation_for_prefix = prefix;
		confirmation_title = "DELETE EXTONTO";
		const ok = await confirmation_dialog.open();

		if (ok && authinfo) {
			const extonto_delete = api_notget_config(authinfo, {
				project: project?.projectShortName.toString() || '',
				prefix: prefix
			})
			apiClient.deleteAdmindatamodelProjectextontoPrefix(undefined, extonto_delete).then(() => {
				delete ontologies[prefix];
				onto_list = onto_list.filter((id) => id !== prefix);
			}).catch((err) => {
				errorInfoStore.set(process_api_error(err as Error));
			});
		}
	}


	let headers: string[] = $state([
		m.label(),
		"PREFIX",
		"NAMESPACE",
		m.action()]);

</script>

{#snippet actions()}
	<div class="flex flex-row items-center justify-end gap-4">
		<Tooltip text="ADD EXTERNAL ONTOLOGY">
			<Button round={true} class="text-xs" onclick={goto_page("/admin/onto", {projectid: project?.projectIri.toString() || ''})}>
				<Plus size="16" strokeWidth="1" />
			</Button>
		</Tooltip>
	</div>
{/snippet}

<Table height={table_height} title="EXTERNAL ONTOLOGIES"
			 description="EXTERNAL ONTOLOGIES..."
			 action_elements={actions}>
	<TableHeader>
		{#each headers as header}
			<TableColumnTitle>{header}</TableColumnTitle>
		{/each}
	</TableHeader>
	<TableBody>
		{#each onto_list as prefix}
			<TableRow>
				<TableItem>{ontologies[prefix]?.label?.get(langobj) || prefix }</TableItem>
				<TableItem>{ontologies[prefix]?.prefix.toString()}</TableItem>
				<TableItem>{ontologies[prefix]?.namespaceIri.toString()}</TableItem>
				<TableItem>
					<div class="flex flex-row items-center justify-left gap-2">
						<Button round={true}
										onclick={goto_page(`/admin/onto/${encodeURIComponent(prefix)}`, {projectid: project?.projectIri.toString() || ''})}>
							<Pencil size="16" strokeWidth="1" />
						</Button>
						<Button round={true} onclick={() => delete_extonto(prefix)}>
							<Trash2 size="16" strokeWidth="1" />
						</Button>
					</div>
				</TableItem>
			</TableRow>
		{/each}
	</TableBody>
</Table>

<Confirmation bind:this={confirmation_dialog} title={confirmation_title}>
	DO YOU REALLY WANT TO DELETE THE EXTERNAL ONTOLOGY {confirmation_for_prefix}?
</Confirmation>
