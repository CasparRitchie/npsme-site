// workspace.routes.js
import express from "express";
import { supabaseAdmin } from "./supabaseClient.js";
import { requireWorkspaceAuth } from "./utils/workspaceAuth.js";

/**
 * Workspace routes
 *
 * Goals:
 * - Provide a single workspace-facing API surface
 * - Minimise PII by default
 * - Reuse existing saved dataset storage
 * - Create a clean place to later add Intercom-backed sources
 *
 * Notes:
 * - Workspace auth is enforced at router level
 * - This file is intentionally conservative with row-level data
 */

export function createWorkspaceRouter() {
  const router = express.Router();

  // --------------------------------------------------
  // GET /api/workspace/ping
  // --------------------------------------------------
  router.get("/ping", (_req, res) => {
    res.json({
      ok: true,
      route: "workspace",
      supabaseConfigured: Boolean(supabaseAdmin),
      piiMode: "minimised",
    });
  });


  // --------------------------------------------------
  // Enforce workspace auth for all workspace routes
  // --------------------------------------------------
  router.use(requireWorkspaceAuth);



  // --------------------------------------------------
  // GET /api/workspace/home
  // Workspace overview without row-level PII
  // --------------------------------------------------
  router.get("/home", async (req, res) => {
    try {
      ensureSupabase();

      const workspaceId = getRequestWorkspaceId(req);

      const { data: workspace, error: workspaceError } = await supabaseAdmin
        .from("workspaces")
        .select("id, workspace_name, created_at")
        .eq("id", workspaceId)
        .single();

      if (workspaceError || !workspace) {
        return res.status(404).json({
          ok: false,
          error: "Workspace not found",
        });
      }

      const { data: datasets, error: datasetsError } = await supabaseAdmin
        .from("datasets")
        .select(
          [
            "id",
            "workspace_id",
            "dataset_name",
            "source_type",
            "content_id",
            "raw_row_count",
            "valid_row_count",
            "skipped_row_count",
            "summary_json",
            "created_at",
          ].join(",")
        )
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      if (datasetsError) {
        return res.status(500).json({
          ok: false,
          error: datasetsError.message,
        });
      }

      const safeDatasets = (datasets || []).map(toSafeDatasetSummary);
      const totals = buildWorkspaceTotals(safeDatasets);

      return res.json({
        ok: true,
        workspace: {
          id: workspace.id,
          workspace_name: workspace.workspace_name,
          created_at: workspace.created_at,
        },
        totals,
        datasets: safeDatasets,
      });
    } catch (err) {
      console.error("[workspace] GET /home error", err);
      return res.status(500).json({
        ok: false,
        error: err.message || "Failed to load workspace home",
      });
    }
  });

  // --------------------------------------------------
  // GET /api/workspace/datasets
  // Saved datasets only, no row-level PII
  // --------------------------------------------------
  router.get("/datasets", async (req, res) => {
    try {
      ensureSupabase();

      const workspaceId = getRequestWorkspaceId(req);

      const { data, error } = await supabaseAdmin
        .from("datasets")
        .select(
          [
            "id",
            "workspace_id",
            "dataset_name",
            "source_type",
            "content_id",
            "raw_row_count",
            "valid_row_count",
            "skipped_row_count",
            "summary_json",
            "created_at",
          ].join(",")
        )
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      if (error) {
        return res.status(500).json({
          ok: false,
          error: error.message,
        });
      }

      return res.json({
        ok: true,
        workspaceId,
        datasets: (data || []).map(toSafeDatasetSummary),
      });
    } catch (err) {
      console.error("[workspace] GET /datasets error", err);
      return res.status(500).json({
        ok: false,
        error: err.message || "Failed to list datasets",
      });
    }
  });

  // --------------------------------------------------
  // GET /api/workspace/datasets/:datasetId
  // Dataset detail with PII-minimised rows
  // Default list payload kept intentionally light
  // --------------------------------------------------
  router.get("/datasets/:datasetId", async (req, res) => {
    try {
      ensureSupabase();

      const workspaceId = getRequestWorkspaceId(req);
      const datasetId = String(req.params.datasetId || "").trim();
      const limit = clampInt(req.query.limit, 200, 1, 2000);

      if (!isUuid(datasetId)) {
        return res.status(400).json({
          ok: false,
          error: "Valid datasetId is required",
        });
      }

      const { data: dataset, error: datasetError } = await supabaseAdmin
        .from("datasets")
        .select("*")
        .eq("id", datasetId)
        .eq("workspace_id", workspaceId)
        .single();

      if (datasetError || !dataset) {
        return res.status(404).json({
          ok: false,
          error: "Dataset not found",
        });
      }

      const { data: rows, error: rowsError } = await supabaseAdmin
        .from("dataset_rows")
        .select(`
          id,
          dataset_id,
          response_id,
          source,
          row_number,
          submitted_at,
          score,
          bucket,
          comment,
          contact_id,
          intercom_contact_url,
          created_at,
          close_loop_actions (
            id,
            status,
            owner,
            action_taken,
            updated_at,
            created_at
          )
        `)
        .eq("dataset_id", datasetId)
        .order("submitted_at", { ascending: false, nullsFirst: false })
        .limit(limit);

      if (rowsError) {
        return res.status(500).json({
          ok: false,
          error: rowsError.message,
        });
      }

      return res.json({
        ok: true,
        workspaceId,
        dataset: toSafeDatasetSummary(dataset),
        rows: (rows || []).map(toSafeWorkspaceRow),
      });
    } catch (err) {
      console.error("[workspace] GET /datasets/:datasetId error", err);
      return res.status(500).json({
        ok: false,
        error: err.message || "Failed to load dataset",
      });
    }
  });

  // --------------------------------------------------
  // GET /api/workspace/datasets/:datasetId/performance
  // Lightweight performance payload for workspace views
  // --------------------------------------------------
  router.get("/datasets/:datasetId/performance", async (req, res) => {
    try {
      ensureSupabase();

      const workspaceId = getRequestWorkspaceId(req);
      const datasetId = String(req.params.datasetId || "").trim();

      if (!isUuid(datasetId)) {
        return res.status(400).json({
          ok: false,
          error: "Valid datasetId is required",
        });
      }

      const { data: dataset, error: datasetError } = await supabaseAdmin
        .from("datasets")
        .select(
          "id, workspace_id, dataset_name, source_type, content_id, summary_json, created_at"
        )
        .eq("id", datasetId)
        .eq("workspace_id", workspaceId)
        .single();

      if (datasetError || !dataset) {
        return res.status(404).json({
          ok: false,
          error: "Dataset not found",
        });
      }

      const { data: rows, error: rowsError } = await supabaseAdmin
        .from("dataset_rows")
        .select("submitted_at, score, bucket")
        .eq("dataset_id", datasetId)
        .order("submitted_at", { ascending: true, nullsFirst: false });

      if (rowsError) {
        return res.status(500).json({
          ok: false,
          error: rowsError.message,
        });
      }

      const safeRows = (rows || []).map((row) => ({
        submitted_at: row.submitted_at || null,
        score: Number.isFinite(Number(row.score)) ? Number(row.score) : null,
        bucket: row.bucket || null,
      }));

      return res.json({
        ok: true,
        dataset: toSafeDatasetSummary(dataset),
        summary: normaliseSummary(dataset.summary_json, safeRows),
        timeline: buildSimpleDailyTimeline(safeRows),
        score_distribution: buildScoreDistribution(safeRows),
      });
    } catch (err) {
      console.error("[workspace] GET /datasets/:datasetId/performance error", err);
      return res.status(500).json({
        ok: false,
        error: err.message || "Failed to load performance",
      });
    }
  });

  // --------------------------------------------------
  // GET /api/workspace/datasets/:datasetId/responses
  // PII-minimised response list for richer workspace UI
  // --------------------------------------------------
  router.get("/datasets/:datasetId/responses", async (req, res) => {
    try {
      ensureSupabase();

      const workspaceId = getRequestWorkspaceId(req);
      const datasetId = String(req.params.datasetId || "").trim();
      const limit = clampInt(req.query.limit, 200, 1, 5000);
      const bucket = String(req.query.bucket || "all").trim().toLowerCase();
      const q = String(req.query.q || "").trim().toLowerCase();

      if (!isUuid(datasetId)) {
        return res.status(400).json({
          ok: false,
          error: "Valid datasetId is required",
        });
      }

      const { data: dataset, error: datasetError } = await supabaseAdmin
        .from("datasets")
        .select(
          "id, workspace_id, dataset_name, source_type, content_id, summary_json, created_at"
        )
        .eq("id", datasetId)
        .eq("workspace_id", workspaceId)
        .single();

      if (datasetError || !dataset) {
        return res.status(404).json({
          ok: false,
          error: "Dataset not found",
        });
      }

      let query = supabaseAdmin
        .from("dataset_rows")
        .select(`
          id,
          dataset_id,
          response_id,
          source,
          row_number,
          submitted_at,
          score,
          bucket,
          company,
          stage,
          comment,
          contact_id,
          intercom_contact_url,
          selected_options_json,
          extra_scores_json,
          created_at,
          close_loop_actions (
            id,
            status,
            owner,
            action_taken,
            updated_at,
            created_at
          )
        `)
        .eq("dataset_id", datasetId)
        .order("submitted_at", { ascending: false, nullsFirst: false })
        .limit(limit);

      if (["promoter", "passive", "detractor", "unknown"].includes(bucket)) {
        query = query.eq("bucket", bucket);
      }

      const { data: rows, error: rowsError } = await query;

      if (rowsError) {
        return res.status(500).json({
          ok: false,
          error: rowsError.message,
        });
      }

      let safeRows = (rows || []).map(toSafeWorkspaceResponseListRow);

      if (q) {
        safeRows = safeRows.filter((row) => {
          const haystack = [
            row.response_id,
            row.company,
            row.stage,
            row.comment,
            row.contact_label,
            ...(Array.isArray(row.selected_options_json)
              ? row.selected_options_json
              : []),
          ]
            .map((x) => String(x || "").toLowerCase())
            .join(" ");

          return haystack.includes(q);
        });
      }

      return res.json({
        ok: true,
        dataset: toSafeDatasetSummary(dataset),
        bucket,
        q,
        returned: safeRows.length,
        rows: safeRows,
      });
    } catch (err) {
      console.error("[workspace] GET /datasets/:datasetId/responses error", err);
      return res.status(500).json({
        ok: false,
        error: err.message || "Failed to load responses",
      });
    }
  });

  // --------------------------------------------------
  // GET /api/workspace/datasets/:datasetId/responses/:responseId
  // Richer drilldown route, still redacted by default
  // --------------------------------------------------
  router.get("/datasets/:datasetId/responses/:responseId", async (req, res) => {
    try {
      ensureSupabase();

      const workspaceId = getRequestWorkspaceId(req);
      const datasetId = String(req.params.datasetId || "").trim();
      const responseId = String(req.params.responseId || "").trim();

      if (!isUuid(datasetId)) {
        return res.status(400).json({
          ok: false,
          error: "Valid datasetId is required",
        });
      }

      if (!responseId) {
        return res.status(400).json({
          ok: false,
          error: "responseId is required",
        });
      }

      const { data: dataset, error: datasetError } = await supabaseAdmin
        .from("datasets")
        .select(
          "id, workspace_id, dataset_name, source_type, content_id, summary_json, created_at"
        )
        .eq("id", datasetId)
        .eq("workspace_id", workspaceId)
        .single();

      if (datasetError || !dataset) {
        return res.status(404).json({
          ok: false,
          error: "Dataset not found",
        });
      }

      const { data: row, error: rowError } = await supabaseAdmin
        .from("dataset_rows")
        .select(`
          id,
          dataset_id,
          response_id,
          source,
          row_number,
          submitted_at,
          score,
          bucket,
          company,
          stage,
          comment,
          contact_id,
          intercom_contact_url,
          selected_options_json,
          extra_scores_json,
          created_at,
          close_loop_actions (
            id,
            status,
            owner,
            action_taken,
            updated_at,
            created_at
          )
        `)
        .eq("dataset_id", datasetId)
        .eq("response_id", responseId)
        .single();

      if (rowError || !row) {
        return res.status(404).json({
          ok: false,
          error: "Response not found",
        });
      }

      return res.json({
        ok: true,
        dataset: toSafeDatasetSummary(dataset),
        response: toSafeWorkspaceResponseDetail(row),
      });
    } catch (err) {
      console.error("[workspace] GET /datasets/:datasetId/responses/:responseId error", err);
      return res.status(500).json({
        ok: false,
        error: err.message || "Failed to load response",
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

function toSafeCloseLoopActions(actions = []) {
  if (!Array.isArray(actions)) return [];

  return actions
    .map((action) => ({
      id: action.id,
      status: action.status || "open",
      owner: action.owner || "",
      action_taken: action.action_taken || "",
      updated_at: action.updated_at || action.created_at || null,
      created_at: action.created_at || null,
    }))
    .sort((a, b) => {
      const aDate = new Date(a.updated_at || a.created_at || 0).getTime();
      const bDate = new Date(b.updated_at || b.created_at || 0).getTime();
      return aDate - bDate;
    });
}

function clampInt(v, def, min, max) {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "").trim()
  );
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

  text = text.replace(
    /\bhttps?:\/\/[^\s]+/gi,
    "[redacted link]"
  );

  text = text.replace(/\b\d{8,}\b/g, "[redacted id]");
  text = text.replace(/\s+/g, " ").trim();

  if (text.length > maxLength) {
    text = text.slice(0, maxLength - 1).trimEnd() + "…";
  }

  return text;
}

function toSafeDatasetSummary(dataset) {
  return {
    id: dataset.id,
    workspace_id: dataset.workspace_id,
    dataset_name: dataset.dataset_name,
    source_type: dataset.source_type,
    content_id: dataset.content_id || null,
    raw_row_count: dataset.raw_row_count ?? 0,
    valid_row_count: dataset.valid_row_count ?? 0,
    skipped_row_count: dataset.skipped_row_count ?? 0,
    summary_json: dataset.summary_json || {},
    created_at: dataset.created_at || null,
  };
}

function toSafeWorkspaceRow(row) {
  return {
    id: row.id,
    dataset_id: row.dataset_id,
    response_id: row.response_id || null,
    source: row.source || null,
    row_number: row.row_number ?? null,
    submitted_at: row.submitted_at || null,
    score: Number.isFinite(Number(row.score)) ? Number(row.score) : null,
    bucket: row.bucket || null,

    comment: redactFreeText(row.comment, 280),

    customer_name: null,
    customer_email: null,

    contact_label: formatRedactedContactLabel(row.contact_id),
    intercom_contact_url: row.intercom_contact_url || null,

    close_loop_actions: toSafeCloseLoopActions(row.close_loop_actions),

    created_at: row.created_at || null,
  };
}

function toSafeWorkspaceResponseListRow(row) {
  return {
    id: row.id,
    dataset_id: row.dataset_id,
    response_id: row.response_id || null,
    source: row.source || null,
    row_number: row.row_number ?? null,
    submitted_at: row.submitted_at || null,
    score: Number.isFinite(Number(row.score)) ? Number(row.score) : null,
    bucket: row.bucket || null,

    company: row.company || null,
    stage: row.stage || null,
    comment: redactFreeText(row.comment, 500),

    customer_name: null,
    customer_email: null,

    contact_label: formatRedactedContactLabel(row.contact_id),
    intercom_contact_url: row.intercom_contact_url || null,

    selected_options_json: Array.isArray(row.selected_options_json)
      ? row.selected_options_json
      : [],

    extra_scores_json: row.extra_scores_json || {},
    close_loop_actions: toSafeCloseLoopActions(row.close_loop_actions),
    created_at: row.created_at || null,
  };
}

function toSafeWorkspaceResponseDetail(row) {
  return {
    id: row.id,
    dataset_id: row.dataset_id,
    response_id: row.response_id || null,
    source: row.source || null,
    row_number: row.row_number ?? null,
    submitted_at: row.submitted_at || null,
    score: Number.isFinite(Number(row.score)) ? Number(row.score) : null,
    bucket: row.bucket || null,

    company: row.company || null,
    stage: row.stage || null,

    comment: redactFreeText(row.comment, 1200),

    customer_name: null,
    customer_email: null,

    contact_label: formatRedactedContactLabel(row.contact_id),
    intercom_contact_url: row.intercom_contact_url || null,

    selected_options_json: Array.isArray(row.selected_options_json)
      ? row.selected_options_json
      : [],

    extra_scores_json: row.extra_scores_json || {},
    close_loop_actions: toSafeCloseLoopActions(row.close_loop_actions),
    created_at: row.created_at || null,
  };
}

function buildWorkspaceTotals(datasets) {
  return (datasets || []).reduce(
    (acc, dataset) => {
      const summary = dataset.summary_json || {};

      acc.datasets += 1;
      acc.responses += Number(summary.total ?? dataset.valid_row_count ?? 0);
      acc.promoters += Number(summary.promoters ?? 0);
      acc.passives += Number(summary.passives ?? 0);
      acc.detractors += Number(summary.detractors ?? 0);

      return acc;
    },
    {
      datasets: 0,
      responses: 0,
      promoters: 0,
      passives: 0,
      detractors: 0,
    }
  );
}

function normaliseSummary(summaryJson, rows) {
  const summary = summaryJson || {};

  return {
    total: summary.total ?? rows.length,
    promoters:
      summary.promoters ?? rows.filter((row) => row.bucket === "promoter").length,
    passives:
      summary.passives ?? rows.filter((row) => row.bucket === "passive").length,
    detractors:
      summary.detractors ??
      rows.filter((row) => row.bucket === "detractor").length,
    nps: summary.nps ?? calculateNps(rows),
    averageScore: summary.averageScore ?? calculateAverageScore(rows),
  };
}

function calculateNps(rows) {
  const total = rows.length;
  if (!total) return null;

  const promoters = rows.filter((row) => row.bucket === "promoter").length;
  const detractors = rows.filter((row) => row.bucket === "detractor").length;

  return Math.round(((promoters - detractors) / total) * 100);
}

function calculateAverageScore(rows) {
  const scores = rows
    .map((row) => Number(row.score))
    .filter((score) => Number.isFinite(score));

  if (!scores.length) return null;

  return Math.round(
    (scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10
  ) / 10;
}

function buildScoreDistribution(rows) {
  const counts = Array.from({ length: 11 }, (_, score) => ({
    score,
    count: 0,
  }));

  for (const row of rows || []) {
    const score = Number(row.score);
    if (Number.isInteger(score) && score >= 0 && score <= 10) {
      counts[score].count += 1;
    }
  }

  return counts;
}

function buildSimpleDailyTimeline(rows) {
  const byDate = new Map();

  for (const row of rows || []) {
    if (!row.submitted_at) continue;

    const dateKey = String(row.submitted_at).slice(0, 10);
    if (!dateKey) continue;

    const cur = byDate.get(dateKey) || {
      date: dateKey,
      total: 0,
      promoters: 0,
      passives: 0,
      detractors: 0,
      nps: null,
    };

    cur.total += 1;
    if (row.bucket === "promoter") cur.promoters += 1;
    if (row.bucket === "passive") cur.passives += 1;
    if (row.bucket === "detractor") cur.detractors += 1;

    cur.nps = Math.round(((cur.promoters - cur.detractors) / cur.total) * 100);

    byDate.set(dateKey, cur);
  }

  return Array.from(byDate.values()).sort((a, b) =>
    a.date > b.date ? 1 : -1
  );
}
