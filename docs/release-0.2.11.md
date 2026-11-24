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

## Home deployment

Home now runs the accepted 0.2.11 image above, alongside FasnachtsPage 0.1.54.
Container package versions and read-only browser acceptance across seven frontend
URLs pass with no uncaught exceptions. Six sibling container IDs are unchanged;
API health remains 1.2.4 and Jena is reachable. The final deployment plan reports
no configuration changes (Ansible: ok=4, changed=0, failed=0). Production is untouched.

Selection: `../oldap-setup/releases/home-frontends-20261124.json`.
Rollback: `../oldap-setup/releases/home-frontends-20261124-rollback.json`, using
`make plan-home` then `make deploy-home` with the absolute `RELEASE_FILE` and the
established protected `ANSIBLE_BECOME_ARGS`. No database restore is involved.
Compose backup: `/opt/oldap/compose/routine-update-20261124T224917713276Z`.
Combined evidence: `../oldap-setup/docs/home-frontends-20261124.md` and its JSON receipt.

After image pull exhausted the host root filesystem, only unused, registry-verified
Fasnacht v0.1.41/v0.1.42/v0.1.43 image caches were removed. The current and rollback
images remain available; the root filesystem has approximately 2.7 GB free (94% used).

## Production promotion — 2026-11-25

The exact Home-accepted image is now active on production. Runtime versions,
seven read-only browser checks and the final unchanged plan pass. Only the two
frontends changed; six sibling IDs and API/Jena 1.2.4 health are retained.
Named-user live editing was not exercised. Evidence and image-only rollback:
`../oldap-setup/docs/production-frontends-20261125.md`.
