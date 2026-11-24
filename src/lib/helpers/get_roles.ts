/*
 * Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
 */

import { apiClient } from '#lib/shared/apiClient.ts';
import type { AuthInfo } from '#lib/oldap/classes/authinfo.ts';
import { api_get_config } from '#lib/helpers/api_config.ts';
import { OldapRole } from '#lib/oldap/classes/role.ts'; // whatever your type is

export async function fetchRolesForProject(
	authinfo: AuthInfo,
	projectIri: string,
	projectShortName: string,
): Promise<OldapRole[]> {
	const rolesearch = api_get_config(authinfo, { definedByProject: projectIri });
	const psdata = await apiClient.getAdminRoleSearch(rolesearch);

	const roles: Record<string, OldapRole> = {};

	const results = await Promise.all(
		psdata.map((hl) => {
			const config_plistdata = api_get_config(authinfo, { iri: hl });
			return apiClient.getAdminRoleGet(config_plistdata);
		})
	);

	const _roles = results.map(r => OldapRole.fromOldapJson(r));
	return _roles

}