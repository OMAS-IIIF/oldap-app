
export enum DataPermission {
	DATA_RESTRICTED = 'oldap:DATA_RESTRICTED', // Allow only restricted view of resource data which means that "restricted" fields are not visible
	DATA_VIEW = 'oldap:DATA_VIEW', // Allow full view of resource data
	DATA_EXTEND = 'oldap:DATA_EXTEND', // Allow to *add* data items to the resource
	DATA_UPDATE = 'oldap:DATA_UPDATE', // Allow to *add/modify/delete* data fields of resource
	DATA_DELETE = 'oldap:DATA_DELETE', // Allow to delete complete resource
	DATA_PERMISSIONS = 'oldap:DATA_PERMISSIONS' // Allow to modify permissions of resource
}

export function stringToDataPermission(value: string | null): DataPermission | undefined {
	if (value === null) return undefined;
	if (!value.startsWith('oldap:')) value = `oldap:${value}`;
	return Object.entries(DataPermission).find(([_, v]) => v === value)?.[1] as DataPermission | undefined;
}

export function dataPermissionAsString(value: DataPermission) {
	const name = Object.keys(DataPermission).find(
		key => DataPermission[key as keyof typeof DataPermission] === value
	);
	return name;
}

export function strippedDataPermission() {
	return Object.values(DataPermission).map(
		value => value.replace(/^oldap:/, '')
	);
}


