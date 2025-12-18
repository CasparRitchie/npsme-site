// intercom.routes.js
import express from "express";
import zlib from "zlib";
import { parse } from "csv-parse/sync";

export function createIntercomRouter() {
  const router = express.Router();

  const INTERCOM_HEADERS_JSON = {
    Authorization: `Bearer ${process.env.INTERCOM_ACCESS_TOKEN}`,
    Accept: "application/json",
    "Intercom-Version": "2.14",
    "Content-Type": "application/json",
  };

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function sniff(buf) {
    const b0 = buf?.[0], b1 = buf?.[1], b2 = buf?.[2], b3 = buf?.[3];
    return {
      isGzip: b0 === 0x1f && b1 === 0x8b,
      headHex: [b0, b1, b2, b3].map(x => (x ?? 0).toString(16).padStart(2, "0")).join(" "),
    };
  }

  async function createExportJob({ created_at_after, created_at_before }) {
    const r = await fetch("https://api.intercom.io/export/content/data", {
      method: "POST",
      headers: INTERCOM_HEADERS_JSON,
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
        Authorization: `Bearer ${process.env.INTERCOM_ACCESS_TOKEN}`,
        Accept: "application/json",
        "Intercom-Version": "2.14",
      },
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`Export job status failed: ${r.status} ${JSON.stringify(data)}`);
    return data;
  }

  async function downloadExportCsv(downloadUrl) {
    // IMPORTANT: Intercom download endpoint expects Accept: application/json (you saw the 406)
    const r = await fetch(downloadUrl, {
      redirect: "manual",
      headers: {
        Authorization: `Bearer ${process.env.INTERCOM_ACCESS_TOKEN}`,
        Accept: "application/json",
        "Intercom-Version": "2.14",
      },
    });

    // Common: 302/303 redirect to a signed URL
    if (r.status >= 300 && r.status < 400) {
      const loc = r.headers.get("location");
      if (!loc) throw new Error("Intercom download redirect missing Location header");

      const fileResp = await fetch(loc); // signed URL usually needs no auth
      const buf = Buffer.from(await fileResp.arrayBuffer());

      if (!fileResp.ok) {
        throw new Error(`File download failed: ${fileResp.status} ${buf.toString("utf8", 0, 500)}`);
      }

      const { isGzip } = sniff(buf);
      if (isGzip) return zlib.gunzipSync(buf).toString("utf8");

      // fallback gunzip attempt
      try { return zlib.gunzipSync(buf).toString("utf8"); } catch {}
      return buf.toString("utf8");
    }

    const contentType = (r.headers.get("content-type") || "").toLowerCase();
    const buf = Buffer.from(await r.arrayBuffer());

    if (!r.ok) {
      throw new Error(`Download failed: ${r.status} ${buf.toString("utf8", 0, 500)}`);
    }

    // Sometimes Intercom returns JSON with a url in-body
    if (contentType.includes("application/json")) {
      const json = JSON.parse(buf.toString("utf8") || "{}");
      const signedUrl = json.url || json.download_url || json.downloadUrl;
      if (!signedUrl) {
        throw new Error(`Intercom JSON download response missing url: ${JSON.stringify(json).slice(0, 500)}`);
      }

      const fileResp = await fetch(signedUrl);
      const fileBuf = Buffer.from(await fileResp.arrayBuffer());

      if (!fileResp.ok) {
        throw new Error(`File download failed: ${fileResp.status} ${fileBuf.toString("utf8", 0, 500)}`);
      }

      const { isGzip } = sniff(fileBuf);
      if (isGzip) return zlib.gunzipSync(fileBuf).toString("utf8");
      try { return zlib.gunzipSync(fileBuf).toString("utf8"); } catch {}
      return fileBuf.toString("utf8");
    }

    // Otherwise: bytes/text directly
    const { isGzip } = sniff(buf);
    if (isGzip) return zlib.gunzipSync(buf).toString("utf8");
    try { return zlib.gunzipSync(buf).toString("utf8"); } catch {}
    return buf.toString("utf8");
  }

  function isLikelySurveyRow(row) {
    const blob = JSON.stringify(row).toLowerCase();
    return blob.includes("survey") || blob.includes("nps");
  }

  // ---- Smoke test ----
  router.get("/ping", async (_req, res) => {
    try {
      const response = await fetch("https://api.intercom.io/me", {
        headers: {
          Authorization: `Bearer ${process.env.INTERCOM_ACCESS_TOKEN}`,
          Accept: "application/json",
          "Intercom-Version": "2.14",
        },
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) return res.status(500).json({ ok: false, data });

      res.json({ ok: true, app: data.app?.name, email: data.email });
    } catch (err) {
      console.error("[intercom] ping error", err);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // ---- Export: start ----
  router.get("/survey-export/start", async (req, res) => {
    try {
      const hours = Math.max(1, Number(req.query.hours || 24));
      const now = Math.floor(Date.now() / 1000);
      const created_at_before = now;
      const created_at_after = now - hours * 3600;

      const job = await createExportJob({ created_at_after, created_at_before });
      const jobId = job.job_identifier || job.job_identfier || job.id;

      if (!jobId) {
        return res.status(500).json({ ok: false, error: "Missing job_identifier", job });
      }

      res.json({
        ok: true,
        job_identifier: jobId,
        range: { created_at_after, created_at_before, hours },
        status: job.status || "pending",
      });
    } catch (err) {
      console.error("[intercom] export start error", err);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // ---- Export: status (SAFE: never downloads/parses) ----
  router.get("/survey-export/status/:jobId", async (req, res) => {
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
      });
    } catch (err) {
      console.error("[intercom] export status error", err);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // ---- Export: parse (HEAVY: call only when complete, limit output) ----
  router.get("/survey-export/parse/:jobId", async (req, res) => {
    try {
      const jobId = req.params.jobId;
      const surveyId = req.query.survey_id ? String(req.query.survey_id) : null;
      const limit = Math.min(Math.max(Number(req.query.limit || 200), 1), 1000);

      const status = await getExportJob(jobId);
      const s = String(status.status || "").toLowerCase();
      const done = ["complete", "completed"].includes(s);

      if (!(done && status.download_url)) {
        return res.status(409).json({ ok: false, error: "Export not ready", status: status.status });
      }

      const csvText = await downloadExportCsv(status.download_url);

      // Parse synchronously (still heavy) — keep response bounded with limit
      const records = parse(csvText, { columns: true, skip_empty_lines: true });

      let surveyRows = records.filter(isLikelySurveyRow);
      if (surveyId) surveyRows = surveyRows.filter((row) => JSON.stringify(row).includes(surveyId));

      const sample = surveyRows.slice(0, limit);

      res.json({
        ok: true,
        job_identifier: jobId,
        status: "complete",
        total_rows: records.length,
        matched_rows: surveyRows.length,
        returned_rows: sample.length,
        sample_headers: records[0] ? Object.keys(records[0]) : [],
        sample_rows: sample,
      });
    } catch (err) {
      console.error("[intercom] export parse error", err);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Optional: your “raw” convenience endpoint (start + poll + parse) — keep it, but it can still be heavy
  router.get("/survey-responses/raw", async (req, res) => {
    try {
      const hours = Math.max(1, Number(req.query.hours || 24));
      const limit = Math.min(Math.max(Number(req.query.limit || 200), 1), 1000);

      const now = Math.floor(Date.now() / 1000);
      const created_at_before = now;
      const created_at_after = now - hours * 3600;

      const job = await createExportJob({ created_at_after, created_at_before });
      const jobId = job.job_identifier || job.job_identfier || job.id;
      if (!jobId) return res.status(500).json({ ok: false, error: "Missing job_identifier", job });

      let status = job;
      for (let i = 0; i < 30; i++) {
        status = await getExportJob(jobId);
        const s = String(status.status || "").toLowerCase();
        const done = ["complete", "completed"].includes(s);
        if (done && status.download_url) break;
        if (s === "failed") return res.status(500).json({ ok: false, error: "Export job failed", status });
        await sleep(2000);
      }

      const s = String(status.status || "").toLowerCase();
      const done = ["complete", "completed"].includes(s);

      if (!(done && status.download_url)) {
        return res.json({ ok: true, job_identifier: jobId, status: status.status, progress: status });
      }

      const csvText = await downloadExportCsv(status.download_url);
      const records = parse(csvText, { columns: true, skip_empty_lines: true });

      const surveyRows = records.filter(isLikelySurveyRow).slice(0, limit);

      res.json({
        ok: true,
        job_identifier: jobId,
        range: { created_at_after, created_at_before, hours },
        total_rows: records.length,
        returned_rows: surveyRows.length,
        sample_headers: records[0] ? Object.keys(records[0]) : [],
        sample_rows: surveyRows,
      });
    } catch (err) {
      console.error("[intercom] survey raw export error", err);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  return router;
}
