/*
 * Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
 */

import { apiClient } from '$lib/shared/apiClient';
import type { AuthInfo } from '$lib/oldap/classes/authinfo';
import { api_get_config } from '$lib/helpers/api_config';
import { OldapPermissionSet } from '$lib/oldap/classes/permissionset'; // whatever your type is

export async function fetchPermissionSetsForProject(
	authinfo: AuthInfo,
	projectIri: string,
	projectShortName: string,
): Promise<Record<string, OldapPermissionSet>> {
	const permsetsearch = api_get_config(authinfo, { definedByProject: projectIri });

	const psdata = await apiClient.getAdminpermissionsetsearch(permsetsearch);

	const permsets: Record<string, OldapPermissionSet> = {};

	const results = await Promise.all(
		psdata.map((hl) => {
			const config_plistdata = api_get_config(authinfo, { iri: hl });
			return apiClient.getAdminpermissionsetget(config_plistdata);
		})
	);

	for (const permsetdata of results) {
		const permset = OldapPermissionSet.fromOldapJson(permsetdata);
		const permsetid = permset.permissionSetId.toString();
		permsets[`${projectShortName}:${permsetid}`] = permset;
	}

	return permsets;
}