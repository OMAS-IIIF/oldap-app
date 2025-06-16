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

	let { table_height, project = null }: {
		table_height: number,
		project: OldapProject | null,
	} = $props();

	let authinfo = $state<AuthInfo | null>($authInfoStore);
	let prop_list = $state<string[]>([]);
	let properties = $state<Record<string, PropertyClass>>({});

	let lang = $state(languageTag());
	let langobj = $derived(convertToLanguage(lang) ?? Language.EN);

	let confirmation_dialog: Confirmation;
	let confirmation_title = $state('');
	let confirmation_for_sname = $state('');

	authInfoStore.subscribe(data => {
		authinfo = data;
	});

	$effect(() => {
		prop_list = [];
		if (authinfo) {
			const dm_config = api_config(authinfo, {project: project?.projectShortName.toString() || ''});
			spinnerStore.set("RETRIEVING DATAMODEL");
			console.log("START QUERY OF DATAMODEL....");
			apiClient.getAdmindatamodelProject(dm_config).then((result) => {
				console.log("QUERY FINISHED!!! Processing....");
				console.log(result);
				const props = result['standaloneProperties'];
				for (const prop of (props || [])) {
					const property = PropertyClass.fromOldapJson(prop);
					console.log(property);
					properties[property.propertyIri.toString()] = property;
					prop_list.push(property.propertyIri.toString() || 'XXXX');
				}
				spinnerStore.set(null);
			}).catch((error) => {
				spinnerStore.set(null);
				errorInfoStore.set(process_api_error(error as Error));
			});
		}
	});

	let headers: string[] = $state([
		"NAME",
		"DATATYPE",
		m.action()]);

</script>

{#snippet actions()}
	<div class="flex flex-row items-center justify-end gap-4">
		<span><Button class="text-xs" onclick={goto_page("/admin/model")}>ADD PROPERTY</Button></span>
	</div>
{/snippet}

<Table height={table_height} title="STANDALONE PROEPRTIES"}
			 description="PROPERTIES THAT CAN BE REUSED..."
			 action_elements={actions}>
	<TableHeader>
		{#each headers as header}
			<TableColumnTitle>{header}</TableColumnTitle>
		{/each}
	</TableHeader>
	<TableBody>
		{#each prop_list as propiri}
			<TableRow>
				<TableItem>{properties[propiri]?.name?.get(langobj) || propiri }</TableItem>
				<TableItem>{properties[propiri]?.datatype}</TableItem>
				<TableItem>
					<div class="flex flex-row items-center justify-left gap-2">
						<Button round={true} onclick={goto_page(`/admin/property/${propiri}`)}>
							<Pencil size="16" strokeWidth="1" />
						</Button>
						<Button round={true} onclick={() => {}} >
							<Trash2 size="16" strokeWidth="1" />
						</Button>
					</div>
				</TableItem>
			</TableRow>
		{/each}
	</TableBody>
</Table>
