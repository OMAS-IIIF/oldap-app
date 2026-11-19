<script lang="ts">
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages';
	import { Plus } from '@lucide/svelte';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { OldapError } from '$lib/oldap/errors/OldapError';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { api_config, api_notget_config } from '$lib/helpers/api_config';
	import { apiClient } from '$lib/shared/apiClient';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import {
		reifierShapeFromJson,
		reifierShapeToWrite,
		type ReifierField
	} from '$lib/oldap/classes/reifierShape';
	import ReifierFieldEditor from './ReifierFieldEditor.svelte';

	/** Owns one fresh, detached definition draft; failed requests retain every field. */
	let {
		projectid,
		shapeIri,
		readonly = false,
		onsaved,
		oncancel
	}: {
		projectid: string;
		shapeIri?: string;
		readonly?: boolean;
		onsaved: () => Promise<void>;
		oncancel: () => void;
	} = $props();
	let dialog: HTMLDialogElement;
	let form: HTMLFormElement;
	let localName = $state('');
	let fields = $state<{ key: number; field: ReifierField }[]>([]);
	let nextKey = 0;
	let loading = $state(true);
	let busy = $state(false);
	let saved = $state(false);
	let baseline = '';
	let loadFailed = $state(false);
	let disposed = false;
	const inputClass = 'oldap-textfield-common oldap-textfield-valid w-full px-2 py-1';

	onMount(() => {
		dialog.showModal();
		void load();
		return () => {
			disposed = true;
		};
	});

	/** Read through the dedicated endpoint before replacing any existing definition. */
	async function load() {
		loading = true;
		loadFailed = false;
		try {
			if (shapeIri) {
				const auth = $authInfoStore;
				if (!auth) throw new Error('Authentication required.');
				const response = await apiClient.getAdmindatamodelProjectreifierShapeShape(
					api_config(auth, { project: projectid, shape: shapeIri })
				);
				// A cancelled editor must not publish late responses into a newer dialog.
				if (disposed) return;
				const definition = reifierShapeFromJson(response);
				fields = definition.properties.map((field) => ({ key: nextKey++, field }));
				localName = definition.iri.slice(definition.iri.indexOf(':') + 1);
				// Comparison uses the untouched read snapshot; serialization is validated on save.
				baseline = JSON.stringify(definition.properties);
			}
		} catch (cause) {
			if (!disposed) {
				loadFailed = true;
				errorInfoStore.set(process_api_error(cause as Error));
			}
		} finally {
			if (!disposed) loading = false;
		}
	}

	function addField() {
		fields = [
			...fields,
			{ key: nextKey++, field: { iri: `${projectid}:`, datatype: 'xsd:string' } }
		];
	}

	/** PUT/POST replace the complete list; no fields are reconstructed from visible controls alone. */
	async function save() {
		if (busy || readonly || saved || !form.reportValidity()) return;
		try {
			if (!/^[A-Za-z_][A-Za-z0-9._-]*$/.test(localName))
				throw new Error(m.reifier_invalid_identifier());
			const properties = fields.map((row) => row.field);
			if (shapeIri && JSON.stringify(properties) === baseline) {
				oncancel();
				return;
			}
			const body = reifierShapeToWrite({ properties });
			const auth = $authInfoStore;
			if (!auth) throw new Error('Authentication required.');
			busy = true;
			const config = api_notget_config(auth, {
				project: projectid,
				shape: shapeIri ?? `${projectid}:${localName}`
			});
			if (shapeIri) await apiClient.postAdmindatamodelProjectreifierShapeShape(body, config);
			else await apiClient.putAdmindatamodelProjectreifierShapeShape(body, config);
			saved = true;
			await finishRefresh();
		} catch (cause) {
			errorInfoStore.set(process_api_error(cause as Error));
		} finally {
			busy = false;
		}
	}

	/** A refresh failure retries reads only; a successful create must never be sent twice. */
	async function finishRefresh() {
		busy = true;
		try {
			await onsaved();
			oncancel();
		} catch {
			errorInfoStore.set(new OldapError(m.reifier_refresh_failed()));
		} finally {
			busy = false;
		}
	}
</script>

<dialog
	bind:this={dialog}
	class="m-auto max-h-[90vh] w-[min(94vw,56rem)] flex-col overflow-hidden rounded-lg bg-white p-5 text-gray-900 shadow-xl backdrop:bg-black/50 open:flex dark:bg-gray-900 dark:text-gray-100"
	aria-label={shapeIri ? m.reifier_shape_edit() : m.reifier_shape_new()}
	oncancel={(event) => {
		event.preventDefault();
		if (!busy) oncancel();
	}}
>
	<h2 class="mb-4 text-lg font-semibold">{shapeIri ?? m.reifier_shape_new()}</h2>
	{#if readonly}<p class="mb-3 text-sm">{m.reifier_shared_readonly()}</p>{/if}
	{#if loading}<p role="status">{m.reifier_loading()}</p>{/if}
	<form
		bind:this={form}
		class="flex min-h-0 flex-col"
		onsubmit={(event) => {
			event.preventDefault();
			void save();
		}}
	>
		<div class="min-h-0 overflow-y-auto">
			<fieldset disabled={busy || loading || loadFailed || saved}>
				<label class="block text-xs"
					>{m.reifier_shape_iri()}
					<div class="mt-1 flex items-center gap-1">
						<span>{projectid}:</span><input
							class={inputClass}
							aria-label={m.reifier_shape_iri()}
							bind:value={localName}
							readonly={!!shapeIri}
							pattern="[A-Za-z_][A-Za-z0-9._-]*"
							required
						/>
					</div>
				</label>
				<h3 class="my-3 font-semibold">{m.reifier_fields()}</h3>
				<div class="space-y-3">
					{#each fields as row, index (row.key)}
						<ReifierFieldEditor
							bind:value={row.field}
							{index}
							{readonly}
							onremove={() => {
								fields = fields.filter((other) => other.key !== row.key);
							}}
						/>
					{/each}
				</div>
				{#if fields.length === 0 && !loading}<p class="my-3 text-sm">
						{m.reifier_fields_empty()}
					</p>{/if}
				{#if !readonly}<button
						class="oldap-button-round mt-3"
						type="button"
						aria-label={m.reifier_field_add()}
						title={m.reifier_field_add()}
						onclick={addField}><Plus size={16} strokeWidth={1} /></button
					>{/if}
			</fieldset>
		</div>
		<div class="mt-5 flex shrink-0 justify-end gap-3">
			<button class="oldap-button" type="button" disabled={busy} onclick={oncancel}
				>{readonly || saved ? m.reifier_close() : m.reifier_cancel()}</button
			>
			{#if saved}<button class="oldap-button" type="button" disabled={busy} onclick={finishRefresh}
					>{m.reifier_refresh()}</button
				>
			{:else if !readonly}<button
					class="oldap-button"
					type="submit"
					disabled={busy || loading || loadFailed}>{m.reifier_save()}</button
				>{/if}
		</div>
	</form>
</dialog>
