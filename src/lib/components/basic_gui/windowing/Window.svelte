<!--
  - Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
-->

<script lang="ts">
	import { onMount, onDestroy, setContext } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { WindowGeometry } from '$lib/helpers/WindowData';

	// Module-scoped z-index counter shared by all window instances
	let nextZIndex = 1000;

	// ---- Event API (now callbacks passed via props) ----
	type WindowCallbacks = {
		onClose?: () => void;
		onActivate?: () => void;
		onMove?: (pos: { x: number; y: number }) => void;
		onResize?: (geom: WindowGeometry) => void;
	};

	let {
		/** Content of the window */
		children,

		/** Initial geometry (px) */
		windowGeometry = { x: 100, y: 100, width: 400, height: 300 },

		/** Min width/height (px) */
		minWidth = 200,
		minHeight = 120,

		/** Window title */
		title = 'Window',

		/** Behavior toggles */
		movable = true,
		resizable = true,
		closable = true,

		/** Callbacks (replaces createEventDispatcher) */
		onClose,
		onActivate,
		onMove,
		onResize
	}: {
		children?: Snippet;
		windowGeometry?: WindowGeometry;
		minWidth?: number;
		minHeight?: number;
		title?: string;
		movable?: boolean;
		resizable?: boolean;
		closable?: boolean;
	} & WindowCallbacks = $props();

	// Internal reactive state (Svelte 5 runes)
	let posX = $derived(windowGeometry.x);
	let posY = $derived(windowGeometry.y);
	let w = $derived(windowGeometry.width);
	let h = $derived(windowGeometry.height);
	let z = $state(++nextZIndex);
	let active = $state(false);
	let rootEl: HTMLDivElement | null = null;

	// Keep external prop changes in sync (controlled usage)
	$effect(() => {
		posX = windowGeometry.x;
		posY = windowGeometry.y;
		w = windowGeometry.width;
		h = windowGeometry.height;
	});

	onMount(() => {
		bringToFront();
		rootEl?.focus?.();
	});

	function bringToFront() {
		z = ++nextZIndex;
		active = true;
		onActivate?.();
	}

	// ---- Dragging logic ----
	let dragStartX = 0;
	let dragStartY = 0;
	let startPosX = 0;
	let startPosY = 0;

	function onTitlePointerDown(e: PointerEvent) {
		if (!movable) return;
		// Don't start dragging when interacting with controls inside the title bar (e.g. close button)
		const targetEl = e.target as HTMLElement | null;
		if (targetEl?.closest('button, a, input, select, textarea, [role="button"]')) return;
		(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
		if (e.button !== 0) return; // only left button
		bringToFront();
		e.preventDefault();
		dragStartX = e.clientX;
		dragStartY = e.clientY;
		startPosX = posX;
		startPosY = posY;
		window.addEventListener('pointermove', onDragMove);
		window.addEventListener('pointerup', onDragEnd, { once: true });
	}

	function onDragMove(e: PointerEvent) {
		const dx = e.clientX - dragStartX;
		const dy = e.clientY - dragStartY;
		posX = startPosX + dx;
		posY = startPosY + dy;
		onMove?.({ x: posX, y: posY });
	}

	function onDragEnd() {
		window.removeEventListener('pointermove', onDragMove);
	}

	// ---- Resizing logic (corners) ----
	type Corner = 'nw' | 'ne' | 'sw' | 'se';
	let resizeCorner: Corner | null = null;
	let rsStartX = 0;
	let rsStartY = 0;
	let rsStartW = 0;
	let rsStartH = 0;
	let rsStartPosX = 0;
	let rsStartPosY = 0;

	function onResizePointerDown(corner: Corner, e: PointerEvent) {
		if (!resizable) return;
		(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
		if (e.button !== 0) return; // only left button
		bringToFront();
		e.stopPropagation();
		resizeCorner = corner;
		rsStartX = e.clientX;
		rsStartY = e.clientY;
		rsStartW = w;
		rsStartH = h;
		rsStartPosX = posX;
		rsStartPosY = posY;
		window.addEventListener('pointermove', onResizeMove);
		window.addEventListener('pointerup', onResizeEnd, { once: true });
	}

	function onResizeMove(e: PointerEvent) {
		if (!resizeCorner) return;
		const dx = e.clientX - rsStartX;
		const dy = e.clientY - rsStartY;

		let newW = rsStartW;
		let newH = rsStartH;
		let newX = rsStartPosX;
		let newY = rsStartPosY;

		if (resizeCorner.includes('e')) newW = Math.max(minWidth, rsStartW + dx);
		if (resizeCorner.includes('s')) newH = Math.max(minHeight, rsStartH + dy);
		if (resizeCorner.includes('w')) {
			const tempW = Math.max(minWidth, rsStartW - dx);
			newX = rsStartPosX + (rsStartW - tempW);
			newW = tempW;
		}
		if (resizeCorner.includes('n')) {
			const tempH = Math.max(minHeight, rsStartH - dy);
			newY = rsStartPosY + (rsStartH - tempH);
			newH = tempH;
		}

		w = newW;
		h = newH;
		posX = newX;
		posY = newY;
		onResize?.({ x: posX, y: posY, width: w, height: h });
	}

	function onResizeEnd() {
		window.removeEventListener('pointermove', onResizeMove);
		resizeCorner = null;
	}

	function onActivateSelf(e: PointerEvent) {
		// Activate the window only when clicking on non-interactive areas.
		// Interactive elements handle their own pointer events.
		const targetEl = e.target as HTMLElement | null;
		if (targetEl?.closest('button, a, input, select, textarea, [role="button"]')) return;
		bringToFront();
		rootEl?.focus?.();
	}

	function onCloseSelf() {
		onClose?.();
	}

	function onCloseClick(e: MouseEvent) {
		e.stopPropagation();
		onCloseSelf();
	}

	// Safety: if a pointerup never fires (tab switch etc.), ensure cleanup
	onDestroy(() => {
		window.removeEventListener('pointermove', onDragMove);
		window.removeEventListener('pointermove', onResizeMove);
	});

	setContext('window', {
		close: onCloseSelf
		// you can add later: activate: bringToFront, etc.
	});
</script>

<div
	class="absolute bg-[var(--window-bg,#fff)] border rounded-lg overflow-hidden select-none shadow-lg focus:outline-none border-[color:var(--window-border,#c9c9c9)]"
	class:shadow-2xl={active}
	class:border-[color:var(--window-border-active,#7aa7ff)]={active}
	bind:this={rootEl}
	onpointerdown={(e) => onActivateSelf(e)}
	style="left: {posX}px; top: {posY}px; width: {w}px; height: {h}px; z-index: {z};"
	role="dialog"
	tabindex="0"
	aria-label={title}
>
	<div
		class="h-9 flex items-center justify-between gap-2 px-2 bg-gradient-to-b from-[var(--titlebar-bg1,#f6f7fb)] to-[var(--titlebar-bg2,#e9ecf6)] border-b border-[color:var(--window-border,#c9c9c9)] cursor-move"
		onpointerdown={onTitlePointerDown}
        role="none"
	>
		<div class="text-[0.95rem] font-semibold truncate text-[color:var(--title-fg,#222)]">{title}</div>
		{#if closable}
			<button
				class="w-7 h-7 grid place-items-center rounded-md bg-transparent text-gray-600 text-[18px] leading-none cursor-pointer hover:bg-slate-100"
				aria-label="Close window"
				onpointerdown={(e) => e.stopPropagation()}
				onmousedown={(e) => e.stopPropagation()}
				onclick={onCloseClick}
			>×</button>
		{/if}
	</div>
	<div class="w-full h-[calc(100%-36px)] overflow-auto">
		{@render children?.()}
	</div>

	{#if resizable}
		<!-- Corner resize handles -->
		<div class="absolute w-3.5 h-3.5 bg-transparent -left-0.5 -top-0.5 cursor-[nwse-resize]" role="none" onpointerdown={(e) => onResizePointerDown('nw', e)}></div>
		<div class="absolute w-3.5 h-3.5 bg-transparent -right-0.5 -top-0.5 cursor-[nesw-resize]" role="none" onpointerdown={(e) => onResizePointerDown('ne', e)}></div>
		<div class="absolute w-3.5 h-3.5 bg-transparent -left-0.5 -bottom-0.5 cursor-[nesw-resize]" role="none" onpointerdown={(e) => onResizePointerDown('sw', e)}></div>
		<div class="absolute w-3.5 h-3.5 bg-transparent -right-0.5 -bottom-0.5 cursor-[nwse-resize]" role="none" onpointerdown={(e) => onResizePointerDown('se', e)}></div>
	{/if}
</div>