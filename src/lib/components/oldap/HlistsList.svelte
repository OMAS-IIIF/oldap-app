<script lang="ts">
	import { OldapUser } from '$lib/oldap/classes/user';
	import type { OldapProject } from '$lib/oldap/classes/project';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { api_config, api_get_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import { OldapList } from '$lib/oldap/classes/list';
	import * as m from '$lib/paraglide/messages';
	import { Pencil, Trash2 } from '@lucide/svelte'
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
	import Confirmation from '$lib/components/basic_gui/dialogs/Confirmation.svelte';

	let { table_height, project = null }: {
		table_height: number,
		project: OldapProject | null
	} = $props();

	let lang = $state(languageTag());
	let langobj = $derived(convertToLanguage(lang) ?? Language.EN);

	let authinfo = $state<AuthInfo | null>($authInfoStore);
	let hlists = $state<Record<string, OldapList>>({});
	let hlist_list = $state<string[]>([]);

	let confirmation_dialog: Confirmation;
	let confirmation_title = $state('');
	let confirmation_text = $state('');

	authInfoStore.subscribe(data => {
		authinfo = data;
	})

	$effect(() => {
		if (authinfo) {
			let hlistsearch = api_get_config(authinfo, { project: project?.projectIri?.toString() || ''});
			apiClient.getAdminhlistsearch(hlistsearch).then(hldata => {
				hlists = {} as Record<string, OldapList>;
				const promises = hldata.map(hl => {
					const config_hlistdata = api_get_config(authinfo as AuthInfo, { iri: hl });
					return apiClient.getAdminhlistget(config_hlistdata);
				});
				Promise.all(promises).then((results) => {
					results.forEach((hlistdata) => {
						const hlist = OldapList.fromOldapJson(hlistdata, true);
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
		confirmation_title = "DELETE HLIST ?";
		confirmation_text = "Do you really want to delete the hlist?";
		const ok = await confirmation_dialog.open();
		if (!ok) {
			return;
		}
		const config_hlistdata = api_config(authinfo as AuthInfo, {
			project: project?.projectIri?.toString() || '',
			hlistid: hlist_id
		});
		apiClient.deleteAdminhlistProjectHlistid(undefined, config_hlistdata).then((result) => {
			console.log(result);
		}).catch((error) => {
			errorInfoStore.set(process_api_error(error as Error));
		})
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
							<Pencil size="16" strokeWidth="1" />
						</Button>
						<Button round={true} onclick={() => delete_hlist(hlist_id)}>
							<Trash2 size="16" strokeWidth="1" />
						</Button>
					</div>
				</TableItem>
			</TableRow>
		{/each}
	</TableBody>
</Table>

<Confirmation bind:this={confirmation_dialog} title={confirmation_title}>
	{confirmation_text}
</Confirmation>
