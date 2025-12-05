/*
 * Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
 */

import { getConfig, type AppConfig } from '$lib/config';
import type { LayoutLoad } from './$types';

export const load = (async ({ fetch }) => {
	const config = await getConfig(fetch);
	return { config };
}) satisfies LayoutLoad<{ config: AppConfig }>;