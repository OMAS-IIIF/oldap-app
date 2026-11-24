# OLDAP App

SvelteKit frontend for OLDAP administration and resource editing. Requires Node.js
22.18 or later; development and Docker builds use Node.js 24.

## Development

```sh
npm ci
cp .env.example .env
npm run dev
```

Set `PUBLIC_API_URL` to the API origin reachable from the browser and
`SERVER_API_URL` to the origin reachable from the frontend server. API transport
uses these environment variables, not `static/config.json`. Optional media/upload
settings are listed in `.env.example`. Never put secrets in `PUBLIC_*` variables.

## API contract

Keep the sibling `../oldap-api` checkout at the intended backend revision, then run:

```sh
npm run zod
```

The Hey API generator produces TypeScript SDK operations and Zod 4 validators from
`../oldap-api/API-def/oldap-api.yaml`. Do not edit generated files manually.
Application code accesses the SDK through `src/lib/shared/apiClient.ts`, which
owns runtime origins, credentials and authenticated retry behavior.

## Verification

```sh
npm run check
npm run test:unit -- --run
npm run test:e2e
npm audit
```

Playwright builds the app and uses mocked `https://oldap.test` API responses; it
must not write to live services. `npm run build` creates the Node adapter output.

## Container

The Dockerfile uses Node.js 24 for both stages. Supply both `PUBLIC_API_URL` and
`SERVER_API_URL` at container startup; `docker-entrypoint.sh` validates them and
starts `node build`. Publishing and deployment are separate release operations.

## Dependency maintenance

Use coordinated framework/client upgrades and review audit findings before changing
major versions. `@hey-api/json-schema-ref-parser` currently pins an affected
`js-yaml`; a scoped override selects patched `4.3.2`. Remove the override when the
upstream dependency includes the fixes. Check `npm install-scripts ls` after
updates. The optional macOS `fsevents` install hook is denied; the package ships its
native binary. Vite 8 no longer requires the old esbuild install-script approval.
