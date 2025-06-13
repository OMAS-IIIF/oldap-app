import type { InProject, OldapUser } from '$lib/oldap/classes/user';
import { api_get_config } from '$lib/helpers/api_config';
import { AuthInfo } from '$lib/oldap/classes/authinfo';
import { apiClient } from '$lib/shared/apiClient';
import { errorInfoStore } from '$lib/stores/errorinfo';
import { process_api_error } from '$lib/helpers/process_api_error';
import { AdminPermission } from '$lib/oldap/enums/admin_permissions';
import { OldapProject } from '$lib/oldap/classes/project';

/*
export const getProjectsOfUser = async (authinfo: AuthInfo, administrator: OldapUser) => {
	let all_projects: Record<string, OldapProject> = {};
	const all_projects_iris: string[] = [];
	if (administrator) { // the administrator has to be defined...
		if (administrator.isRoot) {
			const psearch_config = api_get_config(authinfo as AuthInfo);
			try {
				const projs = await apiClient.getAdminprojectsearch(psearch_config);
				projs.forEach(p => {
					if (p.projectIri) {
						all_projects_iris.push(p.projectIri);
					}
				});
			}
			catch (error) {
				errorInfoStore.set(process_api_error(error as Error));
				return;
			}
		}
		else {
			administrator?.inProject?.forEach(in_project => {
				if (in_project.permissions.includes(AdminPermission.ADMIN_USERS)) {
					all_projects_iris.push(in_project.project.toString());
				}
			});
		}
	}
	//
	// now retrieve all projects data from the triplestore
	//
	const promises = all_projects_iris.map(async iri => {
		const config_projectdata = api_get_config(authinfo as AuthInfo, { iri: iri });
		const jsondata = await apiClient.getAdminprojectget(config_projectdata);
		const project = OldapProject.fromOldapJson(jsondata);
		return { iri: project.projectIri.toString(), project };
	});
	try {
		const results = await Promise.all(promises);
		all_projects = Object.fromEntries(results.filter(p => p !== null).map(({ iri, project }) => [iri, project]));
	}
	catch (error) {
		errorInfoStore.set(process_api_error(error as Error));
		return;
	}
	return all_projects;
}
 */

export const getProjectsOfUser = async (authinfo: AuthInfo, administrator: OldapUser) => {
	if (!administrator) return {};

	let all_projects_iris: string[] = [];

	if (administrator.isRoot) {
		const projs = await apiClient.getAdminprojectsearch(api_get_config(authinfo));
		all_projects_iris = projs
			.map(p => p.projectIri)
			.filter((iri): iri is string => !!iri);
	} else {
		all_projects_iris = (administrator.inProject || [] as InProject[])
			.filter(p => p.permissions.includes(AdminPermission.ADMIN_USERS))
			.map(p => p.project.toString());
	}

	const project_promises = all_projects_iris.map(async iri => {
		const jsondata = await apiClient.getAdminprojectget(api_get_config(authinfo, { iri }));
		const project = OldapProject.fromOldapJson(jsondata);
		return [project.projectIri.toString(), project] as const;
	});

	const results = await Promise.all(project_promises);
	return Object.fromEntries(results);
};