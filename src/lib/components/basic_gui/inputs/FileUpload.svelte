<script lang="ts">

	import Button from '$lib/components/basic_gui/buttons/Button.svelte';
	import { spinnerStore } from '$lib/stores/spinner';
	import * as m from '$lib/paraglide/messages';

	export type UploadFunc =  (f: File) => undefined

	let { filexts, do_upload } : { filexts? : string[], do_upload: UploadFunc} = $props();

	let selectedFile = $state<File | null>(null);
	let isDragging = $state(false);
	let errorMsg = $state<string | null>(null);

	function hasValidExtension(file: File): boolean {
		let res = false;
		filexts?.forEach(filext => {
			if (file.name.endsWith(filext)) {
				res = true;
			}
		})
		return res;
	}

	function handleFile(file: File) {
		if (!hasValidExtension(file)) {
			const filexts_str = filexts?.join('", "');
			errorMsg = m.file_ext_err({exts: filexts_str || ''});
			selectedFile = null;
			return;
		}
		selectedFile = file;
		errorMsg = null;
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
		const file = event.dataTransfer?.files?.[0];
		if (file) handleFile(file);
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function handleInputChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) handleFile(file);
	}

	$effect(() => {
		if (selectedFile) {
			console.log("✅ File selected:", selectedFile.name);
			// you could upload it here
		}
	});

	function upload() {
		if (selectedFile) {
			spinnerStore.set(m.uploading({fname: selectedFile?.name}));
			do_upload(selectedFile);
		}
	}

</script>


<div
	class="oldap-upload"
	class:opacity-50={isDragging}
	class:border-blue-500={isDragging}
	ondrop={handleDrop}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	role="group" aria-label="File upload dropzone"
>
	<p class="oldap-upload-file-selected">
		{#if selectedFile}
			<strong>{selectedFile.name}</strong> selected
		{:else}
			Drag & drop a "<code>{filexts ? filexts.join(", ") : ''}</code>" file here or
		{/if}
	</p>

	<label class="text-oldap-link dark:text-oldap-link-dark underline cursor-pointer">
		<input type="file" class="hidden" accept={filexts ? filexts.join(", ") : ''} onchange={handleInputChange} />
		browse
	</label>

	{#if errorMsg}
		<p class="text-red-600 mt-2">{errorMsg}</p>
	{/if}
	{#if selectedFile}
		<Button onclick={upload}>{m.upload()}</Button>
	{/if}
</div>
