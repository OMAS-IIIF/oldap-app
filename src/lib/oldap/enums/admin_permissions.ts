export enum AdminPermission {
	ADMIN_OLDAP = 'oldap:ADMIN_OLDAP', // Quasi root permission. This user can do everything (**dangerous!**)
	ADMIN_USERS = 'oldap:ADMIN_USERS', // Allows to add/modify/delete users for the project this permission is given for
	ADMIN_PERMISSION_SETS = 'oldap:ADMIN_PERMISSION_SETS', // Allows to add/modify/delete PermissionSets
	ADMIN_RESOURCES = 'oldap:ADMIN_RESOURCES', // Override resources permission for the resources in the given project
	ADMIN_MODEL = 'oldap:ADMIN_MODEL', // Change the data model
	ADMIN_CREATE = 'oldap:ADMIN_CREATE', // Create new resources in the given project
	ADMIN_LISTS = 'oldap:ADMIN_LISTS' // Allows to add/modify/delete lists
}

export function stringToAdminPermission(value: string): AdminPermission | undefined {
	return Object.entries(AdminPermission).find(([_, v]) => v === value)?.[1] as AdminPermission | undefined;
}
