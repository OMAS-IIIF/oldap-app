# Dependency security review — 2026-11-09

## Remediation follow-up

The compatible fixes below are implemented locally and tested; the original
audit sections remain historical evidence. No image publication or deployment
has occurred.

| Dependency | Previous | Updated |
|---|---|---|
| Handlebars | 4.7.9 | 4.7.10 |
| Axios | 1.18.1 | 1.21.1 |
| follow-redirects | 1.16.0 | 1.16.3 |
| devalue | 5.8.2 | 5.9.4 |
| Vitest | 3.2.7 | 4.1.12 |
| Tinypool | 1.1.1 | Removed by Vitest 4 |
| esbuild | Forced 0.24.2 | 0.25.12, normal Vite dependency |

Vitest uses `test.projects` and `defineConfig` from `vitest/config`; existing
client/server test boundaries remain intact. Removing the historical esbuild
override restores Vite's declared ^0.25.0 range. Docker still keeps its original
GOMAXPROCS=1 setting. No application API/generated schema is changed.

Fresh audits: full tree 33 → 25 package entries, critical 3 → 0; runtime-only
5 → 2 high package entries, both Zod and its parent @zodios/core. Remaining
framework/build-tool findings are not silently dismissed. Version updates stayed
within existing ranges except the explicitly tested Vitest major upgrade.

Validation: Svelte check has zero errors/warnings; all 20 unit tests and four
mocked browser workflows pass; targeted ESLint passes. Production build and
clean Linux/AMD64 Docker build pass with the unmodified Dockerfile. Runtime
image startup/version/absence checks are recorded in the remediation evidence.
No test-server or smoke container is left running.

### Separate Zod assessment

Registry metadata still lists @zodios/core 10.9.6 as latest, requiring zod ^3.x;
the latest Zod 3 is 3.25.76. Therefore no compatible upstream patched version
is available through that contract. Do not force Zod 4 or disable validation
merely to suppress the audit. The generated client includes array schemas and
validates API responses; checked +server/+page.server code does not expose a
Zod request-body parsing route. This narrows the observed server entry points,
but does not prove oversized or unexpected API data harmless in a browser.
A supported client/generator migration or a maintained upstream Zod-3 fix needs
its own contract tests. This finding remains open and is not claimed mitigated.

Vitest migration reference: https://v4.vitest.dev/guide/migration.html

## Original scope and evidence

Read-only review of oldap-app after mainline integration. No dependency, runtime,
image or deployment changes; no exploit payloads were sent to production.
The GitHub Dependabot alert endpoint returns 403 for the available credential, so
the two critical alerts announced by GitHub cannot be mapped to exact alert IDs.
Do not present the independent npm audit as that exact GitHub alert list.

Current npm audit reports 33 package entries: 3 critical, 12 high, 12 moderate,
6 low. Three critical entries represent two originating packages (Handlebars,
Tinypool), with severity also propagated to Vitest. There are four distinct
critical advisory IDs. GitHub and npm count differently and may refresh at
different times. The old-main, current and deployed package-lock.json SHA-256 is
identical: b46bf54fd96ac46d3cdb0a2c17b72267756a7539fc3fedebb1137bbde19531d7.
The merge did not introduce these dependency versions.

Production was inspected via read-only docker exec on dhlab-oldap, container
oldap-app. Image ID: sha256:6579efecdce4c19084f1630a804f59bb25766a62d379f30faef38a88003b63af.
Source fingerprint: 6e5e392b8e5a7cf4ab3ad8e4472eb27862257995240ac5fab706de2786368904.
All installed package manifests were scanned, including nested packages.
Handlebars, Tinypool and Vitest are absent. The Dockerfile installs runtime
packages with npm ci --omit=dev. No application import of those tools was found.
The only Handlebars text match in built JS is a MIME-name entry
(text/x-handlebars-template), not a template compiler import.
This supports no identified exposure to these critical tools in the deployed
application; it is not a general security guarantee or a forensic incident audit.

## Critical development dependencies

| Package/path | Installed development version | Findings | Recommended correction |
|---|---|---|---|
| openapi-zod-client → handlebars | 4.7.9 | Two critical code-injection advisories | Update lock resolution to at least 4.7.10; allowed by existing ^4.7.7 range |
| vitest → tinypool | 3.2.7 → 1.1.1 | Two critical prototype-pollution-to-code-execution advisories | Upgrade the supported test-tool chain to resolve Tinypool >=2.1.2; avoid a forced incompatible transitive override |

Handlebars AST type confusion requires untrusted object input reaching compile or
precompile. The other advisory involves unsafe prototype-access settings with
untrusted templates/data. OLDAP uses it in the developer-only API generator with
repository inputs, not a public rendering endpoint. Developer/build access remains
security relevant; absence from runtime is not a reason to leave it unpatched.

Tinypool's advisories require an upstream prototype-pollution primitive and relevant
worker/run options. The identified path is Vitest on development/test machines.
Registry metadata confirms Vitest 4.1.12 supports Node 20 and Vite 6, making that
line a candidate for testing; it is not yet accepted or proven fixed by installation.
The audit's automatic suggestion is Vitest 5.1.0, which requires newer Node.
Confirm the actual resolved dependency tree and unit tests after any upgrade.

Primary advisory/release references:

- https://github.com/advisories/GHSA-8r5x-fm3f-whwj
- https://github.com/advisories/GHSA-p8wg-vrv2-v86f
- https://github.com/handlebars-lang/handlebars.js/releases/tag/v4.7.10
- https://github.com/advisories/GHSA-5gmw-xhrv-c9v3
- https://github.com/advisories/GHSA-85c8-ppgw-ccpr
- https://github.com/tinylibs/tinypool/releases/tag/v2.1.2

## Runtime findings and priorities

npm audit --omit=dev reports zero critical and five high package entries:
axios 1.18.1, follow-redirects 1.16.0, devalue 5.8.2, zod 3.25.76 and the parent
@zodios/core (severity inherited from Zod). The first four versions are confirmed
installed in production. Package count is not a count of distinct vulnerabilities.
SvelteKit also bundles framework dependencies, so omit=dev alone is not a complete
production exposure assessment. No production attack-path exploitability claim
is made for these high findings in this initial review.

Recommended follow-up:

1. Apply the small Handlebars lock update, then the compatible Axios,
   follow-redirects and devalue fixes, inspecting the lock diff. Test typechecking,
   unit/browser behavior, production build and clean runtime image.
2. Upgrade Vitest with its own test compatibility checks; confirm the resolved
   Tinypool version and a fresh audit, rather than trusting the parent version.
3. Review SvelteKit/Vite/build-tool findings and the existing esbuild 0.24.2
   override together; do not retain a known vulnerable override without a reason.
4. Treat Zod separately: @zodios/core 10.9.6 requires ^3.x, while the advisory's fix
   is 4.6.6. Never force Zod 4 under that incompatible peer contract. Assess actual
   oversized-collection validation paths and supported API-client options first.

Zod reference: https://github.com/advisories/GHSA-mrhx-c7xc-m3w5

No automatic audit fix, version bump, API schema regeneration, package installation
or deployment was performed. The accompanying JSON retains the audit metadata and
advisory/package ranges for follow-up; the review is a point-in-time snapshot.
