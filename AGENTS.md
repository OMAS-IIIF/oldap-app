# Repository instructions

- Keep API transport behind `src/lib/shared/apiClient.ts`; regenerate its schema with `npm run zod` from the sibling `oldap-api` contract. Do not hand-edit generated schemas.
- Keep domain conversion in `src/lib/oldap/classes`. Resource properties use the API's flat model; resource-property updates are flat patches.
- Form drafts must not mutate shared model stores before a successful write. Preserve fields not edited by the form, including reverse-path and annotation metadata.
- Use `npm run check`, `npm run test:unit -- --run`, and relevant mocked Playwright workflows for functional changes. Browser tests must not write to live services.
- Keep the frontend backend-neutral: consume HTTP contracts rather than SPARQL or reasoner assumptions.

- Follow `docs/reifier-shapes.md` for full-field replacement, shared ownership and property-use policy semantics when changing reifier-shape workflows.

- Use Node.js >=22.18 (Docker: Node 24). SvelteKit configuration lives in `vite.config.ts`; local imports use `#lib/*` with explicit file extensions.
- Preserve generated request/response validation and Axios authentication retry/error semantics when changing API generation. Generator adaptations belong in `openapi-ts.config.ts` or `tools/fix-generated-schema.mjs`, backed by contract tests.
