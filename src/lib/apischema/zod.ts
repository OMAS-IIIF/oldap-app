import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";



type HasRoleMap = /**
 * Mapping from QName role to data permission
 */
{};;
type DataPermission = /**
 * @enum DATA_RESTRICTED, DATA_VIEW, DATA_EXTEND, DATA_UPDATE, DATA_DELETE, DATA_PERMISSIONS
 */
"DATA_RESTRICTED" | "DATA_VIEW" | "DATA_EXTEND" | "DATA_UPDATE" | "DATA_DELETE" | "DATA_PERMISSIONS" | null;;
type AttachedToRoleMap = /**
 * Map of role IRI/QName to permission value.
 */
{};;
type InstanceData = {
    "rdf:type"?: Array<string> | undefined;
    "oldap:attachedToRole"?: AttachedToRoleMap | undefined;
    "oldap:createdBy": Array<string>;
    "oldap:lastModifiedBy": Array<string>;
    "oldap:creationDate": Array<string>;
    "oldap:lastModificationDate": Array<string>;
} & {
    [key: string]: ValueArray;
};;
type ValueArray = Array<string | number | number | boolean | null>;;
type user_get_body_200 = Partial<{
    userIri: string;
    userId: string;
    familyName: string;
    givenName: string;
    in_projects: Array<Partial<{
        project: string;
        permissions: Array<string>;
    }>>;
    hasRole: HasRoleMap;
}>;;
type ExternalOntology = Partial<{
    creator: string;
    created: string;
    contributor: string;
    modified: string;
    /**
     * Prefix to be used for the external ontology
     */
    prefix: string;
    /**
     * Namespace of the ontology
     */
    namespaceIri: string;
    /**
     * Human readable label.
     */
    label: LangString | Partial<{
        add: LangString;
        del: LangString;
    }> | null;
    /**
     * A description of the property.
     */
    comment: LangString | Partial<{
        add: LangString;
        del: LangString;
    }> | null;
}>;;
type LangString = /**
 * List of strings, each with an optional language tag (e.g., ["Lastname@en", "Nachname@de"])
 *
 * @example ["Eine Buchseite@de","A page of a book@en"]
 */
Array<string> | /**
 * Single string with optional language tag (e.g., "Lastname@en").
 *
 * @example "A page of a book@en"
 */
string | null;;
type Property = Partial<{
    creator: string;
    created: string;
    contributor: string;
    modified: string;
    type: OwlPropertyType | Partial<{
        add: OwlPropertyType;
        del: OwlPropertyType;
    }> | null;
    /**
     * ID of project the property is defined in
     */
    projectid: string;
    /**
     * Iri of property
     */
    iri: string;
    subPropertyOf: Iri;
    /**
     * An Iri() that describes the class of the instance on which this property must point e.g. "myproj:Book" means that the property points on book.
     *
     * @example "xml:Date"
     */
    class: Iri | null;
    /**
     * xsd_datatype if the property is represented via a literal
     *
     * @example "rdf:langString"
     */
    datatype: string | null;
    /**
     * Human readable Name.
     */
    name: LangString | Partial<{
        add: LangString;
        del: LangString;
    }> | null;
    /**
     * A description of the property.
     */
    description: LangString | Partial<{
        add: LangString;
        del: LangString;
    }> | null;
    languageIn: /**
     * The languages that are allowed in the property
     *
     * @example ["en","fr","it","de"]
     */
    Array<string> | null;
    /**
     * Describes if each language must be present only once. This field is only applicable if the property is of datatype langstring.
     *
     * @example true
     */
    uniqueLang: boolean;
    inSet: /**
     * @example ["Renault","Opel","BMW","Mercedes"]
     */
    Array<string | number | number> | null;
    /**
     * Only applicable in xsd:string and rdf:langString. Denotes the minimal length of the string.
     */
    minLength: /**
     * @example 1
     */
    number | /**
     * @example 1.1
     */
    number | null;
    /**
     * Only applicable in xsd:string and rdf:langString. Denotes the maximal length of the string.
     */
    maxLength: /**
     * @example 1
     */
    number | /**
     * @example 1.1
     */
    number | null;
    /**
     * Tells if the string must follow a certain regex pattern. Only applicable in xsd:string and rdf:langString.
     */
    pattern: /**
     * @example "r\"^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)*\\.[a-zA-Z]{2,}$\""
     */
    string | null;
    /**
     * Minimal value (exclusive the value itself) for a numerical datatype of the property like xsd:date/xsd:int/xsd:float...
     */
    minExclusive: /**
     * @example 5.5
     */
    number | /**
     * @example 5
     */
    number | null;
    /**
     * Minimal value (inclusive the value itself) for a numerical datatype of the property like xsd:date/xsd:int/xsd:float...
     */
    minInclusive: /**
     * @example 5.5
     */
    number | /**
     * @example 5
     */
    number | null;
    /**
     * Maximal value (exclusive the value itself) for a numerical datatype of the property like xsd:date/xsd:int/xsd:float...
     */
    maxExclusive: /**
     * @example 5.5
     */
    number | /**
     * @example 5
     */
    number | null;
    /**
     * Maximal value (inclusive the value itself) for a numerical datatype of the property like xsd:date/xsd:int/xsd:float...
     */
    maxInclusive: /**
     * @example 5.5
     */
    number | /**
     * @example 5
     */
    number | null;
    /**
     * The given numerical value must be smaller than the value of the given reverenced IRI property e.g. Iri("myproj:deathDate")
     */
    lessThan: Iri | null;
    /**
     * The given numerical value must be smaller or equal compared to the value of the given reverenced IRI property e.g. Iri("myproj:deathDate")
     */
    lessThanOrEquals: Iri | null;
    /**
     * The inverse property of the current property. This is used to define the inverse relationship between two properties.
     */
    inverseOf: Iri | null;
    /**
     * The equivalent property of the current property. This is used to define the equivalence between two properties.
     */
    equivalentProperty: Iri | null;
}>;;
type OwlPropertyType = Array</**
 * @enum StatementProperty, TransitiveProperty, SymmetricProperty, ReflexiveProperty, IrreflexiveProperty, FunctionalProperty, InverseFunctionalProperty
 */
"StatementProperty" | "TransitiveProperty" | "SymmetricProperty" | "ReflexiveProperty" | "IrreflexiveProperty" | "FunctionalProperty" | "InverseFunctionalProperty">;;
type Iri = /**
 * IRI in the format 'project:object', where 'project' is the project name and 'object' is the object name.
 *
 * @example "myproj:pageOf"
 * @pattern ^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$
 */
string;;
type Resource = Partial<{
    creator: string;
    created: string;
    contributor: string;
    modified: string;
    label: LangString;
    superclass: Array<string> | string;
    comment: LangString;
    /**
     * The standard closed constraint of RDF. See https://www.w3.org/TR/shacl/#ClosedConstraintComponent
     *
     * @example true
     */
    closed: boolean;
    hasProperty: Array<Partial<{
        property: (Partial<{
            iri: Iri;
        }> & Property) | Iri;
        /**
         * Denotes how often (maximum) this property can be used in one resource
         *
         * @example 3
         */
        maxCount: number;
        /**
         * Denotes how often (minimal) this property must be used in one resource
         *
         * @example 1
         */
        minCount: number;
        /**
         * Hint for GUI. Tells order of properties for a GUI
         *
         * @example 2
         */
        order: number;
    }>>;
}>;;

const Error = z.object({ message: z.string(), error: z.string().optional(), details: z.object({}).partial().passthrough().optional() }).passthrough();
const DataPermission = z.enum(["DATA_RESTRICTED", "DATA_VIEW", "DATA_EXTEND", "DATA_UPDATE", "DATA_DELETE", "DATA_PERMISSIONS"]);
const HasRoleMap: z.ZodType<HasRoleMap> = z.record(z.union([DataPermission, z.null()]));
const putAdminuserUserId_Body = z.object({ givenName: z.string(), familyName: z.string(), email: z.string().optional(), password: z.string().min(8), isActive: z.boolean().optional(), userIri: z.string().optional(), inProjects: z.array(z.object({ project: z.string(), permissions: z.array(z.enum(["ADMIN_OLDAP", "ADMIN_USERS", "ADMIN_ROLES", "ADMIN_RESOURCES", "ADMIN_MODEL", "ADMIN_CREATE", "ADMIN_LISTS"])) }).partial().passthrough()).optional(), hasRole: HasRoleMap.optional() }).passthrough();
const postAdminuserUserId_Body = z.object({ userId: z.string(), givenName: z.string(), familyName: z.string(), email: z.string(), password: z.string(), isActive: z.boolean(), inProjects: z.union([z.object({ add: z.object({ project: z.string(), permissions: z.union([z.array(z.string()), z.null()]) }).partial().passthrough(), del: z.array(z.string()) }).partial().passthrough(), z.array(z.object({ project: z.string(), permissions: z.union([z.array(z.string()), z.object({ add: z.array(z.string()), del: z.array(z.string()) }).partial().passthrough(), z.null()]) }).partial().passthrough())]), hasRole: z.union([HasRoleMap, z.object({ add: HasRoleMap, del: z.array(z.string()) }).partial().passthrough(), z.null()]) }).partial().passthrough();
const LangString = z.union([z.array(z.string()), z.string(), z.null()]);
const putAdminprojectProjectId_Body = z.object({ projectIri: z.string(), label: LangString, comment: LangString, namespaceIri: z.string(), projectStart: z.string(), projectEnd: z.string() }).partial().passthrough();
const postAdminprojectProjectId_Body = z.object({ label: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]), comment: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]), projectStart: z.union([z.string(), z.null()]), projectEnd: z.union([z.string(), z.null()]) }).partial().passthrough();
const putAdminroleDefinedByProjectRoleId_Body = z.object({ label: LangString, comment: LangString }).partial().passthrough();
const postAdminroleDefinedByProjectRoleId_Body = z.object({ label: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.unknown()]), comment: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]) }).partial().passthrough();
const ExternalOntology: z.ZodType<ExternalOntology> = z.object({ creator: z.string(), created: z.string().datetime({ offset: true }), contributor: z.string(), modified: z.string().datetime({ offset: true }), prefix: z.string(), namespaceIri: z.string(), label: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]), comment: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]) }).partial();
const OwlPropertyType = z.array(z.enum(["StatementProperty", "TransitiveProperty", "SymmetricProperty", "ReflexiveProperty", "IrreflexiveProperty", "FunctionalProperty", "InverseFunctionalProperty"]));
const Iri = z.string();
const Property: z.ZodType<Property> = z.object({ creator: z.string(), created: z.string().datetime({ offset: true }), contributor: z.string(), modified: z.string().datetime({ offset: true }), type: z.union([OwlPropertyType, z.object({ add: OwlPropertyType, del: OwlPropertyType }).partial().passthrough(), z.null()]), projectid: z.string(), iri: z.string(), subPropertyOf: Iri.regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/), class: z.union([Iri, z.null()]), datatype: z.union([z.string(), z.null()]), name: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]), description: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]), languageIn: z.union([z.array(z.string()), z.null()]), uniqueLang: z.boolean(), inSet: z.union([z.array(z.union([z.string(), z.number(), z.number()])), z.null()]), minLength: z.union([z.number(), z.number(), z.null()]), maxLength: z.union([z.number(), z.number(), z.null()]), pattern: z.union([z.string(), z.null()]), minExclusive: z.union([z.number(), z.number(), z.null()]), minInclusive: z.union([z.number(), z.number(), z.null()]), maxExclusive: z.union([z.number(), z.number(), z.null()]), maxInclusive: z.union([z.number(), z.number(), z.null()]), lessThan: z.union([Iri, z.null()]), lessThanOrEquals: z.union([Iri, z.null()]), inverseOf: z.union([Iri, z.null()]), equivalentProperty: z.union([Iri, z.null()]) }).partial();
const Resource: z.ZodType<Resource> = z.object({ creator: z.string(), created: z.string().datetime({ offset: true }), contributor: z.string(), modified: z.string().datetime({ offset: true }), label: LangString, superclass: z.union([z.array(z.string()), z.string()]), comment: LangString, closed: z.boolean(), hasProperty: z.array(z.object({ property: z.union([z.object({ iri: Iri.regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/) }).partial().passthrough().and(Property), Iri]), maxCount: z.number(), minCount: z.number(), order: z.number() }).partial().passthrough()) }).partial().passthrough();
const postAdmindatamodelProjectextontoPrefix_Body = z.object({ label: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]), comment: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]) }).partial();
const postAdmindatamodelProjectpropertyProperty_Body = z.object({ type: z.union([OwlPropertyType, z.object({ add: OwlPropertyType, del: OwlPropertyType }).partial().passthrough(), z.null()]), datatype: z.union([z.string(), z.null()]), class: z.union([Iri, z.null()]), name: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]), description: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]), languageIn: z.union([z.array(z.string()), z.null()]), uniqueLang: z.boolean(), inSet: z.union([z.array(z.union([z.string(), z.number(), z.number()])), z.null()]), minLength: z.union([z.number(), z.number(), z.null()]), maxLength: z.union([z.number(), z.number(), z.null()]), pattern: z.union([z.string(), z.null()]), minExclusive: z.union([z.number(), z.number(), z.null()]), minInclusive: z.union([z.number(), z.number(), z.null()]), maxExclusive: z.union([z.number(), z.number(), z.null()]), maxInclusive: z.union([z.number(), z.number(), z.null()]), lessThan: z.union([Iri, z.null()]), lessThanOrEquals: z.union([Iri, z.null()]), inverseOf: z.union([Iri, z.null()]), equivalentProperty: z.union([Iri, z.null()]) }).partial();
const postAdmindatamodelProjectResource_Body = z.object({ closed: z.boolean(), superclass: z.union([z.array(z.string()), z.object({ add: z.array(z.string()), del: z.array(z.string()) }).partial().passthrough(), z.null()]), label: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]), comment: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]) }).partial().passthrough();
const putAdmindatamodelProjectResourceProperty_Body = Property.and(z.object({ maxCount: z.union([z.number(), z.number()]), minCount: z.union([z.number(), z.number()]), order: z.union([z.number(), z.number()]) }).partial());
const postAdmindatamodelProjectResourceProperty_Body = z.object({ property: Property, maxCount: z.union([z.number(), z.number(), z.null()]), minCount: z.union([z.number(), z.number(), z.null()]), order: z.union([z.number(), z.number(), z.null()]) }).partial().passthrough();
const putAdminhlistProjectHlistid_Body = z.object({ prefLabel: LangString, definition: LangString }).partial().passthrough();
const postAdminhlistProjectHlistid_Body = z.object({ prefLabel: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]), definition: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]) }).partial().passthrough();
const putAdminhlistProjectHlistidNodeid_Body = z.union([z.object({ prefLabel: LangString, definition: LangString.optional(), position: z.enum(["belowOf", "leftOf", "rightOf"]), refnode: z.string() }).passthrough(), z.object({ prefLabel: LangString, definition: LangString.optional(), position: z.literal("root") }).passthrough()]);
const postAdminhlistProjectHlistidNodeidmove_Body = z.union([z.object({ leftOf: z.string() }).passthrough(), z.object({ rightOf: z.string() }).passthrough(), z.object({ belowOf: z.string() }).passthrough()]);
const ValueArray = z.array(z.union([z.string(), z.number(), z.number(), z.boolean(), z.null()]));
const InstanceData: z.ZodType<InstanceData> = z.record(ValueArray);

export const schemas = {
	Error,
	DataPermission,
	HasRoleMap,
	putAdminuserUserId_Body,
	postAdminuserUserId_Body,
	LangString,
	putAdminprojectProjectId_Body,
	postAdminprojectProjectId_Body,
	putAdminroleDefinedByProjectRoleId_Body,
	postAdminroleDefinedByProjectRoleId_Body,
	ExternalOntology,
	OwlPropertyType,
	Iri,
	Property,
	Resource,
	postAdmindatamodelProjectextontoPrefix_Body,
	postAdmindatamodelProjectpropertyProperty_Body,
	postAdmindatamodelProjectResource_Body,
	putAdmindatamodelProjectResourceProperty_Body,
	postAdmindatamodelProjectResourceProperty_Body,
	putAdminhlistProjectHlistid_Body,
	postAdminhlistProjectHlistid_Body,
	putAdminhlistProjectHlistidNodeid_Body,
	postAdminhlistProjectHlistidNodeidmove_Body,
	ValueArray,
	InstanceData,
};

const endpoints = makeApi([
	{
		method: "post",
		path: "/admin/auth/:userId",
		alias: "postAdminauthUserId",
		description: `Perform login/logout with userid/password. Returns a JWT token.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: z.object({ password: z.string() }).partial().passthrough()
			},
			{
				name: "userId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string(), token: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
		]
	},
	{
		method: "delete",
		path: "/admin/auth/:userId",
		alias: "deleteAdminauthUserId",
		description: `Logout from system`,
		requestFormat: "json",
		response: z.void(),
		errors: [
			{
				status: 400,
				description: `Several Errors that involve bad requests`,
				schema: z.void()
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "put",
		path: "/admin/datamodel/:project",
		alias: "putAdmindatamodelProject",
		description: `Creates an empty datamodel to be filled later by other viewfunctions`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/datamodel/:project",
		alias: "getAdmindatamodelProject",
		description: `Viewfunction to get the information about a datamodel of a project.`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ project: z.string(), externalOntologies: z.array(ExternalOntology), standaloneProperties: z.array(Property), resources: z.array(Resource) }).partial().passthrough(),
		errors: [
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "delete",
		path: "/admin/datamodel/:project",
		alias: "deleteAdmindatamodelProject",
		description: `Viewfunction to delete the entire datamodel of a given project. Use carefully!`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "put",
		path: "/admin/datamodel/:project/:resource",
		alias: "putAdmindatamodelProjectResource",
		description: `Viewfunction to add a resource to an existing datamodel. A JSON is expectet that has the following form. In the hasProperty, either the class or the datatype must be given but not both at the same time. If the datatype is given, then all fields are optional. If the class is given, only subPropertyOf, name and desctiption are allowed.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: Resource
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "resource",
				type: "Path",
				schema: z.string().regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/)
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "delete",
		path: "/admin/datamodel/:project/:resource",
		alias: "deleteAdmindatamodelProjectResource",
		description: `Viewfunction that deletes an entire resource inside the projects datamodel`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "resource",
				type: "Path",
				schema: z.string().regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/)
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/admin/datamodel/:project/:resource",
		alias: "postAdmindatamodelProjectResource",
		description: `Viewfunction to modify a resource. A JSON is expected that has the following form. All fields are optional -- at least one needs to be given Note: To modify the fields of a property of the resource -- use modify_attribute_in_has_prop instead.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: postAdmindatamodelProjectResource_Body
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "resource",
				type: "Path",
				schema: z.string().regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/)
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "put",
		path: "/admin/datamodel/:project/:resource/:property",
		alias: "putAdmindatamodelProjectResourceProperty",
		description: `Viewfunction to add a property to an existing resource inside a datamodel. A JSON is expectet that has the following form. In the hasProperty, either the class or the datatype must be given but not both at the same time. If the datatype is given, then all fields are optional. If the class is given, only subPropertyOf, name and desctiption are allowed.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: putAdmindatamodelProjectResourceProperty_Body
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "resource",
				type: "Path",
				schema: z.string().regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/)
			},
			{
				name: "property",
				type: "Path",
				schema: z.string().regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/)
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "delete",
		path: "/admin/datamodel/:project/:resource/:property",
		alias: "deleteAdmindatamodelProjectResourceProperty",
		description: `Viewfunction that deletes an entire property inside a resource that is located in the projects datamodel`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "resource",
				type: "Path",
				schema: z.string().regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/)
			},
			{
				name: "property",
				type: "Path",
				schema: z.string().regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/)
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/admin/datamodel/:project/:resource/:property",
		alias: "postAdmindatamodelProjectResourceProperty",
		description: `Viewfunction to modify the fields of a single property inside a resource.A JSON is expected that has the following form.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: postAdmindatamodelProjectResourceProperty_Body
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "resource",
				type: "Path",
				schema: z.string().regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/)
			},
			{
				name: "property",
				type: "Path",
				schema: z.string().regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/)
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/datamodel/:project/downlad",
		alias: "getAdmindatamodelProjectdownlad",
		description: `Export the datamode as trig file`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.void(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "put",
		path: "/admin/datamodel/:project/extonto/:prefix",
		alias: "putAdmindatamodelProjectextontoPrefix",
		description: `Add an external ontology reference to the data model. The external ontology reference is defined by a prefx and the namespace Iri. If it&#x27;s declared in the datamode, definitions from this ontology may be used withing the data model.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: ExternalOntology
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "prefix",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "delete",
		path: "/admin/datamodel/:project/extonto/:prefix",
		alias: "deleteAdmindatamodelProjectextontoPrefix",
		description: `Viewfunction that deletes an external ontology reference inside the project&#x27;s datamodel`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "prefix",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/admin/datamodel/:project/extonto/:prefix",
		alias: "postAdmindatamodelProjectextontoPrefix",
		description: `Route to modify the label or the comment of an external ontology reference`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: postAdmindatamodelProjectextontoPrefix_Body
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "prefix",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "put",
		path: "/admin/datamodel/:project/property/:property",
		alias: "putAdmindatamodelProjectpropertyProperty",
		description: `Viewfunction to add a standalone property to an existing datamodel. A JSON is expectet that has the following form. Either the class or the datatype must be given but not both at the same time. If the datatype is given, then all fields are optional. If the class is given, only subPropertyOf, name and desctiption are allowed.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: Property
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "property",
				type: "Path",
				schema: z.string().regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/)
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "delete",
		path: "/admin/datamodel/:project/property/:property",
		alias: "deleteAdmindatamodelProjectpropertyProperty",
		description: `Viewfunction that deletes an entire standalone property inside the projects datamodel`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "property",
				type: "Path",
				schema: z.string().regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/)
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/admin/datamodel/:project/property/:property",
		alias: "postAdmindatamodelProjectpropertyProperty",
		description: `Viewfunction to modify a standalone property. A JSON is expected that has the following form. At least one field must be given. All fields are optional. At least one field must be given.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: postAdmindatamodelProjectpropertyProperty_Body
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "property",
				type: "Path",
				schema: z.string().regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/)
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "put",
		path: "/admin/hlist/:project/:hlistid",
		alias: "putAdminhlistProjectHlistid",
		description: `Creates an empty hierarchical list. Later to be filled with nodes.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: putAdminhlistProjectHlistid_Body
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "hlistid",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/admin/hlist/:project/:hlistid",
		alias: "postAdminhlistProjectHlistid",
		description: `Viewfunction to modify the metadata of a hierarchical list`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: postAdminhlistProjectHlistid_Body
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "hlistid",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "delete",
		path: "/admin/hlist/:project/:hlistid",
		alias: "deleteAdminhlistProjectHlistid",
		description: `Viewfunction to delete a hierarchical list`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "hlistid",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/hlist/:project/:hlistid",
		alias: "getAdminhlistProjectHlistid",
		description: `Viewfunction to get the information about a hierarchical of a project. A (hierarchical) ordered List of all the nodes will be delivered.`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "hlistid",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.union([z.object({}).partial().passthrough(), z.array(z.any()), z.string(), z.number(), z.boolean(), z.unknown()]),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/hlist/:project/:hlistid/:nodeid",
		alias: "getAdminhlistProjectHlistidNodeid",
		description: `Viewfunction to retrieve all information of the given node
`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "hlistid",
				type: "Path",
				schema: z.string()
			},
			{
				name: "nodeid",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ nodeid: z.string(), creator: z.string(), created: z.string().datetime({ offset: true }), contributor: z.string(), modified: z.string().datetime({ offset: true }), prefLabel: LangString, description: LangString }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
		]
	},
	{
		method: "put",
		path: "/admin/hlist/:project/:hlistid/:nodeid",
		alias: "putAdminhlistProjectHlistidNodeid",
		description: `Viewfunction to add a new node to an existing hierarchical list. A JSON is expected that has the following form.
Note: if the position is &quot;root&quot;, then &quot;refnode&quot; must be omitted.

Example JSON:
{
  &quot;prefLabel&quot;: [&quot;testrootnodelabel@en&quot;],
  &quot;definition&quot;: [&quot;testrootnodedefinition@en&quot;],
  &quot;position&quot;: &quot;leftOf&quot;,
  &quot;refnode&quot;: &quot;nodeA&quot;
}
`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: putAdminhlistProjectHlistidNodeid_Body
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "hlistid",
				type: "Path",
				schema: z.string()
			},
			{
				name: "nodeid",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "delete",
		path: "/admin/hlist/:project/:hlistid/:nodeid",
		alias: "deleteAdminhlistProjectHlistidNodeid",
		description: `Viewfunction that deletes a node from the hierarchical list
`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "hlistid",
				type: "Path",
				schema: z.string()
			},
			{
				name: "nodeid",
				type: "Path",
				schema: z.string()
			},
			{
				name: "recursive",
				type: "Query",
				schema: z.enum(["1", "true", "yes", "on", "0", "false", "no", "off"]).optional()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/admin/hlist/:project/:hlistid/:nodeid",
		alias: "postAdminhlistProjectHlistidNodeid",
		description: `Viewfunction to modify the parameters of a node
`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: postAdminhlistProjectHlistid_Body
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "hlistid",
				type: "Path",
				schema: z.string()
			},
			{
				name: "nodeid",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.unknown() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/admin/hlist/:project/:hlistid/:nodeid/move",
		alias: "postAdminhlistProjectHlistidNodeidmove",
		description: `Viewfunction that moves a node inside the hierarchical list from one place to another.
When there are any number of nodes below the node one wish to move, they get moved automatically alongside the other node.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: postAdminhlistProjectHlistidNodeidmove_Body
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "hlistid",
				type: "Path",
				schema: z.string()
			},
			{
				name: "nodeid",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/hlist/:project/:hlistid/download",
		alias: "downloadHList",
		description: `Downloads a hierarchical list as YAML or JSON depending on the &#x60;format&#x60; query parameter.
The user must be authenticated with a Bearer token.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "hlistid",
				type: "Path",
				schema: z.string()
			},
			{
				name: "format",
				type: "Query",
				schema: z.enum(["YAML", "JSON"]).optional()
			},
		],
		response: z.object({}).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/hlist/:project/:hlistid/in_use",
		alias: "getAdminhlistProjectHlistidin_use",
		description: `Viewfunction to check if a hierarchical list is in use. It is in use, if any property in the datamodel references the list.`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "hlistid",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ in_use: z.boolean() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/admin/hlist/:project/upload",
		alias: "postAdminhlistProjectupload",
		description: `Uploads a hierarchical list to a specific project via a YAML file.`,
		requestFormat: "form-data",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: z.object({ yamlfile: z.instanceof(File) }).partial().passthrough()
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/hlist/get",
		alias: "getAdminhlistget",
		description: `Get all hlist data from the hlist iri`,
		requestFormat: "json",
		parameters: [
			{
				name: "iri",
				type: "Query",
				schema: z.string()
			},
		],
		response: z.object({ hlistIri: z.string(), creator: z.string(), created: z.string(), contributor: z.string(), modified: z.string(), hlistId: z.string(), prefLabel: LangString, definition: LangString, nodeNamespaceIri: z.string(), nodeClassIri: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/hlist/search",
		alias: "getAdminhlistsearch",
		description: `Search for a given user`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "hlist",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "prefLabel",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "definition",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "exactMatch",
				type: "Query",
				schema: z.boolean().optional()
			},
		],
		response: z.array(z.string()),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
		]
	},
	{
		method: "put",
		path: "/admin/project/:projectId",
		alias: "putAdminprojectProjectId",
		description: `Creates a new project in the database`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: putAdminprojectProjectId_Body
			},
			{
				name: "projectId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "delete",
		path: "/admin/project/:projectId",
		alias: "deleteAdminprojectProjectId",
		description: `The user that has the rights (given by his token) deletes a project`,
		requestFormat: "json",
		parameters: [
			{
				name: "projectId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/project/:projectId",
		alias: "getAdminprojectProjectId",
		description: `The user that has the rights (given by his token) gets Information about a project`,
		requestFormat: "json",
		parameters: [
			{
				name: "projectId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ projectIri: z.string(), creator: z.string(), created: z.string(), contributor: z.string(), modified: z.string(), label: LangString, comment: LangString, message: z.string(), shortName: z.string().regex(/^[a-zA-Z_][a-zA-Z0-9._-]*$/), namespaceIri: z.string(), projectStart: z.string(), projectEnd: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/admin/project/:projectId",
		alias: "postAdminprojectProjectId",
		description: `The user that has the rights (given by his token) modifies a project`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: postAdminprojectProjectId_Body
			},
			{
				name: "projectId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/project/get",
		alias: "getAdminprojectget",
		description: `Get all project data from the project iri`,
		requestFormat: "json",
		parameters: [
			{
				name: "iri",
				type: "Query",
				schema: z.string()
			},
		],
		response: z.object({ projectIri: z.string(), creator: z.string(), created: z.string(), contributor: z.string(), modified: z.string(), label: LangString, comment: LangString, message: z.string(), shortName: z.string().regex(/^[a-zA-Z_][a-zA-Z0-9._-]*$/), namespaceIri: z.string(), projectStart: z.string(), projectEnd: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/project/getid",
		alias: "getAdminprojectgetid",
		description: `Get the project shortname from the project IRI`,
		requestFormat: "json",
		parameters: [
			{
				name: "iri",
				type: "Query",
				schema: z.string()
			},
		],
		response: z.object({ id: z.string() }).passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/project/search",
		alias: "getAdminprojectsearch",
		description: `The user that has the rights (given by his token) searches for given parameters in projects`,
		requestFormat: "json",
		parameters: [
			{
				name: "label",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "comment",
				type: "Query",
				schema: z.string().optional()
			},
		],
		response: z.array(z.object({ projectIri: z.string(), projectShortName: z.string() }).partial().passthrough()),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
		]
	},
	{
		method: "put",
		path: "/admin/role/:definedByProject/:roleId",
		alias: "putAdminroleDefinedByProjectRoleId",
		description: `Creates a new permissionset in the database`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: putAdminroleDefinedByProjectRoleId_Body
			},
			{
				name: "definedByProject",
				type: "Path",
				schema: z.string()
			},
			{
				name: "roleId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "delete",
		path: "/admin/role/:definedByProject/:roleId",
		alias: "deleteAdminroleDefinedByProjectRoleId",
		description: `The user that has the rights (given by his token) deletes a permissionset`,
		requestFormat: "json",
		parameters: [
			{
				name: "definedByProject",
				type: "Path",
				schema: z.string()
			},
			{
				name: "roleId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/role/:definedByProject/:roleId",
		alias: "getAdminroleDefinedByProjectRoleId",
		description: `The user that has the rights (given by his token) gets Information about a role`,
		requestFormat: "json",
		parameters: [
			{
				name: "definedByProject",
				type: "Path",
				schema: z.string()
			},
			{
				name: "roleId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ roleIri: z.string(), creator: z.string(), created: z.string().datetime({ offset: true }), contributor: z.string(), modified: z.string().datetime({ offset: true }), roleId: z.string(), label: LangString, comment: LangString, definedByProject: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/admin/role/:definedByProject/:roleId",
		alias: "postAdminroleDefinedByProjectRoleId",
		description: `The user that has the rights (given by his token) modifies a permissionset`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: postAdminroleDefinedByProjectRoleId_Body
			},
			{
				name: "definedByProject",
				type: "Path",
				schema: z.string()
			},
			{
				name: "roleId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/role/:definedByProject/:roleId/in_use",
		alias: "getAdminroleDefinedByProjectRoleIdin_use",
		description: `Viewfunction to check if a hierarchical list is in use. It is in use, if any property in the datamodel references the list.`,
		requestFormat: "json",
		parameters: [
			{
				name: "definedByProject",
				type: "Path",
				schema: z.string()
			},
			{
				name: "roleId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ in_use: z.boolean() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/role/get",
		alias: "getAdminroleget",
		description: `Get complete role data by iri`,
		requestFormat: "json",
		parameters: [
			{
				name: "iri",
				type: "Query",
				schema: z.string()
			},
		],
		response: z.object({ creator: z.string(), created: z.string().datetime({ offset: true }), contributor: z.string(), modified: z.string().datetime({ offset: true }), roleIri: z.string(), roleId: z.string(), label: LangString, comment: LangString, definedByProject: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/role/search",
		alias: "getAdminrolesearch",
		description: `The user that has the rights (given by his token) searches for given parameters in role`,
		requestFormat: "json",
		parameters: [
			{
				name: "label",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "definedByProject",
				type: "Query",
				schema: z.string().optional()
			},
		],
		response: z.array(z.string()),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
		]
	},
	{
		method: "put",
		path: "/admin/user/:userId",
		alias: "putAdminuserUserId",
		description: `Create a new user with the given data`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: putAdminuserUserId_Body
			},
			{
				name: "userId",
				type: "Path",
				schema: z.string().max(32)
			},
		],
		response: z.object({ message: z.string(), userIri: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "delete",
		path: "/admin/user/:userId",
		alias: "deleteAdminuserUserId",
		description: `The user that has the rights (given by his token) deletes another user`,
		requestFormat: "json",
		parameters: [
			{
				name: "userId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/user/:userId",
		alias: "getAdminuserUserId",
		description: `Get all information about a user`,
		requestFormat: "json",
		parameters: [
			{
				name: "userId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ creator: z.string(), created: z.string().datetime({ offset: true }), contributor: z.string(), modified: z.string().datetime({ offset: true }), userIri: z.string(), userId: z.string(), familyName: z.string(), givenName: z.string(), email: z.string(), is_active: z.boolean().optional(), in_projects: z.array(z.object({ project: z.string(), permissions: z.array(z.string()) }).partial().passthrough()).optional(), hasRole: HasRoleMap.optional() }).passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/admin/user/:userId",
		alias: "postAdminuserUserId",
		description: `Modify value(s) of a user definition.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: postAdminuserUserId_Body
			},
			{
				name: "userId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/user/get",
		alias: "getAdminuserget",
		description: `Get all user data from the user Iri`,
		requestFormat: "json",
		parameters: [
			{
				name: "iri",
				type: "Query",
				schema: z.string()
			},
		],
		response: z.object({ creator: z.string(), created: z.string().datetime({ offset: true }), contributor: z.string(), modified: z.string().datetime({ offset: true }), userIri: z.string(), userId: z.string(), familyName: z.string(), givenName: z.string(), email: z.string(), is_active: z.boolean().optional(), in_projects: z.array(z.object({ project: z.string(), permissions: z.array(z.string()) }).partial().passthrough()).optional(), hasRole: HasRoleMap.optional() }).passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/user/search",
		alias: "getAdminusersearch",
		description: `Search for a given user`,
		requestFormat: "json",
		parameters: [
			{
				name: "userId",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "familyName",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "givenName",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "inProject",
				type: "Query",
				schema: z.string().optional()
			},
		],
		response: z.array(z.string()),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/data/:project/:instiri",
		alias: "getDataProjectInstiri",
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "instiri",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.record(ValueArray),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/data/:project/:instiri",
		alias: "postDataProjectInstiri",
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: z.object({}).partial().passthrough()
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "instiri",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "delete",
		path: "/data/:project/:instiri",
		alias: "deleteDataProjectInstiri",
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "instiri",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "put",
		path: "/data/:project/:resclass",
		alias: "putDataProjectResclass",
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: z.object({}).partial().passthrough()
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "resclass",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string(), iri: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/data/mediaobject/id/:id",
		alias: "getDatamediaobjectidId",
		requestFormat: "json",
		parameters: [
			{
				name: "id",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ iri: z.string(), graph: z.unknown(), permval: z.unknown(), "oldap:createdBy": z.unknown(), "oldap:creationDate": z.unknown(), "oldap:lastModifiedBy": z.unknown(), "oldap:lastModificationDate": z.unknown(), "shared:imageId": z.unknown(), "shared:originalName": z.unknown(), "dcterms:type": z.unknown(), description: z.unknown(), "shared:originalMimeType": z.string(), "shared:serverUrl": z.string(), "shared:path": z.string(), "shared:protocol": z.enum(["iiif", "http", "custom"]) }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/data/mediaobject/iri/:iri",
		alias: "getDatamediaobjectiriIri",
		requestFormat: "json",
		parameters: [
			{
				name: "iri",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ "oldap:createdBy": z.string(), "oldap:creationDate": z.string().datetime({ offset: true }), "oldap:lastModifiedBy": z.string(), "oldap:lastModificationDate": z.string().datetime({ offset: true }), "shared:imageId": z.string(), "shared:originalName": z.string(), "dcterms:type": z.enum(["dcmitype:Collection", "dcmitype:Dataset", "dcmitype:StillImage", "dcmitype:Image", "dcmitype:MovingImage", "dcmitype:Sound", "dcmitype:Text"]), "shared:originalMimeType": z.string(), "shared:serverUrl": z.string(), "shared:path": z.string(), "shared:protocol": z.enum(["iiif", "http", "custom"]) }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/data/ofclass/:project",
		alias: "getDataofclassProject",
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "resClass",
				type: "Query",
				schema: z.string()
			},
			{
				name: "includeProperties",
				type: "Query",
				schema: z.array(z.string().regex(/^([A-Za-z_][A-Za-z0-9._-]*:)?[A-Za-z_][A-Za-z0-9._-]*$/)).optional()
			},
			{
				name: "countOnly",
				type: "Query",
				schema: z.boolean().optional()
			},
			{
				name: "sortBy",
				type: "Query",
				schema: z.enum(["PROPVAL", "CREATED", "LASTMOD"]).optional()
			},
			{
				name: "limit",
				type: "Query",
				schema: z.number().int().optional()
			},
			{
				name: "offset",
				type: "Query",
				schema: z.number().int().optional()
			},
		],
		response: z.record(z.object({}).partial().passthrough()),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/data/textsearch/:project",
		alias: "getDatatextsearchProject",
		description: `Get all hlist data from the hlist iri`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "searchString",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "resClass",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "countOnly",
				type: "Query",
				schema: z.boolean().optional()
			},
			{
				name: "sortBy",
				type: "Query",
				schema: z.enum(["PROPVAL", "CREATED", "LASTMOD"]).optional()
			},
			{
				name: "limit",
				type: "Query",
				schema: z.number().int().optional()
			},
			{
				name: "offset",
				type: "Query",
				schema: z.number().int().optional()
			},
		],
		response: z.record(z.object({}).partial().passthrough()),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
		]
	},
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
    return new Zodios(baseUrl, endpoints, options);
}
