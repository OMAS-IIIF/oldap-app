<!--
  - Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
  -->

<script lang="ts">
	import { getLocale, locales } from '$lib/paraglide/runtime';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { projectStore } from '$lib/stores/project';
	import RadioButton from '$lib/components/basic_gui/buttons/RadioButton.svelte';
	import { onMount, untrack } from 'svelte';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { OldapRole } from '$lib/oldap/classes/role';
	import { errorInfoStore } from '$lib/stores/errorinfo';
	import { process_api_error } from '$lib/helpers/process_api_error';
	import { convertToLanguage, getLanguageShortname, Language } from '$lib/oldap/enums/language';
	import { fetchRolesForProject } from '$lib/helpers/get_roles';
	import { apiClient } from '$lib/shared/apiClient';
	import { api_config, api_get_config } from '$lib/helpers/api_config';
	import { browser } from '$app/environment';
	import { env as publicEnv } from '$env/dynamic/public';
	import { datamodelStore } from '$lib/stores/datamodel';
	import { is_mediaobject } from '$lib/helpers/is_mediaobject';
	import { DataPermission } from '$lib/oldap/enums/data_permissions';
	import { userStore } from '$lib/stores/user';
	import * as m from '$lib/paraglide/messages';
	import TableBody from '$lib/components/basic_gui/table/TableBody.svelte';
	import TableRow from '$lib/components/basic_gui/table/TableRow.svelte';
	import Checkbox from '$lib/components/basic_gui/checkbox/Checkbox.svelte';
	import TableHeader from '$lib/components/basic_gui/table/TableHeader.svelte';
	import TableColumnTitle from '$lib/components/basic_gui/table/TableColumnTitle.svelte';
	import Table from '$lib/components/basic_gui/table/Table.svelte';
	import TableItem from '$lib/components/basic_gui/table/TableItem.svelte';
	import type { HasProperty } from '$lib/oldap/classes/resource';
	import { XsdDate } from '$lib/oldap/datatypes/xsd_date';
	import { LangString } from '$lib/oldap/datatypes/langstring';
	import { XsdDatatypes } from '$lib/oldap/enums/xsd_datatypes';
	import TextFieldData from '$lib/components/basic_gui/inputs/TextFieldData.svelte';
	import DatePickerData from '$lib/components/basic_gui/inputs/DatePickerData.svelte';
	import LangstringfieldNew from '$lib/components/basic_gui/inputs/LangstringfieldNew.svelte';
	import { OldapList } from '$lib/oldap/classes/list';
	import HlistSelectorData from '$lib/components/basic_gui/inputs/HlistSelectorData.svelte';

	type SuccessHandler = (result: unknown) => void;
	type ErrorHandler = (error: unknown) => void;

	type MediaType = 'image' | 'audio' | 'video';

	type DataTypes = string | XsdDate | null;
	type InputFieldInstance = {
		get_value: () => DataTypes[];
	};

	const MEDIA_LABEL: Record<MediaType, string> = { image: 'Image', audio: 'Audio', video: 'Video' };

	const languages = Array.from(locales)
		.map((lang) => convertToLanguage(lang))
		.filter((lang): lang is Language => lang !== undefined);

	let {
		fieldName = 'file',
		headers = {} as Record<string, string>,
		onSuccess,
		onError,
		buttonLabel = 'Upload',
		path: pathProp = '',
		identifier: identifierProp = '',
		mediaType: mediaTypeProp = 'image',
		autoDetectMediaType = true,
		showMetaFields = true,
		showStoragePreview = true,
		metaFieldsCollapsible = true,
		metaFieldsInitiallyOpen: metaFieldsInitiallyOpenProp = false,
		pathEditable = true,
		identifierEditable = true
	}: {
		fieldName?: string;
		headers?: Record<string, string>;
		onSuccess?: SuccessHandler;
		onError?: ErrorHandler;
		buttonLabel?: string;
		path?: string;
		identifier?: string;
		mediaType?: MediaType;
		autoDetectMediaType?: boolean;
		showMetaFields?: boolean;
		showStoragePreview?: boolean;
		metaFieldsCollapsible?: boolean;
		metaFieldsInitiallyOpen?: boolean;
		pathEditable?: boolean;
		identifierEditable?: boolean;
	} = $props();

	const initialMediaType: MediaType = mediaTypeProp;
	const initialMetaOpen: boolean = metaFieldsInitiallyOpenProp;

	let lang = $state(getLocale());
	let langobj = $derived(convertToLanguage(lang) ?? Language.EN);

	let file: File | null = $state(null);
	let fileInputEl: HTMLInputElement | null = $state(null);
	let previewUrl: string | null = $state(null);
	let dragging = $state(false);
	let uploading = $state(false);
	let uploadProgress = $state<number>(0);
	let statusMsg: string | null = $state(null);

	let resourceClass = $state<string>('shared:MediaObject');
	let path = $state<string>(pathProp);
	let identifier = $state<string>(identifierProp);

	let mediaType = $state<MediaType>(initialMediaType);
	let targetfileformat = $state<string>('TIFF');
	let metaOpen = $state<boolean>(initialMetaOpen);

	let roles = $state<OldapRole[]>([]);
	let user_roles = $state<Record<string, boolean>>({});
	let selected_dperm = $state<Record<string, string>>({});
	let authinfo = $state<AuthInfo | null>($authInfoStore);
	let resource_class_list = $state<string[]>([]);

	let values = $state<Record<string, any>>({});
	let input_fields = $state<Record<string, InputFieldInstance | undefined>>({});
	let hlists = $state<Record<string, OldapList>>({});

	const data_permission_list: string[] = ['None', ...Object.keys(DataPermission)] as const;

	//let role_list = $state<string[]>([]);
	//let role_selectables = $state<Set<{ key: string; label?: string }> | undefined>();
	//let roles_selected = $state<Set<string>>(new Set());

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

	$effect(() => {
		const _ = resourceClass;
		untrack(() => {
			let props = get_props();
			values = {};
			for (const prop of props) {
				if (prop.property.datatype === XsdDatatypes.langString) {
					values[prop.property.propertyIri.toString()] = new LangString();
				} else if (prop.property.datatype == XsdDatatypes.date) {
					values[prop.property.propertyIri.toString()] = [new XsdDate()];
				} else {
					values[prop.property.propertyIri.toString()] = [''];
				}
				input_fields[prop.property.propertyIri.toString()] = undefined;
			}
		});
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
		if (n.match(/\.(png|jpe?g|gif|webp|tif{1,2}|bmp|avif)$/)) return 'image';
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

	function get_props(): HasProperty[] {
		const r = $datamodelStore?.resources.find((r) => r.iri.toString() === resourceClass);
		if (r) {
			return r?.hasProperty || [];
		} else {
			return [];
		}
	}

	function normalizeHlistPayload(raw: any): any {
		if (!raw || typeof raw !== 'object') return raw;

		const normalizeNode = (node: any): any => {
			if (!node || typeof node !== 'object') return node;
			const n = { ...node };
			if (n.oldapListNodeId === undefined && n.nodeid !== undefined) {
				n.oldapListNodeId = n.nodeid;
			}
			if (Array.isArray(n.nodes)) {
				n.nodes = n.nodes.map((child: any) => normalizeNode(child));
			}
			return n;
		};

		const out = { ...raw };
		if (out.oldapListId === undefined && out.hlistId !== undefined) {
			out.oldapListId = out.hlistId;
		}
		if (out.hlist === undefined && out.oldapListId !== undefined) {
			out.hlist = out.oldapListId;
		}
		if (Array.isArray(out.nodes)) {
			out.nodes = out.nodes.map((node: any) => normalizeNode(node));
		}
		return out;
	}

	async function resolveHlistId(rawResult: string): Promise<string | null> {
		const token = (rawResult || '').trim();
		if (!token) return null;
		if (!token.includes(':') && !token.includes('/')) {
			return token;
		}

		try {
			const cfg = api_get_config(authinfo || new AuthInfo('', ''), { iri: token });
			const meta = await apiClient.getAdminhlistget(cfg);
			const hlistId = (meta as any)?.hlistId || (meta as any)?.oldapListId;
			if (hlistId) return hlistId.toString();
		} catch {
			// fallback below
		}

		const tail = token.split('/').pop() || token.split(':').pop() || '';
		return tail.trim().length > 0 ? tail.trim() : null;
	}

	authInfoStore.subscribe((data) => {
		authinfo = data;
	});

	onMount(() => {
		// get all permission sets...
		if (!authinfo || !$projectStore?.projectIri) return;

		const projectIri = $projectStore.projectIri.toString();
		const projectShortName = $projectStore.projectShortName.toString();

		(async () => {
			try {
				//
				// get all the possible roles for this project, and the default roles the user has
				//
				const roles1 = await fetchRolesForProject(authinfo, projectIri, projectShortName);
				const roles2 = await fetchRolesForProject(authinfo, 'oldap:SystemProject', 'SystemProject');
				roles = [...roles1, ...roles2];
				let userHasRoles: string[] = [];
				if ($userStore?.hasRole) {
					userHasRoles = Object.keys($userStore?.hasRole).map((iri) => iri.toString()) || [];
				}
				roles.forEach((role) => {
					user_roles[role.roleIriAsString] = userHasRoles.includes(role.roleIriAsString);
					if (user_roles[role.roleIriAsString]) {
						const v = ($userStore?.hasRole as any)?.[role.roleIriAsString] as
							| string
							| null
							| undefined; // e.g. "oldap:DATA_VIEW"
						selected_dperm[role.roleIriAsString] = v ? v.split(':')[1] : 'None';
					} else {
						selected_dperm[role.roleIriAsString] = 'None';
					}
				});

				//
				// load hierarchical lists for this project (for toClass/list properties)
				//
				const config_hlist_search = api_get_config(authinfo || new AuthInfo('', ''), {
					project: projectShortName
				});
				const hlist_search_results = await apiClient.getAdminhlistsearch(config_hlist_search);
				const hlist_promises = (hlist_search_results || []).map(async (rawResult: string) => {
					const hlistId = await resolveHlistId(rawResult);
					if (!hlistId) return null;
					const config_hlist_full = api_config(authinfo || new AuthInfo('', ''), {
						project: projectShortName,
						hlistid: hlistId
					});
					const hlist_data = await apiClient.getAdminhlistProjectHlistid(config_hlist_full);
					return OldapList.fromOldapJson(normalizeHlistPayload(hlist_data), false);
				});
				const hlist_results = await Promise.all(hlist_promises);
				let tmp_hlists: Record<string, OldapList> = {};
				for (const hlist of hlist_results) {
					if (hlist) {
						tmp_hlists[hlist.nodeClassIri.toString()] = hlist;
					}
				}
				hlists = tmp_hlists;
			} catch (err) {
				errorInfoStore.set(process_api_error(err as Error));
			}
		})();
	});

	$effect(() => {
		// cleanup preview when file changes
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		};
	});

	$effect(() => {
		//
		// get all the descendents of 'shared:MediaObject' that can be used to upload assets for this project
		//
		if ($datamodelStore?.resources) {
			untrack(() => {
				const tmp = $datamodelStore?.resources
					.filter((r) => is_mediaobject(r))
					.map((r) => r.iri.toString());
				resource_class_list = [...tmp];
				if (resource_class_list.length > 0) {
					resourceClass = resource_class_list[0];
				}
			});
		}
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
		e.stopPropagation();
		dragging = true;
	}

	function onDragLeave(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		dragging = false;
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		dragging = false;
		const f = e.dataTransfer?.files?.[0] ?? null;
		if (
			f &&
			(f.type.startsWith('image/') || f.type.startsWith('audio/') || f.type.startsWith('video/'))
		) {
			selectFile(f);
		} else if (f) {
			statusMsg = 'Please drop an image, audio, or video file.';
		}
	}

	function openFileDialog() {
		fileInputEl?.click();
	}

	function onDropZoneKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			openFileDialog();
		}
	}

	function isSafariBrowser(): boolean {
		if (!browser) return false;
		const ua = navigator.userAgent;
		return /Safari/i.test(ua) && !/(Chrome|Chromium|CriOS|Android|Edg|OPR|FxiOS)/i.test(ua);
	}

	async function upload(event?: Event) {
		event?.preventDefault();
		event?.stopPropagation();

		if (uploading) {
			return;
		}

		if (!file) {
			statusMsg = 'Select a file first.';
			return;
		}
		if (!browser) return;

		const url = `${publicEnv.PUBLIC_MEDIASERVER_URL}/upload`;
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
			/*
			roles_selected.forEach((x) => {
				form.append('attachedToRole', roles[x].roleIri.toString());
			});
			 */

			// optional, still useful on server side
			form.append(
				'dcterms:type',
				mediaType === 'image'
					? 'dcmitype:StillImage'
					: mediaType === 'audio'
						? 'dcmitype:Sound'
						: 'dcmitype:MovingImage'
			);

			form.append(fieldName, file);

			get_props().forEach((hasprop) => {
				const propname = hasprop.property.propertyIri.toString();
				const propValue = values[propname];

				switch (hasprop.property.datatype) {
					case XsdDatatypes.xsdString:
						if (Array.isArray(propValue)) {
							propValue.forEach((v) => {
								if (typeof v === 'string' && v.trim().length > 0) {
									form.append(propname, v);
								}
							});
						}
						break;
					case XsdDatatypes.date:
						if (Array.isArray(propValue)) {
							propValue.forEach((v) => {
								if (v instanceof XsdDate) {
									form.append(propname, v.toApi());
								}
							});
						}
						break;
					case XsdDatatypes.langString:
						if (propValue instanceof LangString) {
							propValue.forEach((text, lang) => {
								const langstr = getLanguageShortname(lang);
								if (langstr) {
									form.append(propname, `${text}@${langstr}`);
								}
							});
						}
						break;
					default:
						if (Array.isArray(propValue)) {
							propValue.forEach((v) => {
								if (typeof v === 'string' && v.trim().length > 0) {
									form.append(propname, v);
								}
							});
						}
				}
			});

			// Headers (Authorization etc.)
			const token = $authInfoStore?.token as string | undefined;
			const hdrs: Record<string, string> = { ...headers };
			if (token) hdrs.Authorization = `Bearer ${token}`;

			let result: any;
			if (isSafariBrowser()) {
				const resp = await fetch(url, {
					method: 'POST',
					headers: hdrs,
					body: form
				});
				const ct = resp.headers.get('content-type') || '';
				const payload = ct.includes('application/json') ? await resp.json() : await resp.text();
				if (!resp.ok) {
					throw new Error(formatUploadError(payload, `Upload failed (HTTP ${resp.status})`));
				}
				uploadProgress = 100;
				result = payload;
			} else {
				result = await new Promise<any>((resolve, reject) => {
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
							const payload = ct.includes('application/json')
								? JSON.parse(xhr.responseText || '{}')
								: xhr.responseText;
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
			}

			statusMsg = 'Upload complete.';
			console.log('UPLOAD:', url, result);

			// Follow-up fetch of created MediaObject instance (kept from previous version)
			if (result?.iri) {
				const config_mediaobj = api_config(authinfo || new AuthInfo('', ''), {
					iri: result.iri.toString()
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

<div class="flex flex-col gap-3 p-3">
	<!-- URL input (optional) -->

	{#if showMetaFields}
		{#if metaFieldsCollapsible}
			<div class="rounded-md border bg-white">
				<button
					type="button"
					class="flex w-full items-center justify-between px-3 py-2 text-sm"
					onclick={() => (metaOpen = !metaOpen)}
				>
					<span class="font-medium">Meta (Resource, Path, Identifier)</span>
					<span class="opacity-70">{metaOpen ? '▾' : '▸'}</span>
				</button>
				{#if metaOpen}
					<div class="flex flex-col gap-3 px-3 pt-1 pb-3">
						<div class="flex flex-col gap-1">
							<label class="text-sm" for="resourceClass">Resource class</label>
							<div class="flex items-center gap-2">
								<select
									id="resourceClass"
									class="flex-1 rounded border px-2 py-1 text-sm"
									bind:value={resourceClass}
								>
									{#each resource_class_list as rc (rc)}
										<option value={rc}>{rc}</option>
									{/each}
								</select>
							</div>
							<div class="text-xs opacity-70">SHACL/OWL class for the created MediaObject.</div>
						</div>

						<div class="flex flex-col gap-1">
							<label class="text-sm" for="path">Path (subpath)</label>
							<div class="flex items-center gap-2">
								<input
									id="path"
									class="flex-1 rounded border px-2 py-1 text-sm"
									bind:value={path}
									placeholder="e.g. events/2026"
									disabled={!pathEditable}
								/>
								<button
									type="button"
									class="rounded border px-2 py-1 text-xs disabled:opacity-50"
									onclick={clearPath}
									disabled={!pathEditable}
									title="Clear">✕</button
								>
							</div>
							<div class="text-xs opacity-70">
								Optional subpath <span class="font-mono">within</span> the project’s media folder.
								Examples:
								<span class="font-mono">narrenbaschi</span>,
								<span class="font-mono">mediathek/redaktion</span>. Don’t include
								<span class="font-mono">{projectShortNameStr}/{mediaType}</span> — if you do, it will
								be stripped automatically.
							</div>
						</div>

						<div class="flex flex-col gap-1">
							<label class="text-sm" for="identifier">Identifier (optional)</label>
							<div class="flex items-center gap-2">
								<input
									id="identifier"
									class="flex-1 rounded border px-2 py-1 text-sm"
									bind:value={identifier}
									placeholder="leave empty to auto-generate (uuid)"
									disabled={!identifierEditable}
								/>
								<button
									type="button"
									class="rounded border px-2 py-1 text-xs disabled:opacity-50"
									onclick={clearIdentifier}
									disabled={!identifierEditable}
									title="Clear">✕</button
								>
							</div>
							<div class="text-xs opacity-70">
								If empty, the server will generate a UUID (recommended).
							</div>
						</div>

						{#if showStoragePreview}
							<div class="text-xs">
								<div class="opacity-70">Stored as (preview):</div>
								<div class="rounded border bg-gray-50 px-2 py-1 font-mono break-all">
									{storagePreview}
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		{:else}
			<div class="flex flex-col gap-3 rounded-md border bg-white p-3">
				<div class="flex flex-col gap-1">
					<label class="text-sm" for="resourceClass">Resource class</label>
					<div class="flex items-center gap-2">
						<select
							id="resourceClass"
							class="flex-1 rounded border px-2 py-1 text-sm"
							bind:value={resourceClass}
						>
							{#each resource_class_list as rc (rc)}
								<option value={rc}>{rc}</option>
							{/each}
						</select>
					</div>
				</div>
				<div class="flex flex-col gap-1">
					<label class="text-sm" for="path">Path (subpath)</label>
					<div class="flex items-center gap-2">
						<input
							id="path"
							class="flex-1 rounded border px-2 py-1 text-sm"
							bind:value={path}
							placeholder="e.g. events/2026"
							disabled={!pathEditable}
						/>
						<button
							type="button"
							class="rounded border px-2 py-1 text-xs disabled:opacity-50"
							onclick={clearPath}
							disabled={!pathEditable}
							title="Clear">✕</button
						>
					</div>
					<div class="text-xs opacity-70">
						Optional subpath <span class="font-mono">within</span> the project’s media folder.
						Examples:
						<span class="font-mono">narrenbaschi</span>,
						<span class="font-mono">mediathek/redaktion</span>. Don’t include
						<span class="font-mono">{projectShortNameStr}/{mediaType}</span> — if you do, it will be stripped
						automatically.
					</div>
				</div>
				<div class="flex flex-col gap-1">
					<label class="text-sm" for="identifier">Identifier (optional)</label>
					<div class="flex items-center gap-2">
						<input
							id="identifier"
							class="flex-1 rounded border px-2 py-1 text-sm"
							bind:value={identifier}
							placeholder="leave empty to auto-generate (uuid)"
							disabled={!identifierEditable}
						/>
						<button
							type="button"
							class="rounded border px-2 py-1 text-xs disabled:opacity-50"
							onclick={clearIdentifier}
							disabled={!identifierEditable}
							title="Clear">✕</button
						>
					</div>
				</div>
				{#if showStoragePreview}
					<div class="text-xs">
						<div class="opacity-70">Stored as (preview):</div>
						<div class="rounded border bg-gray-50 px-2 py-1 font-mono break-all">
							{storagePreview}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	{/if}

	<!-- Drop zone -->
	<div
		class="relative rounded-md border-2 border-dashed bg-white p-4 text-center select-none"
		class:border-indigo-400={dragging}
		class:bg-indigo-50={dragging}
		role="button"
		tabindex="0"
		aria-label="Choose file or drop file"
		onclick={openFileDialog}
		onkeydown={onDropZoneKeyDown}
		ondragover={onDragOver}
		ondragleave={onDragLeave}
		ondrop={onDrop}
	>
		<input
			bind:this={fileInputEl}
			type="file"
			accept={acceptFor(mediaType)}
			onchange={onFileInputChange}
			class="hidden"
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
					<video class="mx-auto max-h-40 w-full" controls src={previewUrl}></video>
				{/if}
				<div class="mt-2 text-xs opacity-70">
					{file?.name} ({Math.round((file?.size || 0) / 1024)} KB)
				</div>
			{:else}
				<div class="text-sm">Drop a file here (image/audio/video) or click to choose…</div>
			{/if}
		</div>
	</div>
	<div class="flex flex-col gap-2">
		<div class="flex items-center gap-3">
			<span class="text-sm">Media type:</span>
			<RadioButton name="mediatype" id="mt1" value="image" bind:selected={mediaType}
				>Image</RadioButton
			>
			<RadioButton name="mediatype" id="mt2" value="audio" bind:selected={mediaType}
				>Audio</RadioButton
			>
			<RadioButton name="mediatype" id="mt3" value="video" bind:selected={mediaType}
				>Video</RadioButton
			>
		</div>

		<div>
			<span class="text-sm">Target file format:</span>
			{#if mediaType === 'image'}
				<RadioButton name="targetfileformat" id="tff1" value="TIFF" bind:selected={targetfileformat}
					>TIFF</RadioButton
				>
				<RadioButton name="targetfileformat" id="tff2" value="J2K" bind:selected={targetfileformat}
					>J2K</RadioButton
				>
				<RadioButton name="targetfileformat" id="tff3" value="JPEG" bind:selected={targetfileformat}
					>JPEG</RadioButton
				>
			{:else if mediaType === 'audio'}
				<RadioButton name="targetfileformat" id="taf1" value="m4a" bind:selected={targetfileformat}
					>m4a</RadioButton
				>
				<RadioButton name="targetfileformat" id="taf2" value="mp3" bind:selected={targetfileformat}
					>mp3</RadioButton
				>
			{:else}
				<RadioButton name="targetfileformat" id="tvf1" value="mp4" bind:selected={targetfileformat}
					>mp4</RadioButton
				>
			{/if}
		</div>
	</div>
	{#snippet no_actions()}{/snippet}
	<Table
		label="User Roles and data permissions"
		description="List of roles assigned to the user and their default data permissions"
		padding={false}
		action_elements={no_actions}
	>
		<TableHeader>
			<TableColumnTitle>Role</TableColumnTitle>
			<TableColumnTitle>Data Permissions</TableColumnTitle>
		</TableHeader>
		<TableBody>
			{#each roles as role (role.roleIri.toString())}
				{@const txt = `${role?.label ? role?.label.get(langobj) : ''} (${m.fromproj()} "${role?.projectShortName}")`}
				<TableRow>
					<TableItem>
						<Checkbox
							label={txt}
							position="right"
							bind:checked={user_roles[role?.roleIri.toString()]}
						></Checkbox>
					</TableItem>
					<TableItem>
						<!-- {user_roles[role?.roleIri.toString()] ? user?.hasRole[role?.roleIri] : '-'} -->
						<select bind:value={selected_dperm[role.roleIri.toString()]}>
							{#each data_permission_list as perm (perm)}
								<option value={perm}>{perm}</option>
							{/each}
						</select>
					</TableItem>
				</TableRow>
			{/each}
		</TableBody>
	</Table>
	{#each get_props() as hasprop (hasprop.property.propertyIri.toString())}
		{@const propname = hasprop.property.propertyIri.toString()}
		{#if hasprop.property?.datatype === XsdDatatypes.xsdString}
			<TextFieldData
				id={hasprop.property?.propertyIri?.fragment?.toString() || 'prop_id'}
				name="prop_name"
				label={hasprop.property?.name?.get(langobj) || hasprop.property?.propertyIri.toString()}
				minCount={hasprop?.minCount || 0}
				maxCount={hasprop?.maxCount || Infinity}
				bind:values={values[propname]}
				bind:this={input_fields[hasprop.property.propertyIri.toString()]}
			/>
		{:else if hasprop.property?.datatype === XsdDatatypes.date && values[propname]}
			<DatePickerData
				id={hasprop.property?.propertyIri?.fragment?.toString() || 'prop_id'}
				name="prop_name"
				label={hasprop.property?.name?.get(langobj) || hasprop.property?.propertyIri.toString()}
				minCount={hasprop?.minCount || 0}
				maxCount={hasprop?.maxCount || Infinity}
				bind:values={values[propname]}
				bind:this={input_fields[hasprop.property.propertyIri.toString()]}
			/>
		{:else if hasprop.property?.datatype === XsdDatatypes.langString && values[propname]}
			<LangstringfieldNew
				id={hasprop.property?.propertyIri?.fragment?.toString() || 'prop_id'}
				name="prop_name"
				placeholder="Enter a value"
				{languages}
				input_type={hasprop.editor === 'dash:TextFieldWithLangEditor' ? 'input' : 'textarea'}
				label={hasprop.property?.name?.get(langobj) || hasprop.property?.propertyIri.toString()}
				bind:value={values[propname]}
			/>
		{:else if hasprop.property?.toClass && hlists[hasprop.property.toClass.toString()]}
			<HlistSelectorData
				id={hasprop.property?.propertyIri?.fragment?.toString() || 'prop_id'}
				name="prop_name"
				label={hasprop.property?.name?.get(langobj) || hasprop.property?.propertyIri.toString()}
				minCount={hasprop?.minCount || 0}
				maxCount={hasprop?.maxCount || Infinity}
				hlist={hlists[hasprop.property.toClass.toString()]}
				bind:values={values[propname]}
				bind:this={input_fields[hasprop.property.propertyIri.toString()]}
			/>
		{/if}
	{/each}
	<!-- Controls -->
	<div class="flex items-center gap-3">
		<button
			type="button"
			class="bg-oldap-button rounded-md border px-3 py-1 text-white disabled:opacity-50"
			onclick={upload}
			disabled={uploading}
		>
			{uploading ? `Uploading… ${uploadProgress}%` : buttonLabel}
		</button>
		<button
			type="button"
			class="rounded-md border bg-white px-3 py-1 disabled:opacity-50"
			onclick={clearFile}
			disabled={uploading || !file}
			title="Clear selected file"
		>
			Clear
		</button>
		{#if uploading}
			<div class="flex-1">
				<div class="h-2 w-full overflow-hidden rounded bg-gray-200">
					<div class="bg-oldap-button h-2" style={`width: ${uploadProgress}%`}></div>
				</div>
			</div>
		{/if}
		{#if statusMsg}
			<div class="text-sm opacity-80">
				{statusMsg.startsWith('Upload complete') ? statusMsg : `ERROR: ${statusMsg}`}
			</div>
		{/if}
	</div>
</div>
