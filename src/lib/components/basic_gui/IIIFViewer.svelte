<!--
  - Copyright (©) 2026. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
-->

<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	type IIIFViewerProps = {
		/** IIIF image base URL, e.g. https://media.oldap.org/iiif/3/imageid */
		baseUrl: string;
		/** Optional auth token appended as query param to info.json */
		token?: string | null;
		/** Viewer width (number => px, or CSS string like "100%" / "40rem") */
		width?: string | number;
		/** Viewer height (number => px, or CSS string like "100%" / "30rem") */
		height?: string | number;
		/** OpenSeadragon toolbar/button icon base URL (not IIIF data) */
		prefixUrl?: string;
	};

	let {
		baseUrl,
		token,
		width = '100%',
		height = '100%',
		prefixUrl = 'https://openseadragon.github.io/openseadragon/images/'
	}: IIIFViewerProps = $props();

	let containerEl: HTMLDivElement | null = null;
	let viewer: { destroy: () => void } | null = null;
	let initError = $state<string | null>(null);

	function cssSize(value: string | number): string {
		return typeof value === 'number' ? `${value}px` : value;
	}

	function createInfoJsonUrl(inputBaseUrl: string, tkn?: string | null): string {
		const normalized = inputBaseUrl.replace(/\/+$/, '');
		const url = new URL(`${normalized}/info.json`);
		if (tkn && tkn.trim().length > 0) {
			url.searchParams.set('token', tkn.trim());
		}
		return url.toString();
	}

	async function initViewer() {
		if (!containerEl) return;
		if (!baseUrl || baseUrl.trim().length === 0) {
			initError = 'IIIF baseUrl is required.';
			return;
		}

		try {
			const module = await import('openseadragon');
			const OpenSeadragon = module.default;
			const infoJsonUrl = createInfoJsonUrl(baseUrl, token);

			initError = null;
			viewer?.destroy();
			viewer = OpenSeadragon({
				element: containerEl,
				prefixUrl,
				tileSources: [infoJsonUrl],
				showNavigationControl: true,
				showFullPageControl: true,
				showHomeControl: true,
				showZoomControl: true,
				showRotationControl: true
			});
		} catch (error) {
			console.error('Failed to initialize OpenSeadragon viewer', error);
			initError = 'OpenSeadragon could not be initialized.';
		}
	}

	onMount(() => {
		void initViewer();
	});

	$effect(() => {
		baseUrl;
		token;
		prefixUrl;
		void initViewer();
	});

	onDestroy(() => {
		viewer?.destroy();
		viewer = null;
	});

	/*
	Usage example:
	<IIIFViewer
		baseUrl="https://media.oldap.org/iiif/3/imageid"
		token="x6Df..."
		width={800}
		height={500}
	/>
	*/
</script>

<div class="iiif-viewer-wrapper" style={`width:${cssSize(width)};height:${cssSize(height)};`}>
	<div class="iiif-viewer" bind:this={containerEl}></div>
	{#if initError}
		<div class="iiif-viewer-error">{initError}</div>
	{/if}
</div>

<style>
	.iiif-viewer-wrapper {
		position: relative;
		min-width: 120px;
		min-height: 120px;
	}

	.iiif-viewer {
		width: 100%;
		height: 100%;
		background: #111;
	}

	.iiif-viewer-error {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		padding: 0.75rem;
		background: rgba(255, 255, 255, 0.9);
		color: #8b0000;
		font-size: 0.9rem;
		text-align: center;
	}
</style>
