import { OldapObject } from '$lib/oldap/classes/object';
import { NCName } from '$lib/oldap/datatypes/xsd_ncname';
import { Iri } from '$lib/oldap/datatypes/xsd_iri';
import { DataPermission, stringToDataPermission } from '$lib/oldap/enums/data_permissions';
import { LangString } from '$lib/oldap/datatypes/langstring';
import { OldapErrorInconsistency } from '$lib/oldap/errors/OldapErrorInconsistency';

export class OldapRole extends OldapObject {
	readonly #roleIri: Iri;
	readonly #roleId: NCName;
	readonly #definedByProject: Iri;
	label?: LangString;
	comment?: LangString;
	projectShortName?: string; // for internal use, is not given by RESTFul API (oldaplib/oldap-api)
	checked?: boolean;

	constructor(creator: Iri,
							created: Date,
							contributor: Iri,
							modified: Date,
							roleIri: Iri,
							roleId: NCName,
							definedByProject: Iri,
							label?: LangString,
							comment?: LangString) {
		super(creator, created, contributor, modified);
		this.#roleIri = roleIri;
		this.#roleId = roleId;
		this.#definedByProject = definedByProject;
		this.label = label;
		this.comment = comment;
	}

	get roleIri() {
		return this.#roleIri;
	}

	get roleIriAsString() {
		return this.#roleIri.toLocaleString();
	}

	get roleId() {
		return this.#roleId;
	}

	get definedByProject() {
		return this.#definedByProject;
	}

	static fromOldapJson(json: any): OldapRole {
		console.log("ROLE::", json);
		const creator = new Iri(json.creator);
		const created = new Date(json.created);
		const contributor = new Iri(json.contributor);
		const modified = new Date(json.modified);
		const roleIri = new Iri(json.roleIri);
		const roleId = new NCName(json.roleId);
		const definedByProject = new Iri(json.definedByProject);
		const label = LangString.fromJson(json?.label);
		const comment = LangString.fromJson(json?.comment);

		return new OldapRole(creator, created, contributor, modified, roleIri,
			roleId, definedByProject, label, comment);
	}
}