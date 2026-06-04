// workspaceIntercom.routes.js
import express from "express";
import { supabaseAdmin } from "./supabaseClient.js";
import { requireWorkspaceAuth } from "./utils/workspaceAuth.js";
import { getCanonicalResponses } from "./envola.routes.js";

export function createWorkspaceIntercomRouter() {
  const router = express.Router();

  // Public-ish health check for the mounted router itself
  router.get("/ping", (_req, res) => {
    res.json({
      ok: true,
      route: "workspace-intercom",
      supabaseConfigured: Boolean(supabaseAdmin),
    });
  });

  // Everything below requires workspace auth
  router.use(requireWorkspaceAuth);

  // --------------------------------------------------
  // GET /api/workspace-intercom/sources
  // List Intercom sources configured for this workspace
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
  // Return the active source for this workspace
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
  // Load a specific Intercom source belonging to this workspace
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
  // Shortcut to active source responses
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
  // GET /api/workspace-intercom/sources/active/responses
  // Active source responses
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
  // Specific source responses
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

async function buildWorkspaceIntercomResponsesPayload({ source, query }) {
  const contentId = String(source?.survey_content_id || "").trim();
  const bucket = String(query?.bucket || "all").trim().toLowerCase();
  const q = String(query?.q || "").trim().toLowerCase();
  const limit = clampInt(query?.limit, 200, 1, 5000);

  if (!contentId) {
    throw new Error("Active source is missing survey_content_id");
  }

  const canonicalRows = await getCanonicalResponses();

  let rows = (canonicalRows || [])
    .filter((row) => String(row?.content_id || "").trim() === contentId)
    .map((row) => toWorkspaceIntercomResponseRow(row, source))
    .filter((row) => {
      if (bucket === "all") return true;
      return row.bucket === bucket;
    });

  if (q) {
    rows = rows.filter((row) => {
      const haystack = [
        row.response_id,
        row.comment,
        row.contact_label,
        ...(Array.isArray(row.selected_options_json)
          ? row.selected_options_json
          : []),
      ]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");

      return haystack.includes(q);
    });
  }

  rows.sort((a, b) =>
    String(b?.submitted_at || "").localeCompare(String(a?.submitted_at || ""))
  );

  const limitedRows = rows.slice(0, limit);
  const summary = summariseWorkspaceIntercomRows(rows);

  return {
    content_id: contentId,
    bucket,
    q,
    returned: limitedRows.length,
    total_matching: rows.length,
    summary,
    rows: limitedRows,
  };
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

function toWorkspaceIntercomResponseRow(row, source) {
  const numericScore =
    typeof row?.score_0_10 === "number" ? row.score_0_10 : Number(row?.score_0_10);

  const score = Number.isFinite(numericScore) ? numericScore : null;
  const bucket = scoreBucket(score);
  const sourceAppId = String(source?.intercom_app_id || "").trim();
  const contactId = String(row?.contact_id || "").trim();

  const intercomContactUrl =
    sourceAppId && contactId
      ? `https://app.intercom.com/a/apps/${sourceAppId}/users/${contactId}`
      : null;

  return {
    response_id: row?.response_id || null,
    source: "workspace_intercom",
    submitted_at: row?.submitted_at || null,
    score,
    bucket,
    comment: redactFreeText(row?.comment, 500),
    customer_name: null,
    customer_email: null,
    contact_label: formatRedactedContactLabel(contactId),
    intercom_contact_url: intercomContactUrl,
    selected_options_json: Array.isArray(row?.selected_options)
      ? row.selected_options
      : [],
    extra_scores_json: {},
    source_meta: {
      source_id: source?.id || null,
      source_name: source?.source_name || "",
      source_slug: source?.source_slug || "",
      content_id: source?.survey_content_id || null,
    },
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
