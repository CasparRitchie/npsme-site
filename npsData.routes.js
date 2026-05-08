// npsData.routes.js
import express from "express";
import { supabaseAdmin } from "./supabaseClient.js";

/**
 * NPS Data routes
 *
 * Purpose:
 * Persist imported NPS datasets from CSV/JSON uploads.
 *
 * Kept separate from:
 * - csvNps.routes.js, which parses/normalises pasted data
 * - intercom.routes.js
 * - envola.routes.js
 */

export function createNpsDataRouter() {
  const router = express.Router();

  // --------------------------------------------------
  // GET /api/nps-data/ping
  // --------------------------------------------------
  router.get("/ping", (_req, res) => {
    res.json({ ok: true, route: "nps-data" });
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
        error: "Failed to save dataset",
      });
    }
  });

  // --------------------------------------------------
  // GET /api/nps-data/datasets
  // List saved datasets
  // --------------------------------------------------
  router.get("/datasets", async (_req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({
          ok: false,
          error: "Supabase is not configured",
        });
      }

      const { data, error } = await supabaseAdmin
        .from("datasets")
        .select(
          [
            "id",
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
        datasets: data || [],
      });
    } catch (err) {
      console.error("[nps-data] Error in GET /datasets", err);
      return res.status(500).json({
        ok: false,
        error: "Failed to list datasets",
      });
    }
  });

  // --------------------------------------------------
  // GET /api/nps-data/datasets/:datasetId
  // Return one dataset + rows + close-loop actions
  // --------------------------------------------------
  router.get("/datasets/:datasetId", async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({
          ok: false,
          error: "Supabase is not configured",
        });
      }

      const datasetId = String(req.params.datasetId || "").trim();

      if (!datasetId) {
        return res.status(400).json({
          ok: false,
          error: "datasetId is required",
        });
      }

      const { data: dataset, error: datasetError } = await supabaseAdmin
        .from("datasets")
        .select("*")
        .eq("id", datasetId)
        .single();

      if (datasetError) {
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
        dataset,
        rows: rows || [],
      });
    } catch (err) {
      console.error("[nps-data] Error in GET /datasets/:datasetId", err);
      return res.status(500).json({
        ok: false,
        error: "Failed to load dataset",
      });
    }
  });

  // --------------------------------------------------
  // DELETE /api/nps-data/datasets/:datasetId
  // Deletes dataset and cascades dataset_rows/actions
  // --------------------------------------------------
  router.delete("/datasets/:datasetId", async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({
          ok: false,
          error: "Supabase is not configured",
        });
      }

      const datasetId = String(req.params.datasetId || "").trim();

      if (!datasetId) {
        return res.status(400).json({
          ok: false,
          error: "datasetId is required",
        });
      }

      const { error } = await supabaseAdmin
        .from("datasets")
        .delete()
        .eq("id", datasetId);

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
        error: "Failed to delete dataset",
      });
    }
  });

  return router;
}
