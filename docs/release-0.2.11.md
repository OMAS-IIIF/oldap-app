# OLDAP App 0.2.11

Patch release for the framework and API-client security migration. SvelteKit 3,
Vite 8 and TypeScript 6 run on Node 24 in Docker. The generated Hey API/Axios/Zod 4
client replaces Zodios/Zod 3 while preserving validation, authentication retries,
query serialization and RDF values. Full and production npm audit have no findings.
Details: [security migration](dependency-security-review-20261124.md).

The user authorized source/tag and Docker publication plus deployment to home
first. Production activation is not part of this release task. The version-only
image tag is `lrosenth/oldap-app:v0.2.11`; previous tags and `latest` are preserved.
Published source/tag: `c6338c3d1bcedec114d234d2376c55422380e83f` / `v0.2.11`.
The accepted immutable image is
`lrosenth/oldap-app@sha256:3e084fe78b30b27867e0d916fe2104b73936e05078e87615e82c0e91d0397333`.
Both AMD64/ARM64 image startup checks pass on Node 24.22.3: package version,
English/German HTML, runtime public endpoint and absence of the private endpoint
from HTML. Temporary containers are removed; `latest` is unchanged.
[Image receipt](release-0.2.11-images.json). Home activation and the previous live
image/rollback selection are recorded by the sibling `oldap-setup` deployment task.

Release validation: typecheck (zero errors/warnings), 65 unit/component tests,
29 mocked browser workflows, production build and diff whitespace checks pass.
