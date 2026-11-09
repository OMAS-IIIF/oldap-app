# Jena compatibility review — 2026-11-04

## Scope and outcome

The `migration/jena` checkout is under `OLDAP-Jena/oldap-app`. The original
GraphDB checkout is unchanged. The browser uses the HTTP API and does not
execute SPARQL or RDF-star queries. No API signatures or server configuration
were changed. No image was built/published and no deployment was performed.

## Corrections

- Instance tables now use complete scalar resource IRIs returned by the API,
  while retaining support for legacy singleton-array IRIs.
- Full-text results are arrays of rows, not an IRI-keyed object. Rows for the
  same resource are merged without losing properties or distinct matching
  values. Metadata fields are excluded from property cells.
- Full-text requests use `resClass` (correct case), and let the HTTP client
  encode search strings once, including Unicode, spaces and ampersands.
- Instance editing, upload fields and search property selectors now consume
  `ResourceClass.properties` directly. These components still used the removed
  `hasProperty[].property` structure. Editor hints are QNames and must be
  compared using their string value. This is an existing client/model mismatch,
  not a requirement to introduce Jena-specific UI behavior.

The small shared `src/lib/helpers/searchResults.ts` normalizes API rows for both
instance tables. It does not introduce a new domain model or validate RDF data.

## Verification

- Production build passes.
- Unit/component tests: 20 pass, including search normalization, date/language
  serialization, changed-field updates, cleared values, list IRI handling,
  optional user roles, schema metadata and the actual desktop window workflow.
- Typecheck: zero errors and zero warnings (previously 25 errors / one warning).
- Four Chromium browser tests pass against mocked HTTP contracts: desktop window
  lifecycle; restored session, model loading, Unicode search and content update;
  denied update with retained form values; and superclass editing with QName
  deltas. Search is asserted to issue exactly one count and one results request.
- Eleven live GET probes against home.org pass using `JenaConnection`: project,
  user, role and list searches; shared/Chama/Fasnacht models; instance and
  full-text searches plus their count requests. List search returned no lists,
  so this does not verify list-node rendering. The probe reports response shapes
  and statuses, not a full browser workflow or semantic equivalence check.
- No live create/update/delete, login refresh, media upload or permission changes
  were exercised. Browser tests validate request payloads and error handling with
  simulated responses, not database persistence. Real deployment acceptance for
  uploads, permissions and writes remains part of the overall home.org rollout.
- No broad OWL reasoning is required by these client changes. Existing inverse
  and equivalent property model controls were not removed or reinterpreted.
- Managed Jena full-text configuration remains an API/tools workflow; this review
  does not add an administration UI for it.

Evidence: `docs/jena-api-results.json`. Repeat the read-only API probe with:

```sh
ssh -o BatchMode=yes rosenth@api.home.org \
  'docker exec -i oldap-api python -' \
  < tools/check_jena_api.py > /tmp/oldap-app-jena-api.json
```

The probe uses credentials already in the API container and never emits them.
On a fresh checkout, run `npm ci` and `npm run build` before `npm run check` so
Paraglide's generated modules exist.

## Completion changes

- Fixed generated InstanceData validation to retain declared metadata alongside
  arbitrary RDF fields. `npm run zod` now runs `tools/fix-generated-schema.mjs`
  after the generator, because openapi-zod-client 1.18 drops explicit properties
  when generating this record schema. Contract changes require reviewing this
  targeted correction; no public HTTP contract changed.
- List identifiers use `Iri`, matching deserialization and allowing both full
  IRIs and QNames. This is an internal TypeScript model correction.
- The superclass form reads QName parts and sends QName strings on creation;
  edits send only explicit add/delete deltas, preserving the implicit base class.
  An explicitly false `closed` flag remains false.
- Replaced the non-associated repeatable-field label with fieldset/legend.
- Optional missing user roles no longer break cookie-session restoration.
- Project restoration now loads its model automatically, using one cancellable
  project-loading path instead of competing loaders.
- Connected the formerly inert header search button and completed the existing
  MODIFY action in InstanceEditor. It sends only changed fields; empty values
  use the API's null deletion contract. Unseen fields and role grants remain
  untouched. Denied writes retain the form and show an error. Form buttons do
  not submit/reload the page.

## Release boundary

The local code/typecheck/test completion is finished. No image has been published
and home.org still runs its previously installed frontend. Include the new
frontend in the coordinated release and carry out real write/upload acceptance
on the deployed candidate before the production cutover. These tests do not
claim exhaustive coverage of every administrative screen or media format.
