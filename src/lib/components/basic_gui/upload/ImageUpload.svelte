<!--
  - Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
  -->

<script lang="ts">
	import { languageTag } from '$lib/paraglide/runtime';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { projectStore } from '$lib/stores/project';
	import RadioButton from '$lib/components/basic_gui/buttons/RadioButton.svelte';
	import { onMount } from 'svelte';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { OldapPermissionSet } from '$lib/oldap/classes/permissionset';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import SelectMutiple from '$lib/components/basic_gui/inputs/SelectMutiple.svelte';
	import { convertToLanguage, Language } from '$lib/oldap/enums/language';
	import { fetchPermissionSetsForProject } from '$lib/helpers/get_permissions';

	type SuccessHandler = (result: unknown) => void;
  type ErrorHandler = (error: unknown) => void;

  let {
    uploadUrl = '',
    fieldName = 'file',
    headers = {} as Record<string, string>,
    onSuccess,
    onError,
    buttonLabel = 'Upload',
    placeholderUrl = 'https://example.com/upload',
  }: {
    uploadUrl?: string;
    fieldName?: string;
    headers?: Record<string, string>;
    onSuccess?: SuccessHandler;
    onError?: ErrorHandler;
    buttonLabel?: string;
    placeholderUrl?: string;
  } = $props();

	let lang = $state(languageTag());
	let langobj = $derived(convertToLanguage(lang) ?? Language.EN);

  let file: File | null = $state(null);
  let previewUrl: string | null = $state(null);
  let dragging = $state(false);
  let uploading = $state(false);
  let statusMsg: string | null = $state(null);
	let targetfileformat = $state<string>('TIFF');
	let authinfo = $state<AuthInfo | null>($authInfoStore);

	let permsets = $state<Record<string, OldapPermissionSet>>({});
	let permset_list = $state<string[]>([]);
	let permset_selectables = $state<Set<{key: string, label?: string}> | undefined>();
	let permsets_selected = $state<Set<string>>(new Set());


	authInfoStore.subscribe(data => {
		authinfo = data;
	});

	onMount(() => {
		// get all permission sets...
		if (!authinfo || !$projectStore?.projectIri) return;

		const projectIri = $projectStore.projectIri.toString();
		const projectShortName = $projectStore.projectShortName.toString();

		(async () => {
			try {
				const permsets1 = await fetchPermissionSetsForProject(authinfo, projectIri, projectShortName);
				const permsets2 = await fetchPermissionSetsForProject(authinfo, 'oldap:SystemProject', 'SystemProject');
				permsets = {...permsets1, ...permsets2};
				permset_list = Object.keys(permsets).sort((a, b) => a.localeCompare(b));

				permset_selectables = new Set(
					permset_list.map((psid) => ({
						key: psid,
						label: permsets[psid]?.label?.get(langobj)
					}))
				);
			} catch (err) {
				errorInfoStore.set(process_api_error(err as Error));
			}
			console.log(permset_selectables);
		})();
	});

  $effect(() => {
    // cleanup preview when file changes
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  });

  function selectFile(f: File | null) {
    // revoke previous
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    file = f;
    previewUrl = f ? URL.createObjectURL(f) : null;
    statusMsg = null;
  }

  function onFileInputChange(e: Event) {
    const input = e.target as HTMLInputElement;
    selectFile(input.files && input.files[0] ? input.files[0] : null);
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    dragging = true;
  }

  function onDragLeave() {
    dragging = false;
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    dragging = false;
    const f = e.dataTransfer?.files?.[0] ?? null;
    if (f && f.type.startsWith('image/')) {
      selectFile(f);
    } else if (f) {
      statusMsg = 'Please drop an image file.';
    }
  }

  async function upload() {
    if (!file) {
      statusMsg = 'Select an image first.';
      return;
    }
    const url = uploadUrl.trim();
    if (!url) {
      statusMsg = 'Enter an upload URL.';
      return;
    }
    uploading = true;
    statusMsg = null;
    try {
      const form = new FormData();
			form.append('projectId', $projectStore?.projectShortName.toString() || '')
			form.append('targetFormat', targetfileformat);
			const ps = [...permsets_selected].map(x => permsets[x].permissionSetIri.toString());
			permsets_selected.forEach(x => {
				form.append('permissionSets', permsets[x].permissionSetIri.toString())
			});
      form.append(fieldName, file);
      // Add Authorization: Bearer <token> header when available from authInfoStore
      const token = $authInfoStore?.token as string | undefined;
      const hdrs: Record<string, string> = { ...headers };
      if (token) hdrs.Authorization = `Bearer ${token}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: hdrs,
        body: form
      });
      const ct = res.headers.get('content-type') || '';
      const result = ct.includes('application/json') ? await res.json() : await res.text();
      if (!res.ok) throw new Error(typeof result === 'string' ? result : JSON.stringify(result));
      statusMsg = 'Upload complete.';
      onSuccess?.(result);
    } catch (err) {
      statusMsg = (err as Error)?.message ?? 'Upload failed.';
      onError?.(err);
    } finally {
      uploading = false;
    }
  }
</script>

<div class="p-3 flex flex-col gap-3">
  <!-- URL input (optional) -->
  <div class="flex items-center gap-2">
    <label class="text-sm w-full flex items-center gap-2">
      <span class="w-28 shrink-0">Upload URL</span>
      <input
        class="flex-1 rounded-md border px-2 py-1 text-sm"
        type="url"
        placeholder={placeholderUrl}
        bind:value={uploadUrl}
        aria-label="Upload URL"
      />
    </label>
  </div>

  <!-- Drop zone -->
  <div
    class="relative rounded-md border-2 border-dashed text-center p-4 select-none bg-white"
    class:border-indigo-400={dragging}
    role="region"
    ondragover={onDragOver}
    ondragleave={onDragLeave}
    ondrop={onDrop}
  >
    <input
      type="file"
      accept="image/*"
      onchange={onFileInputChange}
      class="absolute inset-0 opacity-0 cursor-pointer"
      aria-label="Choose image"
    />
    <div class="pointer-events-none">
      {#if previewUrl}
        <img src={previewUrl} alt="preview" class="mx-auto max-h-40 object-contain" />
        <div class="text-xs mt-2 opacity-70">{file?.name} ({Math.round((file?.size||0)/1024)} KB)</div>
      {:else}
        <div class="text-sm">Drop an image here or click to choose…</div>
      {/if}
    </div>
  </div>
	<div>
		<label for="tff1">Target file format:</label>
		<RadioButton name="targetfileformat" id="tff1" value="TIFF" bind:selected={targetfileformat}>TIFF</RadioButton>
		<RadioButton name="targetfileformat" id="tff2" value="J2K" bind:selected={targetfileformat}>J2K</RadioButton>
		<RadioButton name="targetfileformat" id="tff3" value="JPEG" bind:selected={targetfileformat}>JPEG</RadioButton>
	</div>
	<div>
		<SelectMutiple label="Permission sets" selectables={permset_selectables} bind:values={permsets_selected} />
	</div>

  <!-- Controls -->
  <div class="flex items-center gap-2">
    <button class="px-3 py-1 rounded-md border bg-oldap-button text-white disabled:opacity-50" onclick={upload} disabled={uploading}>
      {uploading ? 'Uploading…' : buttonLabel}
    </button>
    {#if statusMsg}
      <div class="text-sm opacity-80">{statusMsg}</div>
    {/if}
  </div>
</div>

