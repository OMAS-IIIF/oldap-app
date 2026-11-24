# Dependency security migration — 2026-11-24

## Changes and scope

The starting audit reported six affected package entries (two low, four high).
They came from SvelteKit/cookie and Zod 3, including inherited findings in Zodios
and openapi-zod-client. This migration replaces the previously accepted Zod 3
limitation; it does not publish or deploy a release.

- SvelteKit 3.4.0, adapter-node 6.0.5, Vite 8.3.8, Svelte 5.59.1 and TypeScript
  6.0.3 form the coordinated framework update. Configuration moved to
  `vite.config.ts`; imports use `#lib/*` and explicit extensions. Hooks and public
  runtime environment declarations follow SvelteKit 3.
- Node >=22.18 is required; both Docker stages now use Node 24. Public API/media
  origins remain runtime values. `SERVER_API_URL` stays server-only.
- Hey API 0.99.0 generates the Axios SDK, TypeScript types and Zod 4 validators.
  Zod resolves to 4.6.7. Zodios and openapi-zod-client are removed. SDK operations
  use a single options object with `body`, `path` and `query`; transport remains
  behind `src/lib/shared/apiClient.ts`.
- Request/response validation, raw-path encoding, bracketed array query values, Axios
  error identity, credentialed browser requests and bounded authenticated retries
  are preserved. Typed options also corrected the role-delete `roleId` path key;
  update notifications use the submitted identifier instead of nonexistent
  response fields.
- The sibling `oldap-api/API-def/oldap-api.yaml` now correctly describes project
  short names and project/list audit timestamps as emitted by existing serializers.
  Project start/end remain dates. Property references accept compact/absolute IRIs,
  and annotation types include the deployed OwlAnnotationProperty spelling. These
  are descriptions of existing wire behavior, with no backend runtime change or
  deployment needed.
- The generator needs explicit support for named fields with typed additional
  properties, binary intersections and RFC3339 offsets. A checked post-generation
  adaptation preserves PropertyCreate's exclusive datatype/class constraint.
  Contract tests cover dynamic RDF data, audit fields, zero/null/false values,
  multiple superproperties, offset timestamps and deployed annotation/reference values. Generated files are never edited
  directly; rerun `npm run zod` against the intended sibling API contract.
- A scoped override upgrades the generator's pinned `js-yaml` 4.2.0 to 4.3.2.
  This stays within the same major version and removes the YAML resource-exhaustion
  findings. Remove it once the upstream parser dependency includes these fixes.
- Vite 8 removes esbuild from this dependency tree, so its old script approval is
  removed. The optional macOS fsevents install hook is denied; the package includes
  its native binary. No dependency scripts have blanket permission.

## Verification

Final results:

| Check | Result |
| --- | --- |
| Full and production-only npm audit | 0 vulnerabilities |
| Clean npm ci; install-script policy review | Pass; no unreviewed scripts |
| npm run zod repeated on final contract | Byte-for-byte identical output |
| npm run check | 0 errors, 0 warnings |
| Unit/component/transport tests | 65 passed |
| Mocked Chromium workflows | 29 passed |
| Production build | Passed |
| Local Linux ARM64 Docker build/start | Passed, Node 24.22.3 |
| Sibling OpenAPI validation and metadata assertions | Passed |
| Changed-tool formatting and diff whitespace checks | Passed |

Independent review identified and resolved offset-timestamp and prefixed-auth-route
regressions, plus existing wire-schema discrepancies exposed by stricter validation.
Browser tests cover locale navigation/reload, authentication, queries, pagination,
property edits, reifier policies and failure recovery. Fixtures now mirror the real
serializer's omission of removed constraints and implicit property types.

A direct built-Node-adapter smoke test also passed. The adapter smoke test
sets a different public origin only at startup, checks English/German HTML and
verifies that the private server origin is not exposed in that HTML.

The final local Docker image is `oldap-app:security-20261124-local`; its isolated
smoke container was removed. AMD64 image validation remains a release step.

No live backend writes or production deployment are part of this work. A clean
npm audit reports known dependency advisories; it is not a whole-product security
certification. Existing product-review gaps remain separate.

## References

- [SvelteKit 3 migration](https://svelte.dev/docs/kit/migrating-to-sveltekit-3)
- [SvelteKit remote-function DoS](https://github.com/advisories/GHSA-3r8g-jcqq-3p5j)
- [Zod resource exhaustion](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5)
- [YAML merge-key resource exhaustion](https://github.com/advisories/GHSA-2883-xcg3-v3hh)
- [npm install-script approvals](https://docs.npmjs.com/cli/v11/commands/npm-install-scripts/)
