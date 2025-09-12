<!--
  - Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
  -->

<script lang="ts">
	import type { OldapProject } from '$lib/oldap/classes/project';
	import { PropertyClass } from '$lib/oldap/classes/property';
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
	import { Download, Pencil, Plus, Trash2 } from '@lucide/svelte';
	import Table from '$lib/components/basic_gui/table/Table.svelte';
	import TableHeader from '$lib/components/basic_gui/table/TableHeader.svelte';
	import TableColumnTitle from '$lib/components/basic_gui/table/TableColumnTitle.svelte';
	import TableBody from '$lib/components/basic_gui/table/TableBody.svelte';
	import TableRow from '$lib/components/basic_gui/table/TableRow.svelte';
	import TableItem from '$lib/components/basic_gui/table/TableItem.svelte';

	let { table_height, project = null }: {
		table_height: number,
		project: OldapProject | null,
	} = $props();

	let res_list = $state<string[]>([]);
	let resources = $state<Record<string, ResourceClass>>({});

	let lang = $state(languageTag());
	let langobj = $derived(convertToLanguage(lang) ?? Language.EN);

	let datamodel = $state<DatamodelClass | null>(null);

	let confirmation_dialog: Confirmation;
	let confirmation_title = $state('');
	let confirmation_for_sname = $state('');

	datamodelStore.subscribe(dm => {
		datamodel = dm;
	});

	$effect(() => {
		// get the list of all resource classes that can be the target of a link
		const tmp_res = datamodel?.resources.filter(x => {
			const gaga = x?.superclass ? [...x.superclass].map(s => s.toString()) : [];
			return !gaga.includes('oldap:OldapListNode');
		}) || [];

		let tmp_list = [];
		let tmp_resources: Record<string, ResourceClass> = {};
		//const datamodel = $datamodelStore;
		for (const res of tmp_res) {
			tmp_resources[res.iri.toString()] = res
			tmp_list.push(res.iri.toString() || 'XXXX');
			res_list = tmp_list
			resources = tmp_resources;
		}
	});

	let headers: string[] = $state([
		m.project(),
		m.label(),
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
				<TableItem>
					<div class="flex flex-row items-center justify-left gap-2">
						<Button round={true}
										onclick={goto_page(`/admin/resource/${encodeURIComponent(resiri)}`, {projectid: project?.projectIri.toString() || ''})}
										disabled={resources[resiri]?.projectid.toString() === 'shared' && project?.projectShortName.toString() !== 'shared'}>
							<Pencil size="16" strokeWidth="1" />
						</Button>
						<Button round={true} onclick={() => {}} disabled={resources[resiri]?.projectid.toString() === 'shared' && project?.projectShortName.toString() !== 'shared'}>
							<Trash2 size="16" strokeWidth="1" />
						</Button>
					</div>
				</TableItem>

			</TableRow>
		{/each}
	</TableBody>
</Table>
