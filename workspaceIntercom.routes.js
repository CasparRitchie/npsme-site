// workspaceIntercom.routes.js
import express from "express";
import { supabaseAdmin } from "./supabaseClient.js";
import { requireWorkspaceAuth } from "./utils/workspaceAuth.js";
import { getCanonicalResponses, getSurveyStatsRows } from "./envola.routes.js";
import { refreshIntercomSurveyStatsIfStale } from "./intercom.routes.js";


export function createWorkspaceIntercomRouter() {
  const router = express.Router();

  router.get("/ping", (_req, res) => {
    res.json({
      ok: true,
      route: "workspace-intercom",
      supabaseConfigured: Boolean(supabaseAdmin),
    });
  });

  router.use(requireWorkspaceAuth);

  // --------------------------------------------------
  // GET /api/workspace-intercom/sources
  // --------------------------------------------------
  router.get("/sources", async (req, res) => {
    try {
      ensureSupabase();

      const workspaceId = getRequestWorkspaceId(req);

      const { data, error } = await supabaseAdmin
        .from("workspace_intercom_sources")
        .select(
          [
            "id",
            "workspace_id",
            "source_name",
            "source_slug",
            "is_active",
            "intercom_app_id",
            "intercom_region",
            "survey_content_id",
            "survey_content_title",
            "ingest_mode",
            "pii_mode",
            "created_at",
            "updated_at",
          ].join(",")
        )
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: true });

      if (error) {
        return res.status(500).json({
          ok: false,
          error: error.message,
        });
      }

      return res.json({
        ok: true,
        workspaceId,
        sources: (data || []).map(toWorkspaceIntercomSourceSummary),
      });
    } catch (err) {
      console.error("[workspace-intercom] GET /sources error", err);
      return res.status(500).json({
        ok: false,
        error: err.message || "Failed to load workspace Intercom sources",
      });
    }
  });

  // --------------------------------------------------
  // GET /api/workspace-intercom/sources/active
  // --------------------------------------------------
  router.get("/sources/active", async (req, res) => {
    try {
      ensureSupabase();

      const workspaceId = getRequestWorkspaceId(req);
      const source = await getActiveWorkspaceIntercomSource(workspaceId);

      if (!source) {
        return res.status(404).json({
          ok: false,
          error: "No active Intercom source configured for this workspace",
        });
      }

      return res.json({
        ok: true,
        workspaceId,
        source: toWorkspaceIntercomSourceSummary(source),
      });
    } catch (err) {
      console.error("[workspace-intercom] GET /sources/active error", err);
      return res.status(500).json({
        ok: false,
        error: err.message || "Failed to load active Intercom source",
      });
    }
  });

  // --------------------------------------------------
  // GET /api/workspace-intercom/sources/:sourceId
  // --------------------------------------------------
  router.get("/sources/:sourceId", async (req, res) => {
    try {
      ensureSupabase();

      const workspaceId = getRequestWorkspaceId(req);
      const sourceId = String(req.params.sourceId || "").trim();

      if (!isUuid(sourceId)) {
        return res.status(400).json({
          ok: false,
          error: "Valid sourceId is required",
        });
      }

      const { data, error } = await supabaseAdmin
        .from("workspace_intercom_sources")
        .select(
          [
            "id",
            "workspace_id",
            "source_name",
            "source_slug",
            "is_active",
            "intercom_app_id",
            "intercom_region",
            "survey_content_id",
            "survey_content_title",
            "ingest_mode",
            "pii_mode",
            "created_at",
            "updated_at",
          ].join(",")
        )
        .eq("id", sourceId)
        .eq("workspace_id", workspaceId)
        .maybeSingle();

      if (error) {
        return res.status(500).json({
          ok: false,
          error: error.message,
        });
      }

      if (!data) {
        return res.status(404).json({
          ok: false,
          error: "Intercom source not found",
        });
      }

      return res.json({
        ok: true,
        workspaceId,
        source: toWorkspaceIntercomSourceSummary(data),
      });
    } catch (err) {
      console.error("[workspace-intercom] GET /sources/:sourceId error", err);
      return res.status(500).json({
        ok: false,
        error: err.message || "Failed to load Intercom source",
      });
    }
  });

  // --------------------------------------------------
  // GET /api/workspace-intercom/responses
  // --------------------------------------------------
  router.get("/responses", async (req, res) => {
    try {
      ensureSupabase();

      const workspaceId = getRequestWorkspaceId(req);
      const source = await getActiveWorkspaceIntercomSource(workspaceId);

      if (!source) {
        return res.status(404).json({
          ok: false,
          error: "No active Intercom source configured for this workspace",
        });
      }

      const payload = await buildWorkspaceIntercomResponsesPayload({
        source,
        query: req.query,
      });

      return res.json({
        ok: true,
        workspaceId,
        source: toWorkspaceIntercomSourceSummary(source),
        ...payload,
      });
    } catch (err) {
      console.error("[workspace-intercom] GET /responses error", err);
      return res.status(500).json({
        ok: false,
        error: err.message || "Failed to load workspace Intercom responses",
      });
    }
  });


  // --------------------------------------------------
  // GET /api/workspace-intercom/invitations
  // --------------------------------------------------
  router.get("/invitations", async (req, res) => {
    try {
      ensureSupabase();

      const workspaceId = getRequestWorkspaceId(req);
      const source = await getActiveWorkspaceIntercomSource(workspaceId);

      if (!source) {
        return res.status(404).json({
          ok: false,
          error: "No active Intercom source configured for this workspace",
        });
      }

      const payload = await buildWorkspaceIntercomInvitationsPayload({
        source,
        query: req.query,
      });

      return res.json({
        ok: true,
        workspaceId,
        source: toWorkspaceIntercomSourceSummary(source),
        ...payload,
      });
    } catch (err) {
      console.error("[workspace-intercom] GET /invitations error", err);
      return res.status(500).json({
        ok: false,
        error: err.message || "Failed to load workspace Intercom invitations",
      });
    }
  });


  // --------------------------------------------------
// GET /api/workspace-intercom/invitations/reconcile
// --------------------------------------------------
router.get("/invitations/reconcile", async (req, res) => {
  try {
    ensureSupabase();

    const workspaceId = getRequestWorkspaceId(req);
    const source = await getActiveWorkspaceIntercomSource(workspaceId);

    if (!source) {
      return res.status(404).json({
        ok: false,
        error: "No active Intercom source configured for this workspace",
      });
    }

    const contentId = String(source?.survey_content_id || "").trim();

    if (!contentId) {
      return res.status(400).json({
        ok: false,
        error: "Active source is missing survey_content_id",
      });
    }

    const statsRows = await getSurveyStatsRows();
    const canonicalRows = await getCanonicalResponses();

    const statsContentRows = (statsRows || []).filter(
      (row) => String(row?.content_id || "").trim() === contentId
    );

    const canonicalContentRows = (canonicalRows || []).filter(
      (row) => String(row?.content_id || "").trim() === contentId
    );

    const statsByReceiptId = new Map();

    for (const row of statsContentRows) {
      const receiptId = normaliseReceiptId(row?.receipt_id);
      if (!receiptId) continue;
      statsByReceiptId.set(receiptId, row);
    }

    const responsesByReceiptId = new Map();

    for (const row of canonicalContentRows) {
      const receiptId = receiptIdFromResponse(row);
      if (!receiptId) continue;
      responsesByReceiptId.set(receiptId, row);
    }

    const statsReceiptIds = new Set(statsByReceiptId.keys());
    const responseReceiptIds = new Set(responsesByReceiptId.keys());

    const responseReceiptsMissingFromStats = Array.from(responseReceiptIds)
      .filter((receiptId) => !statsReceiptIds.has(receiptId));

    const statsReceiptsMissingFromResponses = Array.from(statsReceiptIds)
      .filter((receiptId) => !responseReceiptIds.has(receiptId));

    const responsesMissingStats = responseReceiptsMissingFromStats.map(
      (receiptId) => {
        const response = responsesByReceiptId.get(receiptId);

        return {
          receipt_id: receiptId,
          response_id: response?.response_id || null,
          submitted_at: response?.submitted_at || null,
          score_0_10: response?.score_0_10 ?? null,
          contact_id: response?.contact_id || null,
          selected_options_count: Array.isArray(response?.selected_options)
            ? response.selected_options.length
            : 0,
          verbatims_count: Array.isArray(response?.verbatims)
            ? response.verbatims.length
            : 0,
          has_answers: Array.isArray(response?.answers) && response.answers.length > 0,
          raw_keys: response ? Object.keys(response).sort() : [],
        };
      }
    );

    const statsMissingResponses = statsReceiptsMissingFromResponses.map(
      (receiptId) => {
        const stat = statsByReceiptId.get(receiptId);

        return {
          receipt_id: receiptId,
          received_at: stat?.received_at || null,
          first_delivery: stat?.first_delivery || null,
          first_open: stat?.first_open || null,
          first_click: stat?.first_click || null,
          first_answer: stat?.first_answer || null,
          first_completion: stat?.first_completion || null,
          stat_type: stat?.stat_type || null,
          content_type: stat?.content_type || null,
          device: stat?.device || null,
          user_id: stat?.user_id || null,
          email_present: Boolean(stat?.email),
          name_present: Boolean(stat?.name),
          raw_keys: stat ? Object.keys(stat).sort() : [],
        };
      }
    );

    return res.json({
      ok: true,
      workspaceId,
      content_id: contentId,
      source: toWorkspaceIntercomSourceSummary(source),
      counts: {
        canonical_response_rows_for_content: canonicalContentRows.length,
        stats_rows_for_content: statsContentRows.length,
        response_receipt_ids: responseReceiptIds.size,
        stats_receipt_ids: statsReceiptIds.size,
        responses_missing_stats: responsesMissingStats.length,
        stats_missing_responses: statsMissingResponses.length,
      },
      responses_missing_stats: responsesMissingStats,
      stats_missing_responses: statsMissingResponses,
    });
  } catch (err) {
    console.error("[workspace-intercom] GET /invitations/reconcile error", err);

    return res.status(500).json({
      ok: false,
      error: err.message || "Failed to reconcile invitations and responses",
    });
  }
});


  // --------------------------------------------------
  // GET /api/workspace-intercom/sources/active/responses
  // --------------------------------------------------
  router.get("/sources/active/responses", async (req, res) => {
    try {
      ensureSupabase();

      const workspaceId = getRequestWorkspaceId(req);
      const source = await getActiveWorkspaceIntercomSource(workspaceId);

      if (!source) {
        return res.status(404).json({
          ok: false,
          error: "No active Intercom source configured for this workspace",
        });
      }

      const payload = await buildWorkspaceIntercomResponsesPayload({
        source,
        query: req.query,
      });

      return res.json({
        ok: true,
        workspaceId,
        source: toWorkspaceIntercomSourceSummary(source),
        ...payload,
      });
    } catch (err) {
      console.error("[workspace-intercom] GET /sources/active/responses error", err);
      return res.status(500).json({
        ok: false,
        error: err.message || "Failed to load active source responses",
      });
    }
  });

  // --------------------------------------------------
  // GET /api/workspace-intercom/sources/:sourceId/responses
  // --------------------------------------------------
  router.get("/sources/:sourceId/responses", async (req, res) => {
    try {
      ensureSupabase();

      const workspaceId = getRequestWorkspaceId(req);
      const sourceId = String(req.params.sourceId || "").trim();

      if (!isUuid(sourceId)) {
        return res.status(400).json({
          ok: false,
          error: "Valid sourceId is required",
        });
      }

      const { data: source, error } = await supabaseAdmin
        .from("workspace_intercom_sources")
        .select(
          [
            "id",
            "workspace_id",
            "source_name",
            "source_slug",
            "is_active",
            "intercom_app_id",
            "intercom_region",
            "survey_content_id",
            "survey_content_title",
            "ingest_mode",
            "pii_mode",
            "created_at",
            "updated_at",
          ].join(",")
        )
        .eq("id", sourceId)
        .eq("workspace_id", workspaceId)
        .maybeSingle();

      if (error) {
        return res.status(500).json({
          ok: false,
          error: error.message,
        });
      }

      if (!source) {
        return res.status(404).json({
          ok: false,
          error: "Intercom source not found",
        });
      }

      const payload = await buildWorkspaceIntercomResponsesPayload({
        source,
        query: req.query,
      });

      return res.json({
        ok: true,
        workspaceId,
        source: toWorkspaceIntercomSourceSummary(source),
        ...payload,
      });
    } catch (err) {
      console.error("[workspace-intercom] GET /sources/:sourceId/responses error", err);
      return res.status(500).json({
        ok: false,
        error: err.message || "Failed to load source responses",
      });
    }
  });

  return router;
}


/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function ensureSupabase() {
  if (!supabaseAdmin) {
    throw new Error("Supabase is not configured");
  }
}

function getRequestWorkspaceId(req) {
  const workspaceId = req.auth?.workspaceId;

  if (!workspaceId) {
    throw new Error("Workspace authentication required");
  }

  return workspaceId;
}

async function getActiveWorkspaceIntercomSource(workspaceId) {
  const { data, error } = await supabaseAdmin
    .from("workspace_intercom_sources")
    .select(
      [
        "id",
        "workspace_id",
        "source_name",
        "source_slug",
        "is_active",
        "intercom_app_id",
        "intercom_region",
        "survey_content_id",
        "survey_content_title",
        "ingest_mode",
        "pii_mode",
        "created_at",
        "updated_at",
      ].join(",")
    )
    .eq("workspace_id", workspaceId)
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data || null;
}

async function getOrCreateWorkspaceIntercomDataset({ source, contentId, summary, rowCount }) {
  const workspaceId = String(source?.workspace_id || "").trim();

  if (!workspaceId) {
    throw new Error("Workspace Intercom source is missing workspace_id");
  }

  if (!contentId) {
    throw new Error("Workspace Intercom source is missing survey_content_id");
  }

  const sourceType = "workspace_intercom";
  const datasetName =
    source?.source_name ||
    source?.survey_content_title ||
    "Active Intercom source";

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("datasets")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("source_type", sourceType)
    .eq("content_id", contentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("datasets")
      .update({
        dataset_name: datasetName,
        raw_row_count: rowCount,
        valid_row_count: rowCount,
        skipped_row_count: 0,
        summary_json: summary || {},
      })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    return updated;
  }

  const { data, error } = await supabaseAdmin
    .from("datasets")
    .insert({
      workspace_id: workspaceId,
      dataset_name: datasetName,
      source_type: sourceType,
      content_id: contentId,
      raw_row_count: rowCount,
      valid_row_count: rowCount,
      skipped_row_count: 0,
      summary_json: summary || {},
      detected_fields_json: {},
      warnings_json: [],
      skipped_rows_json: [],
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function syncWorkspaceIntercomRows({ dataset, rows }) {
  const safeRows = Array.isArray(rows) ? rows : [];

  const rowsWithResponseIds = safeRows.filter((row) =>
    String(row?.response_id || "").trim()
  );

  const responseIds = Array.from(
    new Set(rowsWithResponseIds.map((row) => String(row.response_id).trim()))
  );

  if (!dataset?.id || responseIds.length === 0) {
    return new Map();
  }

  const { data: existingRows, error: existingError } = await supabaseAdmin
    .from("dataset_rows")
    .select(
      `
      *,
      close_loop_actions (
        id,
        status,
        owner,
        action_taken,
        updated_at,
        created_at
      )
    `
    )
    .eq("dataset_id", dataset.id)
    .in("response_id", responseIds);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const existingByResponseId = new Map(
    (existingRows || []).map((row) => [String(row.response_id), row])
  );

  const missingRows = rowsWithResponseIds.filter(
    (row) => !existingByResponseId.has(String(row.response_id))
  );

  if (missingRows.length > 0) {
    const payload = missingRows.map((row, index) => ({
      dataset_id: dataset.id,
      response_id: row.response_id,
      source: "workspace_intercom",
      row_number: index + 1,
      submitted_at: row.submitted_at || null,
      score: Number.isFinite(Number(row.score)) ? Number(row.score) : null,
      bucket: row.bucket || "unknown",

      // Keep PII minimised in the workspace dataset.
      customer_name: null,
      customer_email: null,

      company: row.company || null,
      stage: row.stage || null,
      comment: row.comment || null,

      // Keep the contact id for the Intercom deep link/back-office connection,
      // but avoid showing it as the visible contact label in the frontend.
      contact_id: row.contact_id || null,
      intercom_contact_url: row.intercom_contact_url || null,

      selected_options_json: Array.isArray(row.selected_options_json)
        ? row.selected_options_json
        : [],
      extra_scores_json: row.extra_scores_json || {},
      raw_json: row,
    }));

    const { error: insertError } = await supabaseAdmin
      .from("dataset_rows")
      .insert(payload);

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  const { data: refreshedRows, error: refreshError } = await supabaseAdmin
    .from("dataset_rows")
    .select(
      `
      *,
      close_loop_actions (
        id,
        status,
        owner,
        action_taken,
        updated_at,
        created_at
      )
    `
    )
    .eq("dataset_id", dataset.id)
    .in("response_id", responseIds);

  if (refreshError) {
    throw new Error(refreshError.message);
  }

  return new Map(
    (refreshedRows || []).map((row) => [String(row.response_id), row])
  );
}

async function buildWorkspaceIntercomResponsesPayload({ source, query }) {
  const contentId = String(source?.survey_content_id || "").trim();
  const bucket = String(query?.bucket || "all").trim().toLowerCase();
  const q = String(query?.q || "").trim().toLowerCase();
  const limit = clampInt(query?.limit, 200, 1, 5000);

  if (!contentId) {
    throw new Error("Active source is missing survey_content_id");
  }

  const canonicalRows = await getCanonicalResponses();

  const contentRows = (canonicalRows || []).filter(
    (row) => String(row?.content_id || "").trim() === contentId
  );

  const byContact = new Map();

  for (const row of contentRows) {
    const contactId = String(row?.contact_id || "").trim();
    if (!contactId) continue;

    const existing = byContact.get(contactId) || [];
    existing.push(row);
    byContact.set(contactId, existing);
  }

  let rows = contentRows.map((row) => {
    const contactId = String(row?.contact_id || "").trim();
    const history = contactId ? byContact.get(contactId) || [] : [];

    return flattenWorkspaceIntercomResponseForTable(row, history, source);
  });

  rows.sort((a, b) =>
    String(b?.submitted_at || "").localeCompare(String(a?.submitted_at || ""))
  );

  const summary = summariseWorkspaceIntercomRows(rows);

  const dataset = await getOrCreateWorkspaceIntercomDataset({
    source,
    contentId,
    summary,
    rowCount: rows.length,
  });

  const persistedByResponseId = await syncWorkspaceIntercomRows({
    dataset,
    rows,
  });

  rows = rows.map((row) => {
    const persisted = persistedByResponseId.get(String(row.response_id));

    return {
      ...row,

      // Important: keep id/response_id as the Intercom response identity.
      id: row.response_id || row.id || null,
      response_id: row.response_id || row.id || null,

      // Important: db_row_id is the Supabase dataset_rows.id used by
      // POST /api/nps-data/rows/:datasetRowId/actions
      db_row_id: persisted?.id || null,
      dataset_row_id: persisted?.id || null,

      close_loop_actions: Array.isArray(persisted?.close_loop_actions)
        ? persisted.close_loop_actions
        : [],
    };
  });

  rows = rows.filter((row) => {
    if (bucket === "all") return true;
    return row.bucket === bucket;
  });

  if (q) {
    rows = rows.filter((row) => {
      const haystack = [
        row.contact_label,
        row.contact_name,
        row.response_id,
        row.pioupiou,
        row.reader_serial,
        row.q_recommend_score,
        row.q_recommend_comment,
        row.q_install_score,
        row.q_install_comment,
        row.q_daily_use_score,
        row.q_benefits,
        row.q_parent_relation_score,
        row.q_parent_relation_comment,
        row.q_support_score,
        row.q_support_comment,
        row.q_final_comment,
        ...(Array.isArray(row.selected_options_json)
          ? row.selected_options_json
          : []),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }

  const limitedRows = rows.slice(0, limit);

  return {
    dataset,
    content_id: contentId,
    bucket,
    q,
    returned: limitedRows.length,
    total_matching: rows.length,
    summary,
    rows: limitedRows,
  };
}

async function buildWorkspaceIntercomInvitationsPayload({ source, query }) {
  const contentId = String(source?.survey_content_id || query?.content_id || "").trim();
  const days = clampInt(query?.days, 365, 1, 3650);
  const statusFilter = String(query?.status || "all").trim().toLowerCase();

    if (!contentId) {
    throw new Error("Active source is missing survey_content_id");
  }

  const refreshInfo = await refreshIntercomSurveyStatsIfStale({
    hours: clampInt(query?.ingest_hours, 72, 1, 720),
    minIntervalMs: clampInt(query?.min_refresh_minutes, 10, 1, 120) * 60 * 1000,
    force: String(query?.refresh || "").trim() === "1",
  }).catch((err) => {
    console.error("[workspace-intercom] invitation stats refresh failed", err);

    return {
      ok: false,
      ran: false,
      error: err.message || "Invitation stats refresh failed",
    };
  });

  const statsRows = await getSurveyStatsRows();
  const canonicalRows = await getCanonicalResponses();

  const canonicalContentRows = (canonicalRows || []).filter(
    (row) => String(row?.content_id || "").trim() === contentId
  );

  const statsContentRows = (statsRows || []).filter(
    (row) => String(row?.content_id || "").trim() === contentId
  );

  const cutoffMs = Date.now() - days * 24 * 60 * 60 * 1000;

  const responsesByReceiptId = new Map();

  for (const response of canonicalContentRows) {
    const receiptId = receiptIdFromResponse(response);
    if (!receiptId) continue;

    const existing = responsesByReceiptId.get(receiptId);

    if (!existing) {
      responsesByReceiptId.set(receiptId, response);
      continue;
    }

    const existingTs = Date.parse(existing?.submitted_at || "") || 0;
    const newTs = Date.parse(response?.submitted_at || "") || 0;

    if (newTs >= existingTs) {
      responsesByReceiptId.set(receiptId, response);
    }
  }

  const allRows = statsContentRows
    .map((row) => {
      const sentAtRaw = row.received_at || "";
      const sentAtMs = sentAtRaw ? new Date(sentAtRaw).getTime() : 0;

      const receiptId = normaliseReceiptId(row?.receipt_id);

      const matchedResponse = receiptId
        ? responsesByReceiptId.get(receiptId)
        : null;

      const score = normaliseNpsScore(
        matchedResponse?.score_0_10
      );

      /*
       * A valid NPS response must:
       * 1. exist in the canonical responses data; and
       * 2. contain a valid score from 0 to 10.
       */
      const hasValidNpsResponse = Boolean(
        matchedResponse && score !== null
      );

      /*
       * Intercom may mark a survey as completed even when the exported
       * response does not contain a valid NPS score.
       */
      const completedAt =
        row.first_completion ||
        matchedResponse?.submitted_at ||
        null;

      const isIntercomCompleted = Boolean(completedAt);

      /*
       * first_answer indicates that someone started answering the survey,
       * even if they did not subsequently complete it.
       */
      const startedAt =
        row.first_answer ||
        row.first_open ||
        row.first_click ||
        null;

      const respondedAt = hasValidNpsResponse
        ? matchedResponse?.submitted_at || completedAt
        : null;

      let status = "unknown";

      if (hasValidNpsResponse) {
        status = "responded";
      } else if (isIntercomCompleted) {
        status = "completed_without_score";
      } else if (startedAt) {
        status = "opened";
      } else if (row.first_delivery || row.delivered_at) {
        status = "delivered";
      } else if (row.first_hard_bounce || row.first_soft_bounce) {
        status = "bounced";
      } else if (row.failed_at || row.first_failure) {
        status = "failed";
      } else if (row.received_at) {
        status = "sent";
      }

      const contactId = String(
        row.user_id ||
          row.contact_id ||
          matchedResponse?.contact_id ||
          ""
      ).trim();

      return {
        invitation_id: receiptId,
        customer_id: contactId || null,
        survey_id: String(row.content_id || "").trim() || null,
        type_of_device: row.device || "",

        sent_at: sentAtRaw || null,
        sent_at_ms: sentAtMs,

        status,

        /*
         * Do not create a synthetic response_id for an Intercom completion
         * that does not have a canonical NPS response.
         */
        response_id:
          matchedResponse?.response_id ||
          "",

        score_0_10: score,
        responded_at: respondedAt,

        /*
         * Additional lifecycle fields let the frontend distinguish between
         * starting, completing and submitting a valid scored response.
         */
        started_at: startedAt,
        completed_at: completedAt,
        intercom_completed: isIntercomCompleted,
        has_valid_nps_response: hasValidNpsResponse,
        completed_without_valid_score:
          isIntercomCompleted && !hasValidNpsResponse,

        contact_label: formatRedactedContactLabel(contactId),

        intercom_contact_url:
          source?.intercom_app_id && contactId
            ? `https://app.intercom.com/a/apps/${source.intercom_app_id}/users/${contactId}`
            : null,
      };
    })
    .filter((row) => {
      if (!row.sent_at_ms || Number.isNaN(row.sent_at_ms)) {
        return false;
      }

      if (row.sent_at_ms < cutoffMs) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const aLatestActivity = Math.max(
        Date.parse(a.responded_at || "") || 0,
        Date.parse(a.completed_at || "") || 0,
        Date.parse(a.started_at || "") || 0,
        a.sent_at_ms || 0
      );

      const bLatestActivity = Math.max(
        Date.parse(b.responded_at || "") || 0,
        Date.parse(b.completed_at || "") || 0,
        Date.parse(b.started_at || "") || 0,
        b.sent_at_ms || 0
      );

      return bLatestActivity - aLatestActivity;
    });

  /*
   * Build summary figures from the complete date-filtered set, before the
   * optional status filter is applied.
   */
  const sent = allRows.length;

  const delivered = allRows.filter((row) =>
    [
      "sent",
      "delivered",
      "opened",
      "responded",
      "completed_without_score",
    ].includes(row.status)
  ).length;

  const opened = allRows.filter((row) =>
    [
      "opened",
      "responded",
      "completed_without_score",
    ].includes(row.status)
  ).length;

  const completed = allRows.filter(
    (row) => row.intercom_completed
  ).length;

  const responded = allRows.filter(
    (row) => row.has_valid_nps_response
  ).length;

  const completedWithoutValidScore = allRows.filter(
    (row) => row.completed_without_valid_score
  ).length;

  const startedButNotCompleted = allRows.filter(
    (row) =>
      Boolean(row.started_at) &&
      !row.intercom_completed &&
      !row.has_valid_nps_response
  ).length;

  const noResponseActivity = allRows.filter(
    (row) =>
      !row.started_at &&
      !row.intercom_completed &&
      !row.has_valid_nps_response
  ).length;

  const summary = {
    sent,
    delivered,
    opened,

    /*
     * `responded` is now the NPS Me business metric:
     * a canonical response containing a valid 0–10 score.
     */
    responded,
    valid_nps_responses: responded,

    /*
     * Keep the Intercom lifecycle metric separately.
     */
    completed,
    intercom_completed: completed,
    completed_without_valid_score: completedWithoutValidScore,
    started_but_not_completed: startedButNotCompleted,
    no_response_activity: noResponseActivity,

    bounced: allRows.filter(
      (row) => row.status === "bounced"
    ).length,

    failed: allRows.filter(
      (row) => row.status === "failed"
    ).length,

    response_rate_pct:
      sent > 0
        ? Math.round((responded / sent) * 1000) / 10
        : null,

    intercom_completion_rate_pct:
      sent > 0
        ? Math.round((completed / sent) * 1000) / 10
        : null,

    last_sent_at:
      allRows
        .map((row) => row.sent_at)
        .filter(Boolean)
        .sort()
        .slice(-1)[0] || null,
  };

  /*
   * Apply the status filter only to the returned table rows.
   * The headline summary remains based on all invitations in the period.
   */
  const rows =
    statusFilter === "all"
      ? allRows
      : allRows.filter((row) => row.status === statusFilter);

  const statsReceiptIds = new Set(
    statsContentRows
      .map((row) => normaliseReceiptId(row?.receipt_id))
      .filter(Boolean)
  );

  const responseReceiptIds = new Set(
    canonicalContentRows
      .map(receiptIdFromResponse)
      .filter(Boolean)
  );

  const responseReceiptsMissingFromStats = Array.from(responseReceiptIds)
    .filter((receiptId) => !statsReceiptIds.has(receiptId));

  const statsReceiptsMissingFromResponses = Array.from(statsReceiptIds)
    .filter((receiptId) => !responseReceiptIds.has(receiptId));

    const diagnostics =
    String(query?.debug || "") === "1"
      ? {
          canonical_response_rows_for_content:
            canonicalContentRows.length,

          stats_rows_for_content:
            statsContentRows.length,

          response_receipt_ids:
            responseReceiptIds.size,

          stats_receipt_ids:
            statsReceiptIds.size,

          responded_rows_from_invitation_payload:
            responded,

          valid_nps_response_rows_from_invitation_payload:
            responded,

          intercom_completed_rows_from_invitation_payload:
            completed,

          completed_without_valid_score_rows:
            completedWithoutValidScore,

          started_but_not_completed_rows:
            startedButNotCompleted,

          no_response_activity_rows:
            noResponseActivity,

          response_receipts_missing_from_stats_count:
            responseReceiptsMissingFromStats.length,

          response_receipts_missing_from_stats:
            responseReceiptsMissingFromStats.slice(0, 20),

          stats_receipts_missing_from_responses_count:
            statsReceiptsMissingFromResponses.length,

          stats_receipts_missing_from_responses:
            statsReceiptsMissingFromResponses.slice(0, 20),
        }
      : undefined;

  return {
    content_id: contentId,
    days,
    status: statusFilter,
    summary,
    rows,
    ...(diagnostics ? { diagnostics } : {}),
  };
}

function flattenWorkspaceIntercomResponseForTable(row, allRowsForContact = [], source) {
  const answers = Array.isArray(row?.answers) ? row.answers : [];
  const contactId = String(row?.contact_id || "").trim();
  const sourceAppId = String(source?.intercom_app_id || "").trim();

  const previousResponses = (allRowsForContact || [])
    .filter((x) => String(x?.response_id || "") !== String(row?.response_id || ""))
    .sort((a, b) =>
      String(a?.submitted_at || "").localeCompare(String(b?.submitted_at || ""))
    );

  const benefits = uniqueStrings([
    ...(Array.isArray(row?.selected_options) ? row.selected_options : []),
    ...allAnswersByQuestionId(answers, 612570),
  ]);

  const score = normaliseNpsScore(row?.score_0_10);
  const bucket = scoreBucket(score);

  return {
    id: row?.response_id || null,
    response_id: row?.response_id || null,
    source: "workspace_intercom",
    submitted_at: row?.submitted_at || null,
    score,
    bucket,

    contact_id: contactId || null,
    contact_label: formatRedactedContactLabel(contactId),
    contact_name: formatRedactedContactLabel(contactId),
    intercom_contact_url:
      sourceAppId && contactId
        ? `https://app.intercom.com/a/apps/${sourceAppId}/users/${contactId}`
        : null,

    company: null,
    stage: null,
    comment: redactFreeText(row?.comment, 500),

    pioupiou: row?.pioupiou_label || row?.custom_attributes?.pioupiou_label || "-",
    reader_serial: row?.reader_serial || row?.custom_attributes?.reader_serial || "-",

    previous_response_dates: previousResponses
      .map((x) => x?.submitted_at)
      .filter(Boolean),

    previous_response_links: previousResponses
      .map((x) => x?.response_id)
      .filter(Boolean),

    q_recommend_score: firstAnswerByQuestionId(answers, 612560),
    q_recommend_comment: firstAnswerByQuestionId(answers, 612565),

    q_install_score: firstAnswerByQuestionId(answers, 612566),
    q_install_comment: firstAnswerByQuestionId(answers, 612567),

    q_daily_use_score: firstAnswerByQuestionId(answers, 612568),

    q_benefits: benefits.length ? benefits.join(", ") : null,

    q_parent_relation_score: firstAnswerByQuestionId(answers, 612600),
    q_parent_relation_comment: firstAnswerByQuestionId(answers, 612571),

    q_support_score: firstAnswerByQuestionId(answers, 612601),
    q_support_comment: firstAnswerByQuestionId(answers, 612602),

    q_final_comment: firstAnswerByQuestionId(answers, 612603),

    selected_options_json: benefits,
    extra_scores_json: {},
    close_loop_actions: [],
    source_meta: {
      source_id: source?.id || null,
      source_name: source?.source_name || "",
      source_slug: source?.source_slug || "",
      content_id: source?.survey_content_id || null,
    },
  };
}

function firstAnswerByQuestionId(answers, qid) {
  const hit = (answers || []).find((a) => Number(a?.question_id) === Number(qid));
  return hit?.response ?? null;
}

function allAnswersByQuestionId(answers, qid) {
  return (answers || [])
    .filter((a) => Number(a?.question_id) === Number(qid))
    .map((a) => a?.response)
    .filter((x) => x != null);
}

function uniqueStrings(arr) {
  return Array.from(new Set((arr || []).filter(Boolean).map((x) => String(x))));
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "").trim()
  );
}

function clampInt(v, def, min, max) {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

function scoreBucket(score) {
  if (typeof score !== "number") return "unknown";
  if (score >= 9) return "promoter";
  if (score >= 7) return "passive";
  return "detractor";
}

function formatRedactedContactLabel(contactId) {
  const raw = String(contactId || "").trim();
  if (!raw) return "Contact";
  return `Contact •••${raw.slice(-5)}`;
}

function redactFreeText(value, maxLength = 500) {
  let text = String(value || "").trim();
  if (!text) return "";

  text = text.replace(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    "[redacted email]"
  );

  text = text.replace(
    /(\+?\d[\d\s().-]{7,}\d)/g,
    "[redacted phone]"
  );

  text = text.replace(/\bhttps?:\/\/[^\s]+/gi, "[redacted link]");
  text = text.replace(/\b\d{8,}\b/g, "[redacted id]");
  text = text.replace(/\s+/g, " ").trim();

  if (text.length > maxLength) {
    text = text.slice(0, maxLength - 1).trimEnd() + "…";
  }

  return text;
}

function toWorkspaceIntercomSourceSummary(row) {
  return {
    id: row.id,
    workspace_id: row.workspace_id,
    source_name: row.source_name || "",
    source_slug: row.source_slug || "",
    is_active: !!row.is_active,
    intercom_app_id: row.intercom_app_id || null,
    intercom_region: row.intercom_region || "us",
    survey_content_id: row.survey_content_id || null,
    survey_content_title: row.survey_content_title || null,
    ingest_mode: row.ingest_mode || "workspace_intercom",
    pii_mode: row.pii_mode || "minimised",
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
  };
}

function summariseWorkspaceIntercomRows(rows) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const total = safeRows.length;
  const promoters = safeRows.filter((row) => row.bucket === "promoter").length;
  const passives = safeRows.filter((row) => row.bucket === "passive").length;
  const detractors = safeRows.filter((row) => row.bucket === "detractor").length;

  const scores = safeRows
    .map((row) => Number(row.score))
    .filter((score) => Number.isFinite(score));

  const averageScore = scores.length
    ? Math.round(
        (scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10
      ) / 10
    : null;

  const nps =
    total > 0 ? Math.round(((promoters - detractors) / total) * 100) : null;

  return {
    total,
    promoters,
    passives,
    detractors,
    nps,
    averageScore,
  };
}

function normaliseReceiptId(value) {
  return String(value || "").trim();
}

function normaliseNpsScore(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const score = Number(value);

  if (!Number.isFinite(score)) {
    return null;
  }

  if (score < 0 || score > 10) {
    return null;
  }

  return score;
}

function receiptIdFromResponse(row) {
  const direct = normaliseReceiptId(row?.receipt_id);
  if (direct) return direct;

  const responseId = String(row?.response_id || "").trim();

  // Your response_id is usually "contentId:receiptId"
  if (responseId.includes(":")) {
    return normaliseReceiptId(responseId.split(":").slice(1).join(":"));
  }

  return "";
}
