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

const INTERCOM_NPS_RESPONSES_PATH =
  process.env.DROPBOX_INTERCOM_NPS_RESPONSES_PATH || "/npsme/intercom/nps-responses.jsonl";

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

// --------------------------------------------------
// Canonical dataset loader
// --------------------------------------------------
async function getCanonicalResponses({ force = false } = {}) {
  const fresh =
    cache.responses.rows &&
    Date.now() - cache.responses.fetchedAt < cache.responses.ttlMs;

  if (!force && fresh) return cache.responses.rows;

  const text = await readDropboxFile(INTERCOM_NPS_RESPONSES_PATH).catch(() => null);
  const rows = parseJsonl(text);

  // Deduplicate by response_id: newest record wins
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
      r?.name || r?.email || r?.external_id || (r?.contact_id ? `Contact ${r.contact_id}` : "—"),
    intercom_contact_url: r?.contact_id ? intercomContactUrl(r.contact_id) : null,

    pioupiou: r?.pioupiou_label || r?.custom_attributes?.pioupiou_label || "—",
    reader_serial: r?.reader_serial || r?.custom_attributes?.reader_serial || "—",

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

  // Make whole workspace private for now
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

      return res.json({
        ok: true,
        content_id: contentId,
        total_canonical_rows: contentRows.length,
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
