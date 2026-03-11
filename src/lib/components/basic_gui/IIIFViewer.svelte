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
		/** Use OpenSeadragon's built-in toolbar controls (can cause stacking issues in windowed UIs) */
		useDefaultControls?: boolean;
		/** Show local custom controls below the viewer */
		showLocalControls?: boolean;
	};

	let {
		baseUrl,
		token,
		width = '100%',
		height = '100%',
		prefixUrl = 'https://openseadragon.github.io/openseadragon/images/',
		useDefaultControls = false,
		showLocalControls = true
	}: IIIFViewerProps = $props();

	let containerEl: HTMLDivElement | null = null;
	let viewer:
		| {
				destroy: () => void;
				viewport?: {
					zoomBy?: (factor: number) => void;
					applyConstraints?: () => void;
					goHome?: () => void;
					getRotation?: () => number;
					setRotation?: (degrees: number) => void;
				};
		  }
		| null = null;
	let initError = $state<string | null>(null);
	let lastInitKey: string | null = null;

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
			const currentInitKey = JSON.stringify({
				infoJsonUrl,
				prefixUrl,
				useDefaultControls
			});

			// Prevent unnecessary re-creation on parent/window re-renders.
			// Recreating the viewer resets zoom/pan state.
			if (viewer && lastInitKey === currentInitKey) {
				return;
			}

			initError = null;
			viewer?.destroy();
			viewer = OpenSeadragon({
				element: containerEl,
				prefixUrl,
				tileSources: [infoJsonUrl],
				showNavigationControl: useDefaultControls,
				showFullPageControl: false,
				showHomeControl: useDefaultControls,
				showZoomControl: useDefaultControls,
				showRotationControl: useDefaultControls
			});
			lastInitKey = currentInitKey;
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
		useDefaultControls;
		void initViewer();
	});

	onDestroy(() => {
		viewer?.destroy();
		viewer = null;
		lastInitKey = null;
	});

	function zoomIn() {
		viewer?.viewport?.zoomBy?.(1.25);
		viewer?.viewport?.applyConstraints?.();
	}

	function zoomOut() {
		viewer?.viewport?.zoomBy?.(0.8);
		viewer?.viewport?.applyConstraints?.();
	}

	function resetView() {
		viewer?.viewport?.goHome?.();
		viewer?.viewport?.applyConstraints?.();
	}

	function rotateLeft() {
		const current = viewer?.viewport?.getRotation?.() ?? 0;
		viewer?.viewport?.setRotation?.(current - 90);
	}

	function rotateRight() {
		const current = viewer?.viewport?.getRotation?.() ?? 0;
		viewer?.viewport?.setRotation?.(current + 90);
	}

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
	<div class="iiif-viewer" class:with-controls={showLocalControls} bind:this={containerEl}></div>
	{#if showLocalControls}
		<div class="iiif-controls">
			<button type="button" class="iiif-btn" onclick={zoomOut}>-</button>
			<button type="button" class="iiif-btn" onclick={zoomIn}>+</button>
			<button type="button" class="iiif-btn" onclick={resetView}>Home</button>
			<button type="button" class="iiif-btn" onclick={rotateLeft}>⟲</button>
			<button type="button" class="iiif-btn" onclick={rotateRight}>⟳</button>
		</div>
	{/if}
	{#if initError}
		<div class="iiif-viewer-error">{initError}</div>
	{/if}
</div>

<style>
	.iiif-viewer-wrapper {
		position: relative;
		min-width: 120px;
		min-height: 120px;
		overflow: hidden;
		contain: paint;
	}

	.iiif-viewer {
		width: 100%;
		height: 100%;
		background: #111;
		position: relative;
		overflow: hidden;
	}

	.iiif-viewer.with-controls {
		height: calc(100% - 2.25rem);
	}

	.iiif-controls {
		height: 2.25rem;
		display: flex;
		gap: 0.35rem;
		align-items: center;
		padding: 0.25rem 0.35rem;
		background: #f5f5f5;
		border-top: 1px solid #ddd;
	}

	.iiif-btn {
		border: 1px solid #ccc;
		background: #fff;
		border-radius: 0.35rem;
		padding: 0.15rem 0.45rem;
		font-size: 0.8rem;
		cursor: pointer;
	}

	.iiif-btn:hover {
		background: #f0f0f0;
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

	.iiif-viewer :global(.openseadragon-container),
	.iiif-viewer :global(.openseadragon-canvas),
	.iiif-viewer :global(.openseadragon-canvas canvas) {
		position: absolute !important;
		inset: 0 !important;
		z-index: 0 !important;
	}

	.iiif-viewer :global(.openseadragon-container > div) {
		z-index: 0 !important;
	}
</style>
