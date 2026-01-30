// intercom.routes.js
import express from "express";
import zlib from "zlib";
import AdmZip from "adm-zip";
import { parse } from "csv-parse/sync";
import crypto from "crypto";

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

let cachedDropboxToken = null;
let cachedDropboxExpiry = 0; // seconds

const THEME_RULES = [
  { key: "onboarding", en: "Onboarding", fr: "Onboarding", patterns: [/onboard/i, /mise en (route|place)/i, /d[eé]marr/i, /installation/i] },
  { key: "wifi", en: "Connectivity / WiFi", fr: "Connexion / WiFi", patterns: [/wifi/i, /connexion/i, /internet/i, /r[eé]seau/i] },
  { key: "support", en: "Support speed", fr: "Support", patterns: [/support/i, /réponse/i, /lenteur/i, /ticket/i] },
  { key: "billing", en: "Billing", fr: "Facturation", patterns: [/factur/i, /paiement/i, /prix/i, /tarif/i] },
  { key: "reliability", en: "Reliability", fr: "Fiabilité", patterns: [/bug/i, /plante/i, /crash/i, /marche pas/i, /fiab/i] },
];

function detectThemes(comment = "") {
  const text = String(comment || "").trim();
  if (!text) return [];
  const hits = [];
  for (const rule of THEME_RULES) {
    if (rule.patterns.some((re) => re.test(text))) hits.push(rule.key);
  }
  return hits;
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
}

async function appendDropboxJsonl(path, obj) {
  const existing = await readDropboxFile(path).catch(() => null);
  const line = JSON.stringify(obj) + "\n";
  const next = existing ? (existing.replace(/\n*$/, "") + "\n" + line) : line;
  await writeDropboxFile(path, next);
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
  const comment = pickFreeTextComment(answers);

  const response_id = makeResponseId(e);
  if (!response_id) return null;

  return {
    response_id,
    source: "intercom",
    content_id: String(e.content_id || ""),
    content_title: e.content_title || null,
    receipt_id: String(e.receipt_id || ""),

    submitted_at: e.received_at || new Date().toISOString(), // webhook received time (good enough v1)

    // Core NPS payload
    score_0_10: score,
    comment: comment,

    // Identity (keep for now; later you can move/limit this if needed)
    email: e.email || null,
    name: e.name || null,
    contact_id: e.contact_id || null,
    external_id: e.external_id || null,

    // Keep raw answers if useful for future NLP (optional)
    answers: Array.isArray(answers) ? answers : [],

    // lineage
    raw: {
      stat_type: e.stat_type || null,
      topic: e.topic || null,
    },
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
  function requireIngestToken(req, res, next) {
  const ingestToken = process.env.NPSME_INGEST_TOKEN;
  if (!ingestToken) return res.status(500).json({ ok: false, error: "NPSME_INGEST_TOKEN not configured" });

  // Use header to avoid leaking tokens in URLs
  const provided = (req.get("X-Ingest-Token") || "").trim();
  if (provided !== ingestToken) return res.status(401).json({ ok: false, error: "Unauthorized" });

  next();
}

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

router.post("/ingest/export-stats", requireIngestToken, async (req, res) => {
  try {
    const hours = Math.min(Math.max(Number(req.query.hours || 72), 1), 720); // up to 30 days
    const now = Math.floor(Date.now() / 1000);

    const job = await createExportJob({
      created_at_after: now - hours * 3600,
      created_at_before: now,
    });

    const jobId = job.job_identifier || job.job_identfier || job.id;
    if (!jobId) return res.status(500).json({ ok: false, error: "Missing job_identifier", job });

    // poll a few times (simple v1; we can improve later)
    let status = null;
    for (let i = 0; i < 12; i++) {
      status = await getExportJob(jobId);
      const st = String(status.status || "").toLowerCase();
      if (["complete", "completed"].includes(st) && status.download_url) break;
      await new Promise((r) => setTimeout(r, 1500));
    }

    const st = String(status?.status || "").toLowerCase();
    if (!(["complete", "completed"].includes(st) && status.download_url)) {
      return res.json({ ok: true, job_identifier: jobId, status: status?.status || "pending" });
    }

    const csvText = await downloadExportCsv(status.download_url, { token });
    const records = parse(csvText, { columns: true, skip_empty_lines: true });

    const surveyRows = records.filter((row) => String(row.content_type || "").toLowerCase() === "survey");

    // store as jsonl (append & dedupe by content_id:receipt_id)
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
    // sort newest first (received_at is ISO in export)
    merged.sort((a, b) => String(b.received_at || "").localeCompare(String(a.received_at || "")));

    await writeDropboxFile(INTERCOM_SURVEY_STATS_PATH, jsonlStringify(merged));

    return res.json({
      ok: true,
      job_identifier: jobId,
      export_rows_total: records.length,
      export_survey_rows: surveyRows.length,
      total_stored: merged.length,
      path: INTERCOM_SURVEY_STATS_PATH,
    });
  } catch (err) {
    console.error("[intercom] ingest export-stats error", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

router.post("/ingest/nps", requireIngestToken, async (_req, res) => {
  try {
    const out = await ingestSurveyCompletionsToCleanStore();
    res.json({ ok: true, ...out });
  } catch (err) {
    console.error("[intercom] ingest error", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});
  // ✅ Support BOTH endpoints so Intercom config can't 404 you again
  // IMPORTANT: use express.raw so we can verify the signature against the exact raw bytes.
    // Webhook receiver for Intercom (survey answers etc.)
  const webhookHandler = async (req, res) => {
  try {
    const secret = process.env.INTERCOM_WEBHOOK_SECRET;
    if (!secret) {
      return res
        .status(500)
        .json({ ok: false, error: "INTERCOM_WEBHOOK_SECRET not configured" });
    }

    const sigSha1 = (req.get("X-Hub-Signature") || "").trim();
    const sigSha256 = (req.get("X-Hub-Signature-256") || "").trim(); // usually absent for Intercom

    const raw = req.body; // Buffer because of express.raw

    const expectedSha1 =
      "sha1=" + crypto.createHmac("sha1", secret).update(raw).digest("hex");

    const expectedSha256 =
      "sha256=" + crypto.createHmac("sha256", secret).update(raw).digest("hex");

    const timingSafeEq = (a, b) => {
      const aa = Buffer.from(a);
      const bb = Buffer.from(b);
      return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
    };

    // Helpful debug (safe-ish)
    console.log("[intercom webhook] sig header sha1:", sigSha1 || "(missing)");
    console.log("[intercom webhook] sig header sha256:", sigSha256 || "(missing)");
    console.log("[intercom webhook] body len:", raw?.length || 0);
    console.log("[intercom webhook] computed sha1:", expectedSha1);

    const ok =
      (sigSha1 && timingSafeEq(sigSha1, expectedSha1)) ||
      (sigSha256 && timingSafeEq(sigSha256, expectedSha256));

    if (!ok) {
      console.log("[intercom webhook] signature mismatch", {
        has_sha1: !!sigSha1,
        has_sha256: !!sigSha256,
      });
      return res.status(401).json({ ok: false, error: "Invalid signature" });
    }

    // ✅ parse after signature verification
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

    console.log(
      "[intercom webhook] survey summary",
      JSON.stringify({
        topic: record.topic,
        receipt_id: record.receipt_id,
        content_id: record.content_id,
        email: record.email,
        score: record.score,
        comment_preview: (record.comment || "").slice(0, 120),
        answers_count: answers.length,
      })
    );

    console.log("[intercom webhook] received meta", {
      type: event?.type,
      topic: event?.topic,
      item_type: item?.type,
      content_stat_type: cs?.stat_type,
    });

    // ✅ Only persist COMPLETION events (the one that actually contains answers)
    const isCompletion = String(record.stat_type || "").toLowerCase() === "completion";
    if (isCompletion) {
      await appendDropboxJsonl(INTERCOM_SURVEY_EVENTS_PATH, record);
      console.log("[intercom webhook] saved to dropbox", {
        path: INTERCOM_SURVEY_EVENTS_PATH,
        receipt_id: record.receipt_id,
      });
    }

    // Optional raw dump, clipped
    if (process.env.INTERCOM_WEBHOOK_DEBUG === "1") {
      const dump = raw.toString("utf8");
      const max = 4000;
      const clipped = dump.length > max ? dump.slice(0, max) + "…(truncated)" : dump;
      console.log("[intercom webhook] raw event (clipped):", clipped);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[intercom webhook] error", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};
  const rawJson = express.raw({ type: ["application/json", "application/*+json"] });

  // ✅ Support both possible webhook URLs
  router.post("/webhooks", rawJson, webhookHandler);
  router.post("/webhooks/surveys", rawJson, webhookHandler);

  // Optional: make GET obvious
  router.get("/webhooks/surveys", (_req, res) =>
    res.status(405).json({ ok: false, error: "POST only" })
  );
  router.get("/public/nps-summary", async (req, res) => {
    try {
      const contentId = String(req.query.content_id || "").trim();
      const days = Math.min(Math.max(Number(req.query.days || 30), 1), 365);

      if (!contentId) {
        return res.status(400).json({ ok: false, error: "Missing content_id" });
      }

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

      const newest = items
        .map((r) => r.submitted_at)
        .filter(Boolean)
        .sort()
        .slice(-1)[0] || null;

      // Confidence badge purely from sample size (simple + honest)
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

  function msBetween(aIso, bIso) {
  const a = Date.parse(aIso || "");
  const b = Date.parse(bIso || "");
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return b - a;
}

function median(values) {
  const nums = values.filter((x) => typeof x === "number" && Number.isFinite(x)).sort((a, b) => a - b);
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

    const shown = items.length; // proxy: row exists => shown/received
    const completed = items.filter((r) => String(r.first_completion || "").trim().length > 0).length;

    const responseRate = shown ? Math.round((completed / shown) * 1000) / 10 : null;

    const toFirstAnswerMs = items
      .map((r) => msBetween(r.received_at, r.first_answer))
      .filter((x) => x != null);

    const toCompletionMs = items
      .map((r) => msBetween(r.received_at, r.first_completion))
      .filter((x) => x != null);

    const medAnswer = median(toFirstAnswerMs);
    const medCompletion = median(toCompletionMs);

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
    if (!contentId) return res.status(400).json({ ok: false, error: "Missing content_id" });

    const text = await readDropboxFile(INTERCOM_NPS_RESPONSES_PATH).catch(() => null);
    const rows = parseJsonl(text);

    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    const items = rows
      .filter((r) => String(r.content_id || "") === contentId)
      .filter((r) => {
        const t = Date.parse(r.submitted_at || "");
        return Number.isFinite(t) && t >= cutoff;
      })
      .filter((r) => typeof r.score_0_10 === "number");

    // theme stats
    const themeMap = new Map(); // key -> {count, detractors, totalScore}
    for (const r of items) {
      const themes = detectThemes(r.comment || "");
      const isDetractor = r.score_0_10 <= 6;

      for (const t of themes) {
        const cur = themeMap.get(t) || { theme: t, count: 0, detractors: 0, totalScore: 0 };
        cur.count += 1;
        cur.totalScore += r.score_0_10;
        if (isDetractor) cur.detractors += 1;
        themeMap.set(t, cur);
      }
    }

    const themes = Array.from(themeMap.values()).map((x) => ({
      theme: x.theme,
      mentions: x.count,
      avg_score: x.count ? Math.round((x.totalScore / x.count) * 10) / 10 : null,
      share_of_detractor_mentions: x.count ? Math.round((x.detractors / x.count) * 1000) / 10 : 0,
    }));

    themes.sort((a, b) => b.mentions - a.mentions);

    return res.json({
      ok: true,
      content_id: contentId,
      window_days: days,
      responses: items.length,
      themes,
    });
  } catch (err) {
    console.error("[intercom] public nps-themes error", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

  router.use((_req, res, next) => {
    if (!token) return res.status(500).json({ ok: false, error: "INTERCOM_ACCESS_TOKEN not configured" });
    next();
  });



  function isLikelySurveyRow(row) {
    return String(row.content_type || "").toLowerCase() === "survey";
  }

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


  return router;
}
