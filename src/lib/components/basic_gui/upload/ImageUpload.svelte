<!--
  - Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
  -->

<script lang="ts">
	import { locales, getLocale } from '$lib/paraglide/runtime';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { projectStore } from '$lib/stores/project';
	import RadioButton from '$lib/components/basic_gui/buttons/RadioButton.svelte';
	import { onMount } from 'svelte';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { OldapRole } from '$lib/oldap/classes/role';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import SelectMutiple from '$lib/components/basic_gui/inputs/SelectMutiple.svelte';
	import { convertToLanguage, Language } from '$lib/oldap/enums/language';
	import { fetchRolesForProject } from '$lib/helpers/get_roles';
	import { apiClient } from '$lib/shared/apiClient';
	import { api_config } from '$lib/helpers/api_config';
	import { browser } from '$app/environment';
	import { env as publicEnv } from '$env/dynamic/public';

	type SuccessHandler = (result: unknown) => void;
  type ErrorHandler = (error: unknown) => void;

	type MediaType = 'image' | 'audio' | 'video';
	const MEDIA_LABEL: Record<MediaType, string> = { image: 'Image', audio: 'Audio', video: 'Video' };

  let {
    uploadUrl = '',
    fieldName = 'file',
    headers = {} as Record<string, string>,
    onSuccess,
    onError,
    buttonLabel = 'Upload',
    placeholderUrl = 'https://example.com/upload',
		resourceClass: resourceClassProp = 'shared:MediaObject',
		path: pathProp = '',
		identifier: identifierProp = '',
		mediaType: mediaTypeProp = 'image',
		autoDetectMediaType = true,
		showMetaFields = true,
		showStoragePreview = true,
		metaFieldsCollapsible = true,
		metaFieldsInitiallyOpen: metaFieldsInitiallyOpenProp = false,
		resourceClassEditable = true,
		pathEditable = true,
		identifierEditable = true,
  }: {
    uploadUrl?: string;
    fieldName?: string;
    headers?: Record<string, string>;
    onSuccess?: SuccessHandler;
    onError?: ErrorHandler;
    buttonLabel?: string;
    placeholderUrl?: string;
		resourceClass?: string;
		path?: string;
		identifier?: string;
		mediaType?: MediaType;
		autoDetectMediaType?: boolean;
		showMetaFields?: boolean;
		showStoragePreview?: boolean;
		metaFieldsCollapsible?: boolean;
		metaFieldsInitiallyOpen?: boolean;
		resourceClassEditable?: boolean;
		pathEditable?: boolean;
		identifierEditable?: boolean;
  } = $props();

	const initialMediaType: MediaType = mediaTypeProp;
	const initialMetaOpen: boolean = metaFieldsInitiallyOpenProp;

	let lang = $state(getLocale());
	let langobj = $derived(convertToLanguage(lang) ?? Language.EN);

  let file: File | null = $state(null);
  let previewUrl: string | null = $state(null);
  let dragging = $state(false);
  let uploading = $state(false);
  let uploadProgress = $state<number>(0);
  let statusMsg: string | null = $state(null);

	let resourceClass = $state<string>(resourceClassProp);
	let path = $state<string>(pathProp);
	let identifier = $state<string>(identifierProp);

let mediaType = $state<MediaType>(initialMediaType);
let targetfileformat = $state<string>('TIFF');
let metaOpen = $state<boolean>(initialMetaOpen);

	function normalizeSubpath(input: string, proj: string, mt: MediaType): string {
		let p = (input || '').trim();
		if (!p) return '';
		// normalize slashes
		p = p.replace(/\\/g, '/');
		p = p.replace(/^\/+/, '').replace(/\/+$/, '');

		const projPrefix = proj ? `${proj}/` : '';
		const mtPrefix = `${mt}/`;

		// If user entered full path, strip leading project/mediaType parts
		if (projPrefix && p.startsWith(projPrefix + mtPrefix)) {
			p = p.slice((projPrefix + mtPrefix).length);
		} else if (projPrefix && p.startsWith(projPrefix)) {
			p = p.slice(projPrefix.length);
			if (p.startsWith(mtPrefix)) p = p.slice(mtPrefix.length);
		} else if (p.startsWith(mtPrefix)) {
			p = p.slice(mtPrefix.length);
		}

		return p.replace(/^\/+/, '').replace(/\/+$/, '');
	}

  let projectShortNameStr = $state<string>('');
  let normalizedPath = $state<string>('');
  let storagePreview = $state<string>('');

  $effect(() => {
    projectShortNameStr = $projectStore?.projectShortName?.toString?.() ?? '';
    normalizedPath = normalizeSubpath(path, projectShortNameStr, mediaType);

    const id = identifier && identifier.trim().length > 0 ? identifier.trim() : '<generated>';
    storagePreview = [projectShortNameStr, mediaType, normalizedPath, id]
      .filter((x) => (x ?? '').toString().length > 0)
      .join('/');
  });

  function formatUploadError(payload: any, fallback: string): string {
		if (!payload) return fallback;
		if (typeof payload === 'string') return payload;
		if (payload.message && typeof payload.message === 'string') return payload.message;
		if (payload.error && typeof payload.error === 'string') return payload.error;
		try {
			return JSON.stringify(payload, null, 2);
		} catch {
			return fallback;
		}
	}
	function detectMediaTypeFromFile(f: File): MediaType {
		if (f.type.startsWith('image/')) return 'image';
		if (f.type.startsWith('audio/')) return 'audio';
		if (f.type.startsWith('video/')) return 'video';
		// fallback by extension
		const n = (f.name || '').toLowerCase();
		if (n.match(/\.(png|jpe?g|gif|webp|tif{1,2}|bmp)$/)) return 'image';
		if (n.match(/\.(mp3|m4a|aac|wav|flac|ogg)$/)) return 'audio';
		if (n.match(/\.(mp4|mov|m4v|mkv|webm|avi)$/)) return 'video';
		return mediaType;
	}

	function defaultTargetFormatFor(mt: MediaType): string {
		switch (mt) {
			case 'image':
				return 'TIFF';
			case 'audio':
				return 'm4a';
			case 'video':
				return 'mp4';
		}
	}

	function acceptFor(mt: MediaType): string {
		switch (mt) {
			case 'image':
				return 'image/*';
			case 'audio':
				return 'audio/*';
			case 'video':
				return 'video/*';
		}
	}
	function clearResourceClass() {
		resourceClass = 'shared:MediaObject';
	}
	function clearPath() {
		path = '';
	}
	function clearIdentifier() {
		identifier = '';
	}
	function clearFile() {
		selectFile(null);
	}
	let authinfo = $state<AuthInfo | null>($authInfoStore);

	let roles = $state<Record<string, OldapRole>>({});
	let role_list = $state<string[]>([]);
	let role_selectables = $state<Set<{key: string, label?: string}> | undefined>();
	let roles_selected = $state<Set<string>>(new Set());


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
				const roles1 = await fetchRolesForProject(authinfo, projectIri, projectShortName);
				const roles2 = await fetchRolesForProject(authinfo, 'oldap:SystemProject', 'SystemProject');
				roles = {...roles1, ...roles2};
				role_list = Object.keys(roles).sort((a, b) => a.localeCompare(b));

				role_selectables = new Set(
					role_list.map((psid) => ({
						key: psid,
						label: roles[psid]?.label?.get(langobj)
					}))
				);
			} catch (err) {
				errorInfoStore.set(process_api_error(err as Error));
			}
			console.log(role_selectables);
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
		uploadProgress = 0;

		if (f && autoDetectMediaType) {
			const mt = detectMediaTypeFromFile(f);
			mediaType = mt;
			// if current format doesn't match the type, reset to sensible default
			if (mt === 'image' && !['TIFF', 'J2K', 'JPEG'].includes(targetfileformat)) {
				targetfileformat = defaultTargetFormatFor(mt);
			}
			if (mt === 'audio' && !['m4a', 'mp3'].includes(targetfileformat)) {
				targetfileformat = defaultTargetFormatFor(mt);
			}
			if (mt === 'video' && !['mp4'].includes(targetfileformat)) {
				targetfileformat = defaultTargetFormatFor(mt);
			}
		}
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
    if (f && (f.type.startsWith('image/') || f.type.startsWith('audio/') || f.type.startsWith('video/'))) {
      selectFile(f);
    } else if (f) {
      statusMsg = 'Please drop an image, audio, or video file.';
    }
  }

  async function upload() {
    if (!file) {
      statusMsg = 'Select a file first.';
      return;
    }
		if (!browser) return;

		const url = publicEnv.PUBLIC_UPLOAD_URL;
		uploading = true;
		uploadProgress = 0;
		statusMsg = null;

		try {
			const form = new FormData();

			// Required/expected by upload-server
			form.append('resourceClass', resourceClass);
			form.append('projectId', $projectStore?.projectShortName.toString() || '');
			form.append('path', normalizedPath);
			if (identifier && identifier.trim().length > 0) {
				form.append('identifier', identifier.trim());
			}
			form.append('targetFormat', targetfileformat);
			roles_selected.forEach((x) => {
				form.append('attachedToRole', roles[x].roleIri.toString());
			});

			// optional, still useful on server side
			form.append('dcterms:type', mediaType === 'image' ? 'dcmitype:StillImage' : mediaType === 'audio' ? 'dcmitype:Sound' : 'dcmitype:MovingImage');

			form.append(fieldName, file);

			// Headers (Authorization etc.)
			const token = $authInfoStore?.token as string | undefined;
			const hdrs: Record<string, string> = { ...headers };
			if (token) hdrs.Authorization = `Bearer ${token}`;

			const result = await new Promise<any>((resolve, reject) => {
				const xhr = new XMLHttpRequest();
				xhr.open('POST', url);
				Object.entries(hdrs).forEach(([k, v]) => xhr.setRequestHeader(k, v));

				xhr.upload.onprogress = (evt) => {
					if (evt.lengthComputable) {
						uploadProgress = Math.round((evt.loaded / evt.total) * 100);
					}
				};

				xhr.onload = () => {
					const ct = xhr.getResponseHeader('content-type') || '';
					const ok = xhr.status >= 200 && xhr.status < 300;
					try {
						const payload = ct.includes('application/json') ? JSON.parse(xhr.responseText || '{}') : xhr.responseText;
						if (!ok) {
							reject(new Error(formatUploadError(payload, `Upload failed (HTTP ${xhr.status})`)));
							return;
						}
						resolve(payload);
					} catch (e) {
						if (!ok) reject(new Error(xhr.responseText || `Upload failed (HTTP ${xhr.status})`));
						else resolve(xhr.responseText);
					}
				};

				xhr.onerror = () => reject(new Error('Network error during upload.'));
				xhr.onabort = () => reject(new Error('Upload aborted.'));
				xhr.send(form);
			});

			statusMsg = 'Upload complete.';
			console.log('UPLOAD:', url, result);

			// Follow-up fetch of created MediaObject instance (kept from previous version)
			if (result?.iri) {
				const config_mediaobj = api_config(authinfo || new AuthInfo('', ''), {
					iri: result.iri.toString(),
				});
				apiClient.getDatamediaobjectiriIri(config_mediaobj).then((res) => {
					console.log(res);
					onSuccess?.(res);
				});
			} else {
				onSuccess?.(result);
			}
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

  {#if showMetaFields}
    {#if metaFieldsCollapsible}
      <div class="rounded-md border bg-white">
        <button
          type="button"
          class="w-full flex items-center justify-between px-3 py-2 text-sm"
          onclick={() => (metaOpen = !metaOpen)}
        >
          <span class="font-medium">Meta (Resource, Path, Identifier)</span>
          <span class="opacity-70">{metaOpen ? '▾' : '▸'}</span>
        </button>
        {#if metaOpen}
          <div class="px-3 pb-3 pt-1 flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-sm" for="resourceClass">Resource class</label>
              <div class="flex items-center gap-2">
                <input
                  id="resourceClass"
                  class="flex-1 px-2 py-1 border rounded text-sm"
                  bind:value={resourceClass}
                  placeholder="e.g. shared:MediaObject"
                  disabled={!resourceClassEditable}
                />
                <button
                  type="button"
                  class="px-2 py-1 text-xs border rounded disabled:opacity-50"
                  onclick={clearResourceClass}
                  disabled={!resourceClassEditable}
                  title="Reset to default"
                >↺</button>
              </div>
              <div class="text-xs opacity-70">SHACL/OWL class for the created MediaObject.</div>
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-sm" for="path">Path (subpath)</label>
              <div class="flex items-center gap-2">
                <input
                  id="path"
                  class="flex-1 px-2 py-1 border rounded text-sm"
                  bind:value={path}
                  placeholder="e.g. events/2026"
                  disabled={!pathEditable}
                />
                <button
                  type="button"
                  class="px-2 py-1 text-xs border rounded disabled:opacity-50"
                  onclick={clearPath}
                  disabled={!pathEditable}
                  title="Clear"
                >✕</button>
              </div>
              <div class="text-xs opacity-70">
                Optional subpath <span class="font-mono">within</span> the project’s media folder. Examples:
                <span class="font-mono">narrenbaschi</span>, <span class="font-mono">mediathek/redaktion</span>.
                Don’t include <span class="font-mono">{projectShortNameStr}/{mediaType}</span> — if you do, it will be stripped automatically.
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-sm" for="identifier">Identifier (optional)</label>
              <div class="flex items-center gap-2">
                <input
                  id="identifier"
                  class="flex-1 px-2 py-1 border rounded text-sm"
                  bind:value={identifier}
                  placeholder="leave empty to auto-generate (uuid)"
                  disabled={!identifierEditable}
                />
                <button
                  type="button"
                  class="px-2 py-1 text-xs border rounded disabled:opacity-50"
                  onclick={clearIdentifier}
                  disabled={!identifierEditable}
                  title="Clear"
                >✕</button>
              </div>
              <div class="text-xs opacity-70">If empty, the server will generate a UUID (recommended).</div>
            </div>

            {#if showStoragePreview}
              <div class="text-xs">
                <div class="opacity-70">Stored as (preview):</div>
                <div class="font-mono break-all bg-gray-50 border rounded px-2 py-1">{storagePreview}</div>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {:else}
      <div class="rounded-md border bg-white p-3 flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-sm" for="resourceClass">Resource class</label>
          <div class="flex items-center gap-2">
            <input
              id="resourceClass"
              class="flex-1 px-2 py-1 border rounded text-sm"
              bind:value={resourceClass}
              placeholder="e.g. shared:MediaObject"
              disabled={!resourceClassEditable}
            />
            <button
              type="button"
              class="px-2 py-1 text-xs border rounded disabled:opacity-50"
              onclick={clearResourceClass}
              disabled={!resourceClassEditable}
              title="Reset to default"
            >↺</button>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm" for="path">Path (subpath)</label>
          <div class="flex items-center gap-2">
            <input
              id="path"
              class="flex-1 px-2 py-1 border rounded text-sm"
              bind:value={path}
              placeholder="e.g. events/2026"
              disabled={!pathEditable}
            />
            <button
              type="button"
              class="px-2 py-1 text-xs border rounded disabled:opacity-50"
              onclick={clearPath}
              disabled={!pathEditable}
              title="Clear"
            >✕</button>
          </div>
          <div class="text-xs opacity-70">
            Optional subpath <span class="font-mono">within</span> the project’s media folder. Examples:
            <span class="font-mono">narrenbaschi</span>, <span class="font-mono">mediathek/redaktion</span>.
            Don’t include <span class="font-mono">{projectShortNameStr}/{mediaType}</span> — if you do, it will be stripped automatically.
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm" for="identifier">Identifier (optional)</label>
          <div class="flex items-center gap-2">
            <input
              id="identifier"
              class="flex-1 px-2 py-1 border rounded text-sm"
              bind:value={identifier}
              placeholder="leave empty to auto-generate (uuid)"
              disabled={!identifierEditable}
            />
            <button
              type="button"
              class="px-2 py-1 text-xs border rounded disabled:opacity-50"
              onclick={clearIdentifier}
              disabled={!identifierEditable}
              title="Clear"
            >✕</button>
          </div>
        </div>
        {#if showStoragePreview}
          <div class="text-xs">
            <div class="opacity-70">Stored as (preview):</div>
            <div class="font-mono break-all bg-gray-50 border rounded px-2 py-1">{storagePreview}</div>
          </div>
        {/if}
      </div>
    {/if}
  {/if}

  <!-- Drop zone -->
  <div
    class="relative rounded-md border-2 border-dashed text-center p-4 select-none bg-white"
    class:border-indigo-400={dragging}
    class:bg-indigo-50={dragging}
    role="region"
    ondragover={onDragOver}
    ondragleave={onDragLeave}
    ondrop={onDrop}
  >
    <input
      type="file"
      accept={acceptFor(mediaType)}
      onchange={onFileInputChange}
      class="absolute inset-0 opacity-0 cursor-pointer"
      aria-label="Choose file"
    />
    <div class="pointer-events-none">
      {#if previewUrl}
        {#if mediaType === 'image'}
          <img src={previewUrl} alt="preview" class="mx-auto max-h-40 object-contain" />
        {:else if mediaType === 'audio'}
          <audio class="mx-auto w-full" controls src={previewUrl}></audio>
        {:else}
          <!-- svelte-ignore a11y_media_has_caption -->
          <video class="mx-auto w-full max-h-40" controls src={previewUrl}></video>
        {/if}
        <div class="text-xs mt-2 opacity-70">{file?.name} ({Math.round((file?.size||0)/1024)} KB)</div>
      {:else}
        <div class="text-sm">Drop a file here (image/audio/video) or click to choose…</div>
      {/if}
    </div>
  </div>
	<div class="flex flex-col gap-2">
		<div class="flex items-center gap-3">
			<span class="text-sm">Media type:</span>
			<RadioButton name="mediatype" id="mt1" value="image" bind:selected={mediaType}>Image</RadioButton>
			<RadioButton name="mediatype" id="mt2" value="audio" bind:selected={mediaType}>Audio</RadioButton>
			<RadioButton name="mediatype" id="mt3" value="video" bind:selected={mediaType}>Video</RadioButton>
		</div>

		<div>
			<span class="text-sm">Target file format:</span>
			{#if mediaType === 'image'}
				<RadioButton name="targetfileformat" id="tff1" value="TIFF" bind:selected={targetfileformat}>TIFF</RadioButton>
				<RadioButton name="targetfileformat" id="tff2" value="J2K" bind:selected={targetfileformat}>J2K</RadioButton>
				<RadioButton name="targetfileformat" id="tff3" value="JPEG" bind:selected={targetfileformat}>JPEG</RadioButton>
			{:else if mediaType === 'audio'}
				<RadioButton name="targetfileformat" id="taf1" value="m4a" bind:selected={targetfileformat}>m4a</RadioButton>
				<RadioButton name="targetfileformat" id="taf2" value="mp3" bind:selected={targetfileformat}>mp3</RadioButton>
			{:else}
				<RadioButton name="targetfileformat" id="tvf1" value="mp4" bind:selected={targetfileformat}>mp4</RadioButton>
			{/if}
		</div>
	</div>
	<div>
		<SelectMutiple label="Roles" selectables={role_selectables} bind:values={roles_selected} />
	</div>

  <!-- Controls -->
  <div class="flex items-center gap-3">
    <button class="px-3 py-1 rounded-md border bg-oldap-button text-white disabled:opacity-50" onclick={upload} disabled={uploading}>
      {uploading ? `Uploading… ${uploadProgress}%` : buttonLabel}
    </button>
    <button
      type="button"
      class="px-3 py-1 rounded-md border bg-white disabled:opacity-50"
      onclick={clearFile}
      disabled={uploading || !file}
      title="Clear selected file"
    >
      Clear
    </button>
		{#if uploading}
			<div class="flex-1">
				<div class="h-2 w-full rounded bg-gray-200 overflow-hidden">
					<div class="h-2 bg-oldap-button" style={`width: ${uploadProgress}%`}></div>
				</div>
			</div>
		{/if}
    {#if statusMsg}
      <div class="text-sm opacity-80">{statusMsg.startsWith('Upload complete') ? statusMsg : `ERROR: ${statusMsg}`}</div>
    {/if}
  </div>
</div>

