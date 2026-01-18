/*
 * Copyright (©) 2026. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
 */

import { writable, type Writable } from 'svelte/store';
import type { WindowData, WindowGeometry } from '$lib/helpers/WindowData';
import type { Snippet } from 'svelte';

export const windowsStore: Writable<WindowData[]> = writable<WindowData[]>([]);

export function createWindow(
	windowTitle: string,
	content: Snippet,
	windowGeometry: WindowGeometry,
	movable: boolean = true,
	resizable: boolean = true,
	closable: boolean = true,
	minimizable: boolean = true,
	icon?: string,
	minWidth?: number,
	minHeight?: number
) {
	const win: WindowData = {
		windowId: crypto.randomUUID(),
		windowTitle: windowTitle,
		windowGeometry: windowGeometry,
		movable: movable,
		resizable: resizable,
		closable: closable,
		minimizable: minimizable,
		icon: icon,
		minWidth: minWidth,
		minHeight: minHeight,
		content: content
	};
	windowsStore.update((windows) => [...windows, win]);
}

export function closeWindow(id: string) {
	windowsStore.update((ws) => ws.filter((w) => w.windowId !== id));
}

export function setActive(id: string) {
	windowsStore.update((ws) => {
		const idx = ws.findIndex((w) => w.windowId === id);
		if (idx === -1) return ws;
		const w = ws[idx];
		return [...ws.slice(0, idx), ...ws.slice(idx + 1), w];
	});
}

export function updatePos(id: string, pos: { x: number; y: number }) {
	const { x, y } = pos;

	windowsStore.update((ws) =>
		ws.map((w) => (w.windowId === id ? { ...w, windowGeometry: { ...w.windowGeometry, x, y } } : w))
	);
}

export function updateSize(id: string, geom: WindowGeometry) {
	windowsStore.update((ws) =>
		ws.map((w) =>
			w.windowId === id ? { ...w, windowGeometry: { ...w.windowGeometry, ...geom } } : w
		)
	);
}
