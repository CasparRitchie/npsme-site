# Envola Closing the Loop migration

## Iteration 1 boundary

Workspace Closing the Loop is the canonical customer-follow-up experience at
`/workspace/closing-the-loop` and `/fr/workspace/closing-the-loop`. It uses the
Workspace JWT cookie, derives the tenant from `req.auth.workspaceId`, reads
Workspace-owned `dataset_rows`, and persists follow-up through the
`/api/workspace/closing-loop` case and event endpoints.

The Envola pages and APIs remain operational in this iteration. The migration
notice on the two Envola Closing the Loop pages points users to Workspace but is
not a redirect. Existing bookmarks and rollback therefore continue to work.

## Dependencies to separate before deletion

### Workspace imports from legacy route modules

`workspaceIntercom.routes.js` currently imports:

- `getCanonicalResponses` and `getSurveyStatsRows` from `envola.routes.js`.
- `refreshIntercomSurveyStatsIfStale` from `intercom.routes.js`.

Those imports make the Workspace Intercom responses and performance APIs depend
on loading both legacy route modules. `intercom.routes.js` also imports
`rebuildEnvolaResponsesFile` and `getCanonicalResponses` from
`envola.routes.js`, so the two legacy modules are coupled to each other.

Workspace Closing the Loop itself does not import either legacy router. Its
theme display currently reuses the same rule vocabulary already present in the
Workspace frontend risk calculation and applies it only to the privacy-safe
comment/detail fields returned by Workspace APIs. The duplicated theme rules in
`CsvNpsClosingTheLoop.jsx` and `intercom.routes.js` should be moved to a neutral
module in a later extraction iteration, not by importing a legacy router into a
Workspace feature.

### Legacy frontend routes and backend consumers

The private-cookie frontend routes that must remain until their consumers are
retired are:

- `/envola/closing-the-loop` and `/fr/envola/closing-the-loop`, rendered by
  `EnvolaClosingTheLoop.jsx`.
- `/csv-nps/closing-the-loop`, `/fr/csv-nps/closing-the-loop`, and their saved
  dataset variants. These render the shared Workspace-era page under the legacy
  private-cookie guard and are separate from the Envola implementation.
- `/private/closing-the-loop` and `/fr/private/closing-the-loop`, also rendered
  by `EnvolaClosingTheLoop.jsx` through the legacy `ClosingTheLoop` registry
  alias, must be included in the same retirement audit.

`EnvolaClosingTheLoop.jsx` consumes these `intercom.routes.js` endpoints:

- `GET /api/intercom/private/closing-the-loop`
- `GET` and `POST /api/intercom/private/closing-the-loop/cases`
- `POST /api/intercom/private/closing-the-loop/cases/:caseId/status`
- `POST /api/intercom/private/closing-the-loop/cases/:caseId/pause`
- `POST /api/intercom/private/closing-the-loop/cases/:caseId/resume`
- `GET /api/intercom/private/nps-response`

The queue and response readers use canonical response helpers supplied by
`envola.routes.js`. Case, action, pause, contact, impact, and audit records are
stored through the legacy Dropbox JSONL paths in `intercom.routes.js`. Removing
only the frontend route would leave live backend consumers and storage behind;
removing only `envola.routes.js` would break Workspace Intercom and Intercom
ingestion/rebuild behavior.

## Neutral service boundaries

Before deletion, extract behavior without changing route contracts:

1. A response repository for canonical response and survey-stat reads, with no
   Express router or Envola naming. Both Workspace Intercom and legacy routers
   can temporarily depend on it.
2. An Intercom ingestion service for stale-stat refresh and response-file
   rebuild orchestration, independent of HTTP mounting and webhook middleware.
3. A theme service containing the rule vocabulary, detection, and localized
   labels used by both Workspace and legacy queues.
4. A legacy closing-loop repository for Dropbox JSONL case/event persistence.
   Keep this explicitly legacy until its data is migrated or retired; do not
   make Workspace depend on it.
5. Thin route adapters that own authentication and request/response projection:
   Workspace adapters must retain Workspace membership checks and tenant
   scoping; legacy adapters must retain the private-cookie boundary.

## Staged deletion and rollback

1. Characterize current Workspace Intercom and Envola contracts with local
   fixtures. Record auth failures, payload projections, and webhook/rebuild
   behavior without calling production services.
2. Extract the neutral response, ingestion, and theme services while leaving all
   current imports and routes available through compatibility exports. Roll back
   by restoring the old imports; no stored data changes.
3. Change `workspaceIntercom.routes.js` to import only neutral services. Verify
   Workspace authentication, tenant isolation, response privacy, and local
   Intercom fixture behavior. Roll back by switching its imports back.
4. Change `intercom.routes.js` and `envola.routes.js` to consume the neutral
   services. Keep endpoint paths and private-cookie checks unchanged. Roll back
   at the adapter layer.
5. Compare Envola and Workspace feature usage and agree how legacy Dropbox cases
   are archived or migrated. This requires a separate data plan and approval;
   Workspace must not silently read legacy case files.
6. After an announced bookmark window, replace the Envola notice with a scoped
   redirect for only the two Envola Closing the Loop paths. Keep a release that
   can restore the page and APIs during the rollback window. Do not redirect
   Envola performance, responses, invitations, question, or example pages.
7. Remove the Envola Closing the Loop frontend registration only after traffic
   and rollback criteria are met. Then remove its private Intercom endpoints and
   legacy case storage code only after confirming there are no remaining
   consumers.
8. Remove compatibility exports and finally any now-unused legacy module code.
   Run the route/SEO audit and production build at every route-removal stage.

No schema, migration, service extraction, route deletion, redirect, production
data operation, or production integration call is part of iteration 1.

## Iteration 2 progress: neutral theme boundary

The first dependency-separation slice moves the shared rule vocabulary and
detection behavior to `shared/closingLoopThemes.js`:

- Workspace consumes the canonical unique-key result and continues to obtain
  translated labels from the Workspace translation catalog.
- `intercom.routes.js` consumes the same neutral detector through a thin local
  compatibility function. Its duplicate-hit behavior is deliberately retained
  while legacy theme aggregation remains live, avoiding an unplanned API
  contract change in this extraction.
- Dependency-free fixture tests cover bilingual detection, unique Workspace
  results, duplicate legacy compatibility, empty feedback, key validation, and
  translated-label formatting.

This slice has no external I/O and does not move authentication, tenant
selection, response projection, Dropbox persistence, ingestion, webhook, or
route responsibilities. The next extraction slice is the canonical response
repository currently exported by `envola.routes.js`; it should begin with
injected local file adapters so Workspace can be moved without production
Dropbox calls.
