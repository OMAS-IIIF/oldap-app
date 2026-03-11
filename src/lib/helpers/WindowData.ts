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

export type WindowSnippet =
	| Snippet<[]>
	| Snippet<[any]>
	| Snippet<[any, any]>
	| Snippet<[any, any, any]>;

export type WindowSnippetArgs =
	| []
	| [unknown]
	| [unknown, unknown]
	| [unknown, unknown, unknown];

export type WindowData = {
	windowId: string;
	windowTitle: string;
	zIndex: number;
	content: WindowSnippet;
	contentArgs?: WindowSnippetArgs;
	windowGeometry: WindowGeometry;
	movable: boolean;
	resizable: boolean;
	closable: boolean;
	minimizable: boolean;
	icon?: string;
	minWidth?: number;
	minHeight?: number;
	closer?: (wid: string) => void;
}
