<script lang="ts">

	import Button from '$lib/components/basic_gui/buttons/Button.svelte';
	import { Circle2 } from 'svelte-loading-spinners';
	import { spinnerStore } from '$lib/stores/spinner';

	export type UploadFunc =  (f: File) => undefined

	let { filexts, do_upload } : { filexts? : string[], do_upload: UploadFunc} = $props();

	let selectedFile = $state<File | null>(null);
	let isDragging = $state(false);
	let errorMsg = $state<string | null>(null);

	function isYamlFile(file: File): boolean {
		return file.name.endsWith(".yaml");
	}

	function handleFile(file: File) {
		if (!isYamlFile(file)) {
			errorMsg = "Only .yaml files are allowed.";
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
			console.log("✅ YAML file selected:", selectedFile.name);
			// you could upload it here
		}
	});

	function upload() {
		if (selectedFile) {
			spinnerStore.set(`UPLOADING ${selectedFile?.name}`);
			do_upload(selectedFile);
		}
	}

</script>


<div
	class="border-2 border-dashed rounded p-6 text-center cursor-pointer transition-all"
	class:opacity-50={isDragging}
	class:border-blue-500={isDragging}
	ondrop={handleDrop}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	role="group" aria-label="File upload dropzone"
>
	<p class="text-sm text-gray-600 mb-2">
		{#if selectedFile}
			<strong>{selectedFile.name}</strong> selected
		{:else}
			Drag & drop a <code>{filexts ? filexts.join(", ") : ''}</code> file here or
		{/if}
	</p>

	<label class="text-blue-600 underline cursor-pointer">
		<input type="file" class="hidden" accept={filexts ? filexts.join(", ") : ''} onchange={handleInputChange} />
		browse
	</label>

	{#if errorMsg}
		<p class="text-red-600 mt-2">{errorMsg}</p>
	{/if}
	{#if selectedFile}
		<Button onclick={upload}>UPLOAD</Button>
	{/if}
</div>
