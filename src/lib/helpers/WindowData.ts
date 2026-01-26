/*
 * Copyright (©) 2026. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
 */


import type { Snippet } from 'svelte';

export type WindowGeometry = {
	x: number;
	y: number;
	width: number;
	height: number;
}

export type WindowData = {
	windowId: string;
	windowTitle: string;
	content: Snippet
	windowGeometry: WindowGeometry;
	movable: boolean;
	resizable: boolean;
	closable: boolean;
	minimizable: boolean;
	icon?: string;
	minWidth?: number;
	minHeight?: number;
	closer?: () => void;
}