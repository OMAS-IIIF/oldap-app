# OLDAP App Context

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
