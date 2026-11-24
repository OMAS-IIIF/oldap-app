import { defineConfig } from '@hey-api/openapi-ts';

/** Generate the HTTP contract, runtime validators, and Axios SDK together. */
export default defineConfig({
	input: '../oldap-api/API-def/oldap-api.yaml',
	output: 'src/lib/apischema/generated',
	plugins: [
		'@hey-api/typescript',
		'@hey-api/client-axios',
		{
			name: 'zod',
			compatibilityVersion: 4,
			dates: { offset: true },
			// Hey API otherwise drops schema-valued additionalProperties on
			// objects with named fields (including dynamic RDF properties).
			'~resolvers': {
				// Zod intersections are binary; the generator otherwise emits
				// invalid calls for allOf with three or more branches.
				intersection(ctx) {
					if (ctx.childResults.length < 3) return undefined;
					return ctx.childResults
						.slice(1)
						.reduce(
							(chain, child) => chain.attr('and').call(child.chain),
							ctx.childResults[0].chain
						);
				},
				object(ctx) {
					const base = ctx.nodes.base(ctx);
					// OpenAPI permits additional fields unless explicitly prohibited.
					if (!ctx.schema.additionalProperties) return base.attr('passthrough').call();
					if (!ctx.schema.properties) return base;
					const additional = ctx.nodes.additionalProperties({
						...ctx,
						schema: { ...ctx.schema, properties: undefined }
					});
					return additional ? base.attr('catchall').call(additional) : base;
				}
			}
		},
		{
			name: '@hey-api/sdk',
			auth: false,
			validator: { request: 'zod', response: 'zod' }
		}
	]
});
