<script lang="ts">
	import { OldapUser } from '$lib/oldap/classes/user';
	import type { OldapProject } from '$lib/oldap/classes/project';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { api_get_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import { OldapList } from '$lib/oldap/classes/list';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';
	import { goto } from '$app/navigation';
	import Table from '$lib/components/basic_gui/table/Table.svelte';
	import TableHeader from '$lib/components/basic_gui/table/TableHeader.svelte';
	import TableColumnTitle from '$lib/components/basic_gui/table/TableColumnTitle.svelte';
	import TableBody from '$lib/components/basic_gui/table/TableBody.svelte';
	import TableRow from '$lib/components/basic_gui/table/TableRow.svelte';
	import TableItem from '$lib/components/basic_gui/table/TableItem.svelte';
	import { languageTag } from '$lib/paraglide/runtime';
	import { convertToLanguage, Language } from '$lib/oldap/enums/language';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import { authInfoStore } from '$lib/stores/authinfo';

	let { table_height, project = null }: {
		table_height: number,
		project: OldapProject | null
	} = $props();

	let lang = $state(languageTag());
	let langobj = $derived(convertToLanguage(lang) ?? Language.EN);

	let authinfo = $state<AuthInfo | null>($authInfoStore);
	let hlists = $state<Record<string, OldapList>>({});
	let hlist_list = $state<string[]>([]);

	authInfoStore.subscribe(data => {
		authinfo = data;
	})

	$effect(() => {
		if (authinfo) {
			let hlistsearch = api_get_config(authinfo, { project: project?.projectIri?.toString() });
			apiClient.getAdminhlistsearch(hlistsearch).then(hldata => {
				hlists = {} as Record<string, OldapList>;
				const promises = hldata.map(hl => {
					const config_hlistdata = api_get_config(authinfo as AuthInfo, { iri: hl });
					return apiClient.getAdminhlistget(config_hlistdata);
				});
				Promise.all(promises).then((results) => {
					results.forEach((hlistdata) => {
						console.log("--->", hlistdata);
						const hlist = OldapList.fromOldapJson(hlistdata, true);
						console.log("===>", hlist);
						const id = hlist.oldapListId.toString();
						hlists[id] = hlist;
						hlist_list.push(id);
					});
				}).catch((err) => {
					errorInfoStore.set(process_api_error(err as Error));
				});
				//console.log(hldata);
			});
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

	const delete_hlist = async (hlist_id: string) => {

	}

	let headers : string[] = $state([
		m.hlist_id(),
		m.pref_label(),
		m.nodeclassiri(),
		m.action()
	]);
</script>

{#snippet actions()}
	<div class="flex flex-row items-center justify-end gap-4">
		<span><Button class="text-xs" onclick={goto_page("/admin/hlist")}>{m.add_list()}</Button></span>
	</div>
{/snippet}

<Table height={table_height} title={m.hlists()}
			 description={m.hlists_descr()}
			 action_elements={actions}>
	<TableHeader>
		{#each headers as header}
			<TableColumnTitle>{header}</TableColumnTitle>
		{/each}
	</TableHeader>
	<TableBody>
		{#each hlist_list as hlist_id}
			<TableRow>
				<TableItem>{hlist_id}</TableItem>
				<TableItem>{hlists[hlist_id]?.prefLabel?.get(langobj)}</TableItem>
				<TableItem>{hlists[hlist_id]?.nodeClassIri.toString()}</TableItem>
				<TableItem>
					<div class="flex flex-row items-center justify-left gap-2">
						<Button round={true} onclick={goto_page(`/admin/hlist/${hlist_id}`)}>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
									 stroke="currentColor" class="size-4">
								<path stroke-linecap="round" stroke-linejoin="round"
											d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
							</svg>
						</Button>
						<Button round={true} onclick={() => delete_hlist(hlist_id)}>
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