import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";



type Property = Partial<{
    subPropertyOf: Iri;
    class: Iri;
    /**
     * xsd_datatype if the property is represented via a literal
     *
     * @example "rdf:langString"
     */
    datatype: string;
    name: LangString;
    description: LangString;
    /**
     * The languages that are allowed in the property
     *
     * @example ["en","fr","it","de"]
     */
    languageIn: Array<string>;
    /**
     * Describes if each language must be present only once. This field is only applicable if the property is of datatype langstring.
     *
     * @example true
     */
    uniqueLand: boolean;
    /**
     * @example ["Renault","Opel","BMW","Mercedes"]
     */
    inSet: Array<string>;
    /**
     * Only applicable in xsd:string and rdf:langString. Denotes the minimal length of the string.
     */
    minLength: /**
     * @example 1
     */
    number | /**
     * @example 1.1
     */
    number;
    /**
     * Only applicable in xsd:string and rdf:langString. Denotes the maximal length of the string.
     */
    maxLength: /**
     * @example 1
     */
    number | /**
     * @example 1.1
     */
    number;
    /**
     * Tells if the string must follow a certain regex pattern. Only applicable in xsd:string and rdf:langString.
     *
     * @example "r\"^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)*\\.[a-zA-Z]{2,}$\""
     */
    pattern: string;
    /**
     * Minimal value (exclusive the value itself) for a numerical datatype of the property like xsd:date/xsd:int/xsd:float...
     */
    minExclusive: /**
     * @example 5.5
     */
    number | /**
     * @example 5
     */
    number;
    /**
     * Minimal value (inclusive the value itself) for a numerical datatype of the property like xsd:date/xsd:int/xsd:float...
     */
    minInclusive: /**
     * @example 5.5
     */
    number | /**
     * @example 5
     */
    number;
    /**
     * Maximal value (exclusive the value itself) for a numerical datatype of the property like xsd:date/xsd:int/xsd:float...
     */
    maxExclusive: /**
     * @example 5.5
     */
    number | /**
     * @example 5
     */
    number;
    /**
     * Maximal value (inclusive the value itself) for a numerical datatype of the property like xsd:date/xsd:int/xsd:float...
     */
    maxInclusive: /**
     * @example 5.5
     */
    number | /**
     * @example 5
     */
    number;
    lessThan: Iri;
    lessThanOrEquals: Iri;
}>;;
type Iri = /**
 * IRI in the format 'project:object', where 'project' is the project name and 'object' is the object name.
 *
 * @example "myproj:pageOf"
 * @pattern ^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$
 */
string;;
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
string;;
type Resource = Partial<{
    label: LangString;
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

const LangString = z.union([z.array(z.string()), z.string()]);
const Iri = z.string();
const Property: z.ZodType<Property> = z.object({ subPropertyOf: Iri.regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/), class: Iri.regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/), datatype: z.string(), name: LangString, description: LangString, languageIn: z.array(z.string()), uniqueLand: z.boolean(), inSet: z.array(z.string()), minLength: z.union([z.number(), z.number()]), maxLength: z.union([z.number(), z.number()]), pattern: z.string(), minExclusive: z.union([z.number(), z.number()]), minInclusive: z.union([z.number(), z.number()]), maxExclusive: z.union([z.number(), z.number()]), maxInclusive: z.union([z.number(), z.number()]), lessThan: Iri.regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/), lessThanOrEquals: Iri.regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/) }).partial().passthrough();
const Resource: z.ZodType<Resource> = z.object({ label: LangString, comment: LangString, closed: z.boolean(), hasProperty: z.array(z.object({ property: z.union([z.object({ iri: Iri.regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/) }).partial().passthrough().and(Property), Iri]), maxCount: z.number(), minCount: z.number(), order: z.number() }).partial().passthrough()) }).partial().passthrough();
const postAdmindatamodelProjectpropertyProperty_Body = z.object({ name: LangString, description: LangString, languageIn: z.array(z.string()), uniqueLand: z.boolean(), minLength: z.union([z.number(), z.number()]), maxLength: z.union([z.number(), z.number()]), pattern: z.string(), minExclusive: z.union([z.number(), z.number()]), minInclusive: z.union([z.number(), z.number()]), maxExclusive: z.union([z.number(), z.number()]), maxInclusive: z.union([z.number(), z.number()]) }).partial().passthrough();
const postAdmindatamodelProjectResource_Body = z.object({ closed: z.boolean(), label: LangString, comment: LangString }).partial().passthrough();
const putAdmindatamodelProjectResourceProperty_Body = Property.and(z.object({ maxCount: z.number(), minCount: z.number(), order: z.number() }).partial().passthrough());
const postAdmindatamodelProjectResourceProperty_Body = z.object({ property: Property, maxCount: z.number(), minCount: z.number(), order: z.number() }).partial().passthrough();
const putAdminhlistProjectHlistid_Body = z.object({ prefLabel: LangString, definition: LangString }).partial().passthrough();
const putAdminhlistProjectHlistidNodeid_Body = z.union([z.object({ prefLabel: LangString, definition: LangString.optional(), position: z.enum(["belowOf", "leftOf", "rightOf"]), refnode: z.string() }).passthrough(), z.object({ prefLabel: LangString, definition: LangString.optional(), position: z.literal("root") }).passthrough()]);
const postAdminhlistProjectHlistidNodeidmove_Body = z.union([z.object({ leftOf: z.string() }).passthrough(), z.object({ rightOf: z.string() }).passthrough(), z.object({ belowOf: z.string() }).passthrough()]);

export const schemas = {
	LangString,
	Iri,
	Property,
	Resource,
	postAdmindatamodelProjectpropertyProperty_Body,
	postAdmindatamodelProjectResource_Body,
	putAdmindatamodelProjectResourceProperty_Body,
	postAdmindatamodelProjectResourceProperty_Body,
	putAdminhlistProjectHlistid_Body,
	putAdminhlistProjectHlistidNodeid_Body,
	postAdminhlistProjectHlistidNodeidmove_Body,
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
				description: `Several Errors that involve bad requests`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `User not found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
				description: `Internal Server error. Should not be reachable`,
				schema: z.void()
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
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 500,
				description: `Internal Server error. Should not be reachable`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
		response: z.object({ project: Iri.regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/), standaloneProperties: z.array(Property), resources: z.array(Resource) }).partial().passthrough(),
		errors: [
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 500,
				description: `Internal Server error. Should not be reachable`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 500,
				description: `Internal Server error. Should not be reachable`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
				schema: z.string().regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/)
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Bad request`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 409,
				description: `Resource already exists`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 500,
				description: `Internal Server error. Should not be reachable`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
				schema: z.string().regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/)
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 500,
				description: `Internal Server error. Should not be reachable`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
				schema: z.string().regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/)
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Bad Request`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 500,
				description: `Internal Server error. Should not be reachable`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
				schema: z.string().regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/)
			},
			{
				name: "property",
				type: "Path",
				schema: z.string().regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/)
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Bad request`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 409,
				description: `Resource already exists`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 500,
				description: `Internal Server error. Should not be reachable`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
				schema: z.string().regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/)
			},
			{
				name: "property",
				type: "Path",
				schema: z.string().regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/)
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 500,
				description: `Internal Server error. Should not be reachable`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
				schema: z.string().regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/)
			},
			{
				name: "property",
				type: "Path",
				schema: z.string().regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/)
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 500,
				description: `Internal Server error. Should not be reachable`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
				schema: z.object({ subPropertyOf: Iri.regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/), class: Iri.regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/), datatype: z.string(), name: LangString, description: LangString, languageIn: z.array(z.string()), uniqueLand: z.boolean(), inSet: z.array(z.string()), minLength: z.union([z.number(), z.number()]), maxLength: z.union([z.number(), z.number()]), pattern: z.string(), minExclusive: z.union([z.number(), z.number()]), minInclusive: z.union([z.number(), z.number()]), maxExclusive: z.union([z.number(), z.number()]), maxInclusive: z.union([z.number(), z.number()]), lessThan: Iri.regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/), lessThanOrEquals: Iri.regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/) }).partial().passthrough()
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "property",
				type: "Path",
				schema: z.string().regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/)
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 500,
				description: `Internal Server error. Should not be reachable`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
				schema: z.string().regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/)
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 500,
				description: `Internal Server error. Should not be reachable`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
				schema: z.string().regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/)
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Bad Request`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 500,
				description: `Internal Server error. Should not be reachable`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
				description: `Bad request`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 409,
				description: `Userid or useriri already exists`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 500,
				description: `Internal Server error. Should not be reachable`,
				schema: z.void()
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
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 500,
				description: `Internal Server error. Should not be reachable`,
				schema: z.void()
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
		response: z.object({ nodeid: z.string(), creator: z.string(), created: z.string().datetime({ offset: true }), contributor: z.string(), modified: z.string().datetime({ offset: true }), prefLabel: LangString, description: LangString }).partial().passthrough(),
		errors: [
			{
				status: 403,
				description: `Invalid data`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
				description: `Bad request`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 409,
				description: `Resource already exists`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 500,
				description: `Internal Server error. Should not be reachable`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Bad request`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 409,
				description: `Resource already exists`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 500,
				description: `Internal Server error. Should not be reachable`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
				schema: z.object({ prefLabel: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]), definition: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]) }).partial().passthrough()
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
				description: `Bad request`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 500,
				description: `Internal Server error. Should not be reachable`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
				description: `Bad request`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 409,
				description: `Resource already exists`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 500,
				description: `Internal Server error. Should not be reachable`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
				schema: z.string().optional()
			},
		],
		response: z.object({ hlistIri: z.string(), creator: z.string(), created: z.string(), contributor: z.string(), modified: z.string(), hlistId: z.string(), prefLabel: LangString, definition: LangString, nodeNamespaceIri: z.string(), nodeClassIri: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Unspecified error`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
				description: `Several Errors that involve bad requests`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
		]
	},
	{
		method: "put",
		path: "/admin/permissionset/:definedByProject/:permissionSetId",
		alias: "putAdminpermissionsetDefinedByProjectPermissionSetId",
		description: `Creates a new permissionset in the database`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: z.object({ label: LangString, comment: LangString, givesPermission: z.enum(["DATA_RESTRICTED", "DATA_VIEW", "DATA_EXTEND", "DATA_UPDATE", "DATA_DELETE", "DATA_PERMISSIONS"]) }).partial().passthrough()
			},
			{
				name: "definedByProject",
				type: "Path",
				schema: z.string()
			},
			{
				name: "permissionSetId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Several Errors that involve bad requests`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 409,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 500,
				description: `Internal Server error. Should not be reachable`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
		]
	},
	{
		method: "delete",
		path: "/admin/permissionset/:definedByProject/:permissionSetId",
		alias: "deleteAdminpermissionsetDefinedByProjectPermissionSetId",
		description: `The user that has the rights (given by his token) deletes a permissionset`,
		requestFormat: "json",
		parameters: [
			{
				name: "definedByProject",
				type: "Path",
				schema: z.string()
			},
			{
				name: "permissionSetId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 409,
				description: `Conflict`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 500,
				description: `Internal Server error. Should not be reachable`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
		]
	},
	{
		method: "get",
		path: "/admin/permissionset/:definedByProject/:permissionSetId",
		alias: "getAdminpermissionsetDefinedByProjectPermissionSetId",
		description: `The user that has the rights (given by his token) gets Information about a permissionset`,
		requestFormat: "json",
		parameters: [
			{
				name: "definedByProject",
				type: "Path",
				schema: z.string()
			},
			{
				name: "permissionSetId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ permissionSetIri: z.string(), creator: z.string(), created: z.string().datetime({ offset: true }), contributor: z.string(), modified: z.string().datetime({ offset: true }), permissionSetId: z.string(), label: LangString, comment: LangString, givesPermission: z.string(), definedByProject: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
		]
	},
	{
		method: "post",
		path: "/admin/permissionset/:definedByProject/:permissionSetId",
		alias: "postAdminpermissionsetDefinedByProjectPermissionSetId",
		description: `The user that has the rights (given by his token) modifies a permissionset`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: z.object({ label: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough()]), comment: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough()]), givesPermission: z.union([z.array(z.string()), z.object({ add: z.array(z.enum(["DATA_RESTRICTED", "DATA_VIEW", "DATA_EXTEND", "DATA_UPDATE", "DATA_DELETE", "DATA_PERMISSIONS"])), del: z.array(z.array(z.enum(["DATA_RESTRICTED", "DATA_VIEW", "DATA_EXTEND", "DATA_UPDATE", "DATA_DELETE", "DATA_PERMISSIONS"]))) }).partial().passthrough()]) }).partial().passthrough()
			},
			{
				name: "definedByProject",
				type: "Path",
				schema: z.string()
			},
			{
				name: "permissionSetId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Several Errors that involve bad requests`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 500,
				description: `Internal Server error. Should not be reachable`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
		]
	},
	{
		method: "get",
		path: "/admin/permissionset/get",
		alias: "getAdminpermissionsetget",
		description: `Get complete permission set data by iri`,
		requestFormat: "json",
		parameters: [
			{
				name: "iri",
				type: "Query",
				schema: z.string()
			},
		],
		response: z.object({ creator: z.string(), created: z.string().datetime({ offset: true }), contributor: z.string(), modified: z.string().datetime({ offset: true }), permissionSetIri: z.string(), permissionSetId: z.string(), label: LangString, comment: LangString, givesPermission: z.string(), definedByProject: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Several Errors that involve bad requests`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 409,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 500,
				description: `Internal Server error. Should not be reachable`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
		]
	},
	{
		method: "get",
		path: "/admin/permissionset/search",
		alias: "getAdminpermissionsetsearch",
		description: `The user that has the rights (given by his token) searches for given parameters in permissionsets`,
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
			{
				name: "givesPermission",
				type: "Query",
				schema: z.string().optional()
			},
		],
		response: z.array(z.string()),
		errors: [
			{
				status: 400,
				description: `Several Errors that involve bad requests`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
				schema: z.object({ projectIri: z.string(), label: LangString, comment: LangString, namespaceIri: z.string(), projectStart: z.string(), projectEnd: z.string() }).partial().passthrough()
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
				description: `Several Errors that involve bad requests`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 409,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 500,
				description: `Internal Server error. Should not be reachable`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 500,
				description: `Internal Server error. Should not be reachable`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
		response: z.object({ projectIri: z.string(), creator: z.string(), created: z.string(), contributor: z.string(), modified: z.string(), label: LangString, comment: LangString, message: z.string(), shortName: z.string().regex(/^[a-zA-Z_][a-zA-Z0-9._-]*$/), "namespace IRI": z.string(), "project start": z.string(), "project end": z.string() }).partial().passthrough(),
		errors: [
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
				schema: z.object({ label: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]), comment: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]), projectStart: z.string().nullable(), projectEnd: z.string().nullable() }).partial().passthrough()
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
				description: `Several Errors that involve bad requests`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 500,
				description: `Internal Server error. Should not be reachable`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
				schema: z.string().optional()
			},
		],
		response: z.object({ projectIri: z.string(), creator: z.string(), created: z.string(), contributor: z.string(), modified: z.string(), label: LangString, comment: LangString, message: z.string(), shortName: z.string().regex(/^[a-zA-Z_][a-zA-Z0-9._-]*$/), "namespace IRI": z.string(), "project start": z.string(), "project end": z.string() }).partial().passthrough(),
		errors: [
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
				description: `Request has wrong or missing parameter`,
				schema: z.object({ message: z.string() }).passthrough()
			},
			{
				status: 404,
				description: `Project not found`,
				schema: z.object({ message: z.string() }).passthrough()
			},
			{
				status: 500,
				description: `Unknown error`,
				schema: z.object({ message: z.string() }).passthrough()
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
				description: `Several Errors that involve bad requests`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
				schema: z.object({ givenName: z.string(), familyName: z.string(), email: z.string().optional(), password: z.string().min(8), isActive: z.boolean().optional(), userIri: z.string().optional(), inProjects: z.array(z.object({ project: z.string(), permissions: z.array(z.enum(["ADMIN_OLDAP", "ADMIN_USERS", "ADMIN_PERMISSION_SETS", "ADMIN_RESOURCES", "ADMIN_MODEL", "ADMIN_CREATE"])) }).partial().passthrough()).optional(), hasPermissions: z.array(z.string()).optional() }).passthrough()
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
				description: `Several Errors that involve bad requests`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 403,
				description: `Connection failed`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 409,
				description: `Userid or useriri already exists`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 500,
				description: `Internal Server error. Should not be reachable`,
				schema: z.void()
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
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
		response: z.object({ creator: z.string(), created: z.string().datetime({ offset: true }), contributor: z.string(), modified: z.string().datetime({ offset: true }), userIri: z.string(), userId: z.string(), family_name: z.string(), given_name: z.string(), email: z.string(), is_active: z.boolean().optional(), in_projects: z.array(z.object({ project: z.string(), permissions: z.array(z.string()) }).partial().passthrough()).optional(), has_permissions: z.array(z.string()).optional() }).passthrough(),
		errors: [
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
				schema: z.object({ userId: z.string(), givenName: z.string(), familyName: z.string(), email: z.string(), password: z.string(), isActive: z.boolean(), inProjects: z.union([z.object({ add: z.object({ project: z.string(), permissions: z.union([z.array(z.string()), z.null()]) }).partial().passthrough(), del: z.array(z.string()) }).partial().passthrough(), z.array(z.object({ project: z.string(), permissions: z.union([z.array(z.string()), z.object({ add: z.array(z.string()), del: z.array(z.string()) }).partial().passthrough(), z.null()]) }).partial().passthrough())]), hasPermissions: z.union([z.array(z.string()), z.object({ add: z.array(z.string()), del: z.array(z.string()) }).partial().passthrough()]) }).partial().passthrough()
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
				description: `Several Errors that involve bad requests`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Userid not found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 500,
				description: `Internal Server error. Should not be reachable`,
				schema: z.void()
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
		response: z.object({ creator: z.string(), created: z.string().datetime({ offset: true }), contributor: z.string(), modified: z.string().datetime({ offset: true }), userIri: z.string(), userId: z.string(), family_name: z.string(), given_name: z.string(), email: z.string(), is_active: z.boolean().optional(), in_projects: z.array(z.object({ project: z.string(), permissions: z.array(z.string()) }).partial().passthrough()).optional(), has_permissions: z.array(z.string()).optional() }).passthrough(),
		errors: [
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 404,
				description: `Not Found`,
				schema: z.object({ message: z.string() }).partial().passthrough()
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
				description: `Several Errors that involve bad requests`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
			{
				status: 403,
				description: `Unauthorized`,
				schema: z.object({ message: z.string() }).partial().passthrough()
			},
		]
	},
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
    return new Zodios(baseUrl, endpoints, options);
}
