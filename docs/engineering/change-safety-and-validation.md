# Change safety and validation

## Authorization and external effects

Implementation approval permits local edits and proportionate local validation within the requested scope.

It does not permit:

- Committing or pushing changes.
- Opening or merging pull requests.
- Deploying.
- Changing deployment or production configuration.
- Running database migrations against any shared or production environment.
- Modifying production data.
- Calling production services.
- Sending real email, notifications, surveys, or webhooks.
- Creating, disabling, or changing real user accounts.
- Uploading local data or context packs to external systems.

Request explicit approval immediately before any such action. Do not infer it from approval of the underlying implementation.

## General change process

Before editing:

1. Read the relevant code and engineering documentation.
2. Inspect `git status`.
3. Preserve unrelated user changes.
4. Identify the authoritative source file.
5. Identify frontend, backend, authentication, storage, tenant, integration, route, SEO, and deployment effects.
6. Determine the smallest relevant validation plan.

During editing:

- Keep changes focused.
- Avoid opportunistic refactors.
- Avoid modifying generated files.
- Do not silently change dependencies, lockfiles, environment requirements, deployment configuration, or data schemas.
- Do not introduce new production-service calls for local validation.
- Keep sensitive values out of source, output, fixtures, and documentation.

After editing:

1. Review the complete diff.
2. Check for secrets, customer data, generated files, and unrelated changes.
3. Run relevant validation.
4. Review failure paths and security boundaries.
5. Update documentation when behavior or procedures changed.
6. Report completed and unavailable checks accurately.

## Development commands

Install the locked dependency set:

```sh
npm ci
```

Start the frontend development server:

```sh
npm run dev
```

Build the production frontend:

```sh
npm run build
```

Preview the production frontend:

```sh
npm run preview
```

Start the Express server:

```sh
npm run start
```

The Express server reads `dist/index.html` at startup. Run a build first when `dist/` is absent or stale.

## Validation

There is currently no dedicated automated test suite or `npm test` script.

### Baseline validation

For frontend, route, shared-module, or production-serving changes:

```sh
npm run build
```

For route, localization, sitemap, canonical URL, metadata, or indexing changes:

```sh
node src/scripts/audit-seo-routes.mjs
npm run build
```

The build invokes sitemap generation through `prebuild`.

### Declared but currently unconfigured checks

`package.json` declares:

```sh
npm run lint
npm run typecheck
```

The repository currently lacks direct ESLint and TypeScript development dependencies and their project configuration. These commands may depend on undeclared global tooling and must not be reported as successful unless they actually complete in the configured repository environment.

Adding the missing tools is a dependency and configuration change, not an incidental validation step.

### Backend validation

Use focused local checks for affected routes. Where relevant, verify:

- The server starts after a production build.
- Health or ping endpoints respond.
- Unauthenticated requests are rejected.
- Unauthorized roles are rejected.
- Workspace data remains tenant-isolated.
- Invalid inputs fail safely.
- Upload limits and validation remain effective.
- Errors do not reveal credentials or internal service details.
- API changes do not break frontend consumers.
- No real email, webhook, production write, or external side effect occurs.

Use mocks, local fixtures, or non-production services where available. Calling a production endpoint for validation requires explicit approval, even if the endpoint is read-only.

## Security rules

Never hard-code or expose:

- Supabase administrative keys.
- OpenAI API keys.
- Dropbox access or refresh tokens.
- Intercom access tokens or webhook secrets.
- SMTP credentials.
- JWT secrets.
- Private-dashboard passwords or cookie secrets.
- Session cookies.
- Customer data or production identifiers.

`supabaseClient.js` is server-only because it uses an administrative secret. Do not import it into browser code.

Preserve:

- Authentication and role middleware.
- Workspace scoping.
- HTTP-only and secure production-cookie behavior.
- Webhook signature or token verification.
- Helmet and HTTPS protections.
- Rate limits.
- Request and upload limits.
- Error sanitization.
- Blocked-path behavior.

Do not enable permissive CORS, weaken protections, or expose a new production origin without explicit review.

## Database and migration changes

Database changes require deliberate planning.

Before changing a schema or writing a migration:

1. Identify all readers and writers.
2. Determine compatibility with the currently deployed application.
3. Prefer additive and backward-compatible changes.
4. Document migration order, application deployment order, rollback strategy, and data-backfill requirements.
5. Consider indexes, constraints, row-level security, tenant isolation, and authorization.
6. Define local or non-production verification.
7. Avoid embedding environment-specific IDs or production data.

Rules:

- Do not edit an already-applied migration to change history; add a new migration.
- Do not run migrations against shared, staging, or production databases without explicit approval for that environment.
- Do not run destructive SQL, truncate tables, delete customer records, or reset shared data without explicit approval.
- Do not bypass row-level security or application tenant checks for convenience.
- Do not include real customer data in migration fixtures.
- Clearly report when code depends on a migration that has not been run.
- A schema proposal is not authorization to apply it.

## Dependency changes

Treat dependency changes as their own scope.

Before adding, removing, or upgrading a dependency:

1. Explain why existing code or dependencies are insufficient.
2. Prefer the smallest maintained dependency that solves the problem.
3. Review runtime versus development placement.
4. Review package provenance, maintenance, license, security, bundle size, Node 20 compatibility, and deployment impact.
5. Update `package.json` and `package-lock.json` together using the package manager.
6. Review lockfile changes for unexpected packages or lifecycle scripts.
7. Run the production build and relevant checks.

Do not:

- Hand-edit the lockfile.
- Perform broad upgrades unrelated to the task.
- Replace the lockfile without a specific reason.
- Add globally installed tools as an undocumented project requirement.
- Run install scripts from an untrusted package without review.
- Hide dependency changes inside an unrelated feature.

## Package-audit fixes

Package-audit output is diagnostic information, not authorization for automatic remediation.

- Do not run `npm audit fix --force`.
- Do not accept major-version upgrades or dependency removals automatically.
- Do not run any destructive or broad audit fix without explicit approval.
- Review the affected dependency path, exploitability, runtime exposure, available patched versions, and breaking-change risk.
- Prefer a targeted upgrade with focused validation.
- Report vulnerabilities that cannot be safely resolved within scope.
- Do not claim the application is secure solely because an audit command reports zero known vulnerabilities.

A request to inspect or explain audit findings does not authorize dependency changes.

## Files and artifacts

Do not commit:

- `.env` files.
- Credentials, cookies, passwords, or tokens.
- Customer or production data.
- Sensitive database dumps or fixtures.
- Sensitive logs.
- Screenshots or recordings containing secrets, customer information, or authenticated production information.
- `node_modules/`.
- `dist/`.
- Context packs or archives.
- Temporary notes or operating-system files.

Non-sensitive screenshots and images may be committed when they are intentional product or documentation assets.

Local inspection of legacy artifacts is allowed when necessary, but sensitive content must not be exposed, copied into new tracked files, packaged, or recommitted.

## Task completion criteria

A task is complete only when all applicable conditions are met:

1. The requested behavior is implemented within the approved scope.
2. Acceptance criteria are satisfied.
3. The implementation uses authoritative source files rather than generated or legacy copies.
4. Relevant build, audit, and focused checks pass.
5. Checks that could not run are reported with the reason.
6. The diff has been reviewed for correctness and unintended changes.
7. No secrets, customer data, sensitive screenshots, generated artifacts, archives, or temporary files were added.
8. No accidental dependency, lockfile, database, migration, or deployment changes occurred.
9. Authentication, authorization, workspace isolation, error handling, and external-service effects were reviewed where relevant.
10. Route, translation, SEO, and sitemap sources were updated where relevant.
11. Documentation was updated when behavior, architecture, setup, or operational procedures changed.
12. Remaining risks, manual checks, migration requirements, or follow-up work are disclosed.
13. No commit, push, pull request, deployment, production configuration change, database migration, production-data mutation, or production-service call occurred without separate explicit authorization.

Passing a build alone does not establish task completion when relevant security, data, integration, or behavioral checks remain outstanding.
