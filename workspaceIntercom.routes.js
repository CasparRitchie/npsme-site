// workspaceIntercom.routes.js
import express from "express";
import { supabaseAdmin } from "./supabaseClient.js";
import { requireWorkspaceAuth } from "./utils/workspaceAuth.js";

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
        return res.status(500).json({
          ok: false,
          error: error.message,
        });
      }

      if (!data) {
        return res.status(404).json({
          ok: false,
          error: "No active Intercom source configured for this workspace",
        });
      }

      return res.json({
        ok: true,
        workspaceId,
        source: toWorkspaceIntercomSourceSummary(data),
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

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "").trim()
  );
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
