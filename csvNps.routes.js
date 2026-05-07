// csvNps.routes.js
import express from "express";

/**
 * Create CSV NPS router.
 *
 * This router is intentionally generic and separate from:
 * - Intercom routes
 * - Envola-specific routes
 *
 * Goal:
 * Allow a customer to paste CSV survey response data and convert it into
 * a normalised NPS dataset that can later power the same style of charts
 * used in the Envola dashboard.
 */
export function createCsvNpsRouter() {
  const router = express.Router();
  function looksLikeJsonInput(text) {
  const value = String(text || "").trim();
  return value.startsWith("{") || value.startsWith("[");
}

function safeParseJsonInput(text) {
  try {
    return JSON.parse(String(text || "").trim());
  } catch (_err) {
    return null;
  }
}

function getJsonRows(payload) {
  if (Array.isArray(payload)) return payload;

  if (payload && Array.isArray(payload.rows)) return payload.rows;

  if (payload && payload.data && Array.isArray(payload.data.rows)) {
    return payload.data.rows;
  }

  if (payload && Array.isArray(payload.responses)) return payload.responses;

  return null;
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const str = String(value).trim();
    if (str !== "" && str.toLowerCase() !== "null") return value;
  }
  return "";
}

function toNpsScore(value) {
  if (value === null || value === undefined || value === "") return null;

  const score = Number(value);

  if (!Number.isFinite(score)) return null;
  if (score < 0 || score > 10) return null;

  return score;
}

function bucketFromScore(score) {
  if (!Number.isFinite(score)) return "unknown";
  if (score >= 9) return "promoter";
  if (score >= 7) return "passive";
  return "detractor";
}

function normaliseDate(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
}

function normaliseSelectedOptions(value) {
  if (Array.isArray(value)) return value.filter(Boolean);

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[;,|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function buildBestComment(row) {
  const parts = [];

  const recommendComment = firstNonEmpty(
    row.q_recommend_comment,
    row.recommend_comment,
    row.comment,
    row.feedback,
    row.response_comment
  );

  const installComment = firstNonEmpty(row.q_install_comment);
  const parentRelationComment = firstNonEmpty(row.q_parent_relation_comment);
  const finalComment = firstNonEmpty(row.q_final_comment);

  if (recommendComment) parts.push(String(recommendComment).trim());
  if (installComment) parts.push(`Installation: ${String(installComment).trim()}`);
  if (parentRelationComment) {
    parts.push(`Parent relationship: ${String(parentRelationComment).trim()}`);
  }
  if (finalComment) parts.push(`Final comment: ${String(finalComment).trim()}`);

  return parts.join("\n\n");
}

function normaliseJsonRows(payload) {
  const sourceRows = getJsonRows(payload);

  if (!sourceRows) {
    return {
      ok: false,
      error:
        "JSON was detected, but no rows array was found. Expected { rows: [...] } or an array of response objects.",
    };
  }

  const rows = [];
  const skippedRows = [];
  const warnings = [];

  sourceRows.forEach((row, index) => {
    const score = toNpsScore(
      firstNonEmpty(
        row.nps_score,
        row.score,
        row.q_recommend_score,
        row.recommend_score,
        row.rating
      )
    );

    if (score === null) {
      skippedRows.push({
        row_number: index + 1,
        reason: "Invalid or missing NPS score",
        rawScore: firstNonEmpty(
          row.nps_score,
          row.score,
          row.q_recommend_score,
          row.recommend_score,
          row.rating
        ),
        raw: row,
      });
      return;
    }

    const submittedAt = normaliseDate(
      firstNonEmpty(
        row.submitted_at,
        row.createdAt,
        row.created_at,
        row.date,
        row.timestamp
      )
    );

    const selectedOptions = normaliseSelectedOptions(row.selected_options);

    rows.push({
      response_id:
        firstNonEmpty(row.response_id, row.id, row.responseId) ||
        `JSON-${String(index + 1).padStart(5, "0")}`,

      source: "json",

      row_number: index + 1,

      submitted_at: submittedAt,

      score,

      bucket: bucketFromScore(score),

      customer_name: firstNonEmpty(
        row.contact_name,
        row.customer_name,
        row.customerName,
        row.name,
        row.contact
      ),

      customer_email: firstNonEmpty(
        row.contact_email,
        row.customer_email,
        row.customerEmail,
        row.email
      ),

      company: firstNonEmpty(row.company, row.company_name, row.businessName),

      stage: firstNonEmpty(row.stage, row.survey_stage, row.milestone),

      comment: buildBestComment(row),

      contact_id: firstNonEmpty(row.contact_id, row.customer_id),

      intercom_contact_url: firstNonEmpty(row.intercom_contact_url),

      selected_options: selectedOptions,

      extra_scores: {
        recommend: toNpsScore(row.q_recommend_score),
        install: toNpsScore(row.q_install_score),
        daily_use: toNpsScore(row.q_daily_use_score),
        parent_relation: toNpsScore(row.q_parent_relation_score),
        support: toNpsScore(row.q_support_score),
      },

      raw: row,
    });
  });

  if (skippedRows.length > 0) {
    warnings.push({
      type: "skipped_rows",
      message: `${skippedRows.length} row(s) were skipped because they did not contain a valid NPS score from 0 to 10.`,
    });
  }

  const hasDates = rows.some((row) => row.submitted_at);

  if (!hasDates) {
    warnings.push({
      type: "missing_date_column",
      message:
        "No usable submitted date was detected. The data can still be analysed, but timeline charts will not work.",
    });
  }

  const summary = buildNpsSummary(rows);

  return {
    ok: true,
    inputType: "json",
    content_id: payload?.content_id || null,
    days: payload?.days || null,
    columns: rows.length ? Object.keys(rows[0].raw || {}) : [],
    rawRowCount: sourceRows.length,
    validRowCount: rows.length,
    skippedRowCount: skippedRows.length,
    detectedFields: {
      score: "nps_score / q_recommend_score / score",
      submittedAt: "submitted_at / createdAt / date",
      customerName: "contact_name / customer_name / name",
      email: "contact_email / customer_email / email",
      comment:
        "q_recommend_comment + q_install_comment + q_parent_relation_comment + q_final_comment",
      company: "company / company_name / businessName",
      stage: "stage / survey_stage / milestone",
    },
    warnings,
    summary,
    rows,
    skippedRows,
  };
}

  router.get("/ping", (_req, res) => {

    res.json({ ok: true, route: "csv-nps" });

  });

  /**
   * POST /api/csv-nps/parse
   *
   * Expected body:
   * {
   *   "csvText": "name,email,score,comment,date\n..."
   * }
   */
  router.post("/parse", (req, res) => {
    try {
      const inputText = String(req.body?.csvText || req.body?.text || req.body?.data || "").trim();

      if (!inputText) {
        return res.status(400).json({
          ok: false,
          error: "csvText is required",
        });
      }

      // --------------------------------------------------
      // JSON input support
      // Accepts:
      // - { rows: [...] }
      // - { data: { rows: [...] } }
      // - { responses: [...] }
      // - [ ... ]
      // --------------------------------------------------
      if (looksLikeJsonInput(inputText)) {
        const payload = safeParseJsonInput(inputText);

        if (!payload) {
          return res.status(400).json({
            ok: false,
            error:
              "The pasted data looks like JSON, but it could not be parsed. Please check it is valid JSON.",
          });
        }

        const jsonResult = normaliseJsonRows(payload);

        if (!jsonResult.ok) {
          return res.status(400).json(jsonResult);
        }

        return res.json(jsonResult);
      }

      // --------------------------------------------------
      // CSV input support
      // Existing behaviour preserved
      // --------------------------------------------------
      const parsed = parseCsvWithHeader(inputText);
      const detectedFields = detectNpsFields(parsed.columns);
      const normalised = normaliseNpsRows(parsed.rows, detectedFields);

      const summary = buildNpsSummary(normalised.rows);

      return res.json({
        ok: true,
        inputType: "csv",
        delimiter: parsed.delimiter,
        columns: parsed.columns,
        rawRowCount: parsed.rows.length,
        validRowCount: normalised.rows.length,
        skippedRowCount: normalised.skippedRows.length,
        detectedFields,
        warnings: buildParseWarnings({
          parsed,
          detectedFields,
          normalised,
        }),
        summary,
        rows: normalised.rows,
        skippedRows: normalised.skippedRows,
      });
    } catch (err) {
      console.error("[csv-nps] Error in POST /parse", err);
      return res.status(500).json({
        ok: false,
        error: "Failed to parse pasted data",
      });
    }
  });

  return router;
}

/* -------------------------------------------------------------------------- */
/* CSV parsing                                                                */
/* -------------------------------------------------------------------------- */

function detectDelimiter(headerLine) {
  const commaCount = (headerLine.match(/,/g) || []).length;
  const semiCount = (headerLine.match(/;/g) || []).length;
  const tabCount = (headerLine.match(/\t/g) || []).length;

  if (tabCount > commaCount && tabCount > semiCount) return "\t";
  if (semiCount > commaCount) return ";";
  return ",";
}

function splitCsvLine(line, delimiter) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }

  result.push(current);
  return result;
}

function parseCsvWithHeader(csvText) {
  const lines = csvText
    .replace(/^\uFEFF/, "") // remove UTF-8 BOM if present
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return {
      delimiter: ",",
      columns: [],
      rows: [],
    };
  }

  const delimiter = detectDelimiter(lines[0]);

  const columns = splitCsvLine(lines[0], delimiter).map((h) =>
    cleanCellValue(h)
  );

  const rows = lines.slice(1).map((line, rowIndex) => {
    const cells = splitCsvLine(line, delimiter);
    const obj = {
      __rowNumber: rowIndex + 2, // +2 because CSV row 1 is header
    };

    columns.forEach((column, index) => {
      obj[column] = cleanCellValue(cells[index] ?? "");
    });

    return obj;
  });

  return {
    delimiter,
    columns,
    rows,
  };
}

function cleanCellValue(value) {
  let v = String(value ?? "").trim();

  if (v.startsWith('"') && v.endsWith('"')) {
    v = v.slice(1, -1).replace(/""/g, '"');
  }

  return v.trim();
}

/* -------------------------------------------------------------------------- */
/* NPS field detection                                                        */
/* -------------------------------------------------------------------------- */

function normaliseColumnName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function detectNpsFields(columns) {
  const normalised = columns.map((original) => ({
    original,
    key: normaliseColumnName(original),
  }));

  const findFirst = (candidates) => {
    const match = normalised.find((col) => candidates.includes(col.key));
    return match?.original || null;
  };

  return {
    score:
      findFirst([
        "score",
        "nps",
        "nps_score",
        "rating",
        "note",
        "recommendation_score",
        "likelihood_to_recommend",
        "how_likely_are_you_to_recommend",
      ]) || guessScoreColumn(normalised),

    submittedAt: findFirst([
      "date",
      "created_at",
      "submitted_at",
      "response_date",
      "completed_at",
      "timestamp",
      "time",
    ]),

    customerName: findFirst([
      "name",
      "customer",
      "customer_name",
      "client",
      "client_name",
      "contact_name",
      "user_name",
    ]),

    email: findFirst([
      "email",
      "customer_email",
      "client_email",
      "contact_email",
      "user_email",
    ]),

    comment: findFirst([
      "comment",
      "comments",
      "feedback",
      "reason",
      "verbatim",
      "response",
      "open_text",
      "open_feedback",
      "why",
    ]),

    company: findFirst([
      "company",
      "company_name",
      "business",
      "business_name",
      "organisation",
      "organization",
      "account",
    ]),

    stage: findFirst([
      "stage",
      "journey_stage",
      "milestone",
      "touchpoint",
      "survey_stage",
      "survey_type",
    ]),
  };
}

function guessScoreColumn(normalisedColumns) {
  const scoreLike = normalisedColumns.find((col) => {
    return (
      col.key.includes("score") ||
      col.key.includes("nps") ||
      col.key.includes("rating") ||
      col.key.includes("recommend")
    );
  });

  return scoreLike?.original || null;
}

/* -------------------------------------------------------------------------- */
/* NPS normalisation                                                          */
/* -------------------------------------------------------------------------- */

function normaliseNpsRows(rawRows, detectedFields = null) {
  if (!rawRows.length) {
    return {
      rows: [],
      skippedRows: [],
    };
  }

  const columns = Object.keys(rawRows[0]).filter((key) => key !== "__rowNumber");
  const fields = detectedFields || detectNpsFields(columns);

  if (!fields.score) {
    return {
      rows: [],
      skippedRows: rawRows.map((row) => ({
        row_number: row.__rowNumber,
        reason: "No score column detected",
        raw: row,
      })),
    };
  }

  const rows = [];
  const skippedRows = [];

  rawRows.forEach((row, index) => {
    const score = parseNpsScore(row[fields.score]);

    if (score === null) {
      skippedRows.push({
        row_number: row.__rowNumber,
        reason: `Invalid NPS score in column "${fields.score}"`,
        rawScore: row[fields.score],
        raw: row,
      });
      return;
    }

    const submittedAt = fields.submittedAt
      ? parseDateValue(row[fields.submittedAt])
      : null;

    const responseId = `CSV-${String(index + 1).padStart(5, "0")}`;

    rows.push({
      response_id: responseId,
      source: "csv",
      row_number: row.__rowNumber,

      submitted_at: submittedAt,
      score,
      bucket: getNpsBucket(score),

      customer_name: fields.customerName ? row[fields.customerName] || "" : "",
      customer_email: fields.email ? row[fields.email] || "" : "",
      company: fields.company ? row[fields.company] || "" : "",
      stage: fields.stage ? row[fields.stage] || "" : "",

      comment: fields.comment ? row[fields.comment] || "" : "",

      raw: row,
    });
  });

  return {
    rows,
    skippedRows,
  };
}

function parseNpsScore(value) {
  if (value === null || value === undefined) return null;

  const cleaned = String(value)
    .trim()
    .replace(",", ".")
    .replace(/[^0-9.-]/g, "");

  if (!cleaned) return null;

  const score = Number(cleaned);

  if (!Number.isFinite(score)) return null;
  if (score < 0 || score > 10) return null;

  return Math.round(score);
}

function parseDateValue(value) {
  if (!value) return null;

  const raw = String(value).trim();
  const parsed = new Date(raw);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  return raw;
}

function getNpsBucket(score) {
  if (score >= 9) return "promoter";
  if (score >= 7) return "passive";
  return "detractor";
}

/* -------------------------------------------------------------------------- */
/* NPS summary                                                                */
/* -------------------------------------------------------------------------- */

function buildNpsSummary(rows) {
  const total = rows.length;

  if (!total) {
    return {
      total: 0,
      promoters: 0,
      passives: 0,
      detractors: 0,
      nps: null,
      averageScore: null,
    };
  }

  const promoters = rows.filter((row) => row.bucket === "promoter").length;
  const passives = rows.filter((row) => row.bucket === "passive").length;
  const detractors = rows.filter((row) => row.bucket === "detractor").length;

  const nps = Math.round(((promoters - detractors) / total) * 100);

  const averageScore =
    Math.round(
      (rows.reduce((sum, row) => sum + row.score, 0) / total) * 10
    ) / 10;

  return {
    total,
    promoters,
    passives,
    detractors,
    nps,
    averageScore,
  };
}

function buildParseWarnings({ parsed, detectedFields, normalised }) {
  const warnings = [];

  if (!parsed.columns.length) {
    warnings.push({
      type: "no_columns",
      message: "No column headers were detected.",
    });
  }

  if (!detectedFields.score) {
    warnings.push({
      type: "missing_score_column",
      message:
        "No NPS score column was detected. Add a column called score, nps, nps_score, rating, or similar.",
    });
  }

  if (!detectedFields.submittedAt) {
    warnings.push({
      type: "missing_date_column",
      message:
        "No date column was detected. The CSV can still be analysed, but timeline charts will not work.",
    });
  }

  if (!detectedFields.comment) {
    warnings.push({
      type: "missing_comment_column",
      message:
        "No comment/feedback column was detected. Closing-the-loop will still work, but without customer verbatims.",
    });
  }

  if (normalised.skippedRows.length > 0) {
    warnings.push({
      type: "skipped_rows",
      message: `${normalised.skippedRows.length} row(s) were skipped because they did not contain a valid NPS score from 0 to 10.`,
    });
  }

  if (parsed.rows.length > 0 && normalised.rows.length === 0) {
    warnings.push({
      type: "no_valid_rows",
      message:
        "Rows were found in the CSV, but none could be converted into valid NPS responses.",
    });
  }

  return warnings;
}
