<script lang="ts">
	import type { OldapProject } from '$lib/oldap/classes/project';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { api_config, api_get_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { OldapList } from '$lib/oldap/classes/list';
	import * as m from '$lib/paraglide/messages';
	import { Pencil, Trash2, Plus, Upload, Download } from '@lucide/svelte'
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';
	import { goto_page } from '$lib/helpers/goto_page';
	import Table from '$lib/components/basic_gui/table/Table.svelte';
	import TableHeader from '$lib/components/basic_gui/table/TableHeader.svelte';
	import TableColumnTitle from '$lib/components/basic_gui/table/TableColumnTitle.svelte';
	import TableBody from '$lib/components/basic_gui/table/TableBody.svelte';
	import TableRow from '$lib/components/basic_gui/table/TableRow.svelte';
	import TableItem from '$lib/components/basic_gui/table/TableItem.svelte';
	import { getLocale } from '$lib/paraglide/runtime';
	import { convertToLanguage, Language } from '$lib/oldap/enums/language';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import { authInfoStore } from '$lib/stores/authinfo';
	import Confirmation from '$lib/components/basic_gui/dialogs/Confirmation.svelte';
	import FileUpload, { type UploadFunc } from '$lib/components/basic_gui/inputs/FileUpload.svelte';
	import DialogWin from '$lib/components/basic_gui/dialogs/DialogWin.svelte';
	import { spinnerStore } from '$lib/stores/spinner';
	import { refreshHlistsListNow, refreshHlistsList } from '$lib/stores/refresh_hlistslist.svelte';
	import Tooltip from '$lib/components/basic_gui/tooltip/Tooltip.svelte';

	let { table_height, project = null, hlistIsOpen = $bindable() }: {
		table_height: number,
		project: OldapProject | null,
		hlistIsOpen?: boolean
	} = $props();

	let lang = $state(getLocale());
	let langobj = $derived(convertToLanguage(lang) ?? Language.EN);

	let authinfo = $state<AuthInfo | null>($authInfoStore);
	let hlists = $state<Record<string, OldapList>>({});
	let hlist_list = $state<string[]>([]);
	let hlist_in_use = $state<Record<string, boolean>>({});
	let uploadIsOpen = $state(false);

	let confirmation_dialog: Confirmation;
	let confirmation_title = $state('');
	let confirmation_text = $state('');

	authInfoStore.subscribe(data => {
		authinfo = data;
	});

	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const _ = $refreshHlistsList;
		hlist_list = [];
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
						const config_hlist_in_use = api_config(authinfo as AuthInfo, {
							project: project?.projectIri?.toString() || '',
							hlistid: id
						});
						apiClient.getAdminhlistProjectHlistidin_use(config_hlist_in_use).then((result2) => {
							hlist_in_use[id] = result2['in_use'] === undefined ? false : result2['in_use'];
						});
					});
				}).catch((err) => {
					errorInfoStore.set(process_api_error(err as Error));
				});
			});
		}
	});

	const delete_hlist = async (hlist_id: string) => {
		confirmation_title = m.delete_hlist();
		confirmation_text = m.delete_hlist_2({hlistid: hlist_id});
		const ok = await confirmation_dialog.open();
		if (!ok) {
			return;
		}
		const config_hlistdata = api_config(authinfo as AuthInfo, {
			project: project?.projectShortName?.toString() || '',
			hlistid: hlist_id
		});
		apiClient.deleteAdminhlistProjectHlistid(undefined, config_hlistdata).then((result) => {
			console.log(result);
			refreshHlistsListNow();
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

	const do_upload: UploadFunc = (f: File) => {
		const config_upload = api_config(authinfo as AuthInfo, {
			project: project?.projectIri?.toString() || ''
		});
		apiClient.postAdminhlistProjectupload({yamlfile: f}, config_upload).then((result) => {
			spinnerStore.set(null);
			uploadIsOpen = false;
			refreshHlistsListNow();
			console.log(result);
		}).catch((error) => {
			console.log(error);
			spinnerStore.set(null);
			uploadIsOpen = false;
			errorInfoStore.set(process_api_error(error as Error));
		});
	}

	const do_download = async (hlist_id: string) => {
		const config_download = api_config(authinfo as AuthInfo, {
			project: project?.projectIri?.toString() || '',
			hlistid: hlist_id
		});
		spinnerStore.set("Downloading...");

		const url = `${PUBLIC_API_URL}/admin/hlist/${encodeURIComponent(project?.projectIri?.toString() || '')}/${hlist_id}/download?format=YAML`; // or JSON
		fetch(url, {
			method: config_download.method,
			headers: config_download.headers
		}).then(async (res) => {
			const blob = await res.blob();
			const contentDisposition = res.headers.get('Content-Disposition');
			let filename = 'download.yaml';
			if (contentDisposition?.includes('filename=')) {
				filename = contentDisposition.split('filename=')[1].replaceAll('"', '');
			}
			const blobUrl = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = blobUrl;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(blobUrl);

			spinnerStore.set(null);

		}).catch((error) => {
			console.log(error);
			spinnerStore.set(null);
			errorInfoStore.set(process_api_error(error as Error));
		});
	}
</script>

{#snippet actions()}
	<div class="flex flex-row items-center justify-end gap-4">
		<span>
			<Tooltip text={m.add_list()}>
				<Button round={true} class="text-xs" onclick={() => { hlistIsOpen = true; }}>
					<Plus size="16" strokeWidth="1" />
				</Button>
			</Tooltip>
		</span>
		<span>
			<Tooltip text={m.upload_hlist()}>
				<Button round={true} class="text-xs" onclick={() => {uploadIsOpen = true}}>
					<Upload size="16" strokeWidth="1" />
				</Button>
			</Tooltip>
		</span>
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
						<Button round={true} onclick={() => delete_hlist(hlist_id)} disabled={hlist_in_use[hlist_id]}>
							<Trash2 size="16" strokeWidth="1" />
						</Button>
						<Button round={true} onclick={() => do_download(hlist_id)} >
							<Download size="16" strokeWidth="1" />
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

<DialogWin bind:isopen={uploadIsOpen} title={m.upload_hlist()}>
	<form>
		<FileUpload filexts={[".yaml", ".yml"]} {do_upload}/>
	</form>
</DialogWin>