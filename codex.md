# OLDAP App Context

- Jena mainline integration (2026-11-09): the accepted migration is integrated into `main` with its complete ancestry. Core runtime/package versions remain the tested RC versions; this Git integration does not publish final 1.0.0 packages or change deployed images. Prior primary ref is retained by `pre-jena-merge-20261109`; this tag records Git history, not the deployed GraphDB baseline. Migration branches and old GraphDB checkouts are retained. Coordinated evidence: ../oldap-setup/docs/jena-mainline-merge-20261109.md. Older pending-merge notes below are historical.

- Home activation (2026-11-04): `lrosenth/oldap-app:jena-0.2.7-rc1-6e5e392b8e5a-amd64` is deployed with a pinned registry digest. Public HTTPS/Chromium smoke passes; previous configuration retained for rollback. See sibling oldap-setup/docs/jena-apps-home.md. Production and stable image tags remain unchanged.

## Purpose

`oldap-app` is the generic SvelteKit browser application for administering OLDAP projects, users, roles, lists, ontologies, data models, and resource instances.

## Repository State

- The application uses Svelte 5, SvelteKit, TypeScript, Tailwind CSS, and a generated Zodios client for the sibling `oldap-api` OpenAPI contract.
- Browser API origins come from `PUBLIC_API_URL`; server-side requests use `SERVER_API_URL` with the public URL as fallback.
- Authentication work package 6 is implemented: short-lived access tokens remain in the non-persistent `authInfoStore`, named sessions are restored with the API-managed HttpOnly refresh cookie, concurrent `401` responses share one refresh, and requests retry at most once.
- Protected media delivery uses the purpose-specific, short-lived media JWT returned with each MediaObject. The token is appended only to image, video, derivative, and IIIF URLs; uploads, deletes, and API calls continue to use the access JWT.
- User and project state use focused Svelte stores; failed refresh clears the named session and returns the application to anonymous OLDAP access.

## Architecture and Conventions

- Keep generated API access behind `src/lib/shared/apiClient.ts` and request configuration helpers in `src/lib/helpers/api_config.ts`.
- Keep domain conversion in `src/lib/oldap/classes` and reusable UI in `src/lib/components`.
- Prefer explicit TypeScript interfaces and small reusable helpers for shared behavior; keep component-specific behavior local.
- Source code and technical documentation are written in English. User-facing copy follows the application's localization conventions.

## Key Files

- `src/routes/+layout.svelte`: application bootstrap and global session initialization.
- `src/lib/shared/apiClient.ts`: lazy generated API client and cross-cutting request behavior.
- `src/lib/shared/mediaUrl.ts`: safe media-capability URL construction without mixing media and access JWTs.
- `src/lib/stores/authinfo.ts`: in-memory authentication state.
- `src/lib/components/oldap/User.svelte`: named-user login/logout UI.
- `src/lib/helpers/login_unknown_user.ts`: anonymous OLDAP bootstrap.
- `src/lib/apischema/zod.ts`: generated OpenAPI client; regenerate with `npm run zod`.

## Roadmap

- Validate the browser behavior against a compatible deployed `oldap-api` during release integration.
- Coordinate work package 7 release and migration with the compatible `oldaplib`, `oldap-api`, deployment secrets, and browser clients.

## Jena migration checkout (2026-11-04)

- Branch `migration/jena` in `OLDAP-Jena/oldap-app`; original GraphDB checkout is unchanged.
- Keep the frontend backend-neutral: HTTP contracts, not SPARQL or reasoner assumptions.
- Resource fields use the existing flat `ResourceClass.properties` model; do not reintroduce `hasProperty[].property` wrappers.
- `src/lib/helpers/searchResults.ts` adapts current scalar resource IDs and legacy singleton IDs to the two instance tables and merges repeated full-text rows.
- Local completion passes build, typecheck (zero errors/warnings), 20 unit/component tests and four mocked Chromium workflows. Eleven administration GET probes pass against home.org. Real deployed write/upload acceptance remains a release check.
- See `docs/jena-compatibility.md` for evidence, limitations and required browser/write acceptance before release. No oldap-app Jena image has been published or deployed in this step.

- `tools/fix-generated-schema.mjs` runs after API generation to preserve explicit InstanceData properties that openapi-zod-client 1.18 omits for this record schema.
- `instanceForm.ts` serializes editable values and computes content-only deltas; ordinary content editing must never replace unseen fields or role assignments.
- Header search creates a result window; identical query/context effects do not repeat HTTP requests. Project/session restoration loads the selected model automatically.
