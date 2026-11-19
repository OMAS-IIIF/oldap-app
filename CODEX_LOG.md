### Update 2026-11-19 23:52
- Decisions: Completed the authorized 0.2.10 publication and production deployment.
- Implementation: Published source e094743/tag v0.2.10 and accepted AMD64/ARM64 image 47cbd36466e6. Shared updater replaced only oldap-app; seven sibling containers unchanged. Recorded immutable selection, rollback and receipt in sibling setup repository.
- Open: Authenticated user workflow acceptance; no live content writes or home deployment.
- Risks/Assumptions: 55 unit/component tests, 28 mocked browser workflows, typecheck, build, both image smoke checks, public browser/HTTP/API health and final no-change deployment plan pass. See ../oldap-setup/docs/oldap-app-0.2.10-release.md.

### Update 2026-11-19 23:48
- Decisions: Release the current reviewed frontend as 0.2.10 and deploy only oldap-app to production, as requested.
- Implementation: Bumped package manifests; includes resource pagination, detached property/reifier editors, multiple superproperties and restored-session avatars. Production API 1.2.3/library 1.2.2 already provides the matching backend contract.
- Open: Immutable image publication, production activation and live read-only acceptance.
- Risks/Assumptions: Preserve sibling services and data; use the shared image-only updater and retain the previous app digest for rollback. Source validation recorded in release evidence.

### Update 2026-11-18 23:32
- Decisions: Support complete superproperty sets across the library/API/UI; valid imported DCTERMS hierarchies must not prevent model loading.
- Implementation: Decode scalar/array parents into detached IRI lists, regenerate the API client, and add/remove parent rows in ordinary and annotation editors. Preserve full IRIs and local constraints, prevent foreign hierarchy edits, and retain unchanged parents in flat patches/full field replacements. Multiple-parent edits never infer an arbitrary parent's value type. Updated model documentation and coordinated sibling library/API/tools compatibility.
- Open: Coordinated deployment and read-only Salsah model acceptance on the intended server; no live writes or deployment.
- Risks/Assumptions: 55 unit/component tests and all 28 mocked browser workflows pass; strengthened multi-to-single constraint regression passes separately. Build, typecheck (zero errors/warnings), formatting and diff checks pass. Initial concurrently run frontend checks interfered with generated build artifacts; sequential build/browser verification passes. Independent review findings (type inference and library generic setter) are resolved. Isolated sibling checks pass: library 90 tests (7 skipped), API 18 tests, tools 85 tests plus 3 subtests (5 Jena cases deselected). Real DCTERMS/inherited model regression passes.

### Update 2026-11-18 22:23
- Decisions: Derive avatar presentation from the current user instead of initializing it only during manual login.
- Implementation: User.svelte reacts to restored/replaced users and clears presentation for anonymous access; login no longer mutates avatar metadata or redundantly writes the user store. Added a mocked browser regression verifying a loaded avatar before and after reload.
- Open: No deployment.
- Risks/Assumptions: Gravatar availability remains external; browser image responses are mocked. All 50 unit/component tests, three session-restoration browser workflows, production build, typecheck (zero errors/warnings), formatting and diff whitespace checks pass.

### Update 2026-11-18 22:16
- Decisions: Center the pagination bar horizontally within the resource list.
- Implementation: Added flex justification to center the page controls and page indicator, including wrapped rows.
- Open: No deployment.
- Risks/Assumptions: Styling-only change; npm run check passes with zero errors and warnings.

### Update 2026-11-18 11:57
- Decisions: Replace text-only pagination with a compact grouped page selector.
- Implementation: First/previous/next/last chevrons, at most five centered page numbers with boundary clamping and omission ellipses, active-page styling and aria-current. Localized accessible names/tooltips; retain loading/boundary disabling and existing request behavior.
- Open: No deployment.
- Risks/Assumptions: All 50 unit/component tests, 26 browser workflows, production build, typecheck (zero errors/warnings), and diff whitespace checks pass. Five-/ten-page browser cases verify centered numbers, ellipses, offsets, active-page semantics and boundary disabling; the middle-page screenshot was visually inspected.

### Update 2026-11-18 11:40
- Decisions: Reduce resource-list latency with local request scheduling only; retain existing API queries and fresh totals.
- Implementation: Fetch count and requested page concurrently; fetch a corrected page only when the total shrinks past the requested offset. Load media metadata in batches of at most five instead of serially, retaining partial-preview failure tolerance and stale-context guards.
- Open: No deployment or live latency measurement.
- Risks/Assumptions: Same ordinary request count, with one extra page read only for a clamped offset. Actual speedup depends on server concurrency and query cost. All 50 unit/component tests, 24 mocked browser workflows, production build, typecheck (zero errors/warnings), and diff whitespace checks pass. Deterministic browser tests verify overlapping count/page requests, bounded media batches (5+5+2), missing-preview tolerance, pagination and session recovery.

### Update 2026-11-18 00:46
- Decisions: Page the resource list through the existing limit/offset API with a fixed size of 25.
- Implementation: Localized previous/next controls, page and result-range indicators; fresh counts clamp navigation when totals shrink. Page changes retain submitted columns and commit page/results together only on success; Retrieve and context changes reset to the first page.
- Open: No deployment or live-service writes.
- Risks/Assumptions: Offset pagination uses the API's stable ordering; concurrent data changes between count and retrieval are not a snapshot. All 50 unit/component tests, 22 mocked browser workflows, production build, typecheck (zero errors/warnings) and diff whitespace checks pass. Browser coverage verifies three pages, limits/offsets, boundaries, retry with preserved rows, submitted columns, class reset and shrinking totals.

### Update 2026-11-18 00:38
- Decisions: Restore the home resource-list workflow using the existing class-list API and movable desktop window.
- Implementation: Deduplicate inherited/reused property choices by IRI, derive class choices without mutating shared models, and clean up subscriptions. Snapshot result columns, reject stale reads on context change/close, retain results across token renewal, and guard project/model ownership. Report loading, empty results, API failures in the standard popup, and the first-100 limit explicitly; preserve numeric text and add an accessible toolbar name.
- Open: No deployment or live-service writes. Live acceptance against the selected project remains a release check.
- Risks/Assumptions: Duplicate-property fixture reproduces the original blank/frozen controls; simpler model does not. Existing API limit remains 100; pagination and structured-value rendering are outside this repair. Validation: 50 unit/component tests, all 20 mocked browser workflows, production build, typecheck (zero errors/warnings), and diff whitespace checks pass. Browser coverage includes duplicate choices, class switching, dragging, scalar IDs, numeric text, partial/empty results, popup/retry, token renewal and closed-window stale responses.

### Update 2026-11-18 00:18
- Decisions: Expose shared predicate hierarchy in annotation fields using the existing shape workflow; foreign predicate hierarchy is read-only.
- Implementation: Added optional subPropertyOf prefix/local-name controls, translated shared-effect guidance, lossless serialization and regenerated the API client. Added component/domain and mocked browser coverage for persistence, replacement, clearing and ownership. Updated workflow/context documentation.
- Open: No release/deployment. API and library changes must ship together; native Jena/live acceptance remains separate.
- Risks/Assumptions: 50 frontend unit/component tests and 16 browser workflows pass; production build and typecheck (zero errors/warnings) pass. Existing full-field replacement semantics apply, without a client ETag.

### Update 2026-11-17 23:43
- Decisions: Align reifier-shape controls with existing app actions and error presentation.
- Implementation: Added model-panel spacing and round plus actions; split field identifiers into a prefix selector (including external ontologies) and local name. Shape errors use the shared popup with native modal stacking; closing/Escape preserves drafts, and discarded loads cannot publish late errors. Updated workflow docs.
- Open: No deployment performed.
- Risks/Assumptions: Existing unknown prefixes remain selectable to preserve stored identifiers. Validation: 48 unit/component tests and 15 mocked browser workflows pass, including external-prefix payloads, popup dismissal and stale-load cancellation; visual checks cover spacing, prefix controls and popup styling.

### Update 2026-11-17 23:18
- Decisions: Add RDF 1.2 reifier-shape model management through the existing API; keep definition ownership separate from resource-property policy and defer instance annotation UI.
- Implementation: Shape domain/round-trip serializer, model shape collection, local/shared CRUD dialogs with full field replacement and advanced constraints, three-state property-use policy, localized copy, and read-only refresh retries after committed writes. Preserve unsupported read constraints but reject lossy replacements; reject fractional/unsafe numeric integer enumerations. Added domain, component and mocked browser regressions.
- Open: Live acceptance in a disposable project on the intended API/ontology version; instance annotation viewing/editing remains next. API has no client ETag concurrency contract.
- Risks/Assumptions: No live writes or deployment. Existing dirty files preserved. Independent review issues resolved. Validation: 46 unit/component tests, 14 browser workflows, production build, clean typecheck and visual dialog inspection pass.

### Update 2026-11-17 23:02
- Decisions: Repair the property editor and current HTTP contract before adding reification UI; remove obsolete OWL controls without deleting stored metadata.
- Implementation: Independent form drafts and flat deltas; optional QName/number normalization; deduplicated ancestor suggestions; safe zero/removal/bound handling; model refresh after writes; current generated API client and guarded record-schema fixes. Added domain, contract, serializer, component and browser regressions. Corrected property PUT/POST schemas in sibling oldap-api.
- Open: Verify the deployed API/ontology combination using a disposable project. Reifier-shape and annotation UI remain deferred; the existing generic Property read-schema generator limitation is documented in docs/property-editor.md.
- Risks/Assumptions: No live writes, service changes or deployment. Temporal bounds remain preserved but are not edited through numeric controls. Validation: 34 unit/component tests, 8 mocked browser workflows, build and typecheck pass; independent review findings resolved.

### Update 2026-11-10 22:49
- Decisions: Complete the 0.2.9 rollout on home using the production-accepted image.
- Implementation: Home app-only update passed; version/origins, public HTTP/API health and browser shell verified, seven sibling container IDs unchanged. Rollback recorded in sibling setup release evidence.
- Open: Known functional gaps and broader product review; no fresh authenticated edit/upload acceptance.
- Risks/Assumptions: No source/image change, API restart or database migration.

### Update 2026-11-10 22:42
- Decisions: Publish/deploy owner-accepted current 0.2.9 implementation despite known feature gaps; separate broader remediation.
- Implementation: Built clean f67cbc2 archive for AMD64/ARM64, verified startup/version/HTTP HTML, pushed immutable v0.2.9 index 0a5bd7223775. Production scoped deployment passed with unchanged sibling container IDs and public/browser smoke. Recorded setup evidence/rollback.
- Open: Home deployment after VPN shutdown; full functional review and authenticated workflow acceptance.
- Risks/Assumptions: No latest overwrite, data changes or API/database restart. Earlier source test coverage does not claim entire application correctness.

### Update 2026-11-10 22:39
- Decisions: Owner explicitly accepts releasing the current incomplete application; publish patch 0.2.9 with the reviewed inversePath correction. Broader defects/features remain a separate work package.
- Implementation: Increased package/lockfile version from 0.2.8 to 0.2.9; runtime source remains the tested a766113 implementation.
- Open: Multi-platform image acceptance/publication and scoped deployment.
- Risks/Assumptions: Prior 21 unit/component tests, four mocked browser workflows, build/typecheck and eleven read-only production API checks pass. This is not whole-product acceptance.

### Update 2026-11-10 19:26
- Decisions: Consolidate in OLDAP/oldap-app/main and limit this step to current API compatibility; defer the owner-requested broader bug/feature review to a separate work package.
- Implementation: Fast-forwarded published 0.2.8 history and installed locked dependencies. Retained/cloned inversePath in PropertyClass; shared create/edit field selection excludes reverse paths and legacy inverseOf while preserving source model order. Added regression coverage and current review documentation.
- Open: Future patch release/image/deployment; systematic administrative workflow review with the owner. Fulltext configuration and inversePath authoring remain API/tools operations, not completed frontend features.
- Risks/Assumptions: 21 unit/component tests, four mocked browser tests, build and zero-warning typecheck pass. Eleven production Jena API GET probes pass (empty list search does not verify list-node rendering). No live writes, role changes or deployment; tests do not establish whole-product correctness or completeness.

### Update 2026-11-09 18:17
- Decisions: Complete the approved final release; preserve existing tags and database namespace.
- Implementation: Published exact core 1.0.0 wheels/images and app 0.2.8, mainline commits/tags; scoped production activation changes only API, identity and app. Evidence in oldap-setup/docs/oldap-1.0.0-release-results.json.
- Open: Observe routine operations; retain accepted Zod 3 finding and intermittent browser timeout observation. Home unchanged.
- Risks/Assumptions: Real service and both-architecture integration checks pass; public desktop/mobile repeat passes. Read-only production smoke does not cover authenticated writes/uploads; old Compose/images retained for rollback.

### Update 2026-11-09 18:00
- Decisions: Prepare the owner-approved final 0.2.8 release; preserve independent component version lines and exact accepted runtime behavior.
- Implementation: Updated package/runtime/bump metadata where applicable; core API/Tools require final library >=1.0.0,<2.0.0 and locks retain its exact wheel hash. App includes the previously tested dependency patches; Zod 3 remains the owner's accepted temporary risk. Native service 1.0.0 compiles byte-identically to the deployed RC JAR.
- Open: Final clean-source artifacts, installed-image acceptance, immutable publication and coordinated production rollout; record exact results in oldap-setup.
- Risks/Assumptions: No deployment from this commit. Existing production images/data retained; final version labels require genuinely final package metadata.

### Update 2026-11-09 17:47
- Decisions: Apply compatible security patches, upgrade Vitest to the Node-20-compatible v4 line, remove obsolete esbuild override; keep Zod 3 until a supported API-client migration is designed.
- Implementation: Handlebars 4.7.10, Axios 1.21.1, follow-redirects 1.16.3, devalue 5.9.4, Vitest 4.1.12; Tinypool removed, esbuild resolves 0.25.12. Test config uses projects and Vitest defineConfig. Full audit 33→25 entries/zero critical; runtime 5→2 high entries (Zod/parent). Check, 20 unit tests, four browser tests, targeted lint and AMD64 Docker build pass.
- Open: Runtime-image HTTP startup and installed-version checks passed; publish/deploy after acceptance. Zod 3 compatibility and other framework/build-tool findings remain open; do not force incompatible Zod or disable validation.
- Risks/Assumptions: No application API/schema change. Audit counts represent packages; no broad security clearance. Existing Dockerfile/build platform settings preserved; production unchanged.

### Update 2026-11-09 17:43
- Decisions: Audit dependency findings before selecting fixes; distinguish development-tool risk from production exposure and package counts from advisory counts.
- Implementation: Current/old-main/deployed lock hashes match. Full npm audit: 33 package entries, three critical from Handlebars/Tinypool plus propagated Vitest severity, four distinct critical advisories. Runtime package audit: zero critical/five high. Read-only production manifest scan confirms critical tools absent; sole bundled name marker is MIME metadata. Documented upgrade/compatibility plan and GitHub alert API 403 limitation.
- Open: Patch compatible packages, upgrade Vitest with tests, assess Zod 3/API-client compatibility and framework/runtime high findings. Exact original two Dependabot IDs remain unavailable.
- Risks/Assumptions: No dependency/code/deployment changes or exploit tests. Audit snapshot is not a general security clearance; omit=dev alone misses bundled framework code.

### Update 2026-11-09 17:33
- Decisions: Preserve complete migration history in main via a non-squashed merge; keep pre-jena-merge-20261109 at the previous remote primary tip. No final release/version change or deployment.
- Implementation: Refreshed origin; primary has no unique commits and merge-tree exactly matches reviewed migration 6c01cc453566. Added current integration context only; runtime sources remain unchanged.
- Open: Verify coordinated remote refs and record final merge IDs in setup/docs/jena-mainline-merge-20261109.md. Final 1.0.0 artifact publication and old checkout cleanup remain separate.
- Risks/Assumptions: Existing deployed/candidate acceptance covers identical runtime trees; this is not a fresh full-system test. All nine checkouts were clean. Existing GraphDB checkouts and migration branches are retained.

### Update 2026-11-05 12:08
- Decisions: Checkpoint the reviewed Jena migration changes on the migration branch; keep publication, merges and deployment separate.
- Implementation: Rechecked Svelte (zero errors/warnings), 20 unit tests and four browser tests. All 220 packaged source files match the accepted home image snapshot. Checked candidate changes for accidental credentials and whitespace.
- Open: Remaining production readiness gates and final release acceptance; see the coordinated setup checkpoint.
- Risks/Assumptions: This checkpoint does not change running services or production. Existing skipped tests and prior runtime evidence retain their documented scope.

### Update 2026-11-04 23:45
- Decisions: Activate the reviewed working-tree fixes on home using an isolated, digest-pinned Jena candidate; preserve existing stable tags and production.
- Implementation: Built/verified/published `lrosenth/oldap-app:jena-0.2.7-rc1-6e5e392b8e5a-amd64@sha256:ad3308b9e4c18054ed431e24ebec953efcfd5253fc910a39014da9ace28220e7` from a hashed source snapshot. Image-only Ansible rollout backs up installed selection and replaces only the two web services. Public HTTPS/Chromium checks pass without JavaScript errors or server errors; Fasnacht stories and archive return real records.
- Open: Interactive write/upload acceptance by the user; production deployment and source commits/merge remain separate.
- Risks/Assumptions: No API contract, role or data changes. Jena/identity/Redis/Caddy container identities and start times unchanged. Provenance and rollback: sibling oldap-setup/docs/jena-apps-home.md.

# CODEX_LOG

Ongoing technical work log for this project. New entries are inserted at the top.

### Update 2026-11-04 23:26

- Decisions: Complete local Jena frontend checks without deployment; distinguish mocked browser writes from real database acceptance. Preserve public API contracts and unseen RDF fields.
- Implementation: Fixed remaining schema/model types and fieldset semantics; durable post-generation schema correction; QName superclass creation/edit deltas and false closed flag; optional user roles and project/model restoration; connected header search and implemented content-only MODIFY with error retention. Replaced obsolete tests and documented release boundaries.
- Open: Coordinated image/deployment and real write/upload/permission acceptance on home.org. Browser tests do not exercise every administration screen or binary format.
- Risks/Assumptions: Build succeeds, typecheck has zero errors/warnings, 20 unit/component and four mocked Chromium tests pass; eleven live read-only API probes pass. No server data/roles changed, no publish/deploy, original GraphDB checkout untouched. Full repository formatting/lint cleanup is outside this change; focused new-code lint passes.

### Update 2026-11-04 23:14

- Decisions: Review oldap-app in a separate migration/jena checkout; preserve HTTP contracts and use the existing flat resource property model.
- Implementation: Corrected full-text parameter casing/encoding, merged row-based search responses, retained complete scalar/legacy array IRIs, and updated instance/upload/search components from removed nested properties to PropertyClass fields. Added four regressions, read-only live API probe and compatibility evidence.
- Open: Seven pre-existing typecheck errors, one accessibility warning, obsolete h1 component/E2E expectations, and browser write/upload acceptance before release. No deployment or image publication.
- Risks/Assumptions: Build passes; 14 unit tests pass and one pre-existing component test fails. Eleven home.org GET probes pass on JenaConnection, including nonempty full-text hits; list search is empty. GET checks do not prove editing workflows or permissions for other users. Original GraphDB checkout remains clean.

### Update 2026-07-23 18:15

- Decisions: Treat access and media JWTs as separate capabilities in the browser model; keep media JWTs exclusively in protected media query parameters while access JWTs remain API/upload/delete Bearers.
- Implementation: Added centralized media URL construction and focused tests, exposed API response `token` internally as `MediaObject.mediaToken`, updated IIIF/image/video/derivative consumers, and removed duplicate video-token query parameters. Retained the existing single-flight cookie refresh and one-retry request flow.
- Open: Validate reload, forced access-token expiry, protected IIIF tiling, protected video playback, failed refresh, and global logout against a compatible deployed API and media server.
- Risks/Assumptions: The production build, focused ESLint, nine focused tests, and whitespace validation pass. A pre-existing accessibility warning remains in `RepeatableField.svelte`; broader lint/check diagnostics in older components remain outside this auth update.

### Update 2026-07-15 20:42

- Decisions: Keep access tokens exclusively in the existing in-memory auth store; use the API-owned HttpOnly refresh cookie without adding browser-readable refresh state; centralize one-shot recovery for generated API, Fetch, and progress-reporting XHR requests.
- Implementation: Regenerated the OpenAPI client for `accessToken`, refresh, and logout contracts; added cookie-backed reload restoration, single-flight refresh, current-token replacement, one retry after `401`, failed-session fallback to anonymous access, and server-side global logout with unconditional local cleanup. Added the required project context files and focused refresh/retry tests.
- Open: Run the direct-navigation, reload, forced-expiry, failed-refresh, and logout browser matrix against a compatible deployed API during work package 7 integration.
- Risks/Assumptions: The production build, focused authentication ESLint, five focused tests, and whitespace validation pass. Full `svelte-check` remains blocked by 25 existing/generated model and schema diagnostics plus one existing accessibility warning outside the authentication integration.

## Entry Format

```md
### Update YYYY-MM-DD HH:MM

- Decisions:
- Implementation:
- Open:
- Risks/Assumptions:
```
