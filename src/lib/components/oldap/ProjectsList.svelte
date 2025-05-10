<script lang="ts">

	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';
	import { goto } from '$app/navigation';
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
	import { languageTag } from '$lib/paraglide/runtime';
	import { convertToLanguage, Language } from '$lib/oldap/enums/language';
	import Confirmation from '$lib/components/basic_gui/dialogs/Confirmation.svelte';
	import { authInfoStore } from '$lib/stores/authinfo';

	let { table_height }: {
		table_height: number,
	} = $props();

	let authinfo = $state<AuthInfo | null>($authInfoStore);
	let projects = $state<Record<string, OldapProject>>({});
	let project_list = $state<string[]>([]);

	let lang = $state(languageTag());
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
			})
		}
	});

	/**
	 * Returns a function that can be used for a onclick-action to navigate to the given route
	 * @param url An URL to goto to...
	 */
	const goto_page = (url: string) => {
		return () => {
			goto(url);
		}
	}

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
		<span><Button class="text-xs" onclick={goto_page("/admin/project")}>{m.add_project()}</Button></span>
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
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
									 stroke="currentColor" class="size-4">
								<path stroke-linecap="round" stroke-linejoin="round"
											d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
							</svg>
						</Button>
						<Button round={true} onclick={() => delete_project(sname)}>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
									 stroke="currentColor" class="size-4">
								<path stroke-linecap="round" stroke-linejoin="round"
											d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
							</svg>
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
