/**
 * openapi-zod-client 1.18 emits only a record for InstanceData, discarding its
 * declared properties although its TypeScript type still requires them.
 * Restore that part of the schema after generation; keep additional RDF keys.
 * Fail on unexpected generator output so a contract change requires review.
 */
import { readFileSync, writeFileSync } from 'node:fs';
const path = new URL('../src/lib/apischema/zod.ts', import.meta.url);
let source = readFileSync(path, 'utf8');
const pattern = /^const InstanceData: z\.ZodType<InstanceData> = .*;$/m;
if (!pattern.test(source))
	throw new Error('InstanceData declaration changed; review schema generation.');
const fixed = `const InstanceData: z.ZodType<InstanceData> = z.object({
    "rdf:type": z.array(z.string()).optional(),
    "virtual:inferredTypes": z.array(z.string()).optional(),
    "oldap:attachedToRole": AttachedToRoleMap.optional(),
    "oldap:createdBy": z.array(z.string()),
    "oldap:lastModifiedBy": z.array(z.string()),
    "oldap:creationDate": z.array(z.string()),
    "oldap:lastModificationDate": z.array(z.string())
}).catchall(z.union([ValueArray, DatingValue, z.string(), z.number(), z.boolean(), z.null(), AttachedToRoleMap]));`;
source = source.replace(pattern, fixed);

// ResourceSummary.data has the same named-properties-plus-record generator bug.
const summaryRecord =
	'data: z.record(z.union([ValueArray, DatingValue, z.string(), z.number(), z.boolean(), z.null()]))';
const summaryLine = /^const ResourceSummary: z\.ZodType<ResourceSummary> = .*;$/m;
const summary = source.match(summaryLine)?.[0];
if (!summary?.includes(summaryRecord))
	throw new Error('ResourceSummary data declaration changed; review schema generation.');
source = source.replace(
	summaryLine,
	summary.replace(
		summaryRecord,
		`data: z.object({
    "rdf:type": z.array(z.string()).min(1),
    "virtual:inferredTypes": z.array(z.string()).optional()
}).catchall(z.union([ValueArray, DatingValue, z.string(), z.number(), z.boolean(), z.null()]))`
	)
);

// The generator preserves PropertyCreate fields but ignores oneOf required/not.
// Restore the exact exclusive datatype/class rule from its OpenAPI definition.
const createLine = /^const PropertyCreate: z\.ZodType<PropertyCreate> = .*;$/m;
const create = source.match(createLine)?.[0];
const unsupportedChoice = '.and(z.union([z.unknown(), z.unknown()]))';
if (!create?.includes(unsupportedChoice))
	throw new Error('PropertyCreate choice declaration changed; review schema generation.');
source = source.replace(
	createLine,
	create.replace(
		unsupportedChoice,
		'.refine((value) => (value.datatype !== undefined) !== (value.class !== undefined), "Supply exactly one of datatype or class")'
	)
);
// Keep generator-produced blank lines clean without hand-editing the output.
writeFileSync(path, source.replace(/[ \t]+$/gm, ''));
