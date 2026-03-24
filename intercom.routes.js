// intercom.routes.js
import express from "express";
import zlib from "zlib";
import AdmZip from "adm-zip";
import { parse } from "csv-parse/sync";
import crypto from "crypto";

// --- Private auth (shared password cookie) ---
// Mirrors server.js: cookie name "npsme_private", value = HMAC(secret, "npsme_private_v1")
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
  return crypto.createHmac("sha256", secret).update("npsme_private_v1").digest("hex");
}

function requirePrivateCookie(req, res, next) {
  const expected = expectedPrivateCookieValue();
  if (!expected) {
    return res.status(500).json({
      ok: false,
      error: "Private auth is not configured (missing PRIVATE_DASH_COOKIE_SECRET or PRIVATE_DASH_PASSWORD)",
    });
  }

  const cookies = parseCookies(req.headers.cookie || "");
  if (cookies[PRIVATE_COOKIE_NAME] !== expected) {
    return res.status(401).json({ ok: false, error: "Not authorised" });
  }

  return next();
}

function clampInt(v, def, min, max) {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

function toYmd(d) {
  const pad = (x) => String(x).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}


// Data-export endpoints behave best pinned to their own API version
const INTERCOM_EXPORT_VERSION = process.env.INTERCOM_EXPORT_VERSION || "2.7";
const INTERCOM_EXPORT_DEBUG = process.env.INTERCOM_EXPORT_DEBUG === "1";

// --- Dropbox helpers (minimal, local to this file) ---
const DROPBOX_REFRESH_TOKEN = process.env.DROPBOX_REFRESH_TOKEN;
const DROPBOX_APP_KEY = process.env.DROPBOX_APP_KEY;
const DROPBOX_APP_SECRET = process.env.DROPBOX_APP_SECRET;
const LEGACY_DROPBOX_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;

const INTERCOM_SURVEY_EVENTS_PATH =
  process.env.DROPBOX_INTERCOM_SURVEY_EVENTS_PATH || "/npsme/intercom/survey-events.jsonl";
const INTERCOM_NPS_RESPONSES_PATH =
  process.env.DROPBOX_INTERCOM_NPS_RESPONSES_PATH || "/npsme/intercom/nps-responses.jsonl";
const INTERCOM_SURVEY_STATS_PATH =
  process.env.DROPBOX_INTERCOM_SURVEY_STATS_PATH || "/npsme/intercom/survey-stats.jsonl";

// -----------------------
// In-memory caches (per Node process)
// -----------------------
// Avoid re-downloading + re-parsing large JSONL files for endpoints that are called many times
// in a single page load (e.g. /private/nps-response is hit 40+ times for "Average score per question").
// TTL keeps it fresh enough for dashboards.
const __cache = {
  npsResponses: {
    fetchedAt: 0,
    ttlMs: 30_000,
    rows: null,
    byResponseId: null,
  },
};

function invalidateNpsResponsesCache() {
  __cache.npsResponses.fetchedAt = 0;
  __cache.npsResponses.rows = null;
  __cache.npsResponses.byResponseId = null;
}

let cachedDropboxToken = null;
let cachedDropboxExpiry = 0; // seconds
let lastNpsIngestAt = 0;
let lastExportIngestAt = 0;
let ingestLock = null;

const THEME_RULES = [
  { key: "onboarding", en: "Onboarding", fr: "Onboarding", patterns: [/onboard/i, /mise en (route|place)/i, /d[eé]marr/i, /installation/i] },
  { key: "wifi", en: "Connectivity / WiFi", fr: "Connexion / WiFi", patterns: [/wifi/i, /connexion/i, /internet/i, /r[eé]seau/i] },
  { key: "support", en: "Support speed", fr: "Support", patterns: [/support/i, /réponse/i, /lenteur/i, /ticket/i] },
  { key: "billing", en: "Billing", fr: "Facturation", patterns: [/factur/i, /paiement/i, /prix/i, /tarif/i] },
  { key: "reliability", en: "Reliability", fr: "Fiabilité", patterns: [/bug/i, /plante/i, /crash/i, /marche pas/i, /fiab/i] },
  { key: "attendance_sheet", en: "Attendance sheet", fr: "Fiche de présence", patterns: [/fiche de pr[eé]sence/i, /feuilles? de pr[eé]sence/i] },
  { key: "time_tracking", en: "Hours & tracking", fr: "Heures & pointage", patterns: [/horaires?/i, /heures?/i, /pointage/i, /\bpointer\b/i, /heures suppl[eé]mentaires/i] },
  { key: "lateness", en: "Lateness / punctuality", fr: "Retards / ponctualité", patterns: [/retards?/i, /[aà]\s*l['’]?heure/i, /ponctual/i] },
  { key: "parents", en: "Parents relationship", fr: "Relation parents", patterns: [/parents?/i, /employeurs?/i, /rapport(s)? avec les parents/i] },
  { key: "setup", en: "Setup & onboarding", fr: "Installation & prise en main", patterns: [/installation/i, /prise en main/i, /d[eé]marr/i, /onboard/i] },
  { key: "reliability", en: "Reliability / bugs", fr: "Fiabilité / bugs", patterns: [/ne fonctionne pas/i, /fonctionne pas/i, /marche pas/i, /bug/i, /fait parfois des siennes/i] },
  { key: "feature_requests", en: "Feature requests", fr: "Demandes d’ajouts", patterns: [/ajouter/i, /ce serait bien/i, /am[eé]lior/i, /repas/i, /sieste/i, /changes?/i, /carnet de liaison/i, /brochures?/i] },
  { key: "support_speed", en: "Support responsiveness", fr: "Réactivité support", patterns: [/r[eé]actif/i, /support/i, /disponibil/i, /[eé]coute/i] },

];

const ENVOLA_BENEFIT_OPTIONS = [
  "Gain de temps",
  "Moins d’oublis ou d’erreurs d’horaires",
  "Relation plus fluide avec les parents",
  "Plus de clarté et de transparence",
  "Allègement de la charge mentale",
  "Les heures supplémentaires sont payées",
  "Plus de retards",
  "Professionnalisation de mon lieu d'accueil",
  "Other",
];

// Detect “Step 3 benefits” by question text (most reliable)
function isBenefitsMultiSelectAnswer(answer) {
  const qt = String(answer?.question_text || "").toLowerCase();
  return qt.includes("quels bénéfices") || qt.includes("bénéfices principaux");
}

function detectThemes(comment = "") {
  const text = String(comment || "").trim();
  if (!text) return [];
  const hits = [];
  for (const rule of THEME_RULES) {
    if (rule.patterns.some((re) => re.test(text))) hits.push(rule.key);
  }
  return hits;
}

function redactText(input) {
  let text = String(input || "").trim();
  if (!text) return "";

  // Emails
  text = text.replace(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    "[redacted email]"
  );

  // Phone numbers (broad, but practical)
  text = text.replace(
    /(\+?\d[\d\s().-]{7,}\d)/g,
    "[redacted phone]"
  );

  // URLs
  text = text.replace(
    /\bhttps?:\/\/[^\s]+/gi,
    "[redacted link]"
  );

  // Postcodes (UK + FR examples; safe-ish)
  text = text.replace(/\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/gi, "[redacted postcode]");
  text = text.replace(/\b\d{5}\b/g, "[redacted code]"); // FR 5-digit postcode

  // Long digit sequences (order numbers, IDs)
  text = text.replace(/\b\d{8,}\b/g, "[redacted id]");

  // Collapse whitespace
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

function truncate(text, max = 240) {
  const t = String(text || "");
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + "…";
}

function wordCount(text) {
  const t = String(text || "").trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

function scoreBucket(score) {
  if (typeof score !== "number") return "unknown";
  if (score >= 9) return "promoter";
  if (score >= 7) return "passive";
  return "detractor";
}

function intercomContactUrl(contactId) {
  const appId = process.env.ENVOLA_INTERCOM_APP_ID; // from Heroku config

  if (!appId || !contactId) return null;

  return `https://app.intercom.com/a/apps/${appId}/users/${contactId}`;
}



async function getDropboxAccessToken() {
  if (!DROPBOX_REFRESH_TOKEN) return LEGACY_DROPBOX_TOKEN || null;

  const now = Date.now() / 1000;
  if (cachedDropboxToken && now < cachedDropboxExpiry - 60) return cachedDropboxToken;

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
  cachedDropboxToken = data.access_token;
  cachedDropboxExpiry = now + (typeof data.expires_in === "number" ? data.expires_in : 4 * 60 * 60);
  return cachedDropboxToken;
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

  if (res.status === 409) return null; // not found
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

  // If we updated the clean NPS store, invalidate the in-memory cache.
  if (path === INTERCOM_NPS_RESPONSES_PATH) invalidateNpsResponsesCache();
}

async function appendDropboxJsonl(path, obj) {
  const existing = await readDropboxFile(path).catch(() => null);
  const line = JSON.stringify(obj) + "\n";
  const next = existing ? (existing.replace(/\n*$/, "") + "\n" + line) : line;
  await writeDropboxFile(path, next);
}

// Cached reader for the clean NPS responses JSONL store.
// This is the single biggest win for the Envola example page because the UI
// can call /private/nps-response dozens of times; without a cache we would
// download + parse the entire JSONL file for each request.
async function getCachedNpsResponsesStore({ force = false } = {}) {
  const c = __cache.npsResponses;
  const fresh = c.rows && c.byResponseId && Date.now() - c.fetchedAt < c.ttlMs;
  if (!force && fresh) return c;

  const text = await readDropboxFile(INTERCOM_NPS_RESPONSES_PATH).catch(() => null);
  const rows = text ? parseJsonl(text) : [];

  const byResponseId = new Map();
  for (const r of rows) {
    const rid = r?.response_id ? String(r.response_id) : null;
    if (rid) byResponseId.set(rid, r);
  }

  c.fetchedAt = Date.now();
  c.rows = rows;
  c.byResponseId = byResponseId;
  return c;
}

function verifyIntercomSignature({ rawBody, signatureHeader, clientSecret }) {
  if (!clientSecret) return { ok: false, reason: "Missing INTERCOM_CLIENT_SECRET" };
  if (!signatureHeader) return { ok: false, reason: "Missing X-Body-Signature" };

  // Intercom uses HMAC-SHA256 hex digest of the raw JSON body using OAuth client_secret
  const expected = crypto
    .createHmac("sha256", clientSecret)
    .update(rawBody)
    .digest("hex");

  const a = Buffer.from(String(signatureHeader), "utf8");
  const b = Buffer.from(String(expected), "utf8");

  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  return ok ? { ok: true } : { ok: false, reason: "Invalid signature" };
}

function toNumberIfNumeric(x) {
  if (x === null || x === undefined) return null;
  const n = Number(String(x).trim());
  return Number.isFinite(n) ? n : null;
}

function splitMultiSelect(text) {
  return String(text || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function looksLikeBenefitMultiSelect(text) {
  const parts = splitMultiSelect(text);
  if (parts.length < 2) return false;

  // If many parts match known options, it’s multi-select
  const hits = parts.filter((p) => ENVOLA_BENEFIT_OPTIONS.includes(p)).length;
  return hits >= 2 || hits === parts.length; // strong signal
}

function extractCommentsAndOptions(answers) {
  const out = {
    verbatims: [],        // [{ question_text, text }]
    selected_options: [], // ["Gain de temps", ...]
  };

  for (const a of answers || []) {
    const resp = a?.response;
    if (resp == null) continue;

    const s = String(resp).trim();
    if (!s) continue;

    // Skip numeric-only answers (ratings)
    const n = Number(s);
    if (Number.isFinite(n) && /^\d+(\.\d+)?$/.test(s)) continue;

    // Step 3 benefits: always treat as options
    if (isBenefitsMultiSelectAnswer(a) || looksLikeBenefitMultiSelect(s)) {
      out.selected_options.push(...splitMultiSelect(s));
      continue;
    }

    // Otherwise this is a real verbatim
    out.verbatims.push({
      question_text: String(a?.question_text || "").trim() || null,
      text: s,
    });
  }

  // Deduplicate options
  out.selected_options = Array.from(new Set(out.selected_options));

  return out;
}

function pickNpsScore(answers) {
  for (const a of answers || []) {
    const n = toNumberIfNumeric(a?.response);
    if (n !== null && n >= 0 && n <= 10) return n;
  }
  return null;
}

function pickFreeTextComment(answers) {
  const texts = (answers || [])
    .map((a) => (a?.response == null ? "" : String(a.response).trim()))
    .filter((t) => t.length > 0)
    .filter((t) => toNumberIfNumeric(t) === null); // exclude pure numbers
  if (!texts.length) return null;
  return texts.sort((a, b) => b.length - a.length)[0];
}

function parseJsonl(text) {
  if (!text) return [];
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      try { return JSON.parse(l); } catch { return null; }
    })
    .filter(Boolean);
}

function jsonlStringify(rows) {
  return rows.map((r) => JSON.stringify(r)).join("\n") + (rows.length ? "\n" : "");
}

function makeResponseId(e) {
  const contentId = String(e.content_id || "");
  const receiptId = String(e.receipt_id || "");
  return contentId && receiptId ? `${contentId}:${receiptId}` : null;
}

function normalizeCompletionEvent(e) {
  // answers_json is stored as a string currently
  let answers = [];
  try {
    answers = e.answers_json ? JSON.parse(e.answers_json) : [];
  } catch {
    answers = [];
  }

  const score = pickNpsScore(answers);

  const response_id = makeResponseId(e);
  if (!response_id) return null;

  const extracted = extractCommentsAndOptions(answers);

// keep a "primary" comment for legacy UI, but also store all verbatims
const primary = extracted.verbatims
  .map((v) => v.text)
  .sort((a, b) => b.length - a.length)[0] || null;

return {
  response_id,
  source: "intercom",
  content_id: String(e.content_id || ""),
  content_title: e.content_title || null,
  receipt_id: String(e.receipt_id || ""),
  submitted_at: e.received_at || new Date().toISOString(),

  score_0_10: score,

  // ✅ Primary (keeps older code working)
  comment: primary,

  // ✅ New structured fields
  verbatims: extracted.verbatims,          // array of {question_text, text}
  selected_options: extracted.selected_options, // array of options

  email: e.email || null,
  name: e.name || null,
  contact_id: e.contact_id || null,
  external_id: e.external_id || null,

  answers: Array.isArray(answers) ? answers : [],

  raw: { stat_type: e.stat_type || null, topic: e.topic || null },
};
}

async function ingestSurveyCompletionsToCleanStore() {
  const rawText = await readDropboxFile(INTERCOM_SURVEY_EVENTS_PATH).catch(() => null);
  const rawEvents = parseJsonl(rawText);

  // only completions (you already only persist completions, but safe)
  const completions = rawEvents.filter(
    (e) => String(e.stat_type || "").toLowerCase() === "completion"
  );

  // normalize
  const normalized = completions
    .map(normalizeCompletionEvent)
    .filter(Boolean);

  // Load existing clean store to dedupe/upsert
  const existingText = await readDropboxFile(INTERCOM_NPS_RESPONSES_PATH).catch(() => null);
  const existing = parseJsonl(existingText);

  const byId = new Map(existing.map((r) => [r.response_id, r]));
  for (const r of normalized) {
    // Upsert (newer wins if you want, here we just overwrite)
    byId.set(r.response_id, r);
  }

  const merged = Array.from(byId.values());

  // Sort newest first (string ISO sorts correctly)
  merged.sort((a, b) => String(b.submitted_at || "").localeCompare(String(a.submitted_at || "")));

  await writeDropboxFile(INTERCOM_NPS_RESPONSES_PATH, jsonlStringify(merged));
  return { ingested: normalized.length, total: merged.length, path: INTERCOM_NPS_RESPONSES_PATH };
}

function hex16(buf) {
  return Buffer.from(buf || [])
    .subarray(0, 16)
    .toString("hex")
    .match(/.{1,2}/g)
    ?.join(" ") || "";
}

function isZipBuffer(buf) {
  return buf && buf.length >= 4 && buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04;
}

function isGzipBuffer(buf) {
  return buf && buf.length >= 2 && buf[0] === 0x1f && buf[1] === 0x8b;
}

/**
 * Heuristic: is this buffer probably human-readable text?
 */
function looksLikeText(buf) {
  if (!buf || buf.length === 0) return false;
  const sample = buf.subarray(0, Math.min(buf.length, 200));
  let printable = 0;

  for (const b of sample) {
    // allow tab/newline/carriage return
    if (b === 9 || b === 10 || b === 13) {
      printable++;
      continue;
    }
    // printable ASCII range
    if (b >= 32 && b <= 126) printable++;
  }

  return printable / sample.length > 0.8;
}

/**
 * Decode Intercom export payload to CSV text.
 * Handles:
 * - ZIP (PK..)
 * - gzip/deflate (via unzipSync / gunzipSync)
 * - plain text CSV
 */
function decodeExportPayloadToCsvText(buf) {
  if (!buf || buf.length === 0) throw new Error("Intercom export download returned empty body");

  // 1) ZIP
  if (isZipBuffer(buf)) {
    const zip = new AdmZip(buf);
    const entries = zip.getEntries();

    const csvEntry =
      entries.find((e) => !e.isDirectory && String(e.entryName).toLowerCase().endsWith(".csv")) ||
      entries.find((e) => !e.isDirectory);

    if (!csvEntry) throw new Error("Intercom export ZIP contained no files");

    const fileBuf = csvEntry.getData();
    return fileBuf.toString("utf8");
  }

  // 2) gzip (fast-path)
  if (isGzipBuffer(buf)) {
    return zlib.gunzipSync(buf).toString("utf8");
  }

  // 3) deflate/gzip via unzipSync (works for Content-Encoding deflate/gzip)
  try {
    const out = zlib.unzipSync(buf);
    return out.toString("utf8");
  } catch {
    // not zlib-compressed
  }

  // 4) plain text
  if (looksLikeText(buf)) return buf.toString("utf8");

  throw new Error(`Intercom payload not decodable. First 16 bytes: ${hex16(buf)}`);
}

function pickHostFallback(url, host) {
  try {
    const u = new URL(url);
    u.host = host;
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * Download export CSV from Intercom.
 * Handles:
 * - 302/303 redirect to signed URL
 * - ZIP/gzip/deflate/plain CSV
 * - optional fallback to api.eu.intercom.io if 404
 */
async function downloadExportCsv(downloadUrl, { token }) {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/octet-stream",
    "Intercom-Version": INTERCOM_EXPORT_VERSION,
  };

  const tryOnce = async (url) => {
    const r = await fetch(url, { redirect: "manual", headers });

    if (INTERCOM_EXPORT_DEBUG) {
      console.log("[intercom] download status", r.status, "url", url);
      console.log("[intercom] content-type", r.headers.get("content-type"));
      console.log("[intercom] content-encoding", r.headers.get("content-encoding"));
    }

    // Intercom often redirects to a signed URL
    if (r.status >= 300 && r.status < 400) {
      const loc = r.headers.get("location");
      if (!loc) throw new Error("Intercom download redirect missing Location header");

      const fileResp = await fetch(loc); // signed URL usually needs no auth
      const buf = Buffer.from(await fileResp.arrayBuffer());

      if (INTERCOM_EXPORT_DEBUG) {
        console.log("[intercom] signed download status", fileResp.status);
        console.log("[intercom] signed first16", hex16(buf));
      }

      if (!fileResp.ok) {
        throw new Error(`File download failed: ${fileResp.status} ${buf.toString("utf8", 0, 400)}`);
      }

      return decodeExportPayloadToCsvText(buf);
    }

    const buf = Buffer.from(await r.arrayBuffer());

    if (INTERCOM_EXPORT_DEBUG) {
      console.log("[intercom] direct first16", hex16(buf));
    }

    if (!r.ok) {
      throw new Error(`Download failed: ${r.status} ${buf.toString("utf8", 0, 400)}`);
    }

    // IMPORTANT: use the same decoder here too (ZIP included)
    return decodeExportPayloadToCsvText(buf);
  };

  try {
    return await tryOnce(downloadUrl);
  } catch (e) {
    const msg = String(e?.message || "");
    if (msg.includes("404") && downloadUrl.includes("api.intercom.io")) {
      const euUrl = pickHostFallback(downloadUrl, "api.eu.intercom.io");
      return await tryOnce(euUrl);
    }
    throw e;
  }
}

export function createIntercomRouter() {
  const router = express.Router();
  const token = process.env.INTERCOM_ACCESS_TOKEN;

  // -----------------------
  // Protected ingest token
  // -----------------------
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

  // -----------------------
  // Auto-ingest settings (server-side only)
  // -----------------------
  const AUTO_INGEST_ENABLED = process.env.AUTO_INGEST_ENABLED === "1";
  const AUTO_INGEST_MIN_INTERVAL_MS = Number(
    process.env.AUTO_INGEST_MIN_INTERVAL_MS || 15 * 60 * 1000
  );
  const AUTO_EXPORT_HOURS = Number(process.env.AUTO_EXPORT_HOURS || 48);

  // -----------------------
  // Intercom export helpers
  // -----------------------
  async function createExportJob({ created_at_after, created_at_before }) {
    const r = await fetch("https://api.intercom.io/export/content/data", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "Intercom-Version": INTERCOM_EXPORT_VERSION,
      },
      body: JSON.stringify({ created_at_after, created_at_before }),
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`Export job create failed: ${r.status} ${JSON.stringify(data)}`);
    return data;
  }

  async function getExportJob(jobId) {
    const r = await fetch(`https://api.intercom.io/export/content/data/${jobId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Intercom-Version": INTERCOM_EXPORT_VERSION,
      },
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`Export job status failed: ${r.status} ${JSON.stringify(data)}`);
    return data;
  }

  // -----------------------
  // Export-stats ingest function (re-usable)
  // -----------------------
  async function ingestExportStats({ hours }) {
    const h = Math.min(Math.max(Number(hours || 72), 1), 720); // 1h..30d
    const now = Math.floor(Date.now() / 1000);

    const job = await createExportJob({
      created_at_after: now - h * 3600,
      created_at_before: now,
    });

    const jobId = job.job_identifier || job.job_identfier || job.id;
    if (!jobId) throw new Error("Missing job_identifier from Intercom export job create");

    // poll
    let status = null;
    for (let i = 0; i < 12; i++) {
      status = await getExportJob(jobId);
      const st = String(status.status || "").toLowerCase();
      if (["complete", "completed"].includes(st) && status.download_url) break;
      await new Promise((r) => setTimeout(r, 1500));
    }

    const st = String(status?.status || "").toLowerCase();
    if (!(["complete", "completed"].includes(st) && status.download_url)) {
      return { ok: true, job_identifier: jobId, status: status?.status || "pending" };
    }

    const csvText = await downloadExportCsv(status.download_url, { token });
    const records = parse(csvText, { columns: true, skip_empty_lines: true });

    const surveyRows = records.filter(
      (row) => String(row.content_type || "").toLowerCase() === "survey"
    );

    const existingText = await readDropboxFile(INTERCOM_SURVEY_STATS_PATH).catch(() => null);
    const existing = parseJsonl(existingText);

    const key = (r) => {
      const cid = String(r.content_id || "");
      const rid = String(r.receipt_id || "");
      const email = String(r.email || "");
      const received = String(r.received_at || "");
      return rid ? `${cid}:${rid}` : `${cid}:${email}:${received}`;
    };

    const map = new Map(existing.map((r) => [key(r), r]));
    for (const r of surveyRows) map.set(key(r), r);

    const merged = Array.from(map.values());
    merged.sort((a, b) => String(b.received_at || "").localeCompare(String(a.received_at || "")));

    await writeDropboxFile(INTERCOM_SURVEY_STATS_PATH, jsonlStringify(merged));

    return {
      ok: true,
      job_identifier: jobId,
      export_rows_total: records.length,
      export_survey_rows: surveyRows.length,
      total_stored: merged.length,
      path: INTERCOM_SURVEY_STATS_PATH,
    };
  }

  // -----------------------
  // Rebuild canonical NPS responses from Intercom export
  // Source of truth = export rows, not webhook rows
  // -----------------------
  function safeJsonParse(value, fallback = null) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function firstNonEmpty(...values) {
    for (const v of values) {
      if (v == null) continue;
      const s = String(v).trim();
      if (s) return s;
    }
    return null;
  }

  function exportRowResponseId(row) {
    const cid = String(row.content_id || "").trim();
    const rid = String(row.receipt_id || "").trim();
    if (cid && rid) return `${cid}:${rid}`;

    const email = String(row.email || "").trim().toLowerCase();
    const received = String(row.received_at || row.created_at || "").trim();
    if (cid && email && received) return `${cid}:${email}:${received}`;

    return null;
  }

  function normalizeExportSurveyRow(row) {
    const answers =
      safeJsonParse(row.answers_json, []) ||
      safeJsonParse(row.answers, []) ||
      [];

    const scoreFromAnswers = pickNpsScore(answers);
    const score =
      typeof row.score === "number"
        ? row.score
        : toNumberIfNumeric(row.score) ?? scoreFromAnswers;

    const extracted = extractCommentsAndOptions(answers);

    const primaryComment =
      firstNonEmpty(
        row.comment,
        ...extracted.verbatims.map((v) => v?.text)
      ) || null;

    const response_id = exportRowResponseId(row);
    if (!response_id) return null;

    return {
      response_id,
      source: "intercom_export",
      content_id: String(row.content_id || ""),
      content_title: row.content_title || null,
      receipt_id: String(row.receipt_id || ""),
      submitted_at: firstNonEmpty(row.received_at, row.created_at, row.submitted_at) || new Date().toISOString(),

      score_0_10: score,

      comment: primaryComment,

      verbatims: Array.isArray(extracted.verbatims) ? extracted.verbatims : [],
      selected_options: Array.isArray(extracted.selected_options) ? extracted.selected_options : [],

      email: row.email || null,
      name: row.name || null,
      contact_id: row.contact_id || null,
      external_id: row.external_id || null,

      answers: Array.isArray(answers) ? answers : [],

      raw: {
        stat_type: row.stat_type || null,
        topic: row.topic || null,
        export_received_at: row.received_at || null,
      },
    };
  }

  async function rebuildCanonicalNpsResponsesFromExport({ hours = 24 * 365, contentId = null } = {}) {
    const h = Math.min(Math.max(Number(hours || 24 * 365), 1), 24 * 365 * 3);
    const now = Math.floor(Date.now() / 1000);

    const job = await createExportJob({
      created_at_after: now - h * 3600,
      created_at_before: now,
    });

    const jobId = job.job_identifier || job.job_identfier || job.id;
    if (!jobId) throw new Error("Missing job_identifier from Intercom export job create");

    let status = null;
    for (let i = 0; i < 20; i++) {
      status = await getExportJob(jobId);
      const st = String(status.status || "").toLowerCase();
      if (["complete", "completed"].includes(st) && status.download_url) break;
      await new Promise((r) => setTimeout(r, 1500));
    }

    const st = String(status?.status || "").toLowerCase();
    if (!(["complete", "completed"].includes(st) && status.download_url)) {
      throw new Error(`Export job not complete yet (status: ${status?.status || "unknown"})`);
    }

    const csvText = await downloadExportCsv(status.download_url, { token });
    const records = parse(csvText, { columns: true, skip_empty_lines: true });

    let surveyRows = records.filter(
      (row) => String(row.content_type || "").toLowerCase() === "survey"
    );

    if (contentId) {
      surveyRows = surveyRows.filter(
        (row) => String(row.content_id || "") === String(contentId)
      );
    }

    const normalized = surveyRows
      .map(normalizeExportSurveyRow)
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
      if (newTs >= existingTs) byId.set(r.response_id, r);
    }

    const canonical = Array.from(byId.values()).sort((a, b) =>
      String(b.submitted_at || "").localeCompare(String(a.submitted_at || ""))
    );

    await writeDropboxFile(INTERCOM_NPS_RESPONSES_PATH, jsonlStringify(canonical));

    return {
      ok: true,
      job_identifier: jobId,
      export_rows_total: records.length,
      export_survey_rows: surveyRows.length,
      canonical_rows_written: canonical.length,
      path: INTERCOM_NPS_RESPONSES_PATH,
    };
  }

  // -----------------------
  // Auto-ingest if stale (server-side only, safe for public pages)
  // -----------------------
  async function autoIngestIfStale() {
    if (!AUTO_INGEST_ENABLED) return { ran: false, reason: "disabled" };

    const now = Date.now();
    const needNps = now - lastNpsIngestAt > AUTO_INGEST_MIN_INTERVAL_MS;
    const needExport = now - lastExportIngestAt > AUTO_INGEST_MIN_INTERVAL_MS;

    if (!needNps && !needExport) return { ran: false, reason: "fresh" };

    // stampede protection
    if (ingestLock) {
      await ingestLock;
      return { ran: false, reason: "waited" };
    }

    ingestLock = (async () => {
      try {
        if (needNps) {
          await ingestSurveyCompletionsToCleanStore();
          lastNpsIngestAt = Date.now();
        }
        if (needExport) {
          await ingestExportStats({ hours: AUTO_EXPORT_HOURS });
          lastExportIngestAt = Date.now();
        }
      } finally {
        ingestLock = null;
      }
    })();

    await ingestLock;
    return { ran: true, reason: "stale_refresh" };
  }

  // -----------------------
  // Protected ingest routes
  // -----------------------
  router.post("/ingest/export-stats", requireIngestToken, async (req, res) => {
    try {
      const out = await ingestExportStats({ hours: req.query.hours || 72 });
      return res.json(out);
    } catch (err) {
      console.error("[intercom] ingest export-stats error", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  router.post("/ingest/nps", requireIngestToken, async (_req, res) => {
    try {
      const out = await ingestSurveyCompletionsToCleanStore();
      return res.json({ ok: true, ...out });
    } catch (err) {
      console.error("[intercom] ingest nps error", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  router.post("/ingest/nps-rebuild-from-export", requireIngestToken, async (req, res) => {
  try {
    const out = await rebuildCanonicalNpsResponsesFromExport({
      hours: req.query.hours || 24 * 365,
      contentId: req.query.content_id || null,
    });

    return res.json(out);
  } catch (err) {
    console.error("[intercom] rebuild nps from export error", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

  // -----------------------
  // Webhooks (raw body for signature verification)
  // -----------------------
  const rawJson = express.raw({ type: ["application/json", "application/*+json"] });

  const webhookHandler = async (req, res) => {
    try {
      const secret = process.env.INTERCOM_WEBHOOK_SECRET;
      if (!secret) {
        return res.status(500).json({ ok: false, error: "INTERCOM_WEBHOOK_SECRET not configured" });
      }

      const sigSha1 = (req.get("X-Hub-Signature") || "").trim();
      const sigSha256 = (req.get("X-Hub-Signature-256") || "").trim(); // usually absent

      const raw = req.body; // Buffer

      const expectedSha1 = "sha1=" + crypto.createHmac("sha1", secret).update(raw).digest("hex");
      const expectedSha256 = "sha256=" + crypto.createHmac("sha256", secret).update(raw).digest("hex");

      const timingSafeEq = (a, b) => {
        const aa = Buffer.from(a);
        const bb = Buffer.from(b);
        return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
      };

      const ok =
        (sigSha1 && timingSafeEq(sigSha1, expectedSha1)) ||
        (sigSha256 && timingSafeEq(sigSha256, expectedSha256));

      if (!ok) return res.status(401).json({ ok: false, error: "Invalid signature" });

      const event = JSON.parse(raw.toString("utf8"));
      const item = event?.data?.item;
      const cs = item?.content_stat;
      const contact = item?.contact;
      const answers = Array.isArray(item?.answers) ? item.answers : [];

      const score = pickNpsScore(answers);
      const comment = pickFreeTextComment(answers);

      const record = {
        received_at: new Date().toISOString(),
        topic: event?.topic,
        content_id: cs?.content_id,
        receipt_id: cs?.receipt_id,
        stat_type: cs?.stat_type,
        content_title: cs?.content_title,
        contact_id: contact?.id,
        external_id: contact?.external_id,
        email: contact?.email,
        name: contact?.name,
        score,
        comment,
        answers_json: JSON.stringify(answers),
      };

      const isCompletion = String(record.stat_type || "").toLowerCase() === "completion";
      if (isCompletion) {
        await appendDropboxJsonl(INTERCOM_SURVEY_EVENTS_PATH, record);
      }

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("[intercom webhook] error", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  };

  router.post("/webhooks", rawJson, webhookHandler);
  router.post("/webhooks/surveys", rawJson, webhookHandler);
  router.get("/webhooks/surveys", (_req, res) => res.status(405).json({ ok: false, error: "POST only" }));

  // -----------------------
  // Public endpoints (aggregated, safe)
  // -----------------------

  router.get("/public/nps-summary", async (req, res) => {
    try {
      const contentId = String(req.query.content_id || "").trim();
      const days = Math.min(Math.max(Number(req.query.days || 30), 1), 365);
      if (!contentId) return res.status(400).json({ ok: false, error: "Missing content_id" });

      // Optional: keep your auto refresh behaviour (safe for public pages)
      const ingestInfo = await autoIngestIfStale().catch(() => null);
      res.set("X-NPSme-Auto-Ingest", ingestInfo?.ran ? ingestInfo.reason : "no");

      const text = await readDropboxFile(INTERCOM_NPS_RESPONSES_PATH).catch(() => null);
      const rows = parseJsonl(text);

      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

      const items = rows
        .filter((r) => String(r.content_id || "") === contentId)
        .filter((r) => {
          const t = Date.parse(r.submitted_at || "");
          return Number.isFinite(t) && t >= cutoff;
        })
        .filter((r) => typeof r.score_0_10 === "number" && r.score_0_10 >= 0 && r.score_0_10 <= 10);

      const total = items.length;
      const promoters = items.filter((r) => r.score_0_10 >= 9).length;
      const passives = items.filter((r) => r.score_0_10 >= 7 && r.score_0_10 <= 8).length;
      const detractors = items.filter((r) => r.score_0_10 <= 6).length;

      const nps = total ? Math.round(((promoters - detractors) / total) * 100) : null;

      const newest =
        items.map((r) => r.submitted_at).filter(Boolean).sort().slice(-1)[0] || null;

      const confidence =
        total >= 200 ? "high" : total >= 50 ? "medium" : total >= 10 ? "low" : "very_low";

      return res.json({
        ok: true,
        content_id: contentId,
        window_days: days,
        responses: total,
        promoters,
        passives,
        detractors,
        nps,
        confidence,
        newest_response_at: newest,
      });
    } catch (err) {
      console.error("[intercom] public nps-summary error", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  router.get("/public/nps-comments", async (req, res) => {
  try {
    const contentId = String(req.query.content_id || "").trim();
    const days = Math.min(Math.max(Number(req.query.days || 30), 1), 365);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 200);

    if (!contentId) return res.status(400).json({ ok: false, error: "Missing content_id" });

    const text = await readDropboxFile(INTERCOM_NPS_RESPONSES_PATH).catch(() => null);
    const rows = parseJsonl(text);

    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    const responses = rows
      .filter((r) => String(r.content_id || "") === contentId)
      .filter((r) => {
        const t = Date.parse(r.submitted_at || "");
        return Number.isFinite(t) && t >= cutoff;
      })
      .filter((r) => typeof r.score_0_10 === "number");

    const flat = [];
    for (const r of responses) {
      const vs = Array.isArray(r.verbatims) ? r.verbatims : [];
      for (const v of vs) {
        const raw = String(v?.text || "").trim();
        if (!raw) continue;

        const red = truncate(redactText(raw), 320);
        const wc = wordCount(red);

        flat.push({
          submitted_at: r.submitted_at || null,
          score_0_10: r.score_0_10,
          bucket: scoreBucket(r.score_0_10),
          question_text: v?.question_text || null,
          word_count: wc,
          is_substantive: wc >= 8,
          comment: red,
        });
      }
    }

    flat.sort((a, b) => String(b.submitted_at || "").localeCompare(String(a.submitted_at || "")));

    const returned = flat.slice(0, limit);
    const substantive = returned.filter((x) => x.is_substantive).length;

    return res.json({
      ok: true,
      content_id: contentId,
      window_days: days,
      returned: returned.length,
      substantive,
      comments: returned,
    });
  } catch (err) {
    console.error("[intercom] public nps-comments error", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

  function msBetween(aIso, bIso) {
    const a = Date.parse(aIso || "");
    const b = Date.parse(bIso || "");
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
    return b - a;
  }

  function median(values) {
    const nums = values
      .filter((x) => typeof x === "number" && Number.isFinite(x))
      .sort((a, b) => a - b);
    if (!nums.length) return null;
    const mid = Math.floor(nums.length / 2);
    return nums.length % 2 ? nums[mid] : Math.round((nums[mid - 1] + nums[mid]) / 2);
  }

  function formatDurationMs(ms) {
    if (ms == null) return null;
    const s = Math.round(ms / 1000);
    const m = Math.round(s / 60);
    if (m < 1) return `${s}s`;
    const h = Math.round(m / 60);
    if (h < 1) return `${m}m`;
    return `${h}h`;
  }

  router.get("/public/nps-response-rate", async (req, res) => {
    try {
      const contentId = String(req.query.content_id || "").trim();
      const days = Math.min(Math.max(Number(req.query.days || 30), 1), 365);
      if (!contentId) return res.status(400).json({ ok: false, error: "Missing content_id" });

      const text = await readDropboxFile(INTERCOM_SURVEY_STATS_PATH).catch(() => null);
      const rows = parseJsonl(text);

      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

      const items = rows
        .filter((r) => String(r.content_id || "") === contentId)
        .filter((r) => {
          const t = Date.parse(r.received_at || "");
          return Number.isFinite(t) && t >= cutoff;
        });

      const shown = items.length;
      const completed = items.filter((r) => String(r.first_completion || "").trim().length > 0).length;
      const responseRate = shown ? Math.round((completed / shown) * 1000) / 10 : null;

      const medAnswer = median(items.map((r) => msBetween(r.received_at, r.first_answer)).filter((x) => x != null));
      const medCompletion = median(items.map((r) => msBetween(r.received_at, r.first_completion)).filter((x) => x != null));

      return res.json({
        ok: true,
        content_id: contentId,
        window_days: days,
        shown,
        completed,
        response_rate_pct: responseRate,
        median_time_to_first_answer: formatDurationMs(medAnswer),
        median_time_to_completion: formatDurationMs(medCompletion),
      });
    } catch (err) {
      console.error("[intercom] public nps-response-rate error", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  router.get("/public/nps-themes", async (req, res) => {
    try {
      const contentId = String(req.query.content_id || "").trim();
      const days = Math.min(Math.max(Number(req.query.days || 30), 1), 365);
      const bucketsRaw = String(req.query.buckets || "").trim(); // e.g. "promoter,passive"

      if (!contentId) return res.status(400).json({ ok: false, error: "Missing content_id" });

      const allowedBuckets = new Set(
        ["promoter", "passive", "detractor"].filter((b) => {
          if (!bucketsRaw) return true; // if not provided, include all
          return bucketsRaw
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean)
            .includes(b);
        })
      );

      const text = await readDropboxFile(INTERCOM_NPS_RESPONSES_PATH).catch(() => null);
      const rows = parseJsonl(text);

      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

      const items = rows
        .filter((r) => String(r.content_id || "") === contentId)
        .filter((r) => {
          const t = Date.parse(r.submitted_at || "");
          return Number.isFinite(t) && t >= cutoff;
        })
        .filter((r) => typeof r.score_0_10 === "number")
        .filter((r) => allowedBuckets.has(scoreBucket(r.score_0_10)));

      const themeMap = new Map();
      for (const r of items) {
        const bucket = scoreBucket(r.score_0_10);
        const isDetractor = bucket === "detractor";

        const vs = Array.isArray(r.verbatims) ? r.verbatims : [];
        for (const v of vs) {
          const txt = String(v?.text || "").trim();
          if (!txt) continue;

          const ts = detectThemes(txt);
          for (const key of ts) {
            const cur =
              themeMap.get(key) || {
                theme: key,
                mentions: 0,
                totalScore: 0,
                detractorMentions: 0,
              };

            cur.mentions += 1;
            cur.totalScore += r.score_0_10;
            if (isDetractor) cur.detractorMentions += 1;

            themeMap.set(key, cur);
          }
        }
      }

      const themes = Array.from(themeMap.values())
        .map((x) => {
          const avg = x.mentions ? Math.round((x.totalScore / x.mentions) * 10) / 10 : null;

          // If detractors are not included, detractor share becomes meaningless -> null
          const detractorShare =
            allowedBuckets.has("detractor") && x.mentions
              ? Math.round((x.detractorMentions / x.mentions) * 1000) / 10
              : null;

          return {
            theme: x.theme,
            mentions: x.mentions,
            avg_score: avg,
            share_of_detractor_mentions: detractorShare,
          };
        })
        .sort((a, b) => b.mentions - a.mentions);

      return res.json({
        ok: true,
        content_id: contentId,
        window_days: days,
        responses: items.length,
        buckets: Array.from(allowedBuckets),
        themes,
      });
    } catch (err) {
      console.error("[intercom] public nps-themes error", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  // -----------------------
  // Public endpoint: Theme drill-down (safe)
  // -----------------------
  router.get("/public/nps-theme-comments", async (req, res) => {
    try {
      const contentId = String(req.query.content_id || "").trim();
      const theme = String(req.query.theme || "").trim();
      const days = Math.min(Math.max(Number(req.query.days || 30), 1), 365);
      const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 300);

      // Optional buckets filter, same semantics as /public/nps-themes
      const bucketsRaw = String(req.query.buckets || "").trim(); // "promoter,passive"
      const requestedBuckets = bucketsRaw
        ? bucketsRaw
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean)
        : null;

      if (!contentId) return res.status(400).json({ ok: false, error: "Missing content_id" });
      if (!theme) return res.status(400).json({ ok: false, error: "Missing theme" });

      // Validate theme key (prevents typos + makes behaviour predictable)
      const validThemeKeys = new Set(THEME_RULES.map((r) => r.key));
      if (!validThemeKeys.has(theme)) {
        return res.status(400).json({
          ok: false,
          error: "Invalid theme",
          valid_themes: Array.from(validThemeKeys),
        });
      }

      const allowedBuckets = new Set(
        ["promoter", "passive", "detractor"].filter((b) => {
          if (!requestedBuckets) return true;
          return requestedBuckets.includes(b);
        })
      );

      const text = await readDropboxFile(INTERCOM_NPS_RESPONSES_PATH).catch(() => null);
      const rows = parseJsonl(text);

      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

      const responses = rows
        .filter((r) => String(r.content_id || "") === contentId)
        .filter((r) => {
          const t = Date.parse(r.submitted_at || "");
          return Number.isFinite(t) && t >= cutoff;
        })
        .filter((r) => typeof r.score_0_10 === "number")
        .filter((r) => allowedBuckets.has(scoreBucket(r.score_0_10)));

      const matches = [];
      for (const r of responses) {
        const vs = Array.isArray(r.verbatims) ? r.verbatims : [];
        for (const v of vs) {
          const raw = String(v?.text || "").trim();
          if (!raw) continue;

          const themes = detectThemes(raw);
          if (!themes.includes(theme)) continue;

          const red = truncate(redactText(raw), 320);
          const wc = wordCount(red);

          matches.push({
            submitted_at: r.submitted_at || null,
            score_0_10: r.score_0_10,
            bucket: scoreBucket(r.score_0_10),
            question_text: v?.question_text || null,
            word_count: wc,
            is_substantive: wc >= 8,
            comment: red,
            // No PII, no contact ids on public endpoint
          });
        }
      }

      matches.sort((a, b) =>
        String(b.submitted_at || "").localeCompare(String(a.submitted_at || ""))
      );

      const returned = matches.slice(0, limit);
      const substantive = returned.filter((x) => x.is_substantive).length;

      return res.json({
        ok: true,
        content_id: contentId,
        theme,
        window_days: days,
        buckets: Array.from(allowedBuckets),
        matched: matches.length,
        returned: returned.length,
        substantive,
        comments: returned,
      });
    } catch (err) {
      console.error("[intercom] public nps-theme-comments error", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  // -----------------------
  // Public endpoint: NPS time series
  // -----------------------
  router.get("/public/nps-timeseries", async (req, res) => {
    try {
      const contentId = String(req.query.content_id || "").trim();
      if (!contentId) return res.status(400).json({ ok: false, error: "Missing content_id" });

      const granularity = String(req.query.granularity || "day").toLowerCase(); // day|week|month
      if (!["day", "week", "month"].includes(granularity)) {
        return res.status(400).json({ ok: false, error: "Invalid granularity (day|week|month)" });
      }

      const days = req.query.days != null ? Math.min(Math.max(Number(req.query.days || 30), 1), 3650) : null;

      const fromQ = String(req.query.from || "").trim(); // YYYY-MM-DD (optional)
      const toQ = String(req.query.to || "").trim();     // YYYY-MM-DD (optional)

      // Parse date range
      const parseYmdToMs = (ymd, endOfDay = false) => {
        if (!ymd) return null;
        // Interpret as UTC date
        const ms = Date.parse(endOfDay ? `${ymd}T23:59:59.999Z` : `${ymd}T00:00:00.000Z`);
        return Number.isFinite(ms) ? ms : null;
      };

      let fromMs = parseYmdToMs(fromQ, false);
      let toMs = parseYmdToMs(toQ, true);

      // If no explicit from/to, fall back to `days`
      if (fromMs == null || toMs == null) {
        const windowDays = days ?? 30;
        toMs = Date.now();
        fromMs = toMs - windowDays * 24 * 60 * 60 * 1000;
      }

      // Helpers
      const scoreBucket = (score) => {
        if (typeof score !== "number") return "unknown";
        if (score >= 9) return "promoter";
        if (score >= 7) return "passive";
        return "detractor";
      };

      const pad2 = (n) => String(n).padStart(2, "0");

      const ymdUTC = (ms) => {
        const d = new Date(ms);
        return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
      };

      // ISO week start (Monday) in UTC
      const weekStartYmdUTC = (ms) => {
        const d = new Date(ms);
        // Convert to “date only” (UTC)
        const day = d.getUTCDay(); // 0=Sun..6=Sat
        const diffToMonday = (day === 0 ? -6 : 1) - day;
        const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
        monday.setUTCDate(monday.getUTCDate() + diffToMonday);
        return `${monday.getUTCFullYear()}-${pad2(monday.getUTCMonth() + 1)}-${pad2(monday.getUTCDate())}`;
      };

      const monthStartYmdUTC = (ms) => {
        const d = new Date(ms);
        return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-01`;
      };

      const groupKey = (ms) => {
        if (granularity === "day") return ymdUTC(ms);
        if (granularity === "week") return weekStartYmdUTC(ms);
        return monthStartYmdUTC(ms);
      };

      // Load clean store
      const text = await readDropboxFile(INTERCOM_NPS_RESPONSES_PATH).catch(() => null);
      const rows = parseJsonl(text);

      // Filter rows
      const scored = rows
        .filter((r) => String(r.content_id || "") === contentId)
        .map((r) => {
          const t = Date.parse(r.submitted_at || "");
          return { ...r, _t: t };
        })
        .filter((r) => Number.isFinite(r._t))
        .filter((r) => r._t >= fromMs && r._t <= toMs)
        .filter((r) => typeof r.score_0_10 === "number" && r.score_0_10 >= 0 && r.score_0_10 <= 10);

      // Aggregate
      const map = new Map();
      for (const r of scored) {
        const key = groupKey(r._t);
        const cur = map.get(key) || { key, responses: 0, promoters: 0, passives: 0, detractors: 0 };

        cur.responses += 1;
        const b = scoreBucket(r.score_0_10);
        if (b === "promoter") cur.promoters += 1;
        else if (b === "passive") cur.passives += 1;
        else if (b === "detractor") cur.detractors += 1;

        map.set(key, cur);
      }

      const points = Array.from(map.values())
        .map((x) => {
          const nps = x.responses ? Math.round(((x.promoters - x.detractors) / x.responses) * 100) : null;
          return { date: x.key, nps, responses: x.responses, promoters: x.promoters, passives: x.passives, detractors: x.detractors };
        })
        .sort((a, b) => String(a.date).localeCompare(String(b.date)));

      return res.json({
        ok: true,
        content_id: contentId,
        granularity,
        from: ymdUTC(fromMs),
        to: ymdUTC(toMs),
        points,
      });
    } catch (err) {
      console.error("[intercom] public nps-timeseries error", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  router.get("/public/nps-responses", async (req, res) => {
    try {
      const contentId = String(req.query.content_id || "").trim();
      const granularity = String(req.query.granularity || "week").trim(); // day|week|month
      const date = String(req.query.date || "").trim(); // bucket start date, e.g. "2026-02-02"
      const limit = Math.min(Math.max(Number(req.query.limit || 200), 1), 500);

      if (!contentId) return res.status(400).json({ ok: false, error: "Missing content_id" });
      if (!date) return res.status(400).json({ ok: false, error: "Missing date" });

      const bucketStart = new Date(date);
      if (Number.isNaN(bucketStart.getTime())) {
        return res.status(400).json({ ok: false, error: "Invalid date" });
      }

      // Compute [start, end) of bucket in UTC to keep it stable
      const start = new Date(Date.UTC(bucketStart.getUTCFullYear(), bucketStart.getUTCMonth(), bucketStart.getUTCDate()));
      let end = null;

      if (granularity === "day") {
        end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 1);
      } else if (granularity === "month") {
        end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
      } else {
        // week (default): assume "date" is already the week start you emitted in /nps-timeseries
        end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 7);
      }

      const text = await readDropboxFile(INTERCOM_NPS_RESPONSES_PATH).catch(() => null);
      const rows = parseJsonl(text);

      const items = rows
        .filter((r) => String(r.content_id || "") === contentId)
        .filter((r) => typeof r.score_0_10 === "number")
        .filter((r) => {
          const t = Date.parse(r.submitted_at || "");
          return Number.isFinite(t) && t >= start.getTime() && t < end.getTime();
        })
        .sort((a, b) => String(b.submitted_at || "").localeCompare(String(a.submitted_at || "")))
        .slice(0, limit)
        .map((r) => ({
          // Keep this “semi-anonymous”: enough to cross-ref in Intercom, not direct PII
          response_id: r.response_id || null,
          receipt_id: r.receipt_id || null,
          contact_id: r.contact_id || null,
          submitted_at: r.submitted_at || null,
          score_0_10: r.score_0_10,
          bucket: scoreBucket(r.score_0_10),
          selected_options: Array.isArray(r.selected_options) ? r.selected_options : [],
          verbatims: Array.isArray(r.verbatims) ? r.verbatims : [],
          // Never include email/name on public endpoint
        }));

      // Summary (optional but handy for UI header)
      const total = items.length;
      const promoters = items.filter((x) => x.score_0_10 >= 9).length;
      const passives = items.filter((x) => x.score_0_10 >= 7 && x.score_0_10 <= 8).length;
      const detractors = items.filter((x) => x.score_0_10 <= 6).length;
      const nps = total ? Math.round(((promoters - detractors) / total) * 100) : null;

      return res.json({
        ok: true,
        content_id: contentId,
        granularity,
        bucket_start: start.toISOString().slice(0, 10),
        bucket_end: end.toISOString().slice(0, 10),
        responses: total,
        promoters,
        passives,
        detractors,
        nps,
        items,
      });
    } catch (err) {
      console.error("[intercom] public nps-responses error", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Private: Closing the loop queue (per Intercom contact_id)
  // Reads from clean-store JSONL and returns a prioritised action list.
  router.get("/private/closing-the-loop", requirePrivateCookie, async (req, res) => {
    try {
      const contentId = String(req.query.content_id || "").trim();
      if (!contentId) {
        return res.status(400).json({ ok: false, error: "content_id is required" });
      }

      const days = clampInt(req.query.days, 30, 1, 3650);
      const limit = clampInt(req.query.limit, 50, 1, 2000);

      // Pull from clean store (Dropbox JSONL)
      const text = await readDropboxFile(INTERCOM_NPS_RESPONSES_PATH).catch(() => null);
      const rows = parseJsonl(text);

      const since = Date.now() - days * 24 * 60 * 60 * 1000;

      // Group by contact_id
      const byContact = new Map();
      for (const r of rows) {
        if (!r) continue;
        if (String(r.content_id || "") !== contentId) continue;

        const submittedAt = r.submitted_at ? Date.parse(r.submitted_at) : NaN;
        if (!Number.isFinite(submittedAt) || submittedAt < since) continue;

        const contactId = r.contact_id ? String(r.contact_id) : "";
        if (!contactId) continue;

        const entry = byContact.get(contactId) || { contact_id: contactId, responses: [] };
        entry.responses.push(r);
        byContact.set(contactId, entry);
      }

      function extractTexts(resp) {
        const texts = [];
        const vs = Array.isArray(resp?.verbatims) ? resp.verbatims : [];
        for (const v of vs) {
          const t = typeof v?.text === "string" ? v.text.trim() : "";
          if (t) texts.push(t);
        }
        return texts;
      }

      function scoreRisk({ latestBucket, latestScore, themes, hasSubstantive }) {
        let risk = 0;

        if (latestBucket === "detractor") risk += 60;
        else if (latestBucket === "passive") risk += 25;
        else if (latestBucket === "promoter") risk += 5;

        if (typeof latestScore === "number") {
          risk += Math.max(0, 10 - latestScore) * 2; // 0..20
        }

        if (Array.isArray(themes) && themes.length) {
          risk += Math.min(20, themes.length * 4);
        }

        if (hasSubstantive) risk += 8;

        return risk;
      }

      function recommendAction(latestBucket, riskScore) {
        if (latestBucket === "detractor") return riskScore >= 80 ? "Call today" : "Message today";
        if (latestBucket === "passive") return "Follow up (ask what would improve)";
        if (latestBucket === "promoter") return "Thank them / ask for referral";
        return "Review";
      }

      const queue = [];
      for (const { contact_id, responses } of byContact.values()) {
        responses.sort((a, b) => Date.parse(a.submitted_at) - Date.parse(b.submitted_at));
        const latest = responses[responses.length - 1];

        const latestScore = typeof latest.score_0_10 === "number" ? latest.score_0_10 : null;
        const latestBucket =
          latestScore == null ? null : scoreBucket(latestScore);

        const texts = extractTexts(latest);
        const joined = texts.join(" ");
        const themes = joined ? Array.from(new Set(detectThemes(joined))) : [];

        const hasSubstantive = texts.some(
          (t) => t.split(/\s+/).filter(Boolean).length >= 8
        );

        const risk_score = scoreRisk({
          latestBucket,
          latestScore: latestScore == null ? undefined : latestScore,
          themes,
          hasSubstantive,
        });

        queue.push({
          contact_id,
          response_id: latest.response_id || null,
          intercom_contact_url: intercomContactUrl(contact_id),
          responses_count: responses.length,
          latest: {
            submitted_at: latest.submitted_at || null,
            date: latest.submitted_at ? toYmd(new Date(latest.submitted_at)) : null,
            score_0_10: latestScore,
            bucket: latestBucket,
            comment_excerpt: texts[0] ? String(texts[0]).slice(0, 220) : null,
          },
          themes,
          risk_score,
          recommendation: recommendAction(latestBucket, risk_score),
        });
      }

      queue.sort((a, b) => b.risk_score - a.risk_score);

      return res.json({
        ok: true,
        content_id: contentId,
        days,
        returned: Math.min(limit, queue.length),
        queue: queue.slice(0, limit),
      });
    } catch (e) {
      console.error("[intercom] private closing-the-loop error", e);
      return res.status(500).json({ ok: false, error: e?.message || String(e) });
    }
  });

  router.get("/private/nps-response", requirePrivateCookie, async (req, res) => {
    try {
      const responseId = String(req.query.response_id || "").trim();
      if (!responseId) return res.status(400).json({ ok: false, error: "response_id is required" });

      // Cached read + O(1) lookup (huge win when this route is called 40+ times on one page).
      const store = await getCachedNpsResponsesStore();
      const r = store.byResponseId?.get(responseId) || null;
      if (!r) return res.status(404).json({ ok: false, error: "Response not found" });

      const appId = process.env.ENVOLA_INTERCOM_APP_ID || "";
      const intercom_contact_url =
        appId && r.contact_id ? `https://app.intercom.com/a/apps/${appId}/users/${r.contact_id}` : null;

      return res.json({
        ok: true,
        response: {
          response_id: r.response_id || null,
          content_id: r.content_id || null,
          receipt_id: r.receipt_id || null,
          submitted_at: r.submitted_at || null,
          score_0_10: r.score_0_10 ?? null,
          bucket: scoreBucket(r.score_0_10),
          selected_options: Array.isArray(r.selected_options) ? r.selected_options : [],
          verbatims: Array.isArray(r.verbatims) ? r.verbatims : [],
          answers: Array.isArray(r.answers) ? r.answers : [], // optional but useful
          intercom_contact_url,
        },
      });
    } catch (err) {
      console.error("[intercom] private nps-response error", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Batch version to reduce waterfall requests (useful for "Average score per question").
  // Usage: /private/nps-responses?response_ids=189616:...,189616:...
  router.get("/private/nps-responses", requirePrivateCookie, async (req, res) => {
    try {
      const idsRaw = String(req.query.response_ids || "").trim();
      if (!idsRaw) return res.status(400).json({ ok: false, error: "response_ids is required" });

      const ids = idsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 300); // guardrail

      const store = await getCachedNpsResponsesStore();
      const items = ids.map((id) => store.byResponseId?.get(id) || null).filter(Boolean);

      const appId = process.env.ENVOLA_INTERCOM_APP_ID || "";
      const enriched = items.map((r) => {
        const intercom_contact_url =
          appId && r.contact_id ? `https://app.intercom.com/a/apps/${appId}/users/${r.contact_id}` : null;

        return {
          response_id: r.response_id || null,
          content_id: r.content_id || null,
          receipt_id: r.receipt_id || null,
          submitted_at: r.submitted_at || null,
          score_0_10: r.score_0_10 ?? null,
          bucket: scoreBucket(r.score_0_10),
          selected_options: Array.isArray(r.selected_options) ? r.selected_options : [],
          verbatims: Array.isArray(r.verbatims) ? r.verbatims : [],
          answers: Array.isArray(r.answers) ? r.answers : [],
          intercom_contact_url,
        };
      });

      return res.json({
        ok: true,
        requested: ids.length,
        returned: enriched.length,
        responses: enriched, // ✅ what the frontend expects
        // items: enriched,  // optional: keep temporarily if anything else uses it
      });
    } catch (err) {
      console.error("[intercom] private nps-responses(batch) error", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });


  router.get("/private/nps-by-question", requirePrivateCookie, async (req, res) => {
    try {
      const contentId = String(req.query.content_id || "").trim();
      if (!contentId) return res.status(400).json({ ok: false, error: "content_id is required" });

      const days = clampInt(req.query.days, 30, 1, 3650);
      const minResponses = clampInt(req.query.min_responses, 3, 1, 9999);
      const limit = clampInt(req.query.limit, 20, 1, 200);

      const text = await readDropboxFile(INTERCOM_NPS_RESPONSES_PATH).catch(() => null);
      const rows = parseJsonl(text);

      const since = Date.now() - days * 24 * 60 * 60 * 1000;

      // key: question_id (preferred) else question_text
      const byQ = new Map();

      function bump(questionId, questionText, bucket) {
        const qid = questionId != null ? String(questionId) : "";
        const qText = String(questionText || "").trim() || "—";
        const key = qid ? `id:${qid}` : `text:${qText}`;

        const cur =
          byQ.get(key) || {
            question_id: qid ? Number(questionId) : null,
            question: qText,
            promoters: 0,
            passives: 0,
            detractors: 0,
            responses: 0,
          };

        if (bucket === "promoter") cur.promoters += 1;
        else if (bucket === "passive") cur.passives += 1;
        else if (bucket === "detractor") cur.detractors += 1;

        cur.responses += 1;

        // Keep the nicest question text we’ve seen
        if (cur.question === "—" && qText !== "—") cur.question = qText;

        byQ.set(key, cur);
      }

      for (const r of rows) {
        if (!r) continue;
        if (String(r.content_id || "") !== contentId) continue;

        const submittedAt = r.submitted_at ? Date.parse(r.submitted_at) : NaN;
        if (!Number.isFinite(submittedAt) || submittedAt < since) continue;

        const score = typeof r.score_0_10 === "number" ? r.score_0_10 : null;
        if (score == null) continue;

        const bucket = scoreBucket(score);

        // Count once per response per question_id
        const seen = new Set();

        const answers = Array.isArray(r.answers) ? r.answers : [];
        for (const a of answers) {
          const qid = a?.question_id;
          const qText = a?.question_text;

          // Need at least some identifier
          const key = qid != null ? `id:${qid}` : `text:${String(qText || "").trim()}`;
          if (!key || key === "text:") continue;

          if (seen.has(key)) continue;
          seen.add(key);

          bump(qid, qText, bucket);
        }
      }

      const items = Array.from(byQ.values())
        .filter((x) => x.responses >= minResponses)
        .sort((a, b) => b.responses - a.responses)
        .slice(0, limit);

      return res.json({
        ok: true,
        content_id: contentId,
        days,
        returned: items.length,
        min_responses: minResponses,
        items,
      });
    } catch (e) {
      console.error("[intercom] private nps-by-question error", e);
      return res.status(500).json({ ok: false, error: e?.message || String(e) });
    }
  });

  // Private: Multi-select questions (aggregated)
  // Detects from r.answers so we keep question context.
  router.get("/private/nps-multi-select", requirePrivateCookie, async (req, res) => {
    try {
      const contentId = String(req.query.content_id || "").trim();
      if (!contentId) return res.status(400).json({ ok: false, error: "content_id is required" });

      const days = clampInt(req.query.days, 90, 1, 3650);
      const sample = clampInt(req.query.sample, 120, 10, 5000);
      const limit = clampInt(req.query.limit, 50, 1, 500);

      const store = await getCachedNpsResponsesStore(); // fast
      const rows = Array.isArray(store.rows) ? store.rows : [];

      const since = Date.now() - days * 24 * 60 * 60 * 1000;

      // key -> aggregated stats
      const byQ = new Map();

      function qKey(a) {
        const qid = a?.question_id != null ? String(a.question_id) : "";
        const qt = String(a?.question_text || "").trim();
        return qid ? `id:${qid}` : qt ? `text:${qt}` : null;
      }

      function ensureAgg(a) {
        const key = qKey(a);
        if (!key) return null;

        const qid = a?.question_id != null ? Number(a.question_id) : null;
        const qt = String(a?.question_text || "").trim() || "—";

        const cur =
          byQ.get(key) || {
            question_id: qid,
            question_text: qt,
            responses: 0,
            option_counts: {},     // option -> count
            example_response_ids: [],
            latest_submitted_at: null,
          };

        // Keep best text
        if (cur.question_text === "—" && qt !== "—") cur.question_text = qt;

        byQ.set(key, cur);
        return cur;
      }

      // Filter to window + sample newest
      const windowed = rows
        .filter((r) => String(r?.content_id || "") === contentId)
        .map((r) => ({ ...r, _t: Date.parse(r?.submitted_at || "") }))
        .filter((r) => Number.isFinite(r._t) && r._t >= since)
        .sort((a, b) => b._t - a._t)
        .slice(0, sample);

      for (const r of windowed) {
        const answers = Array.isArray(r?.answers) ? r.answers : [];
        for (const a of answers) {
          const raw = a?.response;
          if (raw == null) continue;

          const s = String(raw).trim();
          if (!s) continue;

          // Only treat as multi-select if we are confident it is
          const isMulti =
            isBenefitsMultiSelectAnswer(a) || looksLikeBenefitMultiSelect(s);

          if (!isMulti) continue;

          const opts = splitMultiSelect(s);
          if (opts.length < 2) continue; // must actually be multi-choice

          const agg = ensureAgg(a);
          if (!agg) continue;

          agg.responses += 1;
          agg.latest_submitted_at =
            agg.latest_submitted_at && String(agg.latest_submitted_at) > String(r.submitted_at || "")
              ? agg.latest_submitted_at
              : (r.submitted_at || agg.latest_submitted_at);

          for (const opt of opts) {
            agg.option_counts[opt] = (agg.option_counts[opt] || 0) + 1;
          }

          if (agg.example_response_ids.length < 25 && r.response_id) {
            agg.example_response_ids.push(r.response_id);
          }
        }
      }

      const items = Array.from(byQ.values())
        .map((q) => ({
          question_id: q.question_id,
          question_text: q.question_text,
          responses: q.responses,
          latest_submitted_at: q.latest_submitted_at,
          options: Object.entries(q.option_counts)
            .map(([option, count]) => ({ option, count }))
            .sort((a, b) => b.count - a.count),
          example_response_ids: q.example_response_ids,
        }))
        .sort((a, b) => b.responses - a.responses)
        .slice(0, limit);

      return res.json({
        ok: true,
        content_id: contentId,
        window_days: days,
        sample,
        returned: items.length,
        items,
        questions: items, // alias (handy if frontend uses a different name)
      });
    } catch (err) {
      console.error("[intercom] private nps-multi-select error", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });


  // -----------------------
  // Everything below requires an Intercom access token
  // -----------------------
  router.use((_req, res, next) => {
    if (!token) return res.status(500).json({ ok: false, error: "INTERCOM_ACCESS_TOKEN not configured" });
    next();
  });

  router.get("/ping", async (_req, res) => {
    try {
      const response = await fetch("https://api.intercom.io/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Intercom-Version": "2.14",
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return res.status(500).json({ ok: false, data });
      return res.json({ ok: true, app: data.app?.name, email: data.email });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  // (Optional) keep your existing export debug routes here if you still use them:
  // /survey-export/start, /survey-export/status/:jobId, /survey-export/parse/:jobId


router.get("/survey-export/start", async (req, res) => {
    try {
      const hours = Number(req.query.hours || 24);
      const now = Math.floor(Date.now() / 1000);

      const job = await createExportJob({
        created_at_after: now - hours * 3600,
        created_at_before: now,
      });

      const jobId = job.job_identifier || job.job_identfier || job.id;
      if (!jobId) return res.status(500).json({ ok: false, error: "Missing job_identifier", job });

      res.json({ ok: true, job_identifier: jobId, status: job.status || "pending", export_version: INTERCOM_EXPORT_VERSION });
    } catch (err) {
      console.error("[intercom] export start error", err);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  router.get("/survey-export/status/:jobId", async (req, res) => {
    try {
      const jobId = req.params.jobId;
      const status = await getExportJob(jobId);

      const st = String(status.status || "").toLowerCase();
      const done = ["complete", "completed"].includes(st);

      res.json({
        ok: true,
        job_identifier: jobId,
        status: status.status,
        done,
        has_download_url: !!status.download_url,
        progress: status,
        export_version: INTERCOM_EXPORT_VERSION,
      });
    } catch (err) {
      console.error("[intercom] export status error", err);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  router.get("/survey-export/parse/:jobId", async (req, res) => {
    try {
      const jobId = req.params.jobId;
      const surveyId = req.query.survey_id ? String(req.query.survey_id) : null;
      const limit = Math.min(Number(req.query.limit || 200), 2000);

      const status = await getExportJob(jobId);
      const st = String(status.status || "").toLowerCase();
      const done = ["complete", "completed"].includes(st);

      if (!(done && status.download_url)) {
        return res.json({ ok: true, job_identifier: jobId, status: status.status, progress: status });
      }

      const csvText = await downloadExportCsv(status.download_url, { token });
      const records = parse(csvText, { columns: true, skip_empty_lines: true });

      let surveyRows = records.filter(isLikelySurveyRow);
      if (surveyId) surveyRows = surveyRows.filter((row) => JSON.stringify(row).includes(surveyId));

      res.json({
        ok: true,
        job_identifier: jobId,
        status: "complete",
        total_rows: records.length,
        matched_rows: surveyRows.length,
        sample_headers: records[0] ? Object.keys(records[0]) : [],
        sample_rows: surveyRows.slice(0, limit),
        export_version: INTERCOM_EXPORT_VERSION,
      });
    } catch (err) {
      console.error("[intercom] export parse error", err);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  router.get("/debug/nps-missing-score", requireIngestToken, async (req, res) => {
    try {
      const contentId = String(req.query.content_id || "").trim();
      const days = Math.min(Math.max(Number(req.query.days || 30), 1), 365);
      if (!contentId) return res.status(400).json({ ok: false, error: "Missing content_id" });

      const text = await readDropboxFile(INTERCOM_NPS_RESPONSES_PATH).catch(() => null);
      const rows = parseJsonl(text);

      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

      const inWindow = rows
        .filter((r) => String(r.content_id || "") === contentId)
        .filter((r) => {
          const t = Date.parse(r.submitted_at || "");
          return Number.isFinite(t) && t >= cutoff;
        });

      const scored = inWindow.filter(
        (r) => typeof r.score_0_10 === "number" && r.score_0_10 >= 0 && r.score_0_10 <= 10
      );

      const missingScore = inWindow.filter(
        (r) => !(typeof r.score_0_10 === "number" && r.score_0_10 >= 0 && r.score_0_10 <= 10)
      );

      return res.json({
        ok: true,
        content_id: contentId,
        window_days: days,
        in_window_total: inWindow.length,
        scored_total: scored.length,
        missing_score_total: missingScore.length,
        missing_score_samples: missingScore.slice(0, 10).map((r) => ({
          response_id: r.response_id,
          submitted_at: r.submitted_at,
          score_0_10: r.score_0_10,
          comment_preview: String(r.comment || "").slice(0, 120),
        })),
      });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  });
  // =======================================================
  // PRIVATE — NPS RESPONSES EXPLORER
  // Uses the same clean Dropbox-backed JSONL store as the
  // existing private Intercom routes.
  // =======================================================

  router.get(
    "/private/nps-responses-explorer",
    requirePrivateCookie,
    async (req, res) => {
      try {
        const contentId = String(req.query.content_id || "189616").trim();
        const days = clampInt(req.query.days, 120, 1, 3650);
        const limit = clampInt(req.query.limit, 200, 1, 2000);

        if (!contentId) {
          return res.status(400).json({ ok: false, error: "content_id is required" });
        }

        console.log("[intercom] nps-responses-explorer start", {
          contentId,
          days,
          limit,
        });

        const text = await readDropboxFile(INTERCOM_NPS_RESPONSES_PATH).catch(() => null);
        const allRows = parseJsonl(text);

        const since = Date.now() - days * 24 * 60 * 60 * 1000;

        const responses = allRows
          .filter((r) => String(r?.content_id || "") === contentId)
          .filter((r) => {
            const t = Date.parse(r?.submitted_at || "");
            return Number.isFinite(t) && t >= since;
          })
          .sort((a, b) => String(b?.submitted_at || "").localeCompare(String(a?.submitted_at || "")))
          .slice(0, limit);

        // Build response history by contact
        const historyByContact = new Map();
        for (const r of responses) {
          const cid = r?.contact_id ? String(r.contact_id) : "";
          if (!cid) continue;
          const arr = historyByContact.get(cid) || [];
          arr.push(r);
          historyByContact.set(cid, arr);
        }

        const explorerRows = [];

        for (const r of responses) {
          const cid = r?.contact_id ? String(r.contact_id) : "";

          const previous = (historyByContact.get(cid) || [])
            .filter((x) => String(x?.response_id || "") !== String(r?.response_id || ""))
            .sort((a, b) =>
              String(a?.submitted_at || "").localeCompare(String(b?.submitted_at || ""))
            );

          const previousDates = previous.map((p) => p?.submitted_at).filter(Boolean);
          const previousLinks = previous.map((p) => p?.response_id).filter(Boolean);

          const answers = Array.isArray(r?.answers) ? r.answers : [];

          // helper
          const findAnswer = (qid) => {
            const a = answers.find(x => Number(x?.question_id) === qid);
            return a?.response ?? null;
          };

          explorerRows.push({
            response_id: r?.response_id || null,
            submitted_at: r?.submitted_at || null,
            nps_score: r?.score_0_10 ?? null,
            bucket: scoreBucket(r?.score_0_10),

            contact_id: cid || null,
            contact_name:
              r?.name ||
              r?.email ||
              r?.external_id ||
              (cid ? `Contact ${cid}` : "—"),

            intercom_contact_url: cid ? intercomContactUrl(cid) : null,

            pioupiou:
              r?.pioupiou_label ||
              r?.custom_attributes?.pioupiou_label ||
              "—",

            reader_serial:
              r?.reader_serial ||
              r?.custom_attributes?.reader_serial ||
              "—",

            previous_response_dates: previousDates,
            previous_response_links: previousLinks,

            // ⭐ flattened survey answers
            q_recommend_score: findAnswer(612560),
            q_recommend_comment: findAnswer(612565),

            q_install_score: findAnswer(612566),
            q_install_comment: findAnswer(612567),

            q_daily_use_score: findAnswer(612568),

            q_benefits: findAnswer(612570),

            q_parent_relation_score: findAnswer(612600),
            q_parent_relation_comment: findAnswer(612571),

            q_support_score: findAnswer(612601),
            q_final_comment: findAnswer(612603),

            selected_options: Array.isArray(r?.selected_options) ? r.selected_options : [],
          });
        }

        console.log("[intercom] nps-responses-explorer built", {
          responses: responses.length,
          rows: explorerRows.length,
        });

        return res.json({
          ok: true,
          content_id: contentId,
          days,
          rows: explorerRows,
          summary: {
            responses: responses.length,
            rows: explorerRows.length,
          },
        });
      } catch (e) {
        console.error("[intercom] nps-responses-explorer error", e);
        return res.status(500).json({
          ok: false,
          error: String(e?.message || e),
        });
      }
    }
  );
  return router;
}
