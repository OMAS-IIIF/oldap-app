import { OldapObject } from '$lib/oldap/classes/object';
import { NCName } from '$lib/oldap/datatypes/xsd_ncname';
import { Iri } from '$lib/oldap/datatypes/xsd_iri';
import { DataPermission, stringToDataPermission } from '$lib/oldap/enums/data_permissions';
import { LangString } from '$lib/oldap/datatypes/langstring';
import { OldapErrorInconsistency } from '$lib/oldap/errors/OldapErrorInconsistency';

export class OldapPermissionSet extends OldapObject {
	readonly #permissionSetIri: Iri;
	readonly #permissionSetId: NCName;
	readonly #definedByProject: Iri;
	givesPermission: DataPermission;
	label?: LangString;
	comment?: LangString;
	projectShortName?: string; // for internal use, is not given by RESTFul API (oldaplib/oldap-api)
	checked?: boolean;

	constructor(creator: Iri,
							created: Date,
							contributor: Iri,
							modified: Date,
							permissionSetIri: Iri,
							permissionSetId: NCName,
							definedByProject: Iri,
							givesPermission: DataPermission,
							label?: LangString,
							comment?: LangString) {
		super(creator, created, contributor, modified);
		this.#permissionSetIri = permissionSetIri;
		this.#permissionSetId = permissionSetId;
		this.#definedByProject = definedByProject;
		this.givesPermission = givesPermission;
		this.label = label;
		this.comment = comment;
	}

	get permissionSetIri() {
		return this.#permissionSetIri;
	}

	get permissionSetIriAsString() {
		return this.#permissionSetIri.toLocaleString();
	}

	get permissionSetId() {
		return this.#permissionSetId;
	}

	get definedByProject() {
		return this.#definedByProject;
	}

	static fromOldapJson(json: any): OldapPermissionSet {
		const creator = new Iri(json.creator);
		const created = new Date(json.created);
		const contributor = new Iri(json.contributor);
		const modified = new Date(json.modified);
		const permissionSetIri = new Iri(json.permissionSetIri);
		const permissionSetId = new NCName(json.permissionSetId);
		const definedByProject = new Iri(json.definedByProject);
		const givesPermission = stringToDataPermission(json.givesPermission);
		//const label = jsonToLangString(json?.label);
		const label = LangString.fromJson(json?.label);
		//const comment = jsonToLangString(json?.comment);
		const comment = LangString.fromJson(json?.comment);

		if (!givesPermission) {
			throw new OldapErrorInconsistency("No permission in permission set.");
		}
		return new OldapPermissionSet(creator, created, contributor, modified, permissionSetIri,
			permissionSetId, definedByProject, givesPermission, label, comment);
	}
}