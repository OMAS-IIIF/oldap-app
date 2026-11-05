/**
 * openapi-zod-client 1.18 emits only a record for InstanceData, discarding its
 * declared properties although its TypeScript type still requires them.
 * Restore that part of the schema after generation; keep additional RDF keys.
 * Fail on unexpected generator output so a contract change requires review.
 */
import { readFileSync, writeFileSync } from 'node:fs';
const path = new URL('../src/lib/apischema/zod.ts', import.meta.url);
const source = readFileSync(path, 'utf8');
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
}).catchall(z.union([ValueArray, z.string(), z.number(), z.boolean(), z.null(), AttachedToRoleMap]));`;
writeFileSync(path, source.replace(pattern, fixed));
