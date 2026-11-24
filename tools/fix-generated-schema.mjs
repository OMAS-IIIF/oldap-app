/**
 * Hey API 0.99 does not implement OpenAPI required/not-only oneOf branches.
 * Preserve PropertyCreate's exclusive datatype/class rule after generation.
 * Named properties and typed additionalProperties are handled by the Zod
 * resolver in openapi-ts.config.ts; never edit generated schemas manually.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const path = new URL('../src/lib/apischema/generated/zod.gen.ts', import.meta.url);
const source = readFileSync(path, 'utf8');
const declaration = /export const zPropertyCreate = [\s\S]*?;(?=\n)/;
const original = source.match(declaration)?.[0];
if (!original?.endsWith('}).catchall(z.never()).and(z.unknown());')) {
	throw new Error('PropertyCreate generation changed; review the exclusive type rule.');
}
const corrected = original.replace(
	'}).catchall(z.never()).and(z.unknown());',
	'}).catchall(z.never()).refine((value) => (value.datatype !== undefined) !== (value.class !== undefined), "Supply exactly one of datatype or class");'
);
writeFileSync(path, source.replace(declaration, corrected));
