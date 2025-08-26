/*
 * Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
 */
import type { PageLoad } from './$types';

export const load: PageLoad = ({url, params}) => {
	return {resiri: params.resiri};
};

