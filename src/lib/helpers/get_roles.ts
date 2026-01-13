/*
 * Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
 */

import { apiClient } from '$lib/shared/apiClient';
import type { AuthInfo } from '$lib/oldap/classes/authinfo';
import { api_get_config } from '$lib/helpers/api_config';
import { OldapRole } from '$lib/oldap/classes/role'; // whatever your type is

export async function fetchRolesForProject(
	authinfo: AuthInfo,
	projectIri: string,
	projectShortName: string,
): Promise<Record<string, OldapRole>> {
	const rolesearch = api_get_config(authinfo, { definedByProject: projectIri });

	const psdata = await apiClient.getAdminrolesearch(rolesearch);

	const roles: Record<string, OldapRole> = {};

	const results = await Promise.all(
		psdata.map((hl) => {
			const config_plistdata = api_get_config(authinfo, { iri: hl });
			return apiClient.getAdminroleget(config_plistdata);
		})
	);

	for (const roledata of results) {
		const role = OldapRole.fromOldapJson(roledata);
		const roleid = role.roleId.toString();
		roles[`${projectShortName}:${roleid}`] = role;
	}

	return roles;
}