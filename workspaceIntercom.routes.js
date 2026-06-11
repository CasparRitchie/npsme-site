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
  // GET /api/workspace-intercom/performance
  //
  // Query options:
  // - days=365
  // - from=2026-01-01&to=2026-06-11
  // - granularity=day|week|month
  // --------------------------------------------------
  router.get("/performance", async (req, res) => {
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

      const payload = await buildWorkspaceIntercomPerformancePayload({
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
      console.error("[workspace-intercom] GET /performance error", err);

      return res.status(500).json({
        ok: false,
        error:
          err.message ||
          "Failed to load workspace Intercom performance",
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

      async function buildWorkspaceIntercomPerformancePayload({
        source,
        query,
      }) {
        const contentId = String(source?.survey_content_id || "").trim();

        if (!contentId) {
          throw new Error("Active source is missing survey_content_id");
        }

        const window = parsePerformanceWindow(query);

        const requestedGranularity = String(
          query?.granularity || ""
        )
          .trim()
          .toLowerCase();

        const granularity = ["day", "week", "month"].includes(
          requestedGranularity
        )
          ? requestedGranularity
          : choosePerformanceGranularity(window);

        const canonicalRows = await getCanonicalResponses();

        /*
        * Filter once here.
        *
        * Every chart and headline figure below must use this exact same
        * response population so that the numbers remain internally consistent.
        */
        const rows = (canonicalRows || [])
          .filter(
            (row) =>
              String(row?.content_id || "").trim() === contentId
          )
          .map((row) => ({
            ...row,
            _submitted_ms: Date.parse(row?.submitted_at || ""),
            _score: normaliseNpsScore(row?.score_0_10),
          }))
          .filter((row) => Number.isFinite(row._submitted_ms))
          .filter(
            (row) =>
              row._submitted_ms >= window.fromMs &&
              row._submitted_ms <= window.toMs
          )
          .sort((a, b) => b._submitted_ms - a._submitted_ms);

        const summary = buildPerformanceSummary(rows);

        const previousRows = (canonicalRows || [])
          .filter(
            (row) =>
              String(row?.content_id || "").trim() === contentId
          )
          .map((row) => ({
            ...row,
            _submitted_ms: Date.parse(row?.submitted_at || ""),
            _score: normaliseNpsScore(row?.score_0_10),
          }))
          .filter((row) => Number.isFinite(row._submitted_ms))
          .filter(
            (row) =>
              row._submitted_ms >= window.previousFromMs &&
              row._submitted_ms <= window.previousToMs
          );

        const previousSummary = buildPerformanceSummary(previousRows);

        return {
          content_id: contentId,

          period: {
            mode: window.mode,
            days: window.days,
            from: toYmdUtc(window.fromMs),
            to: toYmdUtc(window.toMs),
            granularity,

            previous_from: toYmdUtc(window.previousFromMs),
            previous_to: toYmdUtc(window.previousToMs),
          },

          summary,

          comparison: buildPerformanceComparison({
            current: summary,
            previous: previousSummary,
          }),

          timeseries: buildPerformanceTimeseries(
            rows,
            granularity,
            window
          ),

          score_distribution: buildPerformanceScoreDistribution(rows),

          question_scores: buildPerformanceQuestionScores(rows),

          benefits: buildPerformanceBenefits(rows),

          recent_detractors: buildRecentDetractors(rows, source, 8),

          data_quality: {
            canonical_rows_in_period: rows.length,
            valid_scored_responses: summary.validResponses,
            responses_without_valid_score:
              rows.length - summary.validResponses,
            responses_with_comments: rows.filter(
              (row) => getBestResponseComment(row)
            ).length,
            responses_with_benefits: rows.filter(
              (row) => getResponseBenefits(row).length > 0
            ).length,
          },
        };
      }

      function parsePerformanceWindow(query = {}) {
        const fromRaw = String(query?.from || "").trim();
        const toRaw = String(query?.to || "").trim();

        if (fromRaw || toRaw) {
          if (!fromRaw || !toRaw) {
            throw new Error(
              "Both from and to are required when using a custom date range"
            );
          }

          const fromMs = Date.parse(`${fromRaw}T00:00:00.000Z`);
          const toMs = Date.parse(`${toRaw}T23:59:59.999Z`);

          if (
            !Number.isFinite(fromMs) ||
            !Number.isFinite(toMs)
          ) {
            throw new Error(
              "Invalid date range. Use YYYY-MM-DD for from and to"
            );
          }

          if (fromMs > toMs) {
            throw new Error(
              "The from date must be before or equal to the to date"
            );
          }

          const durationMs = toMs - fromMs + 1;

          return {
            mode: "range",
            days: Math.max(
              1,
              Math.ceil(durationMs / (24 * 60 * 60 * 1000))
            ),
            fromMs,
            toMs,
            previousFromMs: fromMs - durationMs,
            previousToMs: fromMs - 1,
          };
        }

        const days = clampInt(query?.days, 365, 1, 3650);
        const toMs = Date.now();

        /*
        * Use days - 1 because the current calendar day is included.
        */
        const fromMs =
          startOfUtcDay(toMs) -
          (days - 1) * 24 * 60 * 60 * 1000;

        const durationMs = toMs - fromMs + 1;

        return {
          mode: "rolling",
          days,
          fromMs,
          toMs,
          previousFromMs: fromMs - durationMs,
          previousToMs: fromMs - 1,
        };
      }

      function choosePerformanceGranularity(window) {
        if (window.days <= 45) return "day";
        if (window.days <= 550) return "week";
        return "month";
      }

      function startOfUtcDay(ms) {
        const date = new Date(ms);

        return Date.UTC(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate()
        );
      }

      function toYmdUtc(ms) {
        const date = new Date(ms);

        const pad = (value) =>
          String(value).padStart(2, "0");

        return [
          date.getUTCFullYear(),
          pad(date.getUTCMonth() + 1),
          pad(date.getUTCDate()),
        ].join("-");
      }

      function buildPerformanceScoreDistribution(rows) {
        const counts = Array.from(
          { length: 11 },
          (_, score) => ({
            score,
            count: 0,
            percentage: 0,
            bucket: scoreBucket(score),
          })
        );

        let validResponses = 0;

        for (const row of rows || []) {
          const score = normaliseNpsScore(row?._score);

          if (score === null) continue;

          /*
          * Intercom NPS scores should be whole numbers.
          * Ignore non-integer values rather than silently moving them.
          */
          if (!Number.isInteger(score)) continue;

          counts[score].count += 1;
          validResponses += 1;
        }

        return counts.map((item) => ({
          ...item,
          percentage:
            validResponses > 0
              ? roundOneDecimal(
                  (item.count / validResponses) * 100
                )
              : 0,
        }));
      }

      function buildPerformanceQuestionScores(rows) {
        const byQuestion = new Map();

        for (const row of rows || []) {
          const answers = Array.isArray(row?.answers)
            ? row.answers
            : [];

          const seenInResponse = new Set();

          for (const answer of answers) {
            const score = normaliseNpsScore(answer?.response);

            if (score === null) continue;

            const questionId =
              answer?.question_id !== null &&
              answer?.question_id !== undefined
                ? String(answer.question_id)
                : "";

            const questionText = String(
              answer?.question_text || ""
            ).trim();

            if (!questionId && !questionText) continue;

            const key = questionId
              ? `id:${questionId}`
              : `text:${questionText}`;

            /*
            * Avoid counting the same question twice for one response.
            */
            if (seenInResponse.has(key)) continue;
            seenInResponse.add(key);

            const current =
              byQuestion.get(key) || {
                question_id: questionId || null,
                question:
                  questionText ||
                  `Question ${questionId}`,
                responses: 0,
                score_total: 0,
                promoters: 0,
                passives: 0,
                detractors: 0,
              };

            current.responses += 1;
            current.score_total += score;

            const bucket = scoreBucket(score);

            if (bucket === "promoter") current.promoters += 1;
            if (bucket === "passive") current.passives += 1;
            if (bucket === "detractor") current.detractors += 1;

            if (
              (!current.question ||
                current.question.startsWith("Question ")) &&
              questionText
            ) {
              current.question = questionText;
            }

            byQuestion.set(key, current);
          }
        }

        return Array.from(byQuestion.values())
          .map((item) => ({
            question_id: item.question_id,
            question: item.question,
            responses: item.responses,

            average_score:
              item.responses > 0
                ? roundOneDecimal(
                    item.score_total / item.responses
                  )
                : null,

            promoters: item.promoters,
            passives: item.passives,
            detractors: item.detractors,
          }))
          .sort((a, b) => {
            if (b.responses !== a.responses) {
              return b.responses - a.responses;
            }

            return String(a.question).localeCompare(
              String(b.question)
            );
          });
      }

      function buildPerformanceBenefits(rows) {
        const byBenefit = new Map();
        let responsesWithBenefits = 0;

        for (const row of rows || []) {
          const benefits = getResponseBenefits(row);

          if (benefits.length === 0) continue;

          responsesWithBenefits += 1;

          /*
          * Count a selected option only once per response.
          */
          for (const benefit of new Set(benefits)) {
            const current =
              byBenefit.get(benefit) || {
                benefit,
                mentions: 0,
                score_total: 0,
                scored_mentions: 0,
                promoter_mentions: 0,
                passive_mentions: 0,
                detractor_mentions: 0,
              };

            current.mentions += 1;

            const score = normaliseNpsScore(row?._score);

            if (score !== null) {
              current.score_total += score;
              current.scored_mentions += 1;

              const bucket = scoreBucket(score);

              if (bucket === "promoter") {
                current.promoter_mentions += 1;
              }

              if (bucket === "passive") {
                current.passive_mentions += 1;
              }

              if (bucket === "detractor") {
                current.detractor_mentions += 1;
              }
            }

            byBenefit.set(benefit, current);
          }
        }

        return Array.from(byBenefit.values())
          .map((item) => ({
            benefit: item.benefit,
            mentions: item.mentions,

            percentage_of_responses_with_benefits:
              responsesWithBenefits > 0
                ? roundOneDecimal(
                    (item.mentions /
                      responsesWithBenefits) *
                      100
                  )
                : null,

            average_score:
              item.scored_mentions > 0
                ? roundOneDecimal(
                    item.score_total /
                      item.scored_mentions
                  )
                : null,

            promoter_mentions: item.promoter_mentions,
            passive_mentions: item.passive_mentions,
            detractor_mentions:
              item.detractor_mentions,
          }))
          .sort((a, b) => {
            if (b.mentions !== a.mentions) {
              return b.mentions - a.mentions;
            }

            return String(a.benefit).localeCompare(
              String(b.benefit)
            );
          });
      }

      function buildRecentDetractors(
        rows,
        source,
        limit = 8
      ) {
        const appId = String(
          source?.intercom_app_id || ""
        ).trim();

        return (rows || [])
          .filter((row) => {
            const score = normaliseNpsScore(row?._score);
            return score !== null && score <= 6;
          })
          .sort(
            (a, b) =>
              Number(b?._submitted_ms || 0) -
              Number(a?._submitted_ms || 0)
          )
          .slice(0, limit)
          .map((row) => {
            const contactId = String(
              row?.contact_id || ""
            ).trim();

            return {
              response_id: row?.response_id || null,
              submitted_at: row?.submitted_at || null,
              score: normaliseNpsScore(row?._score),
              bucket: "detractor",

              contact_label:
                formatRedactedContactLabel(contactId),

              comment: redactFreeText(
                getBestResponseComment(row),
                400
              ),

              intercom_contact_url:
                appId && contactId
                  ? `https://app.intercom.com/a/apps/${appId}/users/${contactId}`
                  : null,
            };
          });
      }

      function getBestResponseComment(row) {
        const verbatims = Array.isArray(row?.verbatims)
          ? row.verbatims
          : [];

        const verbatimTexts = verbatims
          .map((item) =>
            String(item?.text || "").trim()
          )
          .filter(Boolean)
          .sort((a, b) => b.length - a.length);

        if (verbatimTexts.length > 0) {
          return verbatimTexts[0];
        }

        return String(row?.comment || "").trim();
      }

      function getResponseBenefits(row) {
        const answers = Array.isArray(row?.answers)
          ? row.answers
          : [];

        const answerBenefits = allAnswersByQuestionId(
          answers,
          612570
        ).flatMap(splitSelectedOptions);

        const storedBenefits = Array.isArray(
          row?.selected_options
        )
          ? row.selected_options.flatMap(splitSelectedOptions)
          : [];

        return uniqueStrings([
          ...storedBenefits,
          ...answerBenefits,
        ])
          .map((value) => value.trim())
          .filter(Boolean);
      }

      function splitSelectedOptions(value) {
        if (Array.isArray(value)) {
          return value.flatMap(splitSelectedOptions);
        }

        return String(value || "")
          .split(/[;,|]/)
          .map((item) => item.trim())
          .filter(Boolean);
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
      score: normaliseNpsScore(row.score),
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
      const intercomCompletedAt = row.first_completion || null;

      const isIntercomCompleted = Boolean(intercomCompletedAt);

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
        ? matchedResponse?.submitted_at || intercomCompletedAt
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
        completed_at: intercomCompletedAt,
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

  const validResponsesWithoutCompletionEvent = allRows.filter(
    (row) =>
      row.has_valid_nps_response &&
      !row.intercom_completed
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
    valid_responses_without_completion_event:
      validResponsesWithoutCompletionEvent,
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

          valid_responses_without_completion_event_rows:
            validResponsesWithoutCompletionEvent,

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
    refresh: refreshInfo,
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

  const scoredRows = safeRows.filter(
    (row) => normaliseNpsScore(row?.score) !== null
  );

  const total = safeRows.length;
  const validResponses = scoredRows.length;

  const promoters = scoredRows.filter(
    (row) => scoreBucket(normaliseNpsScore(row.score)) === "promoter"
  ).length;

  const passives = scoredRows.filter(
    (row) => scoreBucket(normaliseNpsScore(row.score)) === "passive"
  ).length;

  const detractors = scoredRows.filter(
    (row) => scoreBucket(normaliseNpsScore(row.score)) === "detractor"
  ).length;

  const scores = scoredRows.map((row) =>
    normaliseNpsScore(row.score)
  );

  const averageScore = scores.length
    ? Math.round(
        (scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10
      ) / 10
    : null;

  const nps =
    validResponses > 0
      ? Math.round(
          ((promoters - detractors) / validResponses) * 100
        )
      : null;

  return {
    total,
    validResponses,
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
