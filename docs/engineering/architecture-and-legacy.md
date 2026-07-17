# Architecture and legacy areas

## Application architecture

NPS Me combines a React single-page application with an Express server.

### Frontend

- `src/components/` contains shared UI and feature components.
- `src/pages/` contains public, survey, workspace, reporting, and administrative pages.
- `src/i18n/` contains translations and localized-path helpers.
- `src/styles/` contains global and feature-specific styles.
- `src/routesManifest.js` defines canonical route metadata.
- `src/routesRegistry.js` maps routes to frontend components.
- `src/seoRoutes.js` contains shared SEO and localized-path logic.
- `src/scripts/` contains sitemap, SEO-audit, and account-setup scripts.
- `public/` contains assets copied into the Vite build.

### Backend

- `server.js` configures Express, middleware, authentication, API routers, legacy functionality, static serving, and server-generated SEO markup.
- `csvNps.routes.js` handles CSV workspace workflows.
- `npsData.routes.js` handles saved datasets and close-the-loop data.
- `workspace.routes.js` handles workspace operations.
- `workspaceIntercom.routes.js` exposes workspace-scoped Intercom data.
- `intercom.routes.js` handles Intercom ingestion, exports, statistics, and webhooks.
- `envola.routes.js` handles Envola and live-survey workflows.
- `supabaseClient.js` creates the server-only Supabase administrative client.
- `openaiClient.js` creates the optional OpenAI client.
- `utils/` contains authentication, authorization, workspace events, and related helpers.

### Runtime and deployment

The production build sequence configured in `package.json` is:

1. `prebuild` generates the sitemap.
2. `vite build` creates `dist/`.
3. Heroku invokes `heroku-postbuild`, which runs the build.
4. The `Procfile` starts `node server.js`.
5. `server.js` reads `dist/index.html` and serves the built application.

`dist/` is ignored and is not tracked. Do not edit it manually or commit it.

## Security boundaries

### Workspace authentication

Workspace users authenticate through a JWT stored in an HTTP-only cookie. Protected routes derive the user, workspace, and role from verified authentication.

For workspace-owned data:

- Use `req.auth.workspaceId` as the tenant boundary.
- Do not trust workspace IDs, user IDs, roles, or authorization claims supplied by the browser when they can be derived from authentication.
- Apply authorization checks on the server.
- Preserve owner/admin restrictions for privileged operations.
- Test that one workspace cannot access another workspace’s records.

### Legacy private authentication

The application also has a shared-password private-dashboard cookie.

Workspace authentication and private-dashboard authentication are separate systems. Protection by one does not imply protection by the other.

Do not merge, replace, or remove either system without first mapping:

- Every protected backend route.
- Every frontend consumer.
- Cookie names and domains.
- Login, logout, and session-check behavior.
- Production migration and rollback requirements.

### External systems

The application uses several external systems with different data ownership and security characteristics:

- Supabase for workspace users and workspace-owned data.
- Dropbox for legacy invitations, responses, survey events, and exports.
- Intercom for survey and customer-interaction data.
- OpenAI for assisted analysis.
- SMTP/Zoho for email delivery.

Confirm the authoritative system for a feature before changing its read or write path.

## Legacy areas requiring caution

### Monolithic Express server

`server.js` is large and mixes current and legacy responsibilities.

When changing it:

- Make small, localized edits.
- Avoid broad formatting or unrelated refactoring.
- Preserve middleware ordering.
- Search for existing helpers and routes before adding another.
- Verify both API behavior and SPA fallback behavior.
- Check authentication, rate limiting, body parsing, error handling, and external-service effects.

The Intercom router is intentionally mounted before `express.json()`. This ordering may be required for raw webhook-body verification and must not be changed casually.

### Multiple storage models

The repository mixes:

- Supabase data.
- Dropbox CSV and JSONL data.
- In-memory caches.
- Historical file-based workflows.

Do not assume similar-looking features use the same storage system. Trace both reads and writes before implementing changes.

The legacy `DROPBOX_ACCESS_TOKEN` fallback exists for compatibility. Avoid expanding reliance on it; use the refresh-token flow where supported.

### Route and SEO coordination

Route behavior spans:

- React routing.
- `src/routesManifest.js`.
- `src/routesRegistry.js`.
- `src/seoRoutes.js`.
- Server-side route and SEO mappings in `server.js`.
- Translations.
- `public/sitemap.xml`, regenerated during builds.

When adding, removing, renaming, translating, indexing, or disabling a route:

1. Update every applicable route source.
2. Update translations and metadata.
3. Run the SEO audit.
4. Run the production build.
5. Verify canonical URLs, language alternates, indexing rules, and 404 behavior.

Unknown or disabled routes are intentionally returned as 404 responses instead of receiving the React application.

### Context-pack system

`make context-pack` creates a disposable snapshot for sharing project context.

It:

1. Deletes an existing `context-pack/` and `context-pack.zip`.
2. Copies selected source and configuration files.
3. Writes `context-pack/tree.txt`.
4. Creates a ZIP archive.

Rules:

- Root files and `src/` are authoritative.
- Do not edit a context-pack copy to implement a change.
- Do not copy a pack file over live source without comparing it to the current implementation.
- Regenerate the pack only when explicitly requested.
- Inspect the generated contents before sharing.
- Do not package credentials, customer data, cookies, exports, or authenticated state.
- Do not commit the pack or its archive.

The currently present pack is a legacy snapshot and has drifted from live source. It must not be used as an authoritative implementation.

### Historical files and archives

The repository contains or has tracked files with names suggesting historical, generated, or potentially sensitive content, including:

- Backup route files.
- Repository and site archives.
- Cookie files.
- Invitation data.
- Temporary notes.

Local inspection is permitted when it is necessary to understand or safely change the project. During inspection:

- Do not reproduce sensitive values in terminal output, chat responses, screenshots, documentation, or logs.
- Prefer inspecting structure, metadata, field names, or redacted excerpts.
- Do not copy sensitive content into new tracked files.
- Do not add inspected artifacts to context packs or other archives.
- Do not recommit or repackage them.
- Do not treat historical content as current configuration or authoritative source.
- Stop and report the issue if credentials or sensitive customer data appear to be exposed.

Deleting tracked artifacts or rewriting Git history is a separate security task and requires explicit approval.

### Generated files and deployment helpers

- `dist/` is generated by Vite and Heroku.
- Sitemap generation runs before builds.
- The scheduled GitHub workflow calls the production health endpoint.
- `make deploy` stages all changes, commits, and pushes directly to `origin main`.
- Backup and archive files are not active source modules.

Do not import from backups, overwrite live source from archives, or use deployment helpers as validation commands.
