/*
 * Copyright (©) 2026. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
 */

import type { QName } from '$lib/oldap/datatypes/xsd_qname';
import { OldapObject } from '$lib/oldap/classes/object';
import { Iri } from '$lib/oldap/datatypes/xsd_iri';
import { XsdDateTime } from '$lib/oldap/datatypes/xsd_datetime';

const DCMI_TYPES = [
	'dcmitype:Collection',
	'dcmitype:Dataset',
	'dcmitype:StillImage',
	'dcmitype:Image',
	'dcmitype:MovingImage',
	'dcmitype:Sound',
	'dcmitype:Text'
] as const;

export type Dcmitype = typeof DCMI_TYPES[number];

export function isDcmitype(value: string): value is Dcmitype {
	return (DCMI_TYPES as readonly string[]).includes(value);
}

export class MediaObject extends OldapObject {
	iri: string;
	graph: QName;
	type: Dcmitype;
	attachedToRole: string[];
	permval: number;
	assetId: string;
	derivativeName: string;
	originalMimeType: string;
	originalName: string;
	path?: string;
	protocol: string;
	serverUrl: string;
	token: string;

	constructor(
		creator: Iri,
		created: XsdDateTime,
		contributor: Iri,
		modified: XsdDateTime,
		iri: string,
		graph: QName,
		type: Dcmitype,
		attachedToRole: string[],
		permval: number,
		assetId: string,
		derivativeName: string,
		originalMimeType: string,
		originalName: string,
		path: string | undefined,
		protocol: string,
		serverUrl: string,
		token: string
	) {
		super(creator, created, contributor, modified);
		this.iri = iri;
		this.graph = graph;
		this.type = type;
		this.attachedToRole = attachedToRole;
		this.permval = permval;
		this.assetId = assetId;
		this.derivativeName = derivativeName;
		this.originalMimeType = originalMimeType;
		this.originalName = originalName;
		this.path = path;
		this.protocol = protocol;
		this.serverUrl = serverUrl;
		this.token = token;
	}

	static fromOldapJson(json: any): MediaObject {
		const creator = new Iri(json.creator);
		const created = new XsdDateTime(json.created);
		const contributor = new Iri(json.contributor);
		const modified = new XsdDateTime(json.modified);

		return new MediaObject(
			creator,
			created,
			contributor,
			modified,
			json['iri'],
			json['graph'],
			json['dcterms:type'],
			json['oldap:attachedToRole'],
			json['permval'],
			json['shared:assetId'],
			json['shared:derivativeName'],
			json['shared:originalMimeType'],
			json['shared:originalName'],
			json['shared:path'],
			json['shared:protocol'],
			json['shared:serverUrl'],
			json['token']
		);
	}
}