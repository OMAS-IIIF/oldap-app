import { Iri } from '$lib/oldap/datatypes/xsd_iri';
import { OldapObject } from '$lib/oldap/classes/object';
import { NCName } from '$lib/oldap/datatypes/xsd_ncname';
import { QName } from '$lib/oldap/datatypes/xsd_qname';
import { AdminPermission, stringToAdminPermission } from '$lib/oldap/enums/admin_permissions';
import { OldapErrorInvalidValue } from '$lib/oldap/errors/OldapErrorInvalidValue';


export interface InProject {
	project: Iri;
	permissions: AdminPermission[]
}

export class OldapUser extends OldapObject {
	#userIri: Iri;
	#userId: NCName;
	isActive?: boolean;
	familyName: string;
	givenName: string;
	email: string;
	inProject?: InProject[];
	hasPermissions?: QName[];
	isRoot: boolean;

	constructor(creator: Iri,
							created: Date,
							contributor: Iri,
							modified: Date,
							userIri: Iri,
							userId: NCName,
							familyName: string,
							givenName: string,
							email: string,
							isActive?: boolean,
							inProject?: InProject[],
							hasPermissions?: QName[],
							isRoot: boolean = false) {
		super(creator, created, contributor, modified);
		this.#userIri = userIri;
		this.#userId = userId;
		this.familyName = familyName;
		this.givenName = givenName;
		this.email = email;
		this.isActive = isActive;
		this.inProject = inProject;
		this.hasPermissions = hasPermissions;
		this.isRoot = isRoot;
	}

	get userIri() {
		return this.#userIri;
	}

	get userId() {
		return this.#userId;
	}

	static fromOldapJson(json: any): OldapUser {
		const creator = new Iri(json.creator);
		const created = new Date(json.created);
		const contributor = new Iri(json.contributor);
		const modified = new Date(json.modified);
		const userIri = new Iri(json.userIri);
		const userId = new NCName(json.userId);
		const familyName = json.family_name;
		const givenName = json.given_name;
		const email = json.email;
		const is_active = json?.isActive;

		let in_project: InProject[] | undefined = undefined;
		if (json?.in_projects) {
			if (Array.isArray(json.in_projects)) {
				in_project = json.in_projects.map((item: {project: string, permissions: string[]}): InProject => {
					const permissions = item.permissions.map((x) => (stringToAdminPermission(x)))
					if (permissions === undefined) {
						throw new OldapErrorInvalidValue(`${json?.in_permissions} is not a valid AdminPermission`);
					}
					return {
						project: new Iri(item.project),
						permissions: permissions as AdminPermission[],
					}
				});
			}
		}
		const has_permissions: QName[] | undefined = json?.has_permissions.map((x: string) => (QName.createQName(x)));

		let isRoot = false
		in_project?.forEach((in_project: InProject) => {
			if ((in_project.project.toString() === 'oldap:SystemProject') && in_project.permissions.includes(AdminPermission.ADMIN_OLDAP)) {
				isRoot = true;
			}
		});

		return new OldapUser(
			creator,
			created,
			contributor,
			modified,
			userIri,
			userId,
			familyName,
			givenName,
			email,
			is_active,
			in_project,
			has_permissions,
			isRoot);
	}
}