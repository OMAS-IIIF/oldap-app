<!--
  - Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
  -->

<script lang="ts">
	import type { OldapProject } from '$lib/oldap/classes/project';
	import { ResourceClass } from '$lib/oldap/classes/resource';
	import { languageTag } from '$lib/paraglide/runtime';
	import { convertToLanguage, Language } from '$lib/oldap/enums/language';
	import { DatamodelClass } from '$lib/oldap/classes/datamodel';
	import Confirmation from '$lib/components/basic_gui/dialogs/Confirmation.svelte';
	import { datamodelStore } from '$lib/stores/datamodel';
	import * as m from '$lib/paraglide/messages';
	import { goto_page } from '$lib/helpers/goto_page';
	import Tooltip from '$lib/components/basic_gui/tooltip/Tooltip.svelte';
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';
	import { Pencil, Plus, Trash2 } from '@lucide/svelte';
	import Table from '$lib/components/basic_gui/table/Table.svelte';
	import TableHeader from '$lib/components/basic_gui/table/TableHeader.svelte';
	import TableColumnTitle from '$lib/components/basic_gui/table/TableColumnTitle.svelte';
	import TableBody from '$lib/components/basic_gui/table/TableBody.svelte';
	import TableRow from '$lib/components/basic_gui/table/TableRow.svelte';
	import TableItem from '$lib/components/basic_gui/table/TableItem.svelte';
	import { refreshResourcesList } from '$lib/stores/refresh_resourceslist.svelte';
	import { projectStore } from '$lib/stores/project';
	import { datamodelSharedStore } from '$lib/stores/datamodel_shared';
	import { api_notget_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { authInfoStore } from '$lib/stores/authinfo';

	let { table_height, project = null }: {
		table_height: number,
		project: OldapProject | null,
	} = $props();

	let authinfo = $state<AuthInfo | null>($authInfoStore);

	let res_list = $state<string[]>([]);
	let res_prefixes = $state<Record<string, string>>({});
	let resources = $state<Record<string, ResourceClass>>({});

	let lang = $state(languageTag());
	let langobj = $derived(convertToLanguage(lang) ?? Language.EN);

	let datamodel = $state<DatamodelClass | null>(null);

	let confirmation_dialog: Confirmation;
	let confirmation_title = $state('');
	let confirmation_for_resiri = $state('');

	datamodelStore.subscribe(dm => {
		datamodel = dm;
	});

	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const _1 = $refreshResourcesList;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const _2 = $projectStore;
		// get the list of all resource classes that can be the target of a link
		const tmp_res = datamodel?.resources.filter(x => {
			const gaga = x?.superclass ? [...x.superclass].map(s => s.toString()) : [];
			return !gaga.includes('oldap:OldapListNode');
		}) || [];
		let tmp_list = [];
		let tmp_prefixes: Record<string, string> = {};
		let tmp_resources: Record<string, ResourceClass> = {};
		//const datamodel = $datamodelStore;
		for (const res of tmp_res) {
			tmp_resources[res.iri.toString()] = res
			tmp_list.push(res.iri.toString() || 'XXXX');
			tmp_prefixes[res.iri.toString()] = res.iri.toString();
		}
		if (datamodel?.projectid.toString() !== 'shared' && datamodel?.projectid.toString() !== 'oldap') {
			const shared = $datamodelSharedStore;
			if (shared) {
				for (const res of shared.resources) {
					tmp_resources[res.iri.toString()] = res
					tmp_list.push(res.iri.toString() || 'XXXX');
					tmp_prefixes[res.iri.toString()] = res.iri.toString();
				}
			}
		}
		res_list = tmp_list
		res_prefixes = tmp_prefixes
		resources = tmp_resources;
	});

	const delete_resource = async (resiri: string) => {
		confirmation_for_resiri = resiri;
		confirmation_title = m.delete_resource();
		const ok = await confirmation_dialog.open();

		if (ok && authinfo) {
			const res_delete = api_notget_config(authinfo, {
				project: project?.projectShortName.toString() || '',
				resource: resiri
			})
			apiClient.deleteAdmindatamodelProjectResource(undefined, res_delete).then(() => {
				delete resources[resiri];
				res_list = res_list.filter((id) => id !== resiri);
			}).catch((err) => {
				errorInfoStore.set(process_api_error(err as Error));
			});
		}
	}


	let headers: string[] = $state([
		m.project(),
		m.label(),
		m.resource_iri(),
		m.action()]);

</script>

{#snippet actions()}
	<div class="flex flex-row items-center justify-end gap-4">
		<Tooltip text={m.add_property()}>
			<Button round={true} class="text-xs" onclick={goto_page("/admin/resource", {projectid: project?.projectIri.toString() || ''})}>
				<Plus size="16" strokeWidth="1" />
			</Button>
		</Tooltip>
	</div>
{/snippet}

<Table height={table_height} title={m.resources()}
			 description={m.resources_desc()}
			 action_elements={actions}>
	<TableHeader>
		{#each headers as header}
			<TableColumnTitle>{header}</TableColumnTitle>
		{/each}
	</TableHeader>
	<TableBody>
		{#each res_list as resiri}
			<TableRow>
				<TableItem>{resources[resiri]?.projectid.toString() }</TableItem>
				<TableItem>{resources[resiri]?.label?.get(langobj) || resiri }</TableItem>
				<TableItem>{res_prefixes[resiri]}</TableItem>
				<TableItem>
					<div class="flex flex-row items-center justify-left gap-2">
						<Button round={true}
										onclick={goto_page(`/admin/resource/${encodeURIComponent(resiri)}`, {projectid: project?.projectIri.toString() || ''})}
										disabled={resources[resiri]?.projectid.toString() === 'shared' && project?.projectShortName.toString() !== 'shared'}>
							<Pencil size="16" strokeWidth="1" />
						</Button>
						<Button round={true} onclick={() => delete_resource(resiri)} disabled={resources[resiri]?.projectid.toString() === 'shared' && project?.projectShortName.toString() !== 'shared'}>
							<Trash2 size="16" strokeWidth="1" />
						</Button>
					</div>
				</TableItem>
			</TableRow>
		{/each}
	</TableBody>
</Table>

<Confirmation bind:this={confirmation_dialog} title={confirmation_title}>
	{m.delete_resource_confirm({resiri: confirmation_for_resiri})}
</Confirmation>
