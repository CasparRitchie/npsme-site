// intercom.routes.js
import zlib from "zlib";
import { parse } from "csv-parse/sync";

// Data-export endpoints behave best pinned to their own API version
const INTERCOM_EXPORT_VERSION = process.env.INTERCOM_EXPORT_VERSION || "2.7";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isGzipBuffer(buf) {
  return buf && buf.length >= 2 && buf[0] === 0x1f && buf[1] === 0x8b;
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
 * - gzipped CSV vs plain CSV
 * - fallback to api.eu.intercom.io if Intercom returns 404 (optional but handy)
 */
async function downloadExportCsv(downloadUrl, { token }) {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/octet-stream",
    "Intercom-Version": INTERCOM_EXPORT_VERSION,
  };

  const tryOnce = async (url) => {
    const r = await fetch(url, { redirect: "manual", headers });

    // Intercom often redirects to a signed URL
    if (r.status >= 300 && r.status < 400) {
      const loc = r.headers.get("location");
      if (!loc) throw new Error("Intercom download redirect missing Location header");

      const fileResp = await fetch(loc); // signed URL usually needs no auth
      const buf = Buffer.from(await fileResp.arrayBuffer());
      if (!fileResp.ok) {
        throw new Error(`File download failed: ${fileResp.status} ${buf.toString("utf8", 0, 400)}`);
      }

      return isGzipBuffer(buf) ? zlib.gunzipSync(buf).toString("utf8") : buf.toString("utf8");
    }

    const buf = Buffer.from(await r.arrayBuffer());

    if (!r.ok) {
      throw new Error(`Download failed: ${r.status} ${buf.toString("utf8", 0, 400)}`);
    }

    // Sometimes undici may already have decompressed; sniff before gunzip
    return isGzipBuffer(buf) ? zlib.gunzipSync(buf).toString("utf8") : buf.toString("utf8");
  };

  // First try as-is
  try {
    return await tryOnce(downloadUrl);
  } catch (e) {
    // If Intercom returns 404 here, it can be region-host weirdness.
    // Optional fallback: try EU host once.
    const msg = String(e?.message || "");
    if (msg.includes("404") && downloadUrl.includes("api.intercom.io")) {
      const euUrl = pickHostFallback(downloadUrl, "api.eu.intercom.io");
      return await tryOnce(euUrl);
    }
    throw e;
  }
}

export function registerIntercomRoutes(app) {
  const token = process.env.INTERCOM_ACCESS_TOKEN;

  // ---- Export helpers ----
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
    if (!r.ok) {
      throw new Error(`Export job create failed: ${r.status} ${JSON.stringify(data)}`);
    }
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
    if (!r.ok) {
      throw new Error(`Export job status failed: ${r.status} ${JSON.stringify(data)}`);
    }
    return data;
  }

  function isLikelySurveyRow(row) {
    const blob = JSON.stringify(row).toLowerCase();
    return blob.includes("survey") || blob.includes("nps");
  }

  // Guard (so you don’t crash prod silently)
  app.use("/api/intercom", (req, res, next) => {
    if (!token) return res.status(500).json({ ok: false, error: "INTERCOM_ACCESS_TOKEN not configured”" });
    next();
  });

  // Start export job
  app.get("/api/intercom/survey-export/start", async (req, res) => {
    try {
      const hours = Number(req.query.hours || 24);
      const now = Math.floor(Date.now() / 1000);

      const job = await createExportJob({
        created_at_after: now - hours * 3600,
        created_at_before: now,
      });

      const jobId = job.job_identifier || job.job_identfier || job.id;
      if (!jobId) return res.status(500).json({ ok: false, error: "Missing job_identifier", job });

      res.json({
        ok: true,
        job_identifier: jobId,
        status: job.status || "pending",
        export_version: INTERCOM_EXPORT_VERSION,
      });
    } catch (err) {
      console.error("[intercom] export start error", err);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Status only (no download)
  app.get("/api/intercom/survey-export/status/:jobId", async (req, res) => {
    try {
      const jobId = req.params.jobId;
      const status = await getExportJob(jobId);

      const s = String(status.status || "").toLowerCase();
      const done = ["complete", "completed"].includes(s);

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

  // Download + parse (your “parse” endpoint)
  app.get("/api/intercom/survey-export/parse/:jobId", async (req, res) => {
    try {
      const jobId = req.params.jobId;
      const surveyId = req.query.survey_id ? String(req.query.survey_id) : null;
      const limit = Math.min(Number(req.query.limit || 200), 2000);

      const status = await getExportJob(jobId);
      const s = String(status.status || "").toLowerCase();
      const done = ["complete", "completed"].includes(s);

      if (!(done && status.download_url)) {
        return res.json({ ok: true, job_identifier: jobId, status: status.status, progress: status });
      }

      const csvText = await downloadExportCsv(status.download_url, { token });

      const records = parse(csvText, { columns: true, skip_empty_lines: true });

      let surveyRows = records.filter(isLikelySurveyRow);
      if (surveyId) {
        surveyRows = surveyRows.filter((row) => JSON.stringify(row).includes(surveyId));
      }

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
}
