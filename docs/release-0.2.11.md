# OLDAP App 0.2.11

Patch release for the framework and API-client security migration. SvelteKit 3,
Vite 8 and TypeScript 6 run on Node 24 in Docker. The generated Hey API/Axios/Zod 4
client replaces Zodios/Zod 3 while preserving validation, authentication retries,
query serialization and RDF values. Full and production npm audit have no findings.
Details: [security migration](dependency-security-review-20261124.md).

The user authorized source/tag and Docker publication plus deployment to home
first. Production activation is not part of this release task. The version-only
image tag is `lrosenth/oldap-app:v0.2.11`; previous tags and `latest` are preserved.
Exact immutable image, acceptance and rollback are recorded after publication.

Release validation: typecheck (zero errors/warnings), 65 unit/component tests,
29 mocked browser workflows, production build and diff whitespace checks pass.
