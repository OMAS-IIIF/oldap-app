<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { Plus } from '@lucide/svelte';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { OldapError } from '$lib/oldap/errors/OldapError';
	import { datamodelStore } from '$lib/stores/datamodel';
	import { datamodelSharedStore } from '$lib/stores/datamodel_shared';
	import { datamodelOldapStore } from '$lib/stores/datamodel_oldap';
	import { projectStore } from '$lib/stores/project';
	import { userStore } from '$lib/stores/user';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { api_config, api_notget_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import { DatamodelClass } from '$lib/oldap/classes/datamodel';
	import type { OldapProject } from '$lib/oldap/classes/project';
	import type { ReifierShape } from '$lib/oldap/classes/reifierShape';
	import { AdminPermission } from '$lib/oldap/enums/admin_permissions';
	import Table from '$lib/components/basic_gui/table/Table.svelte';
	import TableHeader from '$lib/components/basic_gui/table/TableHeader.svelte';
	import TableColumnTitle from '$lib/components/basic_gui/table/TableColumnTitle.svelte';
	import TableBody from '$lib/components/basic_gui/table/TableBody.svelte';
	import TableRow from '$lib/components/basic_gui/table/TableRow.svelte';
	import TableItem from '$lib/components/basic_gui/table/TableItem.svelte';
	import Confirmation from '$lib/components/basic_gui/dialogs/Confirmation.svelte';
	import ReifierShapeEditor from './ReifierShapeEditor.svelte';

	/** Project-owned definitions plus shared read-only definitions; no instance annotations are loaded. */
	let { project, table_height }: { project: OldapProject | null; table_height: number } = $props();
	let projectid = $derived(project?.projectShortName.toString() ?? '');
	let canManage = $derived(
		!!$authInfoStore &&
			!!project &&
			($userStore?.isRoot ||
				!!$userStore?.inProject?.some(
					(entry) =>
						entry.project.toString() === project?.projectIri.toString() &&
						entry.permissions.includes(AdminPermission.ADMIN_MODEL)
				))
	);
	let rows = $derived.by(() => {
		const local =
			$datamodelStore?.projectid.toString() === projectid ? $datamodelStore.reifierShapes : [];
		const shared = projectid !== 'shared' ? ($datamodelSharedStore?.reifierShapes ?? []) : [];
		return [
			...local.map((shape) => ({ shape, owner: projectid })),
			...shared
				.filter((shape) => !local.some((item) => item.iri === shape.iri))
				.map((shape) => ({ shape, owner: 'shared' }))
		];
	});
	let selected = $state<{ owner: string; iri?: string; readonly: boolean }>();
	let deleting = $state(false);
	let confirmation: Confirmation;
	let deletionIri = $state('');
	let notice = $state('');
	let refreshPending = $state(false);

	/** Refresh each affected snapshot. Guard the active project against navigation during requests. */
	async function refreshModels() {
		const auth = $authInfoStore;
		if (!auth) throw new Error('Authentication required.');
		const active = projectid;
		const owners = [...new Set([active, 'shared'])].filter(Boolean);
		const results = await Promise.allSettled(
			owners.map(async (owner) => {
				const json = await apiClient.getAdmindatamodelProject(api_config(auth, { project: owner }));
				const model = DatamodelClass.fromOldapJson(json);
				if (owner === 'shared') datamodelSharedStore.set(model);
				if (owner === 'oldap') datamodelOldapStore.set(model);
				if ($projectStore?.projectShortName.toString() === owner) datamodelStore.set(model);
			})
		);
		const failure = results.find((result) => result.status === 'rejected');
		if (failure?.status === 'rejected') throw failure.reason;
	}

	async function saved() {
		await refreshModels();
		notice = m.reifier_shape_saved();
	}

	/** DELETE is confirmed and delegated to the API's reference and permission checks. */
	async function remove(shape: ReifierShape, owner: string) {
		if (deleting || refreshPending || !canManage || owner !== projectid) return;
		const auth = $authInfoStore;
		if (!auth) return;
		deleting = true;
		deletionIri = shape.iri;
		if (!(await confirmation.open())) {
			deleting = false;
			return;
		}
		notice = '';
		let removed = false;
		try {
			await apiClient.deleteAdmindatamodelProjectreifierShapeShape(
				undefined,
				api_notget_config(auth, { project: owner, shape: shape.iri })
			);
			removed = true;
			await refreshModels();
			notice = m.reifier_shape_deleted();
		} catch (cause) {
			refreshPending = removed;
			errorInfoStore.set(
				removed ? new OldapError(m.reifier_refresh_failed()) : process_api_error(cause as Error)
			);
		} finally {
			deleting = false;
		}
	}
	/** Retry model reads after a committed deletion, never the deletion itself. */
	async function retryRefresh() {
		deleting = true;
		try {
			await refreshModels();
			refreshPending = false;
			notice = m.reifier_shape_deleted();
		} catch {
			errorInfoStore.set(new OldapError(m.reifier_refresh_failed()));
		} finally {
			deleting = false;
		}
	}
</script>

{#snippet actions()}
	<button
		class="oldap-button-round text-xs"
		aria-label={m.reifier_shape_new()}
		title={m.reifier_shape_new()}
		type="button"
		disabled={!canManage || deleting || refreshPending}
		onclick={() => {
			notice = '';
			selected = { owner: projectid, readonly: false };
		}}><Plus size={16} strokeWidth={1} /></button
	>
{/snippet}

<section aria-label={m.reifier_shapes()}>
	{#if refreshPending}<button
			class="oldap-button mx-4 my-2 text-xs"
			type="button"
			disabled={deleting}
			onclick={retryRefresh}>{m.reifier_refresh()}</button
		>{/if}
	{#if notice}<p role="status" class="px-4 py-2 text-sm">{notice}</p>{/if}
	<Table title={m.reifier_shapes()} height={table_height} action_elements={actions}>
		<TableHeader
			><TableColumnTitle>{m.project()}</TableColumnTitle><TableColumnTitle
				>{m.reifier_shape_iri()}</TableColumnTitle
			><TableColumnTitle>{m.action()}</TableColumnTitle></TableHeader
		>
		<TableBody>
			{#each rows as { shape, owner } (shape.iri)}
				<TableRow>
					<TableItem>{owner}</TableItem><TableItem>{shape.iri}</TableItem>
					<TableItem
						><div class="flex gap-2">
							<button
								class="oldap-button text-xs"
								type="button"
								onclick={() => {
									selected = { owner, iri: shape.iri, readonly: owner !== projectid || !canManage };
								}}>{owner === projectid && canManage ? m.modify() : m.reifier_view()}</button
							>
							{#if owner === projectid && canManage}<button
									class="oldap-button text-xs"
									type="button"
									disabled={deleting || refreshPending}
									onclick={() => remove(shape, owner)}>{m.reifier_delete()}</button
								>{/if}
						</div></TableItem
					>
				</TableRow>
			{/each}
			{#if rows.length === 0}<TableRow
					><td colspan="3" class="p-3 text-sm">{m.reifier_shape_empty()}</td></TableRow
				>{/if}
		</TableBody>
	</Table>
</section>

{#if selected}
	<ReifierShapeEditor
		projectid={selected.owner}
		shapeIri={selected.iri}
		readonly={selected.readonly}
		onsaved={saved}
		oncancel={() => {
			selected = undefined;
		}}
	/>
{/if}
<Confirmation
	bind:this={confirmation}
	title={m.reifier_delete()}
	cancel={m.reifier_cancel()}
	ok={m.reifier_delete()}
>
	{deletionIri}: {m.reifier_shape_delete_confirm()}
</Confirmation>
