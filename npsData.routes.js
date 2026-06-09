// npsData.routes.js
import express from "express";
import { supabaseAdmin } from "./supabaseClient.js";

import { logWorkspaceEvent } from "./utils/workspaceEvents.js";
import { ensureOpenAI } from "./openaiClient.js";

/**
 * NPS Data routes
 *
 * Purpose:
 * Persist imported NPS datasets from CSV/JSON uploads.
 *
 * Workspace-aware foundation:
 * - Uses req.auth.workspaceId from the workspace JWT auth middleware
 * - DEFAULT_WORKSPACE_ID is now only used for /ping/debug fallback checks
 *
 * Kept separate from:
 * - csvNps.routes.js, which parses/normalises pasted data
 * - intercom.routes.js
 * - envola.routes.js
 */

const DEFAULT_WORKSPACE_ID = process.env.DEFAULT_WORKSPACE_ID || "";



export function createNpsDataRouter({ openai } = {}) {
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
  router.get("/workspace", async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({
          ok: false,
          error: "Supabase is not configured",
        });
      }

      const workspaceId = getRequestWorkspaceId(req);

      const { data, error } = await supabaseAdmin
        .from("workspaces")
        .select("*")
        .eq("id", workspaceId)
        .single();

      if (error) {
        console.error("[nps-data] Failed to load workspace", {
          workspaceId,
          error,
        });

        return res.status(404).json({
          ok: false,
          error: "Workspace not found",
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

      const workspaceId = getRequestWorkspaceId(req);
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
      await logWorkspaceEvent(req, {
        eventType: "dataset_created",
        entityType: "dataset",
        entityId: dataset.id,
        metadata: {
          datasetName: dataset.dataset_name,
          sourceType: dataset.source_type,
          rowCount: rowPayload.length,
          validRowCount: dataset.valid_row_count,
        },
      });

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
  router.get("/datasets", async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({
          ok: false,
          error: "Supabase is not configured",
        });
      }

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
  // POST /api/nps-data/datasets/:datasetId/insights
  // Generate AI insights for a saved workspace-owned dataset
  // --------------------------------------------------
  router.post("/datasets/:datasetId/insights", async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({
          ok: false,
          error: "Supabase is not configured",
        });
      }

      const aiClient = openai || ensureOpenAI();

      const workspaceId = getRequestWorkspaceId(req);
      const datasetId = String(req.params.datasetId || "").trim();

      if (!isUuid(datasetId)) {
        return res.status(400).json({
          ok: false,
          error: "Valid datasetId is required",
        });
      }

      // 1) Confirm this dataset belongs to the current workspace.
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

      // 2) Load rows.
      const { data: rows, error: rowsError } = await supabaseAdmin
        .from("dataset_rows")
        .select(
          [
            "id",
            "submitted_at",
            "score",
            "bucket",
            "stage",
            "comment",
            "selected_options_json",
            "extra_scores_json",
            "raw_json",
          ].join(",")
        )
        .eq("dataset_id", datasetId)
        .order("submitted_at", { ascending: false, nullsFirst: false })
        .limit(500);

      if (rowsError) {
        console.error("[nps-data] Failed to load rows for insights", rowsError);

        return res.status(500).json({
          ok: false,
          error: rowsError.message,
        });
      }

      const usableRows = (rows || [])
        .filter((row) => Number.isFinite(Number(row.score)))
        .slice(0, 120)
        .map((row, index) => {
          const raw = row.raw_json || {};
          const extra = row.extra_scores_json || {};

          return {
            row_ref: index + 1,
            date: row.submitted_at
              ? String(row.submitted_at).slice(0, 10)
              : null,
            score: Number(row.score),
            bucket: row.bucket || "",
            stage: cleanForAi(row.stage, 80),
            comment: cleanForAi(row.comment, 350),

            recommend_comment: cleanForAi(
              raw.q_recommend_comment || extra.q_recommend_comment,
              350
            ),
            install_comment: cleanForAi(
              raw.q_install_comment || extra.q_install_comment,
              250
            ),
            daily_use_comment: cleanForAi(
              raw.q_daily_use_comment || extra.q_daily_use_comment,
              250
            ),
            parent_relation_comment: cleanForAi(
              raw.q_parent_relation_comment || extra.q_parent_relation_comment,
              250
            ),
            final_comment: cleanForAi(
              raw.q_final_comment || extra.q_final_comment,
              250
            ),

            benefits: Array.isArray(row.selected_options_json)
              ? row.selected_options_json.slice(0, 8)
              : [],
          };
        });

      if (usableRows.length === 0) {
        return res.status(400).json({
          ok: false,
          error: "This dataset does not contain enough usable NPS rows",
        });
      }

      const summary = dataset.summary_json || {};

      const compactPayload = {
        dataset: {
          id: dataset.id,
          name: dataset.dataset_name,
          source_type: dataset.source_type,
          created_at: dataset.created_at,
          summary,
        },
        rows: usableRows,
      };

      const prompt = `
You are a senior CX and NPS analyst.

You will receive a saved NPS feedback dataset containing scores, buckets, comments, stages and selected options.

Return ONLY valid JSON. Do not use markdown. Do not wrap the JSON in code fences.

Use this exact schema:
{
  "executive_summary": "string",
  "nps_readout": {
    "score": number | null,
    "interpretation": "string"
  },
  "key_themes": [
    {
      "theme": "string",
      "sentiment": "positive|negative|mixed|neutral",
      "evidence_count": number,
      "example_quotes": ["string"]
    }
  ],
  "cx_risks": [
    {
      "risk": "string",
      "severity": "high|medium|low",
      "why_it_matters": "string",
      "who_to_review": "string"
    }
  ],
  "recommended_actions": [
    {
      "action": "string",
      "why": "string",
      "impact": "high|medium|low",
      "effort": "high|medium|low"
    }
  ]
}

Rules:
- Be practical and commercially useful.
- Do not invent evidence.
- If comments are sparse, say so.
- Example quotes must be short excerpts from comments, max 15 words each.
- Recommended actions should be specific enough that a founder, CX lead or ops manager could act on them.
- Close-the-loop templates should be warm, concise and human.
- Do not refer to customers by name, email, contact ID, or any direct personal identifier.
- Refer to respondents generically, such as "a detractor", "a passive respondent", or "several promoters".
`.trim();

      const aiResponse = await aiClient.responses.create({
        model: "gpt-4o-mini",
        max_output_tokens: 650,
        input: [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "user",
            content: JSON.stringify(compactPayload),
          },
        ],
      });

      let text = String(aiResponse.output_text || "").trim();

      if (text.startsWith("```")) {
        text = text.replace(/```json|```/gi, "").trim();
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        text = jsonMatch[0];
      }

      let insights;

      try {
        insights = JSON.parse(text);
      } catch (parseError) {
        console.error("[nps-data] Failed to parse AI insights JSON", {
          parseError,
          raw: text,
        });

        return res.status(500).json({
          ok: false,
          error: "AI insights could not be parsed",
          raw: text,
        });
      }

      await logWorkspaceEvent(req, {
        eventType: "ai_insights_generated",
        entityType: "dataset",
        entityId: datasetId,
        metadata: {
          datasetName: dataset.dataset_name,
          rowCount: usableRows.length,
          model: "gpt-4o-mini",
        },
      });

      return res.json({
        ok: true,
        datasetId,
        workspaceId,
        generatedAt: new Date().toISOString(),
        insights,
      });
    } catch (err) {
      console.error("[nps-data] Error in POST /datasets/:datasetId/insights", err);

      return res.status(500).json({
        ok: false,
        error: err.message || "Failed to generate dataset insights",
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

      const workspaceId = getRequestWorkspaceId(req);
      const datasetId = String(req.params.datasetId || "").trim();

      const role = req.auth?.role;

      if (!canDeleteDatasets(role)) {
        return res.status(403).json({
          ok: false,
          error: "You do not have permission to delete datasets",
        });
      }

      if (!isUuid(datasetId)) {
        return res.status(400).json({
          ok: false,
          error: "Valid datasetId is required",
        });
      }

      // Important: check workspace ownership before deleting.
      const { data: dataset, error: findError } = await supabaseAdmin
        .from("datasets")
        .select("id,dataset_name")
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

      await logWorkspaceEvent(req, {
        eventType: "dataset_deleted",
        entityType: "dataset",
        entityId: datasetId,
        metadata: {
          datasetName: dataset?.dataset_name || null,
        },
      });

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
  // POST /api/nps-data/rows/:datasetRowId/reply-draft
  // Generate a suggested Intercom reply draft for one saved response row
  // --------------------------------------------------
  router.post("/rows/:datasetRowId/reply-draft", async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({
          ok: false,
          error: "Supabase is not configured",
        });
      }

      if (!workspaceHasFeature(req, "ai_reply_drafts")) {
        return res.status(403).json({
          ok: false,
          error: "AI reply drafts are not enabled for this workspace",
        });
      }

      const aiClient = openai || ensureOpenAI();

      const workspaceId = getRequestWorkspaceId(req);
      const datasetRowId = String(req.params.datasetRowId || "").trim();

      if (!isUuid(datasetRowId)) {
        return res.status(400).json({
          ok: false,
          error: "Valid datasetRowId is required",
        });
      }

      const language = String(req.body?.language || "fr").trim().toLowerCase();
      const tone = String(req.body?.tone || "warm_professional").trim();
      const channel = String(req.body?.channel || "intercom").trim();

      const { data: row, error } = await supabaseAdmin
        .from("dataset_rows")
        .select(
          `
          *,
          datasets!inner (
            id,
            workspace_id,
            dataset_name,
            source_type,
            content_id
          )
        `
        )
        .eq("id", datasetRowId)
        .eq("datasets.workspace_id", workspaceId)
        .maybeSingle();

      if (error) {
        console.error("[nps-data] Failed to load row for reply draft", error);

        return res.status(500).json({
          ok: false,
          error: error.message,
        });
      }

      if (!row) {
        return res.status(404).json({
          ok: false,
          error: "Dataset row not found",
        });
      }

      const prompt = buildReplyDraftPrompt({
        row,
        language,
        tone,
        channel,
      });

      const aiResponse = await aiClient.responses.create({
        model: "gpt-4o-mini",
        max_output_tokens: 500,
        input: [
          {
            role: "system",
            content: prompt.system,
          },
          {
            role: "user",
            content: JSON.stringify(prompt.user),
          },
        ],
      });

      let text = String(aiResponse.output_text || "").trim();

      if (text.startsWith("```")) {
        text = text.replace(/```json|```/gi, "").trim();
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        text = jsonMatch[0];
      }

      let parsed;

      try {
        parsed = JSON.parse(text);
      } catch (parseError) {
        console.error("[nps-data] Failed to parse reply draft JSON", {
          parseError,
          raw: text,
        });

        return res.status(500).json({
          ok: false,
          error: "Reply draft could not be parsed",
          raw: text,
        });
      }

      await logWorkspaceEvent(req, {
        eventType: "reply_draft_generated",
        entityType: "dataset_row",
        entityId: datasetRowId,
        metadata: {
          datasetId: row.dataset_id,
          score: row.score,
          bucket: row.bucket,
          model: "gpt-4o-mini",
          language,
          channel,
        },
      });

      return res.json({
        ok: true,
        datasetRowId,
        generatedAt: new Date().toISOString(),
        draft: {
          subject: parsed.subject || null,
          body: parsed.body || "",
        },
      });
    } catch (err) {
      console.error("[nps-data] Error in POST /rows/:datasetRowId/reply-draft", err);

      return res.status(500).json({
        ok: false,
        error: err.message || "Failed to generate reply draft",
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

      const workspaceId = getRequestWorkspaceId(req);
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

      await logWorkspaceEvent(req, {
        eventType: "close_loop_action_created",
        entityType: "close_loop_action",
        entityId: data.id,
        metadata: {
          datasetRowId,
          status: data.status,
          owner: data.owner || null,
        },
      });

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

      const workspaceId = getRequestWorkspaceId(req);
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

      await logWorkspaceEvent(req, {
        eventType: "close_loop_action_updated",
        entityType: "close_loop_action",
        entityId: actionId,
        metadata: {
          status: data.status,
          owner: data.owner || null,
        },
      });


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

function getRequestWorkspaceId(req) {
  const workspaceId = req.auth?.workspaceId;

  if (!workspaceId) {
    throw new Error("Workspace authentication required");
  }

  return workspaceId;
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

function cleanForAi(value, maxLength = 300) {
  if (!value) return "";

  return String(value)
    .replace(/\s+/g, " ")
    .replace(/(.{80,}?)\1+/g, "$1")
    .trim()
    .slice(0, maxLength);
}

function buildReplyDraftPrompt({ row, language, tone, channel }) {
  const score = Number(row.score);
  const bucket = row.bucket || scoreBucket(score);

  const raw = row.raw_json || {};
  const extraScores = row.extra_scores_json || {};
  const selectedOptions = Array.isArray(row.selected_options_json)
    ? row.selected_options_json
    : [];

  return {
    system: `
You are helping a French customer success team write a short reply to an NPS survey response.

Return ONLY valid JSON. Do not use markdown. Do not wrap the JSON in code fences.

Use this exact schema:
{
  "subject": string | null,
  "body": string
}

Rules:
- Write in ${language === "fr" ? "French" : "English"}.
- The message is for ${channel || "Intercom"}, so keep it concise, warm and human.
- Do not invent fixes, promises, compensation, timelines, discounts, or facts.
- Do not mention internal labels like "detractor", "passive", or "promoter".
- Acknowledge the customer's specific feedback.
- If the score is 0-6, be empathetic and ask for enough detail to help or investigate.
- If the score is 7-8, thank them and ask what would make the experience better.
- If the score is 9-10, thank them warmly and reinforce what is working.
- Do not include personal data, real email addresses, contact IDs, or internal identifiers.
- Avoid sounding robotic or over-formal.
- Use "nous" rather than "je" unless the source text clearly suggests a personal reply.
- Keep the body under 160 words.
- The body should be ready to copy into Intercom, but the human user will review it before sending.
`.trim(),
    user: {
      channel,
      tone,
      score: Number.isFinite(score) ? score : null,
      bucket,
      submitted_at: row.submitted_at || null,
      comment: cleanForAi(row.comment, 500),
      selected_options: selectedOptions.slice(0, 10),
      survey_details: {
        recommend_score:
          raw.q_recommend_score ?? extraScores.q_recommend_score ?? null,
        recommend_comment: cleanForAi(
          raw.q_recommend_comment ??
            extraScores.q_recommend_comment ??
            row.comment ??
            "",
          500
        ),
        install_score:
          raw.q_install_score ?? extraScores.q_install_score ?? null,
        install_comment: cleanForAi(
          raw.q_install_comment ?? extraScores.q_install_comment ?? "",
          300
        ),
        daily_use_score:
          raw.q_daily_use_score ?? extraScores.q_daily_use_score ?? null,
        benefits:
          raw.q_benefits ?? extraScores.q_benefits ?? selectedOptions,
        parent_relation_score:
          raw.q_parent_relation_score ??
          extraScores.q_parent_relation_score ??
          null,
        parent_relation_comment: cleanForAi(
          raw.q_parent_relation_comment ??
            extraScores.q_parent_relation_comment ??
            "",
          300
        ),
        support_score:
          raw.q_support_score ?? extraScores.q_support_score ?? null,
        support_comment: cleanForAi(
          raw.q_support_comment ?? extraScores.q_support_comment ?? "",
          300
        ),
        final_comment: cleanForAi(
          raw.q_final_comment ?? extraScores.q_final_comment ?? "",
          500
        ),
      },
    },
  };
}

function scoreBucket(score) {
  if (!Number.isFinite(Number(score))) return "unknown";

  const n = Number(score);

  if (n >= 9) return "promoter";
  if (n >= 7) return "passive";
  return "detractor";
}

function workspaceHasFeature(_req, featureKey) {
  const pilotEnabledFeatures = new Set([
    "ai_reply_drafts",
    "ai_dataset_insights",
  ]);

  return pilotEnabledFeatures.has(featureKey);
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

function canDeleteDatasets(role) {
  return role === "owner" || role === "admin";
}

