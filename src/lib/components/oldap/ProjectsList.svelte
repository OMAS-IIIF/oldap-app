<script lang="ts">

	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';
	import { goto_page } from '$lib/helpers/goto_page';
	import Table from '$lib/components/basic_gui/table/Table.svelte';
	import { OldapProject } from '$lib/oldap/classes/project';
	import TableColumnTitle from '$lib/components/basic_gui/table/TableColumnTitle.svelte';
	import TableHeader from '$lib/components/basic_gui/table/TableHeader.svelte';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import TableBody from '$lib/components/basic_gui/table/TableBody.svelte';
	import { apiClient } from '$lib/shared/apiClient';
	import { api_get_config, api_notget_config } from '$lib/helpers/api_config';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import TableRow from '$lib/components/basic_gui/table/TableRow.svelte';
	import TableItem from '$lib/components/basic_gui/table/TableItem.svelte';
	import { getLocale } from '$lib/paraglide/runtime';
	import { convertToLanguage, Language } from '$lib/oldap/enums/language';
	import Confirmation from '$lib/components/basic_gui/dialogs/Confirmation.svelte';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { Pencil, Plus, Trash2 } from '@lucide/svelte';
	import Tooltip from '$lib/components/basic_gui/tooltip/Tooltip.svelte';

	let { table_height }: {
		table_height: number,
	} = $props();

	let authinfo = $state<AuthInfo | null>($authInfoStore);
	let projects = $state<Record<string, OldapProject>>({});
	let project_list = $state<string[]>([]);

	let lang = $state(getLocale());
	let langobj = $derived(convertToLanguage(lang) ?? Language.EN);

	let confirmation_dialog: Confirmation;
	let confirmation_title = $state('');
	let confirmation_for_sname = $state('');

	authInfoStore.subscribe(data => {
		authinfo = data;
	})

	$effect(() => {
		project_list = [];
		if (authinfo) {
			const config_data = api_get_config(authinfo);
			apiClient.getAdminprojectsearch(config_data).then(pdata => {
				projects = {} as Record<string, OldapProject>;
				const promises = pdata.map(p => {
					const config_projectdata = api_get_config(authinfo as AuthInfo, { iri: p.projectIri || '' });
					return apiClient.getAdminprojectget(config_projectdata);
				});
				Promise.all(promises)
					.then((results) => {
						results.forEach((projectdata) => {
							const project = OldapProject.fromOldapJson(projectdata);
							const sname = project.projectShortName.toString();
							projects[sname] = project;
							project_list.push(sname);
						});
						project_list = project_list.sort((a, b) => a.localeCompare(b));
					})
					.catch((err) => {
						errorInfoStore.set(process_api_error(err as Error));
					});
			}).catch((err) => {
				errorInfoStore.set(process_api_error(err as Error));
			});
		}
	});

	const delete_project = async (sname: string) => {
		confirmation_for_sname = sname;
		confirmation_title = m.delproject();
		const ok = await confirmation_dialog.open();

		if (ok && authinfo) {
			const project_delete = api_notget_config(authinfo, { projectId: sname })
			apiClient.deleteAdminprojectProjectId(undefined, project_delete).then(() => {
				delete projects[sname];
				project_list = project_list.filter((id) => id !== sname);
			}).catch((err) => {
				errorInfoStore.set(process_api_error(err as Error));
			});
		}
	}

	let headers: string[] = $state([
		m.iri_qname(),
		m.shortname(),
		m.label(),
		m.startdate(),
		m.enddate(),
		m.action()]);

</script>

{#snippet actions()}
	<div class="flex flex-row items-center justify-end gap-4">
		<Tooltip text={m.add_project()}>
			<Button round={true} class="text-xs" onclick={goto_page("/admin/project")}>
				<Plus size="16" strokeWidth="1" />
			</Button>
		</Tooltip>
	</div>
{/snippet}

<Table height={table_height} title={m.projects()}
			 description={m.projectlist_descr()}
			 action_elements={actions}>
	<TableHeader>
		{#each headers as header}
			<TableColumnTitle>{header}</TableColumnTitle>
		{/each}
	</TableHeader>
	<TableBody>
		{#each project_list as sname}
			<TableRow>
				<TableItem>{projects[sname].projectIri.toString()}</TableItem>
				<TableItem>{sname}</TableItem>
				<TableItem>{projects[sname].label?.get(langobj)}</TableItem>
				<TableItem>{projects[sname].projectStart?.toString()}</TableItem>
				<TableItem>{projects[sname].projectEnd?.toString()}</TableItem>
				<TableItem>
					<div class="flex flex-row items-center justify-left gap-2">
						<Button round={true} onclick={goto_page(`/admin/project/${sname}`)}>
							<Pencil size="16" strokeWidth="1" />
						</Button>
						<Button round={true} onclick={() => delete_project(sname)}>
							<Trash2 size="16" strokeWidth="1" />
						</Button>
					</div>
				</TableItem>

			</TableRow>
		{/each}
	</TableBody>
</Table>

<Confirmation bind:this={confirmation_dialog} title={confirmation_title}>
	{m.confirm_project_delete({ sname: confirmation_for_sname})}
</Confirmation>
