import express from "express";

import { supabaseAdmin } from "./supabaseClient.js";
import { getWorkspaceAuth } from "./utils/workspaceAuth.js";

const READ_ROLES = new Set(["owner", "admin", "member", "viewer"]);
const MUTATION_ROLES = new Set(["owner", "admin", "member"]);
const STATUSES = new Set(["open", "in_progress", "closed"]);
const PRIORITIES = new Set(["high", "normal", "low"]);
const CASE_STATES = new Set(["all", "no_case", ...STATUSES]);
const BUCKETS = new Set(["all", "detractor", "passive", "promoter"]);
const PERIODS = new Set(["all", "7d", "30d", "this_month"]);
const MAX_SEARCH_LENGTH = 120;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createWorkspaceClosingLoopRouter() {
  const router = express.Router();

  router.use(authenticateCurrentWorkspaceMember);

  router.get("/", async (req, res) => {
    try {
      ensureSupabase();

      const parsed = parseListRequest(req.query);
      if (!parsed.ok) {
        return sendError(res, 400, parsed.code, parsed.message);
      }

      const { filters, limit, cursor } = parsed;
      const ownersResult = await loadAssignableOwners(req.auth.workspaceId);

      if (ownersResult.error) {
        console.error("[workspace-closing-loop] Failed to load assignable owners", ownersResult.error);
        return sendError(res, 500, "OWNERS_FAILED", "Failed to load assignable owners");
      }

      const assignableOwners = ownersResult.owners;
      if (
        isUuid(filters.owner) &&
        !assignableOwners.some((owner) => owner.membershipId === filters.owner)
      ) {
        return sendError(
          res,
          400,
          "INVALID_OWNER_FILTER",
          "Owner filter must be an active assignable Workspace member"
        );
      }

      const baseSpec = buildBaseQuerySpec(filters);
      const rowsQuery = applyCursor(
        createFilteredRowsQuery({
          workspaceId: req.auth.workspaceId,
          filters,
          spec: baseSpec,
          select: buildListSelect(baseSpec),
        }),
        cursor
      )
        .order("submitted_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .order("updated_at", {
          referencedTable: "close_loop_actions",
          ascending: false,
          nullsFirst: false,
        })
        .order("created_at", {
          referencedTable: "close_loop_actions",
          ascending: false,
          nullsFirst: false,
        })
        .order("id", {
          referencedTable: "close_loop_actions",
          ascending: false,
        })
        .limit(1, { referencedTable: "close_loop_actions" })
        .limit(limit + 1);

      const summaryPromise = loadFilteredSummary({
        workspaceId: req.auth.workspaceId,
        filters,
      });
      const [{ data, error: rowsError }, summaryResult] = await Promise.all([
        rowsQuery,
        summaryPromise,
      ]);

      if (rowsError) {
        console.error("[workspace-closing-loop] Failed to list dataset rows", rowsError);
        return sendError(res, 500, "LIST_FAILED", "Failed to load Closing the Loop cases");
      }

      if (summaryResult.error) {
        console.error("[workspace-closing-loop] Failed to load summary", summaryResult.error);
        return sendError(res, 500, "SUMMARY_FAILED", "Failed to load Closing the Loop summary");
      }

      const resultRows = data || [];
      const hasMore = resultRows.length > limit;
      const pageRows = resultRows.slice(0, limit);
      const rows = pageRows.map(toClosingLoopListRow);
      const nextCursor = hasMore && pageRows.length
        ? encodeCursor(pageRows[pageRows.length - 1])
        : null;

      return res.json({
        ok: true,
        permissions: {
          canRead: true,
          canMutate: MUTATION_ROLES.has(req.workspaceMembership.role),
          role: req.workspaceMembership.role,
        },
        assignableOwners,
        filters,
        summary: summaryResult.summary,
        pagination: {
          limit,
          returned: rows.length,
          totalMatching: summaryResult.summary.totalMatchingResponses,
          hasMore,
          nextCursor,
        },
        rows,
      });
    } catch (err) {
      return handleUnexpectedError(res, "GET /", err, "Failed to load Closing the Loop cases");
    }
  });

  router.post("/cases", requireMutationRole, async (req, res) => {
    try {
      ensureSupabase();

      const invalidFields = findUnknownFields(req.body, [
        "datasetRowId",
        "ownerMembershipId",
        "priority",
      ]);
      if (invalidFields.length > 0) {
        return sendError(res, 400, "INVALID_FIELDS", "Request contains unsupported fields");
      }

      const datasetRowId = optionalString(req.body?.datasetRowId);
      const hasPriority = hasOwn(req.body, "priority");
      const priority = hasPriority ? optionalString(req.body.priority) : null;
      const ownerMembershipId = nullableUuid(req.body?.ownerMembershipId);

      if (!isUuid(datasetRowId)) {
        return sendError(
          res,
          400,
          "INVALID_DATASET_ROW_ID",
          "Valid datasetRowId is required"
        );
      }

      if (hasPriority && !PRIORITIES.has(priority)) {
        return sendError(res, 400, "INVALID_PRIORITY", "Invalid priority");
      }

      if (ownerMembershipId === undefined) {
        return sendError(
          res,
          400,
          "INVALID_OWNER",
          "Valid ownerMembershipId or null is required"
        );
      }

      const { data, error } = await supabaseAdmin.rpc(
        "create_workspace_closing_loop_case",
        {
          p_workspace_id: req.auth.workspaceId,
          p_actor_user_id: req.auth.userId,
          p_dataset_row_id: datasetRowId,
          p_owner_membership_id: ownerMembershipId,
          p_priority: priority,
        }
      );

      if (error) return handleRpcError(res, error);

      return res.status(201).json({
        ok: true,
        case: data,
      });
    } catch (err) {
      return handleUnexpectedError(res, "POST /cases", err, "Failed to create case");
    }
  });

  router.patch("/cases/:caseId", requireMutationRole, async (req, res) => {
    try {
      ensureSupabase();

      const caseId = optionalString(req.params.caseId);
      if (!isUuid(caseId)) {
        return sendError(res, 400, "INVALID_CASE_ID", "Valid caseId is required");
      }

      const allowedFields = ["status", "ownerMembershipId", "priority", "note"];
      const invalidFields = findUnknownFields(req.body, allowedFields);
      if (invalidFields.length > 0) {
        return sendError(res, 400, "INVALID_FIELDS", "Request contains unsupported fields");
      }

      const hasStatus = hasOwn(req.body, "status");
      const hasOwner = hasOwn(req.body, "ownerMembershipId");
      const hasPriority = hasOwn(req.body, "priority");
      const hasNote = hasOwn(req.body, "note");

      if (!hasStatus && !hasOwner && !hasPriority && !hasNote) {
        return sendError(res, 400, "EMPTY_UPDATE", "At least one change is required");
      }

      const status = hasStatus ? optionalString(req.body.status) : null;
      const priority = hasPriority ? optionalString(req.body.priority) : null;
      const ownerMembershipId = hasOwner ? nullableUuid(req.body.ownerMembershipId) : null;
      const note = hasNote ? optionalString(req.body.note) : null;

      if (hasStatus && !STATUSES.has(status)) {
        return sendError(res, 400, "INVALID_STATUS", "Invalid status");
      }

      if (hasPriority && !PRIORITIES.has(priority)) {
        return sendError(res, 400, "INVALID_PRIORITY", "Invalid priority");
      }

      if (hasOwner && ownerMembershipId === undefined) {
        return sendError(
          res,
          400,
          "INVALID_OWNER",
          "Valid ownerMembershipId or null is required"
        );
      }

      if (hasNote && (!note || note.length > 4000)) {
        return sendError(
          res,
          400,
          note ? "NOTE_TOO_LONG" : "NOTE_REQUIRED",
          note ? "Note must be 4000 characters or fewer" : "A non-empty note is required"
        );
      }

      const { data, error } = await supabaseAdmin.rpc(
        "update_workspace_closing_loop_case",
        {
          p_workspace_id: req.auth.workspaceId,
          p_actor_user_id: req.auth.userId,
          p_case_id: caseId,
          p_update_status: hasStatus,
          p_status: status,
          p_update_owner: hasOwner,
          p_owner_membership_id: ownerMembershipId,
          p_update_priority: hasPriority,
          p_priority: priority,
          p_note: note,
        }
      );

      if (error) return handleRpcError(res, error);

      return res.json({
        ok: true,
        case: data,
      });
    } catch (err) {
      return handleUnexpectedError(res, "PATCH /cases/:caseId", err, "Failed to update case");
    }
  });

  router.post("/cases/:caseId/notes", requireMutationRole, async (req, res) => {
    try {
      ensureSupabase();

      const caseId = optionalString(req.params.caseId);
      if (!isUuid(caseId)) {
        return sendError(res, 400, "INVALID_CASE_ID", "Valid caseId is required");
      }

      const invalidFields = findUnknownFields(req.body, ["note"]);
      if (invalidFields.length > 0) {
        return sendError(res, 400, "INVALID_FIELDS", "Request contains unsupported fields");
      }

      const note = optionalString(req.body?.note);
      if (!note || note.length > 4000) {
        return sendError(
          res,
          400,
          note ? "NOTE_TOO_LONG" : "NOTE_REQUIRED",
          note ? "Note must be 4000 characters or fewer" : "A non-empty note is required"
        );
      }

      const { data, error } = await supabaseAdmin.rpc(
        "add_workspace_closing_loop_note",
        {
          p_workspace_id: req.auth.workspaceId,
          p_actor_user_id: req.auth.userId,
          p_case_id: caseId,
          p_note: note,
        }
      );

      if (error) return handleRpcError(res, error);

      return res.status(201).json({
        ok: true,
        event: data,
      });
    } catch (err) {
      return handleUnexpectedError(res, "POST /cases/:caseId/notes", err, "Failed to add note");
    }
  });

  router.get("/cases/:caseId/events", async (req, res) => {
    try {
      ensureSupabase();

      const caseId = optionalString(req.params.caseId);
      if (!isUuid(caseId)) {
        return sendError(res, 400, "INVALID_CASE_ID", "Valid caseId is required");
      }

      const { data: closingCase, error: caseError } = await supabaseAdmin
        .from("closing_loop_cases")
        .select("id")
        .eq("id", caseId)
        .eq("workspace_id", req.auth.workspaceId)
        .maybeSingle();

      if (caseError) {
        console.error("[workspace-closing-loop] Failed to verify case", caseError);
        return sendError(res, 500, "EVENTS_FAILED", "Failed to load case history");
      }

      if (!closingCase) {
        return sendError(res, 404, "CASE_NOT_FOUND", "Case not found");
      }

      const { data, error } = await supabaseAdmin
        .from("closing_loop_case_events")
        .select("*")
        .eq("workspace_id", req.auth.workspaceId)
        .eq("case_id", caseId)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true });

      if (error) {
        console.error("[workspace-closing-loop] Failed to list events", error);
        return sendError(res, 500, "EVENTS_FAILED", "Failed to load case history");
      }

      return res.json({
        ok: true,
        caseId,
        events: data || [],
      });
    } catch (err) {
      return handleUnexpectedError(
        res,
        "GET /cases/:caseId/events",
        err,
        "Failed to load case history"
      );
    }
  });

  return router;
}

function parseListRequest(query) {
  const datasetId = optionalString(query.datasetId);
  const caseState = optionalString(query.caseState) || "all";
  const priority = optionalString(query.priority) || "all";
  const owner = optionalString(query.owner) || "all";
  const bucket = optionalString(query.bucket) || "all";
  const period = optionalString(query.period) || "all";
  const rawSearch = optionalString(query.search);
  const limit = clampInt(query.limit, 100, 1, 500);

  if (datasetId && !isUuid(datasetId)) {
    return invalidListRequest("INVALID_DATASET_ID", "Valid datasetId is required");
  }

  if (!CASE_STATES.has(caseState)) {
    return invalidListRequest("INVALID_CASE_STATE", "Invalid caseState filter");
  }

  if (priority !== "all" && !PRIORITIES.has(priority)) {
    return invalidListRequest("INVALID_PRIORITY", "Invalid priority filter");
  }

  if (owner !== "all" && owner !== "unassigned" && !isUuid(owner)) {
    return invalidListRequest("INVALID_OWNER_FILTER", "Invalid owner filter");
  }

  if (!BUCKETS.has(bucket)) {
    return invalidListRequest("INVALID_BUCKET", "Invalid bucket filter");
  }

  if (!PERIODS.has(period)) {
    return invalidListRequest("INVALID_PERIOD", "Invalid period filter");
  }

  if (rawSearch.length > MAX_SEARCH_LENGTH) {
    return invalidListRequest(
      "SEARCH_TOO_LONG",
      `Search must be ${MAX_SEARCH_LENGTH} characters or fewer`
    );
  }

  if (caseState === "no_case" && (priority !== "all" || owner !== "all")) {
    return invalidListRequest(
      "INVALID_FILTER_COMBINATION",
      "Priority and owner filters require a Closing the Loop case"
    );
  }

  const decodedCursor = query.cursor ? decodeCursor(optionalString(query.cursor)) : null;
  if (query.cursor && !decodedCursor) {
    return invalidListRequest("INVALID_CURSOR", "Invalid pagination cursor");
  }

  return {
    ok: true,
    limit,
    cursor: decodedCursor,
    filters: {
      datasetId: datasetId || null,
      caseState,
      priority,
      owner,
      bucket,
      period,
      search: normaliseSearchTerm(rawSearch),
    },
  };
}

function invalidListRequest(code, message) {
  return { ok: false, code, message };
}

function normaliseSearchTerm(value) {
  return value
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s@._'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function loadAssignableOwners(workspaceId) {
  const { data, error } = await supabaseAdmin
    .from("workspace_members")
    .select(`
      id,
      user_id,
      role,
      app_users!inner (
        id,
        full_name,
        email,
        is_active
      )
    `)
    .eq("workspace_id", workspaceId)
    .in("role", [...MUTATION_ROLES])
    .eq("app_users.is_active", true);

  if (error) return { owners: [], error };

  const owners = (data || [])
    .map((membership) => {
      const user = Array.isArray(membership.app_users)
        ? membership.app_users[0]
        : membership.app_users;

      return {
        membershipId: membership.id,
        userId: membership.user_id,
        fullName: user?.full_name || "",
        email: user?.email || "",
        role: membership.role,
      };
    })
    .sort((left, right) => {
      const nameOrder = left.fullName.localeCompare(right.fullName, undefined, {
        sensitivity: "base",
      });
      if (nameOrder !== 0) return nameOrder;
      const emailOrder = left.email.localeCompare(right.email, undefined, {
        sensitivity: "base",
      });
      if (emailOrder !== 0) return emailOrder;
      return left.membershipId.localeCompare(right.membershipId);
    });

  return { owners, error: null };
}

function buildBaseQuerySpec(filters) {
  return {
    noCase: filters.caseState === "no_case",
    statuses: STATUSES.has(filters.caseState) ? [filters.caseState] : null,
    priority: filters.priority,
    owner: filters.owner,
    bucket: filters.bucket,
  };
}

function buildListSelect(spec) {
  return `
    id,
    dataset_id,
    response_id,
    source,
    submitted_at,
    score,
    bucket,
    company,
    stage,
    comment,
    contact_id,
    intercom_contact_url,
    created_at,
    datasets!inner (
      id,
      workspace_id,
      dataset_name,
      source_type
    ),
    ${buildCaseSelect(spec, "*")},
    close_loop_actions (
      id,
      dataset_row_id,
      status,
      owner,
      action_taken,
      updated_at,
      created_at
    )
  `;
}

function buildCountSelect(spec) {
  return `
    id,
    datasets!inner (id, workspace_id),
    ${buildCaseSelect(spec, "id,status,priority,owner_membership_id")}
  `;
}

function buildCaseSelect(spec, columns) {
  return `closing_loop_cases!${caseJoinType(spec)} (${columns})`;
}

function caseJoinType(spec) {
  const caseFilterRequired =
    !spec.noCase &&
    (Boolean(spec.statuses?.length) || spec.priority !== "all" || spec.owner !== "all");
  return caseFilterRequired ? "inner" : "left";
}

function createFilteredRowsQuery({ workspaceId, filters, spec, select, count, head = false }) {
  let query = supabaseAdmin
    .from("dataset_rows")
    .select(select, { count, head })
    .eq("datasets.workspace_id", workspaceId);

  if (filters.datasetId) query = query.eq("dataset_id", filters.datasetId);
  if (spec.bucket !== "all") query = query.eq("bucket", spec.bucket);

  const periodStart = getPeriodStart(filters.period);
  if (periodStart) query = query.gte("submitted_at", periodStart);

  if (filters.search) {
    const pattern = `%${filters.search}%`;
    query = query.or(
      ["comment", "company", "stage", "response_id", "contact_id"]
        .map((field) => `${field}.ilike.${pattern}`)
        .join(",")
    );
  }

  if (spec.noCase) {
    query = query.is("closing_loop_cases", null);
  } else {
    if (spec.statuses?.length === 1) {
      query = query.eq("closing_loop_cases.status", spec.statuses[0]);
    } else if (spec.statuses?.length > 1) {
      query = query.in("closing_loop_cases.status", spec.statuses);
    }

    if (spec.priority !== "all") {
      query = query.eq("closing_loop_cases.priority", spec.priority);
    }

    if (spec.owner === "unassigned") {
      query = query.is("closing_loop_cases.owner_membership_id", null);
    } else if (isUuid(spec.owner)) {
      query = query.eq("closing_loop_cases.owner_membership_id", spec.owner);
    }
  }

  return query;
}

function getPeriodStart(period) {
  if (period === "all") return null;

  const now = new Date();
  if (period === "this_month") {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  }

  const days = period === "7d" ? 7 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

function applyCursor(query, cursor) {
  if (!cursor) return query;

  const createdPredicate = [
    `created_at.lt.${cursor.createdAt}`,
    `and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`,
  ].join(",");

  if (cursor.submittedAt === null) {
    return query.is("submitted_at", null).or(createdPredicate);
  }

  return query.or(
    [
      `submitted_at.lt.${cursor.submittedAt}`,
      `and(submitted_at.eq.${cursor.submittedAt},created_at.lt.${cursor.createdAt})`,
      `and(submitted_at.eq.${cursor.submittedAt},created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`,
      "submitted_at.is.null",
    ].join(",")
  );
}

function encodeCursor(row) {
  return Buffer.from(
    JSON.stringify({
      v: 1,
      submittedAt: row.submitted_at || null,
      createdAt: row.created_at,
      id: row.id,
    })
  ).toString("base64url");
}

function decodeCursor(value) {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (
      parsed?.v !== 1 ||
      (parsed.submittedAt !== null && !isIsoDate(parsed.submittedAt)) ||
      !isIsoDate(parsed.createdAt) ||
      !isUuid(parsed.id)
    ) {
      return null;
    }

    return {
      submittedAt: parsed.submittedAt === null
        ? null
        : new Date(parsed.submittedAt).toISOString(),
      createdAt: new Date(parsed.createdAt).toISOString(),
      id: parsed.id,
    };
  } catch {
    return null;
  }
}

function isIsoDate(value) {
  return typeof value === "string" && value.length <= 40 && !Number.isNaN(Date.parse(value));
}

async function loadFilteredSummary({ workspaceId, filters }) {
  const baseSpec = buildBaseQuerySpec(filters);
  const definitions = [
    ["totalMatchingResponses", baseSpec],
    ["noCase", buildNoCaseSummarySpec(baseSpec)],
    ["open", buildCaseSummarySpec(baseSpec, { statuses: ["open"] })],
    ["inProgress", buildCaseSummarySpec(baseSpec, { statuses: ["in_progress"] })],
    ["closed", buildCaseSummarySpec(baseSpec, { statuses: ["closed"] })],
    [
      "openDetractors",
      buildCaseSummarySpec(baseSpec, { statuses: ["open"], bucket: "detractor" }),
    ],
    [
      "highPriorityActive",
      buildCaseSummarySpec(baseSpec, {
        statuses: ["open", "in_progress"],
        priority: "high",
      }),
    ],
    [
      "unassignedActive",
      buildCaseSummarySpec(baseSpec, {
        statuses: ["open", "in_progress"],
        owner: "unassigned",
      }),
    ],
  ];

  const results = await Promise.all(
    definitions.map(async ([key, spec]) => {
      if (!spec) return { key, count: 0, error: null };

      const { count, error } = await createFilteredRowsQuery({
        workspaceId,
        filters,
        spec,
        select: buildCountSelect(spec),
        count: "exact",
        head: true,
      });
      return { key, count: count || 0, error };
    })
  );

  const failed = results.find((result) => result.error);
  if (failed) return { summary: null, error: failed.error };

  return {
    summary: Object.fromEntries(results.map((result) => [result.key, result.count])),
    error: null,
  };
}

function buildNoCaseSummarySpec(baseSpec) {
  if (baseSpec.priority !== "all" || baseSpec.owner !== "all") return null;
  if (baseSpec.statuses?.length) return null;

  return {
    ...baseSpec,
    noCase: true,
    statuses: null,
  };
}

function buildCaseSummarySpec(baseSpec, requested) {
  if (baseSpec.noCase) return null;

  const statuses = intersectStatuses(baseSpec.statuses, requested.statuses);
  if (!statuses.length) return null;

  const priority = intersectSingleValue(baseSpec.priority, requested.priority || "all");
  if (!priority) return null;

  const owner = intersectSingleValue(baseSpec.owner, requested.owner || "all");
  if (!owner) return null;

  const bucket = intersectSingleValue(baseSpec.bucket, requested.bucket || "all");
  if (!bucket) return null;

  return {
    noCase: false,
    statuses,
    priority,
    owner,
    bucket,
  };
}

function intersectStatuses(current, requested) {
  if (!current?.length) return requested;
  return current.filter((status) => requested.includes(status));
}

function intersectSingleValue(current, requested) {
  if (current === "all") return requested;
  if (requested === "all" || requested === current) return current;
  return null;
}

function toClosingLoopListRow(row) {
  const { closing_loop_cases: closingCases, close_loop_actions: legacyActions, ...response } = row;
  const closingCase = Array.isArray(closingCases) ? closingCases[0] : closingCases;
  const latestLegacy = Array.isArray(legacyActions) ? legacyActions[0] : null;
  const safeLegacyAction = latestLegacy
    ? {
        id: latestLegacy.id,
        dataset_row_id: latestLegacy.dataset_row_id,
        status: latestLegacy.status,
        owner: latestLegacy.owner || null,
        action_taken: latestLegacy.action_taken || null,
        updated_at: latestLegacy.updated_at || null,
        created_at: latestLegacy.created_at || null,
      }
    : null;

  return {
    ...response,
    case: closingCase || null,
    legacy_actions: safeLegacyAction ? [safeLegacyAction] : [],
    latest_legacy_action: safeLegacyAction,
    latest_legacy_status: safeLegacyAction?.status || null,
  };
}

async function authenticateCurrentWorkspaceMember(req, res, next) {
  const auth = getWorkspaceAuth(req);

  if (!auth) {
    return sendError(res, 401, "AUTH_REQUIRED", "Workspace authentication required");
  }

  try {
    ensureSupabase();

    const { data: user, error: userError } = await supabaseAdmin
      .from("app_users")
      .select("id,is_active")
      .eq("id", auth.userId)
      .eq("is_active", true)
      .maybeSingle();

    if (userError) {
      console.error("[workspace-closing-loop] Failed to revalidate app user", userError);
      return sendError(res, 500, "AUTH_CHECK_FAILED", "Unable to verify Workspace access");
    }

    if (!user) {
      return sendError(res, 403, "MEMBERSHIP_REQUIRED", "Workspace access is no longer active");
    }

    const { data: memberships, error: membershipError } = await supabaseAdmin
      .from("workspace_members")
      .select("id,workspace_id,user_id,role")
      .eq("workspace_id", auth.workspaceId)
      .eq("user_id", auth.userId);

    if (membershipError) {
      console.error("[workspace-closing-loop] Failed to revalidate membership", membershipError);
      return sendError(res, 500, "AUTH_CHECK_FAILED", "Unable to verify Workspace access");
    }

    if (memberships?.length !== 1 || !READ_ROLES.has(memberships[0].role)) {
      return sendError(res, 403, "MEMBERSHIP_REQUIRED", "Workspace access is no longer active");
    }

    req.auth = auth;
    req.workspaceMembership = memberships[0];
    return next();
  } catch (err) {
    return handleUnexpectedError(res, "membership revalidation", err, "Unable to verify Workspace access");
  }
}

function requireMutationRole(req, res, next) {
  if (!MUTATION_ROLES.has(req.workspaceMembership?.role)) {
    return sendError(res, 403, "READ_ONLY_ROLE", "This Workspace role is read-only");
  }

  return next();
}

function handleRpcError(res, error) {
  const code = String(error?.message || "").trim();
  const knownErrors = {
    FORBIDDEN_MEMBERSHIP: [403, "MEMBERSHIP_REQUIRED", "Workspace access is no longer active"],
    FORBIDDEN_ROLE: [403, "READ_ONLY_ROLE", "This Workspace role is read-only"],
    DATASET_ROW_NOT_FOUND: [404, "DATASET_ROW_NOT_FOUND", "Dataset row not found"],
    CASE_NOT_FOUND: [404, "CASE_NOT_FOUND", "Case not found"],
    CASE_ALREADY_EXISTS: [409, "CASE_ALREADY_EXISTS", "A case already exists for this response"],
    INVALID_OWNER: [400, "INVALID_OWNER", "Owner must be an active member of this Workspace"],
    INVALID_STATUS: [400, "INVALID_STATUS", "Invalid status"],
    INVALID_PRIORITY: [400, "INVALID_PRIORITY", "Invalid priority"],
    CLOSURE_NOTE_REQUIRED: [400, "CLOSURE_NOTE_REQUIRED", "A non-empty note is required when closing a case"],
    NOTE_REQUIRED: [400, "NOTE_REQUIRED", "A non-empty note is required"],
    NOTE_TOO_LONG: [400, "NOTE_TOO_LONG", "Note must be 4000 characters or fewer"],
    EMPTY_UPDATE: [400, "EMPTY_UPDATE", "At least one change is required"],
    NO_CHANGES: [409, "NO_CHANGES", "The requested update does not change the case"],
  };
  const mapped = knownErrors[code];

  if (mapped) return sendError(res, mapped[0], mapped[1], mapped[2]);

  console.error("[workspace-closing-loop] RPC failed", error);
  return sendError(res, 500, "MUTATION_FAILED", "Closing the Loop update failed");
}

function handleUnexpectedError(res, operation, err, safeMessage) {
  console.error(`[workspace-closing-loop] ${operation} error`, err);
  return sendError(res, 500, "INTERNAL_ERROR", safeMessage);
}

function sendError(res, status, code, message) {
  return res.status(status).json({
    ok: false,
    error: {
      code,
      message,
    },
  });
}

function ensureSupabase() {
  if (!supabaseAdmin) throw new Error("Supabase admin client is not configured");
}

function optionalString(value) {
  return String(value ?? "").trim();
}

function nullableUuid(value) {
  if (value === null || value === undefined || value === "") return null;
  const normalised = optionalString(value);
  return isUuid(normalised) ? normalised : undefined;
}

function isUuid(value) {
  return UUID_PATTERN.test(optionalString(value));
}

function clampInt(value, fallback, min, max) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function hasOwn(value, key) {
  return Boolean(value && Object.prototype.hasOwnProperty.call(value, key));
}

function findUnknownFields(value, allowedFields) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const allowed = new Set(allowedFields);
  return Object.keys(value).filter((key) => !allowed.has(key));
}
