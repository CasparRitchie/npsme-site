import express from "express";

import { supabaseAdmin } from "./supabaseClient.js";
import { getWorkspaceAuth } from "./utils/workspaceAuth.js";

const READ_ROLES = new Set(["owner", "admin", "member", "viewer"]);
const MUTATION_ROLES = new Set(["owner", "admin", "member"]);
const STATUSES = new Set(["open", "in_progress", "closed"]);
const PRIORITIES = new Set(["high", "normal", "low"]);
const LEGACY_ACTION_LIMIT = 5000;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createWorkspaceClosingLoopRouter() {
  const router = express.Router();

  router.use(authenticateCurrentWorkspaceMember);

  router.get("/", async (req, res) => {
    try {
      ensureSupabase();

      const datasetId = optionalString(req.query.datasetId);
      const limit = clampInt(req.query.limit, 200, 1, 500);

      if (datasetId && !isUuid(datasetId)) {
        return sendError(res, 400, "INVALID_DATASET_ID", "Valid datasetId is required");
      }

      // Status, priority and owner filters must be added with database-side
      // pagination during the frontend/reporting implementation.
      let rowsQuery = supabaseAdmin
        .from("dataset_rows")
        .select(`
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
          )
        `)
        .eq("datasets.workspace_id", req.auth.workspaceId)
        .order("submitted_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(limit);

      if (datasetId) rowsQuery = rowsQuery.eq("dataset_id", datasetId);

      const { data: datasetRows, error: rowsError } = await rowsQuery;

      if (rowsError) {
        console.error("[workspace-closing-loop] Failed to list dataset rows", rowsError);
        return sendError(res, 500, "LIST_FAILED", "Failed to load Closing the Loop cases");
      }

      const rowIds = (datasetRows || []).map((row) => row.id);
      let cases = [];
      let legacyActions = [];

      if (rowIds.length > 0) {
        const [casesResult, legacyActionsResult] = await Promise.all([
          supabaseAdmin
            .from("closing_loop_cases")
            .select("*")
            .eq("workspace_id", req.auth.workspaceId)
            .in("dataset_row_id", rowIds),
          supabaseAdmin
            .from("close_loop_actions")
            .select(`
              id,
              dataset_row_id,
              status,
              owner,
              action_taken,
              updated_at,
              created_at,
              dataset_rows!inner (
                id,
                datasets!inner (
                  workspace_id
                )
              )
            `)
            .in("dataset_row_id", rowIds)
            .eq("dataset_rows.datasets.workspace_id", req.auth.workspaceId)
            .order("updated_at", { ascending: false, nullsFirst: false })
            .order("created_at", { ascending: false, nullsFirst: false })
            .order("id", { ascending: false })
            .limit(LEGACY_ACTION_LIMIT),
        ]);

        if (casesResult.error) {
          console.error("[workspace-closing-loop] Failed to load cases", casesResult.error);
          return sendError(res, 500, "LIST_FAILED", "Failed to load Closing the Loop cases");
        }

        if (legacyActionsResult.error) {
          console.error(
            "[workspace-closing-loop] Failed to load legacy actions",
            legacyActionsResult.error
          );
          return sendError(res, 500, "LIST_FAILED", "Failed to load Closing the Loop cases");
        }

        cases = casesResult.data || [];
        legacyActions = legacyActionsResult.data || [];
      }

      const casesByRowId = new Map(cases.map((closingCase) => [closingCase.dataset_row_id, closingCase]));
      const legacyActionsByRowId = new Map();

      legacyActions.forEach((action) => {
        const safeAction = {
          id: action.id,
          dataset_row_id: action.dataset_row_id,
          status: action.status,
          owner: action.owner || null,
          action_taken: action.action_taken || null,
          updated_at: action.updated_at || null,
          created_at: action.created_at || null,
        };
        const existing = legacyActionsByRowId.get(action.dataset_row_id) || [];
        existing.push(safeAction);
        legacyActionsByRowId.set(action.dataset_row_id, existing);
      });

      const rows = (datasetRows || []).map((row) => {
        const rowLegacyActions = legacyActionsByRowId.get(row.id) || [];

        return {
          ...row,
          case: casesByRowId.get(row.id) || null,
          legacy_actions: rowLegacyActions,
          latest_legacy_status: rowLegacyActions[0]?.status || null,
        };
      });

      return res.json({
        ok: true,
        limit,
        returned: rows.length,
        legacy_actions_truncated: legacyActions.length === LEGACY_ACTION_LIMIT,
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
