/*
 * Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
 */

import type { OldapUser } from '$lib/oldap/classes/user';
import { AuthInfo } from '$lib/oldap/classes/authinfo';
import { api_config } from '$lib/helpers/api_config';
import { apiClient } from '$lib/shared/apiClient';
import { process_api_error } from '$lib/helpers/process_api_error';
import { OldapProject } from '$lib/oldap/classes/project';

export const read_projects = async (user?: OldapUser | null, authinfo?: AuthInfo | null) => {
	if (!user || !authinfo) {
		return {};
	}

	//
	// first we search the projects (if user is not root, only the projects the user is member of,
	// if the user is rppot, then we search all available projects.
	//
	let project_iris: string[] | undefined;
	if (user.isRoot) {
		const all_projects_config = api_config(authinfo);
		try {
			const res = await apiClient.getAdminprojectsearch(all_projects_config);
			project_iris = res.map((item) => item.projectIri) as string[] | undefined;
		} catch (err) {
			process_api_error(err as Error);
		}
	} else {
		project_iris = user.inProject?.map((x) => x.project.toString());
	}
	//
	// now we get the full project data for each project
	//
	const projs: Record<string, OldapProject> = {};
	for (const iri of project_iris || []) {
		const config_projectiri = api_config(authinfo, undefined, { iri: iri });
		try {
			const proj_data = await apiClient.getAdminprojectget(config_projectiri);
			const project = OldapProject.fromOldapJson(proj_data);
			projs[project.projectShortName.toString()] = project;
		} catch (err) {
			process_api_error(err as Error);
		}
	}
	return projs;
};
