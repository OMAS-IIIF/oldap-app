import { Iri } from '#lib/oldap/datatypes/xsd_iri.ts';
import { NCName } from '#lib/oldap/datatypes/xsd_ncname.ts';
import { LangString } from '#lib/oldap/datatypes/langstring.ts';
import { OldapObject } from '#lib/oldap/classes/object.ts';
import { XsdDate } from '#lib/oldap/datatypes/xsd_date.ts';
import { XsdDateTime } from '#lib/oldap/datatypes/xsd_datetime.ts';

export class OldapProject extends OldapObject {
	#projectIri: Iri;
	#projectShortName: NCName;
	#namespaceIri: Iri;
	label?: LangString;
	comment?: LangString;
	projectStart?: XsdDate;
	projectEnd?: XsdDate;

	constructor(creator: Iri,
							created: XsdDateTime,
							contributor: Iri,
							modified: XsdDateTime,
							projectIri: Iri,
							projectShortName: NCName,
							namespaceIri: Iri,
							label?: LangString,
							comment?: LangString,
							projectStart?: XsdDate,
							projectEnd?: XsdDate) {
		super(creator, created, contributor, modified);
		this.#projectIri = projectIri;
		this.#projectShortName = projectShortName;
		this.#namespaceIri = namespaceIri;
		this.label = label;
		this.comment = comment;
		this.projectStart = projectStart;
		this.projectEnd = projectEnd;
	}

	get projectIri() {
		return this.#projectIri;
	}

	get projectShortName() {
		return this.#projectShortName;
	}

	get namespaceIri() {
		return this.#namespaceIri;
	}


	static fromOldapJson(json: any): OldapProject {
		const creator = new Iri(json.creator);
		const created = new XsdDateTime(json.created);
		const contributor = new Iri(json.contributor);
		const modified = new XsdDateTime(json.modified);
		const projectIri = new Iri(json.projectIri);
		const projectShortName = new NCName(json.projectShortName);
		const namespaceIri = new Iri(json.namespaceIri);
		const label = LangString.fromJson(json?.label);
		const comment = LangString.fromJson(json?.comment);
		const projectStart = json?.projectStart ? new XsdDate(json.projectStart) : undefined
		const projectEnd = json?.projectEnd ? new XsdDate(json.projectEnd) : undefined;

		return new OldapProject(
			creator, created, contributor, modified, projectIri, projectShortName,
			namespaceIri, label, comment, projectStart, projectEnd
		);
	}
}

