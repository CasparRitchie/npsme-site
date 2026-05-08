// npsData.routes.js
import express from "express";
import { supabaseAdmin } from "./supabaseClient.js";

/**
 * NPS Data routes
 *
 * Purpose:
 * Persist imported NPS datasets from CSV/JSON uploads.
 *
 * Workspace-aware foundation:
 * - For now, uses DEFAULT_WORKSPACE_ID from env
 * - Later, this can be replaced with req.user.workspace_id / memberships
 *
 * Kept separate from:
 * - csvNps.routes.js, which parses/normalises pasted data
 * - intercom.routes.js
 * - envola.routes.js
 */

const DEFAULT_WORKSPACE_ID = process.env.DEFAULT_WORKSPACE_ID || "";

export function createNpsDataRouter() {
  const router = express.Router();

  // --------------------------------------------------
  // GET /api/nps-data/ping
  // --------------------------------------------------
  router.get("/ping", (_req, res) => {
    res.json({
      ok: true,
      route: "nps-data",
      workspaceConfigured: Boolean(DEFAULT_WORKSPACE_ID),
    });
  });

  // --------------------------------------------------
  // GET /api/nps-data/workspace
  // Small debug/helper endpoint while developing
  // --------------------------------------------------
  router.get("/workspace", async (_req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({
          ok: false,
          error: "Supabase is not configured",
        });
      }

      const workspaceId = getWorkspaceId();

      const { data, error } = await supabaseAdmin
        .from("workspaces")
        .select("*")
        .eq("id", workspaceId)
        .single();

      if (error) {
        console.error("[nps-data] Failed to load default workspace", {
          workspaceId,
          error,
        });

        return res.status(404).json({
          ok: false,
          error: "Default workspace not found",
          workspaceId,
          supabaseError: error.message,
          supabaseCode: error.code,
          supabaseDetails: error.details,
        });
      }

      return res.json({
        ok: true,
        workspace: data,
      });
    } catch (err) {
      return res.status(500).json({
        ok: false,
        error: err.message || "Failed to load workspace",
      });
    }
  });

  // --------------------------------------------------
  // POST /api/nps-data/datasets
  //
  // Expected body:
  // {
  //   "datasetName": "May 2026 NPS import",
  //   "parsedDataset": {
  //     inputType,
  //     content_id,
  //     rawRowCount,
  //     validRowCount,
  //     skippedRowCount,
  //     summary,
  //     detectedFields,
  //     warnings,
  //     skippedRows,
  //     rows
  //   }
  // }
  // --------------------------------------------------
  router.post("/datasets", async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({
          ok: false,
          error: "Supabase is not configured",
        });
      }

      const workspaceId = getWorkspaceId();

      const datasetName = String(req.body?.datasetName || "").trim();
      const parsedDataset = req.body?.parsedDataset;

      if (!datasetName) {
        return res.status(400).json({
          ok: false,
          error: "datasetName is required",
        });
      }

      if (!parsedDataset || !Array.isArray(parsedDataset.rows)) {
        return res.status(400).json({
          ok: false,
          error: "parsedDataset.rows is required",
        });
      }

      const rows = parsedDataset.rows;

      // 1) Insert parent dataset record
      const { data: dataset, error: datasetError } = await supabaseAdmin
        .from("datasets")
        .insert({
          workspace_id: workspaceId,
          dataset_name: datasetName,
          source_type: parsedDataset.inputType || parsedDataset.sourceType || "unknown",
          content_id: parsedDataset.content_id || null,
          raw_row_count: Number(parsedDataset.rawRowCount || rows.length || 0),
          valid_row_count: Number(parsedDataset.validRowCount || rows.length || 0),
          skipped_row_count: Number(parsedDataset.skippedRowCount || 0),
          summary_json: parsedDataset.summary || {},
          detected_fields_json: parsedDataset.detectedFields || {},
          warnings_json: parsedDataset.warnings || [],
          skipped_rows_json: parsedDataset.skippedRows || [],
        })
        .select("*")
        .single();

      if (datasetError) {
        console.error("[nps-data] Failed to insert dataset", datasetError);
        return res.status(500).json({
          ok: false,
          error: datasetError.message,
        });
      }

      // 2) Insert normalised response rows
      const rowPayload = rows.map((row) => ({
        dataset_id: dataset.id,
        response_id: row.response_id || null,
        source: row.source || parsedDataset.inputType || "unknown",
        row_number: Number.isFinite(Number(row.row_number))
          ? Number(row.row_number)
          : null,
        submitted_at: row.submitted_at || null,
        score: Number.isFinite(Number(row.score)) ? Number(row.score) : null,
        bucket: row.bucket || null,
        customer_name: row.customer_name || null,
        customer_email: row.customer_email || null,
        company: row.company || null,
        stage: row.stage || null,
        comment: row.comment || null,
        contact_id: row.contact_id || null,
        intercom_contact_url: row.intercom_contact_url || null,
        selected_options_json: Array.isArray(row.selected_options)
          ? row.selected_options
          : [],
        extra_scores_json: row.extra_scores || {},
        raw_json: row.raw || {},
      }));

      if (rowPayload.length > 0) {
        const { error: rowsError } = await supabaseAdmin
          .from("dataset_rows")
          .insert(rowPayload);

        if (rowsError) {
          console.error("[nps-data] Failed to insert dataset rows", rowsError);

          // Try to clean up parent dataset if row insert fails
          await supabaseAdmin.from("datasets").delete().eq("id", dataset.id);

          return res.status(500).json({
            ok: false,
            error: rowsError.message,
          });
        }
      }

      return res.status(201).json({
        ok: true,
        dataset,
        rowCount: rowPayload.length,
      });
    } catch (err) {
      console.error("[nps-data] Error in POST /datasets", err);
      return res.status(500).json({
        ok: false,
        error: err.message || "Failed to save dataset",
      });
    }
  });

  // --------------------------------------------------
  // GET /api/nps-data/datasets
  // List saved datasets for current workspace
  // --------------------------------------------------
  router.get("/datasets", async (_req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({
          ok: false,
          error: "Supabase is not configured",
        });
      }

      const workspaceId = getWorkspaceId();

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
        console.error("[nps-data] Failed to list datasets", error);
        return res.status(500).json({
          ok: false,
          error: error.message,
        });
      }

      return res.json({
        ok: true,
        workspaceId,
        datasets: data || [],
      });
    } catch (err) {
      console.error("[nps-data] Error in GET /datasets", err);
      return res.status(500).json({
        ok: false,
        error: err.message || "Failed to list datasets",
      });
    }
  });

  // --------------------------------------------------
  // GET /api/nps-data/datasets/:datasetId
  // Return one workspace-owned dataset + rows + close-loop actions
  // --------------------------------------------------
  router.get("/datasets/:datasetId", async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({
          ok: false,
          error: "Supabase is not configured",
        });
      }

      const workspaceId = getWorkspaceId();
      const datasetId = String(req.params.datasetId || "").trim();

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
        .eq("dataset_id", datasetId)
        .order("submitted_at", { ascending: false, nullsFirst: false });

      if (rowsError) {
        console.error("[nps-data] Failed to load dataset rows", rowsError);
        return res.status(500).json({
          ok: false,
          error: rowsError.message,
        });
      }

      return res.json({
        ok: true,
        workspaceId,
        dataset,
        rows: rows || [],
      });
    } catch (err) {
      console.error("[nps-data] Error in GET /datasets/:datasetId", err);
      return res.status(500).json({
        ok: false,
        error: err.message || "Failed to load dataset",
      });
    }
  });

  // --------------------------------------------------
  // DELETE /api/nps-data/datasets/:datasetId
  // Deletes workspace-owned dataset and cascades dataset_rows/actions
  // --------------------------------------------------
  router.delete("/datasets/:datasetId", async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({
          ok: false,
          error: "Supabase is not configured",
        });
      }

      const workspaceId = getWorkspaceId();
      const datasetId = String(req.params.datasetId || "").trim();

      if (!isUuid(datasetId)) {
        return res.status(400).json({
          ok: false,
          error: "Valid datasetId is required",
        });
      }

      // Important: check workspace ownership before deleting.
      const { data: dataset, error: findError } = await supabaseAdmin
        .from("datasets")
        .select("id")
        .eq("id", datasetId)
        .eq("workspace_id", workspaceId)
        .single();

      if (findError || !dataset) {
        return res.status(404).json({
          ok: false,
          error: "Dataset not found",
        });
      }

      const { error } = await supabaseAdmin
        .from("datasets")
        .delete()
        .eq("id", datasetId)
        .eq("workspace_id", workspaceId);

      if (error) {
        console.error("[nps-data] Failed to delete dataset", error);
        return res.status(500).json({
          ok: false,
          error: error.message,
        });
      }

      return res.json({
        ok: true,
        deletedDatasetId: datasetId,
      });
    } catch (err) {
      console.error("[nps-data] Error in DELETE /datasets/:datasetId", err);
      return res.status(500).json({
        ok: false,
        error: err.message || "Failed to delete dataset",
      });
    }
  });

  // --------------------------------------------------
  // POST /api/nps-data/rows/:datasetRowId/actions
  // Create a close-loop action for a dataset row
  //
  // Expected body:
  // {
  //   "status": "open" | "in_progress" | "closed",
  //   "owner": "Caspar",
  //   "actionTaken": "Called customer..."
  // }
  // --------------------------------------------------
  router.post("/rows/:datasetRowId/actions", async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({
          ok: false,
          error: "Supabase is not configured",
        });
      }

      const workspaceId = getWorkspaceId();
      const datasetRowId = String(req.params.datasetRowId || "").trim();

      if (!isUuid(datasetRowId)) {
        return res.status(400).json({
          ok: false,
          error: "Valid datasetRowId is required",
        });
      }

      const row = await findWorkspaceDatasetRow(datasetRowId, workspaceId);

      if (!row) {
        return res.status(404).json({
          ok: false,
          error: "Dataset row not found",
        });
      }

      const status = normaliseActionStatus(req.body?.status);
      const owner = String(req.body?.owner || "").trim();
      const actionTaken = String(req.body?.actionTaken || "").trim();

      const { data, error } = await supabaseAdmin
        .from("close_loop_actions")
        .insert({
          dataset_row_id: datasetRowId,
          status,
          owner,
          action_taken: actionTaken,
          updated_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (error) {
        console.error("[nps-data] Failed to create close-loop action", error);
        return res.status(500).json({
          ok: false,
          error: error.message,
        });
      }

      return res.status(201).json({
        ok: true,
        action: data,
      });
    } catch (err) {
      console.error("[nps-data] Error in POST /rows/:datasetRowId/actions", err);
      return res.status(500).json({
        ok: false,
        error: err.message || "Failed to create close-loop action",
      });
    }
  });

  // --------------------------------------------------
  // PATCH /api/nps-data/actions/:actionId
  // Update an existing close-loop action
  // --------------------------------------------------
  router.patch("/actions/:actionId", async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({
          ok: false,
          error: "Supabase is not configured",
        });
      }

      const workspaceId = getWorkspaceId();
      const actionId = String(req.params.actionId || "").trim();

      if (!isUuid(actionId)) {
        return res.status(400).json({
          ok: false,
          error: "Valid actionId is required",
        });
      }

      const existingAction = await findWorkspaceAction(actionId, workspaceId);

      if (!existingAction) {
        return res.status(404).json({
          ok: false,
          error: "Close-loop action not found",
        });
      }

      const patch = {
        updated_at: new Date().toISOString(),
      };

      if (req.body?.status !== undefined) {
        patch.status = normaliseActionStatus(req.body.status);
      }

      if (req.body?.owner !== undefined) {
        patch.owner = String(req.body.owner || "").trim();
      }

      if (req.body?.actionTaken !== undefined) {
        patch.action_taken = String(req.body.actionTaken || "").trim();
      }

      const { data, error } = await supabaseAdmin
        .from("close_loop_actions")
        .update(patch)
        .eq("id", actionId)
        .select("*")
        .single();

      if (error) {
        console.error("[nps-data] Failed to update close-loop action", error);
        return res.status(500).json({
          ok: false,
          error: error.message,
        });
      }

      return res.json({
        ok: true,
        action: data,
      });
    } catch (err) {
      console.error("[nps-data] Error in PATCH /actions/:actionId", err);
      return res.status(500).json({
        ok: false,
        error: err.message || "Failed to update close-loop action",
      });
    }
  });

  return router;
}

function getWorkspaceId() {
  if (!DEFAULT_WORKSPACE_ID) {
    throw new Error(
      "DEFAULT_WORKSPACE_ID is not configured. Add it to .env and Heroku Config Vars."
    );
  }

  return DEFAULT_WORKSPACE_ID;
}

async function findWorkspaceDatasetRow(datasetRowId, workspaceId) {
  const { data, error } = await supabaseAdmin
    .from("dataset_rows")
    .select(
      `
      id,
      dataset_id,
      datasets!inner (
        id,
        workspace_id
      )
    `
    )
    .eq("id", datasetRowId)
    .eq("datasets.workspace_id", workspaceId)
    .single();

  if (error || !data) return null;

  return data;
}

async function findWorkspaceAction(actionId, workspaceId) {
  const { data, error } = await supabaseAdmin
    .from("close_loop_actions")
    .select(
      `
      id,
      dataset_row_id,
      dataset_rows!inner (
        id,
        dataset_id,
        datasets!inner (
          id,
          workspace_id
        )
      )
    `
    )
    .eq("id", actionId)
    .eq("dataset_rows.datasets.workspace_id", workspaceId)
    .single();

  if (error || !data) return null;

  return data;
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "").trim()
  );
}

function normaliseActionStatus(value) {
  const status = String(value || "open").trim();

  if (status === "in_progress") return "in_progress";
  if (status === "closed") return "closed";
  return "open";
}
