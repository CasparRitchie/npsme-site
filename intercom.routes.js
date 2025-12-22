// intercom.routes.js
import express from "express";
import zlib from "zlib";
import AdmZip from "adm-zip";
import { parse } from "csv-parse/sync";
import crypto from "crypto";

// Data-export endpoints behave best pinned to their own API version
const INTERCOM_EXPORT_VERSION = process.env.INTERCOM_EXPORT_VERSION || "2.7";
const INTERCOM_EXPORT_DEBUG = process.env.INTERCOM_EXPORT_DEBUG === "1";

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

  // ✅ Support BOTH endpoints so Intercom config can't 404 you again
  // IMPORTANT: use express.raw so we can verify the signature against the exact raw bytes.
    // Webhook receiver for Intercom (survey answers etc.)
  const webhookHandler = (req, res) => {
  try {
    const secret = process.env.INTERCOM_WEBHOOK_SECRET;
    if (!secret) {
      return res
        .status(500)
        .json({ ok: false, error: "INTERCOM_WEBHOOK_SECRET not configured" });
    }

    // Intercom signature headers (can be sha1, sometimes also sha256 depending on config/version)
    const sigSha1 = req.get("X-Hub-Signature") || "";
    const sigSha256 = req.get("X-Hub-Signature-256") || "";

    // Because this route uses express.raw({ type: "application/json" })
    const raw = req.body; // Buffer

    // Compute expected signatures from raw bytes
    const expectedSha1 =
      "sha1=" + crypto.createHmac("sha1", secret).update(raw).digest("hex");
    const expectedSha256 =
      "sha256=" + crypto.createHmac("sha256", secret).update(raw).digest("hex");

    // TEMP debug: hashes only (safe-ish)
    console.log("[intercom webhook] sig header sha1:", sigSha1);
    console.log("[intercom webhook] sig header sha256:", sigSha256 ? "(present)" : "(missing)");
    console.log("[intercom webhook] body len:", raw?.length || 0);
    console.log("[intercom webhook] computed sha1:", expectedSha1);
    if (sigSha1) console.log("[intercom webhook] received sha1:", sigSha1);

    const timingSafeEq = (a, b) => {
      const aa = Buffer.from(a);
      const bb = Buffer.from(b);
      return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
    };

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

    // Parse JSON AFTER signature check
    const event = JSON.parse(raw.toString("utf8"));

    console.log("[intercom webhook] received", {
      type: event?.type,
      topic: event?.topic,
      item_type: event?.data?.item?.type,
      item_id: event?.data?.item?.id,
    });

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

  router.use((_req, res, next) => {
    if (!token) return res.status(500).json({ ok: false, error: "INTERCOM_ACCESS_TOKEN not configured" });
    next();
  });

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

  function isLikelySurveyRow(row) {
    const blob = JSON.stringify(row).toLowerCase();
    return blob.includes("survey") || blob.includes("nps");
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
