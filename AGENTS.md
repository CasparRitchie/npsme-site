# AGENTS.md

## Project

NPS Me is a full-stack customer-feedback application:

- React 18 and Vite frontend.
- Express backend.
- Supabase workspace data and authentication.
- Dropbox and Intercom integrations.
- OpenAI-assisted analysis.
- Heroku deployment.

Use Node.js 20. The live root files and `src/` are authoritative.

Read these references when the task touches the relevant area:

- [Architecture and legacy areas](docs/engineering/architecture-and-legacy.md)
- [Change safety and validation](docs/engineering/change-safety-and-validation.md)

## Main structure

- `src/` — React pages, components, routes, translations, styles, and scripts.
- `public/` — static public assets.
- `server.js` — Express entry point, API wiring, legacy endpoints, SPA serving, and server-side SEO.
- `*.routes.js` — backend feature routers.
- `utils/` — workspace authentication, authorization, events, and shared helpers.
- `shared/` — configuration shared by backend features.
- `docs/` — product, customer, and engineering documentation.
- `context-pack/` — generated legacy snapshot; never treat it as authoritative.
- `dist/` — generated Vite build output; ignored by Git and built by Heroku.

## Commands

```sh
npm ci
npm run dev
npm run build
npm run preview
npm run start
node src/scripts/audit-seo-routes.mjs
```

`npm run start` requires a current `dist/`; build first when necessary.

There is no dedicated automated test suite or `npm test` command. The declared lint and typecheck commands are not currently backed by direct project dependencies and configuration. Do not report them as passing unless they run successfully in the repository’s configured environment.

Do not use `make deploy` as a validation command. It stages all changes, commits, and pushes to `origin main`.

## Working rules

Before changing code:

1. Inspect `git status` and preserve unrelated changes.
2. Identify the frontend, backend, authentication, storage, and route/SEO boundaries involved.
3. Search for current and legacy implementations before adding another.
4. Read the linked engineering guidance for security-sensitive, architectural, dependency, database, integration, or deployment work.

During changes:

- Make focused edits and avoid unrelated cleanup.
- Preserve workspace isolation, role checks, authentication, webhook verification, request limits, and middleware ordering.
- Never expose secrets or customer data.
- Never edit generated copies instead of authoritative source.
- Do not change dependencies, lockfiles, database schemas, migrations, or deployment configuration unless the task requires it.
- Do not run destructive package-audit fixes such as `npm audit fix --force`.
- Do not mutate production data or call production services without explicit approval.

## Authorization boundary

Approval to implement a code or documentation change authorizes only the local work needed for that change.

It does not authorize:

- Creating a commit.
- Pushing a branch.
- Opening or merging a pull request.
- Deploying.
- Changing Heroku or other production configuration.
- Running database migrations.
- Modifying production data.
- Calling production Supabase, Dropbox, Intercom, OpenAI, SMTP, webhook, or other external services.

Obtain explicit approval for those actions separately.

## Never commit

Never commit:

- Environment files or secrets.
- Cookies, sessions, tokens, passwords, or credential notes.
- Customer invitations, email lists, survey responses, production exports, or uploaded customer data.
- Sensitive database dumps, fixtures, logs, screenshots, or recordings.
- `node_modules/`.
- `dist/`; it is generated locally and by Heroku through `heroku-postbuild`.
- `context-pack/`, `context-pack.zip`, repository ZIP files, or TGZ archives.
- Temporary notes, debug output, or `.DS_Store`.

Screenshots are prohibited from being committed when they contain secrets, customer information, authenticated production information, or other sensitive data. Ordinary non-sensitive product assets may be committed when intentionally part of the project.

Ignored files are not automatically safe to inspect, share, or package.

## Completion criteria

A task is complete only when:

1. The requested outcome is implemented within scope.
2. Relevant validation has run, or any unavailable checks are clearly reported.
3. The diff contains no secrets, customer data, generated artifacts, unrelated edits, or accidental dependency/lockfile changes.
4. Security, workspace isolation, routing, SEO, and external-service effects have been considered where relevant.
5. Documentation is updated when behavior or operating procedures changed.
6. No commit, push, deployment, migration, production mutation, or production-service call occurred without separate authorization.
