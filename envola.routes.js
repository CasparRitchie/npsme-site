// envola.routes.js
import express from "express";
import crypto from "crypto";

// --------------------------------------------------
// Private auth (same pattern as intercom.routes.js)
// --------------------------------------------------
const PRIVATE_COOKIE_NAME = "npsme_private";

function parseCookies(header = "") {
  const out = {};
  if (!header) return out;

  header.split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  });

  return out;
}

function expectedPrivateCookieValue() {
  const secret =
    process.env.PRIVATE_DASH_COOKIE_SECRET || process.env.PRIVATE_DASH_PASSWORD || "";
  if (!secret) return null;

  return crypto
    .createHmac("sha256", secret)
    .update("npsme_private_v1")
    .digest("hex");
}

function requirePrivateCookie(req, res, next) {
  const expected = expectedPrivateCookieValue();
  if (!expected) {
    return res.status(500).json({
      ok: false,
      error:
        "Private auth is not configured (missing PRIVATE_DASH_COOKIE_SECRET or PRIVATE_DASH_PASSWORD)",
    });
  }

  const cookies = parseCookies(req.headers.cookie || "");
  if (cookies[PRIVATE_COOKIE_NAME] !== expected) {
    return res.status(401).json({ ok: false, error: "Not authorised" });
  }

  return next();
}

// --------------------------------------------------
// Dropbox config
// --------------------------------------------------
const DROPBOX_REFRESH_TOKEN = process.env.DROPBOX_REFRESH_TOKEN;
const DROPBOX_APP_KEY = process.env.DROPBOX_APP_KEY;
const DROPBOX_APP_SECRET = process.env.DROPBOX_APP_SECRET;
const LEGACY_DROPBOX_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;

const ENVOLA_RESPONSES_PATH =
  process.env.DROPBOX_ENVOLA_RESPONSES_PATH || "/npsme/envola/responses.jsonl";

const INTERCOM_SURVEY_EVENTS_PATH =
  process.env.DROPBOX_INTERCOM_SURVEY_EVENTS_PATH || "/npsme/intercom/survey-events.jsonl";

const DEFAULT_CONTENT_ID = process.env.ENVOLA_CONTENT_ID || "189616";
const ENVOLA_INTERCOM_APP_ID = process.env.ENVOLA_INTERCOM_APP_ID || "";

// --------------------------------------------------
// In-memory cache
// --------------------------------------------------
const cache = {
  token: null,
  tokenExpiry: 0,
  responses: {
    fetchedAt: 0,
    ttlMs: 30_000,
    rows: null,
  },
};

function invalidateResponsesCache() {
  cache.responses.fetchedAt = 0;
  cache.responses.rows = null;
}

// --------------------------------------------------
// Generic helpers
// --------------------------------------------------
function clampInt(v, def, min, max) {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

function parseJsonl(text) {
  if (!text) return [];
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function toNumberIfNumeric(x) {
  if (x === null || x === undefined) return null;
  const n = Number(String(x).trim());
  return Number.isFinite(n) ? n : null;
}

function scoreBucket(score) {
  if (typeof score !== "number") return "unknown";
  if (score >= 9) return "promoter";
  if (score >= 7) return "passive";
  return "detractor";
}

function toYmdUtc(ms) {
  const d = new Date(ms);
  const pad = (x) => String(x).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function weekStartYmdUTC(ms) {
  const d = new Date(ms);
  const day = d.getUTCDay(); // 0=Sun
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
  monday.setUTCDate(monday.getUTCDate() + diffToMonday);
  return toYmdUtc(monday.getTime());
}

function monthStartYmdUTC(ms) {
  const d = new Date(ms);
  const pad = (x) => String(x).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-01`;
}

function intercomContactUrl(contactId) {
  if (!ENVOLA_INTERCOM_APP_ID || !contactId) return null;
  return `https://app.intercom.com/a/apps/${ENVOLA_INTERCOM_APP_ID}/users/${contactId}`;
}

function splitMultiSelect(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  return String(value || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
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

function jsonlStringify(rows) {
  return rows.map((r) => JSON.stringify(r)).join("\n") + (rows.length ? "\n" : "");
}

function escapeCsv(value) {
  if (value == null) return "";
  const s = String(value);
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(rows) {
  if (!rows.length) return "";

  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCsv(row[header])).join(",")
    ),
  ];

  return lines.join("\n");
}

function makeResponseId(e) {
  const contentId = String(e.content_id || "").trim();
  const receiptId = String(e.receipt_id || "").trim();
  return contentId && receiptId ? `${contentId}:${receiptId}` : null;
}

function isBenefitsQuestion(answer) {
  const qt = String(answer?.question_text || "").toLowerCase();
  return qt.includes("quels bénéfices") || qt.includes("bénéfices principaux");
}

function extractCommentsAndOptions(answers) {
  const out = {
    verbatims: [],
    selected_options: [],
  };

  for (const a of answers || []) {
    const resp = a?.response;
    if (resp == null) continue;

    const s = String(resp).trim();
    if (!s) continue;

    const n = Number(s);
    if (Number.isFinite(n) && /^\d+(\.\d+)?$/.test(s)) continue;

    if (isBenefitsQuestion(a)) {
      out.selected_options.push(...splitMultiSelect(s));
      continue;
    }

    out.verbatims.push({
      question_text: String(a?.question_text || "").trim() || null,
      text: s,
    });
  }

  out.selected_options = uniqueStrings(out.selected_options);
  return out;
}

function pickNpsScore(answers) {
  for (const a of answers || []) {
    const n = toNumberIfNumeric(a?.response);
    if (n !== null && n >= 0 && n <= 10) return n;
  }
  return null;
}

function normalizeCompletionEvent(e) {
  let answers = [];
  try {
    answers = e.answers_json ? JSON.parse(e.answers_json) : [];
  } catch {
    answers = [];
  }

  const response_id = makeResponseId(e);
  if (!response_id) return null;

  const extracted = extractCommentsAndOptions(answers);
  const primaryComment =
    extracted.verbatims.map((v) => v.text).sort((a, b) => b.length - a.length)[0] || null;

  return {
    response_id,
    source: "intercom_webhook",
    content_id: String(e.content_id || "").trim() || null,
    content_title: e.content_title || null,
    receipt_id: String(e.receipt_id || "").trim() || null,
    submitted_at: e.received_at || new Date().toISOString(),

    score_0_10: pickNpsScore(answers),

    comment: primaryComment,
    verbatims: extracted.verbatims,
    selected_options: extracted.selected_options,

    email: e.email || null,
    name: e.name || null,
    contact_id: e.contact_id || null,
    external_id: e.external_id || null,

    answers: Array.isArray(answers) ? answers : [],

    raw: {
      stat_type: e.stat_type || null,
      topic: e.topic || null,
    },
  };
}

// --------------------------------------------------
// Dropbox helpers
// --------------------------------------------------
async function getDropboxAccessToken() {
  if (!DROPBOX_REFRESH_TOKEN) return LEGACY_DROPBOX_TOKEN || null;

  const now = Date.now() / 1000;
  if (cache.token && now < cache.tokenExpiry - 60) return cache.token;

  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", DROPBOX_REFRESH_TOKEN);
  params.append("client_id", DROPBOX_APP_KEY);
  params.append("client_secret", DROPBOX_APP_SECRET);

  const resp = await fetch("https://api.dropbox.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Dropbox token refresh failed (${resp.status}): ${text}`);
  }

  const data = await resp.json();
  cache.token = data.access_token;
  cache.tokenExpiry = now + (typeof data.expires_in === "number" ? data.expires_in : 14400);

  return cache.token;
}

async function readDropboxFile(path) {
  const token = await getDropboxAccessToken();
  if (!token) return null;

  const res = await fetch("https://content.dropboxapi.com/2/files/download", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Dropbox-API-Arg": JSON.stringify({ path }),
    },
  });

  if (res.status === 409) return null;
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Dropbox download failed (${res.status}): ${text}`);
  }

  return res.text();
}

async function writeDropboxFile(path, contents) {
  const token = await getDropboxAccessToken();
  if (!token) return;

  const res = await fetch("https://content.dropboxapi.com/2/files/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/octet-stream",
      "Dropbox-API-Arg": JSON.stringify({ path, mode: "overwrite", mute: true }),
    },
    body: contents,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Dropbox upload failed (${res.status}): ${text}`);
  }
}

// --------------------------------------------------
// Canonical dataset loader
// --------------------------------------------------
async function getCanonicalResponses({ force = false } = {}) {
  const fresh =
    cache.responses.rows &&
    Date.now() - cache.responses.fetchedAt < cache.responses.ttlMs;

  if (!force && fresh) return cache.responses.rows;

  const text = await readDropboxFile(ENVOLA_RESPONSES_PATH).catch(() => null);
  const rows = parseJsonl(text);

  const byId = new Map();

  for (const r of rows) {
    const responseId = String(r?.response_id || "").trim();
    if (!responseId) continue;

    const existing = byId.get(responseId);
    if (!existing) {
      byId.set(responseId, r);
      continue;
    }

    const existingTs = Date.parse(existing?.submitted_at || "") || 0;
    const newTs = Date.parse(r?.submitted_at || "") || 0;
    if (newTs >= existingTs) {
      byId.set(responseId, r);
    }
  }

  const canonical = Array.from(byId.values()).sort((a, b) =>
    String(b?.submitted_at || "").localeCompare(String(a?.submitted_at || ""))
  );

  cache.responses.fetchedAt = Date.now();
  cache.responses.rows = canonical;

  return canonical;
}

// --------------------------------------------------
// Filtering helpers
// --------------------------------------------------
function parseWindowFromQuery(req) {
  const mode = String(req.query.mode || "rolling").trim().toLowerCase();

  if (mode === "range") {
    const from = String(req.query.from || "").trim();
    const to = String(req.query.to || "").trim();

    const fromMs = Date.parse(`${from}T00:00:00.000Z`);
    const toMs = Date.parse(`${to}T23:59:59.999Z`);

    if (!Number.isFinite(fromMs) || !Number.isFinite(toMs)) {
      return { ok: false, error: "Invalid from/to date range" };
    }

    return {
      ok: true,
      mode: "range",
      from,
      to,
      fromMs,
      toMs,
    };
  }

  const days = clampInt(req.query.days, 90, 1, 3650);
  const toMs = Date.now();
  const fromMs = toMs - days * 24 * 60 * 60 * 1000;

  return {
    ok: true,
    mode: "rolling",
    days,
    from: toYmdUtc(fromMs),
    to: toYmdUtc(toMs),
    fromMs,
    toMs,
  };
}

function filterDataset(rows, { contentId, fromMs, toMs, bucket = "all" }) {
  return (rows || [])
    .filter((r) => String(r?.content_id || "") === String(contentId))
    .map((r) => {
      const submittedMs = Date.parse(r?.submitted_at || "");
      return { ...r, _submittedMs: submittedMs };
    })
    .filter((r) => Number.isFinite(r._submittedMs))
    .filter((r) => r._submittedMs >= fromMs && r._submittedMs <= toMs)
    .filter((r) => {
      if (!bucket || bucket === "all") return true;
      return scoreBucket(r?.score_0_10) === bucket;
    });
}

function summarizeDataset(rows) {
  const completedResponses = rows.length;

  const scored = rows.filter(
    (r) =>
      typeof r?.score_0_10 === "number" &&
      r.score_0_10 >= 0 &&
      r.score_0_10 <= 10
  );

  const scoredResponses = scored.length;
  const promoters = scored.filter((r) => r.score_0_10 >= 9).length;
  const passives = scored.filter((r) => r.score_0_10 >= 7 && r.score_0_10 <= 8).length;
  const detractors = scored.filter((r) => r.score_0_10 <= 6).length;

  const nps = scoredResponses
    ? Math.round(((promoters - detractors) / scoredResponses) * 100)
    : null;

  const latestSubmittedAt =
    rows
      .map((r) => r?.submitted_at)
      .filter(Boolean)
      .sort()
      .slice(-1)[0] || null;

  return {
    completedResponses,
    scoredResponses,
    promoters,
    passives,
    detractors,
    nps,
    latestSubmittedAt,
  };
}

function buildTimeseries(rows, granularity = "week") {
  const keyFor = (ms) => {
    if (granularity === "day") return toYmdUtc(ms);
    if (granularity === "month") return monthStartYmdUTC(ms);
    return weekStartYmdUTC(ms);
  };

  const map = new Map();

  for (const r of rows) {
    if (!(typeof r?.score_0_10 === "number")) continue;

    const key = keyFor(r._submittedMs);
    const cur = map.get(key) || {
      date: key,
      responses: 0,
      promoters: 0,
      passives: 0,
      detractors: 0,
    };

    cur.responses += 1;
    const bucket = scoreBucket(r.score_0_10);
    if (bucket === "promoter") cur.promoters += 1;
    else if (bucket === "passive") cur.passives += 1;
    else if (bucket === "detractor") cur.detractors += 1;

    map.set(key, cur);
  }

  return Array.from(map.values())
    .map((x) => ({
      ...x,
      nps: x.responses
        ? Math.round(((x.promoters - x.detractors) / x.responses) * 100)
        : null,
    }))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

function flattenResponseForTable(r, allRowsForContact = []) {
  const answers = Array.isArray(r?.answers) ? r.answers : [];

  const previousResponses = (allRowsForContact || [])
    .filter((x) => String(x?.response_id || "") !== String(r?.response_id || ""))
    .sort((a, b) =>
      String(a?.submitted_at || "").localeCompare(String(b?.submitted_at || ""))
    );

  const benefits = uniqueStrings([
    ...(Array.isArray(r?.selected_options) ? r.selected_options : []),
    ...allAnswersByQuestionId(answers, 612570),
  ]);

  return {
    response_id: r?.response_id || null,
    submitted_at: r?.submitted_at || null,
    nps_score: r?.score_0_10 ?? null,
    bucket: scoreBucket(r?.score_0_10),

    contact_id: r?.contact_id || null,
    contact_name:
      r?.name || r?.email || r?.external_id || (r?.contact_id ? `Contact ${r.contact_id}` : "-"),
    intercom_contact_url: r?.contact_id ? intercomContactUrl(r.contact_id) : null,

    pioupiou: r?.pioupiou_label || r?.custom_attributes?.pioupiou_label || "-",
    reader_serial: r?.reader_serial || r?.custom_attributes?.reader_serial || "-",

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

    selected_options: benefits,
  };
}

// --------------------------------------------------
// Router
// --------------------------------------------------
export function createEnvolaRouter() {
  const router = express.Router();

  function requireIngestToken(req, res, next) {
    const ingestToken = process.env.NPSME_INGEST_TOKEN;
    if (!ingestToken) {
      return res.status(500).json({ ok: false, error: "NPSME_INGEST_TOKEN not configured" });
    }

    const provided = (req.get("X-Ingest-Token") || "").trim();
    if (provided !== ingestToken) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    next();
  }

  async function rebuildEnvolaResponsesFile({ contentId = DEFAULT_CONTENT_ID } = {}) {
    const rawText = await readDropboxFile(INTERCOM_SURVEY_EVENTS_PATH).catch(() => null);
    const rawEvents = parseJsonl(rawText);

    const completions = rawEvents.filter(
      (e) =>
        String(e?.stat_type || "").toLowerCase() === "completion" &&
        String(e?.content_id || "") === String(contentId)
    );

    const normalized = completions
      .map(normalizeCompletionEvent)
      .filter(Boolean);

    const byId = new Map();
    for (const r of normalized) {
      const existing = byId.get(r.response_id);
      if (!existing) {
        byId.set(r.response_id, r);
        continue;
      }

      const existingTs = Date.parse(existing.submitted_at || "") || 0;
      const newTs = Date.parse(r.submitted_at || "") || 0;
      if (newTs >= existingTs) {
        byId.set(r.response_id, r);
      }
    }

    const canonical = Array.from(byId.values()).sort((a, b) =>
      String(b.submitted_at || "").localeCompare(String(a.submitted_at || ""))
    );

    await writeDropboxFile(ENVOLA_RESPONSES_PATH, jsonlStringify(canonical));
    invalidateResponsesCache();

    return {
      ok: true,
      content_id: contentId,
      rebuilt_rows: canonical.length,
      path: ENVOLA_RESPONSES_PATH,
    };
  }

  // Public to ingest-token only
  router.post("/rebuild", requireIngestToken, async (req, res) => {
    try {
      const contentId = String(req.query.content_id || DEFAULT_CONTENT_ID).trim();
      const out = await rebuildEnvolaResponsesFile({ contentId });
      return res.json(out);
    } catch (err) {
      console.error("[envola] rebuild error", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Everything below this line requires private cookie
  router.use(requirePrivateCookie);

  router.get("/summary", async (req, res) => {
    try {
      const contentId = String(req.query.content_id || DEFAULT_CONTENT_ID).trim();
      const bucket = String(req.query.bucket || "all").trim().toLowerCase();

      const window = parseWindowFromQuery(req);
      if (!window.ok) {
        return res.status(400).json({ ok: false, error: window.error });
      }

      const allRows = await getCanonicalResponses();
      const filtered = filterDataset(allRows, {
        contentId,
        fromMs: window.fromMs,
        toMs: window.toMs,
        bucket,
      });

      const summary = summarizeDataset(filtered);
      console.log("[envola summary debug]", {
        query: req.query,
        window,
        filteredCount: filtered.length,
        filteredScores: filtered.map((r) => ({
          submitted_at: r.submitted_at,
          score_0_10: r.score_0_10,
        })),
        summary,
      });

      return res.json({
        ok: true,
        content_id: contentId,
        mode: window.mode,
        from: window.from,
        to: window.to,
        bucket,
        ...summary,
      });
    } catch (err) {
      console.error("[envola] summary error", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  router.get("/timeseries", async (req, res) => {
    try {
      const contentId = String(req.query.content_id || DEFAULT_CONTENT_ID).trim();
      const bucket = String(req.query.bucket || "all").trim().toLowerCase();
      const granularity = String(req.query.granularity || "week").trim().toLowerCase();

      if (!["day", "week", "month"].includes(granularity)) {
        return res.status(400).json({ ok: false, error: "Invalid granularity" });
      }

      const window = parseWindowFromQuery(req);
      if (!window.ok) {
        return res.status(400).json({ ok: false, error: window.error });
      }

      const allRows = await getCanonicalResponses();
      const filtered = filterDataset(allRows, {
        contentId,
        fromMs: window.fromMs,
        toMs: window.toMs,
        bucket,
      });

      const points = buildTimeseries(filtered, granularity);

      return res.json({
        ok: true,
        content_id: contentId,
        mode: window.mode,
        from: window.from,
        to: window.to,
        bucket,
        granularity,
        points,
      });
    } catch (err) {
      console.error("[envola] timeseries error", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  router.get("/responses-for-point", async (req, res) => {
    try {
      const contentId = String(req.query.content_id || DEFAULT_CONTENT_ID).trim();
      const bucket = String(req.query.bucket || "all").trim().toLowerCase();
      const granularity = String(req.query.granularity || "week").trim().toLowerCase();
      const date = String(req.query.date || "").trim();
      const limit = clampInt(req.query.limit, 200, 1, 2000);

      if (!["day", "week", "month"].includes(granularity)) {
        return res.status(400).json({ ok: false, error: "Invalid granularity" });
      }

      if (!date) {
        return res.status(400).json({ ok: false, error: "Missing date" });
      }

      const bucketStartMs = Date.parse(`${date}T00:00:00.000Z`);
      if (!Number.isFinite(bucketStartMs)) {
        return res.status(400).json({ ok: false, error: "Invalid date" });
      }

      let bucketEndMs;
      if (granularity === "day") {
        bucketEndMs = bucketStartMs + 24 * 60 * 60 * 1000;
      } else if (granularity === "week") {
        bucketEndMs = bucketStartMs + 7 * 24 * 60 * 60 * 1000;
      } else {
        const d = new Date(bucketStartMs);
        bucketEndMs = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
      }

      const allRows = await getCanonicalResponses();

      const filtered = (allRows || [])
        .filter((r) => String(r?.content_id || "") === String(contentId))
        .map((r) => {
          const submittedMs = Date.parse(r?.submitted_at || "");
          return { ...r, _submittedMs: submittedMs };
        })
        .filter((r) => Number.isFinite(r._submittedMs))
        .filter((r) => r._submittedMs >= bucketStartMs && r._submittedMs < bucketEndMs)
        .filter((r) => {
          if (!bucket || bucket === "all") return true;
          return scoreBucket(r?.score_0_10) === bucket;
        })
        .sort((a, b) =>
          String(b?.submitted_at || "").localeCompare(String(a?.submitted_at || ""))
        )
        .slice(0, limit)
        .map((r) => ({
          ...r,
          contact_name:
            r?.name ||
            r?.email ||
            r?.external_id ||
            (r?.contact_id ? `Contact ${r.contact_id}` : "-"),
          intercom_contact_url: r?.contact_id ? intercomContactUrl(r.contact_id) : null,
        }));

      return res.json({
        ok: true,
        content_id: contentId,
        granularity,
        date,
        bucket,
        returned: filtered.length,
        rows: filtered,
      });
    } catch (err) {
      console.error("[envola] responses-for-point error", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  router.get("/responses", async (req, res) => {
    try {
      const contentId = String(req.query.content_id || DEFAULT_CONTENT_ID).trim();
      const bucket = String(req.query.bucket || "all").trim().toLowerCase();
      const limit = clampInt(req.query.limit, 2000, 1, 5000);

      const window = parseWindowFromQuery(req);
      if (!window.ok) {
        return res.status(400).json({ ok: false, error: window.error });
      }

      const allRows = await getCanonicalResponses();
      const filtered = filterDataset(allRows, {
        contentId,
        fromMs: window.fromMs,
        toMs: window.toMs,
        bucket,
      })
        .sort((a, b) =>
          String(b?.submitted_at || "").localeCompare(String(a?.submitted_at || ""))
        )
        .slice(0, limit);

      const byContact = new Map();
      for (const r of filtered) {
        const cid = String(r?.contact_id || "").trim();
        if (!cid) continue;
        const arr = byContact.get(cid) || [];
        arr.push(r);
        byContact.set(cid, arr);
      }

      const rows = filtered.map((r) => {
        const cid = String(r?.contact_id || "").trim();
        const history = cid ? byContact.get(cid) || [] : [];
        return flattenResponseForTable(r, history);
      });

      return res.json({
        ok: true,
        content_id: contentId,
        mode: window.mode,
        from: window.from,
        to: window.to,
        bucket,
        returned: rows.length,
        rows,
      });
    } catch (err) {
      console.error("[envola] responses error", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  router.get("/responses-export.csv", async (req, res) => {
    try {
      const contentId = String(req.query.content_id || DEFAULT_CONTENT_ID).trim();
      const bucket = String(req.query.bucket || "all").trim().toLowerCase();
      const limit = clampInt(req.query.limit, 5000, 1, 20000);

      const window = parseWindowFromQuery(req);
      if (!window.ok) {
        return res.status(400).json({ ok: false, error: window.error });
      }

      const allRows = await getCanonicalResponses();
      const filtered = filterDataset(allRows, {
        contentId,
        fromMs: window.fromMs,
        toMs: window.toMs,
        bucket,
      })
        .sort((a, b) =>
          String(b?.submitted_at || "").localeCompare(String(a?.submitted_at || ""))
        )
        .slice(0, limit);

      const byContact = new Map();
      for (const r of filtered) {
        const cid = String(r?.contact_id || "").trim();
        if (!cid) continue;
        const arr = byContact.get(cid) || [];
        arr.push(r);
        byContact.set(cid, arr);
      }

      const rows = filtered.map((r) => {
        const cid = String(r?.contact_id || "").trim();
        const history = cid ? byContact.get(cid) || [] : [];
        const flat = flattenResponseForTable(r, history);

        return {
          response_id: flat.response_id,
          submitted_at: flat.submitted_at,
          nps_score: flat.nps_score,
          bucket: flat.bucket,
          contact_id: flat.contact_id,
          contact_name: flat.contact_name,
          intercom_contact_url: flat.intercom_contact_url,
          pioupiou: flat.pioupiou,
          reader_serial: flat.reader_serial,
          previous_response_dates: (flat.previous_response_dates || []).join(" | "),
          previous_response_links: (flat.previous_response_links || []).join(" | "),
          q_recommend_score: flat.q_recommend_score,
          q_recommend_comment: flat.q_recommend_comment,
          q_install_score: flat.q_install_score,
          q_install_comment: flat.q_install_comment,
          q_daily_use_score: flat.q_daily_use_score,
          q_benefits: flat.q_benefits,
          q_parent_relation_score: flat.q_parent_relation_score,
          q_parent_relation_comment: flat.q_parent_relation_comment,
          q_support_score: flat.q_support_score,
          q_support_comment: flat.q_support_comment,
          q_final_comment: flat.q_final_comment,
          selected_options: (flat.selected_options || []).join(" | "),
        };
      });

      const csv = toCsv(rows);

      const suffix =
        window.mode === "range"
          ? `${window.from}_to_${window.to}`
          : `last_${window.days}d`;

      const safeBucket = bucket || "all";
      const filename = `envola_responses_${contentId}_${safeBucket}_${suffix}.csv`;

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.status(200).send(csv);
    } catch (err) {
      console.error("[envola] responses-export.csv error", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  router.get("/comments", async (req, res) => {
    try {
      const contentId = String(req.query.content_id || DEFAULT_CONTENT_ID).trim();
      const bucket = String(req.query.bucket || "all").trim().toLowerCase();
      const limit = clampInt(req.query.limit, 80, 1, 500);

      const window = parseWindowFromQuery(req);
      if (!window.ok) {
        return res.status(400).json({ ok: false, error: window.error });
      }

      const allRows = await getCanonicalResponses();
      const filtered = filterDataset(allRows, {
        contentId,
        fromMs: window.fromMs,
        toMs: window.toMs,
        bucket,
      });

      const comments = filtered
        .flatMap((r) => {
          const verbatims = Array.isArray(r?.verbatims) ? r.verbatims : [];
          const score = r?.score_0_10 ?? null;
          const rowBucket = scoreBucket(score);
          const contactName =
            r?.name ||
            r?.email ||
            r?.external_id ||
            (r?.contact_id ? `Contact ${r.contact_id}` : "-");
          const contactUrl = r?.contact_id ? intercomContactUrl(r.contact_id) : null;

          if (verbatims.length > 0) {
            return verbatims
              .filter((v) => v?.text)
              .map((v) => ({
                response_id: r?.response_id || null,
                submitted_at: r?.submitted_at || null,
                score_0_10: score,
                bucket: rowBucket,
                question_text: v?.question_text || null,
                comment: v?.text || null,
                contact_id: r?.contact_id || null,
                contact_name: contactName,
                intercom_contact_url: contactUrl,
              }));
          }

          if (r?.comment) {
            return [
              {
                response_id: r?.response_id || null,
                submitted_at: r?.submitted_at || null,
                score_0_10: score,
                bucket: rowBucket,
                question_text: null,
                comment: r.comment,
                contact_id: r?.contact_id || null,
                contact_name: contactName,
                intercom_contact_url: contactUrl,
              },
            ];
          }

          return [];
        })
        .sort((a, b) =>
          String(b?.submitted_at || "").localeCompare(String(a?.submitted_at || ""))
        )
        .slice(0, limit);

      return res.json({
        ok: true,
        content_id: contentId,
        mode: window.mode,
        from: window.from,
        to: window.to,
        bucket,
        returned: comments.length,
        comments,
      });
    } catch (err) {
      console.error("[envola] comments error", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  router.get("/response-rate", async (req, res) => {
    try {
      const contentId = String(req.query.content_id || DEFAULT_CONTENT_ID).trim();

      const window = parseWindowFromQuery(req);
      if (!window.ok) {
        return res.status(400).json({ ok: false, error: window.error });
      }

      const allRows = await getCanonicalResponses();
      const filtered = filterDataset(allRows, {
        contentId,
        fromMs: window.fromMs,
        toMs: window.toMs,
        bucket: "all",
      });

      return res.json({
        ok: true,
        content_id: contentId,
        mode: window.mode,
        from: window.from,
        to: window.to,
        completed_responses: filtered.length,
        response_rate_pct: null,
        median_time_to_completion: null,
        median_time_to_first_answer: null,
        note: "Response-rate and timing fields are not yet computed in /api/envola/response-rate",
      });
    } catch (err) {
      console.error("[envola] response-rate error", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  router.get("/themes", async (req, res) => {
    try {
      const contentId = String(req.query.content_id || DEFAULT_CONTENT_ID).trim();
      const bucket = String(req.query.bucket || "all").trim().toLowerCase();

      const window = parseWindowFromQuery(req);
      if (!window.ok) {
        return res.status(400).json({ ok: false, error: window.error });
      }

      const allRows = await getCanonicalResponses();
      const filtered = filterDataset(allRows, {
        contentId,
        fromMs: window.fromMs,
        toMs: window.toMs,
        bucket,
      });

      const themeMap = new Map();

      for (const r of filtered) {
        const score = r?.score_0_10 ?? null;
        const rowBucket = scoreBucket(score);
        const options = Array.isArray(r?.selected_options) ? r.selected_options : [];

        for (const rawTheme of options) {
          const theme = String(rawTheme || "").trim();
          if (!theme) continue;

          const cur = themeMap.get(theme) || {
            theme,
            mentions: 0,
            total_score: 0,
            scored_count: 0,
            detractor_mentions: 0,
          };

          cur.mentions += 1;

          if (typeof score === "number") {
            cur.total_score += score;
            cur.scored_count += 1;
          }

          if (rowBucket === "detractor") {
            cur.detractor_mentions += 1;
          }

          themeMap.set(theme, cur);
        }
      }

      const themes = Array.from(themeMap.values())
        .map((t) => ({
          theme: t.theme,
          mentions: t.mentions,
          avg_score: t.scored_count ? +(t.total_score / t.scored_count).toFixed(1) : null,
          share_of_detractor_mentions: t.mentions
            ? Math.round((t.detractor_mentions / t.mentions) * 100)
            : null,
        }))
        .sort((a, b) => b.mentions - a.mentions);

      return res.json({
        ok: true,
        content_id: contentId,
        mode: window.mode,
        from: window.from,
        to: window.to,
        bucket,
        themes,
      });
    } catch (err) {
      console.error("[envola] themes error", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  router.get("/diagnostics", async (req, res) => {
    try {
      const contentId = String(req.query.content_id || DEFAULT_CONTENT_ID).trim();

      const allRows = await getCanonicalResponses();
      const contentRows = allRows.filter(
        (r) => String(r?.content_id || "") === String(contentId)
      );

      const scoredRows = contentRows.filter(
        (r) =>
          typeof r?.score_0_10 === "number" &&
          r.score_0_10 >= 0 &&
          r.score_0_10 <= 10
      );

      const uniqueContacts = new Set(
        contentRows.map((r) => String(r?.contact_id || "").trim()).filter(Boolean)
      );

      const missingScore = contentRows.filter(
        (r) =>
          !(
            typeof r?.score_0_10 === "number" &&
            r.score_0_10 >= 0 &&
            r.score_0_10 <= 10
          )
      );

      const latestSubmittedAt =
        contentRows
          .map((r) => r?.submitted_at)
          .filter(Boolean)
          .sort()
          .slice(-1)[0] || null;

      const rawText = await readDropboxFile(INTERCOM_SURVEY_EVENTS_PATH).catch(() => null);
      const rawEvents = parseJsonl(rawText);

      const matchingContentEvents = rawEvents.filter(
        (e) => String(e?.content_id || "") === String(contentId)
      );

      const completionEvents = matchingContentEvents.filter(
        (e) => String(e?.stat_type || "").toLowerCase() === "completion"
      );

      const dedupeDifference = completionEvents.length - contentRows.length;

      return res.json({
        ok: true,
        content_id: contentId,
        raw_events_matching_content: matchingContentEvents.length,
        completion_events: completionEvents.length,
        total_canonical_rows: contentRows.length,
        dedupe_removed: dedupeDifference,
        total_scored_rows: scoredRows.length,
        unique_contacts: uniqueContacts.size,
        latest_submitted_at: latestSubmittedAt,
        missing_score_total: missingScore.length,
        missing_score_samples: missingScore.slice(0, 10).map((r) => ({
          response_id: r?.response_id || null,
          submitted_at: r?.submitted_at || null,
          contact_name: r?.name || r?.email || null,
          score_0_10: r?.score_0_10 ?? null,
        })),
      });
    } catch (err) {
      console.error("[envola] diagnostics error", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  router.get("/debug-rebuild", async (req, res) => {
    try {
      const contentId = String(req.query.content_id || DEFAULT_CONTENT_ID).trim();

      const rawText = await readDropboxFile(INTERCOM_SURVEY_EVENTS_PATH).catch(() => null);
      const rawEvents = parseJsonl(rawText);

      const matchingContent = rawEvents.filter(
        (e) => String(e?.content_id || "") === String(contentId)
      );

      const completions = matchingContent.filter(
        (e) => String(e?.stat_type || "").toLowerCase() === "completion"
      );

      const normalized = completions
        .map(normalizeCompletionEvent)
        .filter(Boolean);

      const byId = new Map();
      for (const r of normalized) {
        const existing = byId.get(r.response_id);
        if (!existing) {
          byId.set(r.response_id, r);
          continue;
        }

        const existingTs = Date.parse(existing.submitted_at || "") || 0;
        const newTs = Date.parse(r.submitted_at || "") || 0;
        if (newTs >= existingTs) {
          byId.set(r.response_id, r);
        }
      }

      return res.json({
        ok: true,
        content_id: contentId,
        raw_events_total: rawEvents.length,
        matching_content_total: matchingContent.length,
        completion_total: completions.length,
        normalized_total: normalized.length,
        deduped_total: byId.size,
      });
    } catch (err) {
      console.error("[envola] debug-rebuild error", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  router.get("/debug-response-ids", async (req, res) => {
    try {
      const contentId = String(req.query.content_id || DEFAULT_CONTENT_ID).trim();

      const rawText = await readDropboxFile(INTERCOM_SURVEY_EVENTS_PATH).catch(() => null);
      const rawEvents = parseJsonl(rawText);

      const completions = rawEvents.filter(
        (e) =>
          String(e?.content_id || "") === String(contentId) &&
          String(e?.stat_type || "").toLowerCase() === "completion"
      );

      const grouped = new Map();

      for (const e of completions) {
        const responseId = makeResponseId(e) || "__missing__";
        const arr = grouped.get(responseId) || [];
        arr.push({
          response_id: responseId,
          receipt_id: e?.receipt_id || null,
          content_id: e?.content_id || null,
          received_at: e?.received_at || null,
          email: e?.email || null,
          name: e?.name || null,
        });
        grouped.set(responseId, arr);
      }

      const collisions = Array.from(grouped.entries())
        .filter(([, rows]) => rows.length > 1)
        .map(([response_id, rows]) => ({
          response_id,
          count: rows.length,
          rows,
        }))
        .sort((a, b) => b.count - a.count);

      return res.json({
        ok: true,
        content_id: contentId,
        completion_total: completions.length,
        unique_response_ids: grouped.size,
        collisions_count: collisions.length,
        collisions,
      });
    } catch (err) {
      console.error("[envola] debug-response-ids error", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  router.post("/refresh", async (_req, res) => {
    try {
      invalidateResponsesCache();
      await getCanonicalResponses({ force: true });
      return res.json({ ok: true, refreshed: true });
    } catch (err) {
      console.error("[envola] refresh error", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  return router;
}
