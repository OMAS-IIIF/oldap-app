# CODEX_LOG

Ongoing technical work log for this project. New entries are inserted at the top.

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
