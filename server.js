// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";
import helmet from "helmet";
import fs from "fs";
import nodemailer from "nodemailer";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false, // TLS later
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// --- Social summary endpoint for npsme.com ---
app.get("/api/social-summary", async (req, res) => {
  try {
    const company = (req.query.company || "").trim();
    if (!company) {
      return res
        .status(400)
        .json({ error: "company query parameter is required" });
    }

    // For now we use small mocked snippets to keep the prompt tiny (cheap).
    // Later we can plug in real social/report data instead of this.
    const fakePosts = [
      {
        source: "twitter",
        text: `${company} support was really helpful and quick today.`,
      },
      {
        source: "twitter",
        text: `Not impressed with ${company}'s latest update, it feels buggy.`,
      },
      {
        source: "reddit",
        text: `Thinking of switching to ${company}. How good is their onboarding and support?`,
      },
    ];

    const snippets = fakePosts
      .slice(0, 10)
      .map((p) => `[${p.source}] ${p.text}`)
      .join("\n");

    const prompt = `
Summarise recent social/media sentiment for the company: ${company}.

Posts:
${snippets}

Return:
- Overall tone (positive/neutral/negative, with nuance)
- 2–4 key themes you're seeing
- Any clear CX 'delighters' or red flags relevant for NPS

Max 120 words. Neutral, professional tone.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini", // cheap + good
      max_tokens: 150,       // cost control
      temperature: 0.4,
      messages: [
        { role: "system", content: "You are a concise CX & NPS analyst." },
        { role: "user", content: prompt },
      ],
    });

    const summary =
      completion.choices?.[0]?.message?.content?.trim() ||
      "No summary available.";

    res.json({
      company,
      summary,
      samples: fakePosts,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error in /api/social-summary:", err);
    res
      .status(500)
      .json({ error: "Internal error generating social summary" });
  }
});


function generateInvitationId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `INV-${ts}-${rand}`;
}

async function sendInvitationEmail({ email, customerId, customerName, businessName, stage, surveyId }) {
  const name = customerName ? `Hi ${customerName},` : "Hi,";
  const invitationId = generateInvitationId();
  const surveyUrl = `https://www.npsme.com/demo-invitation-survey?inv=${encodeURIComponent(invitationId)}`;

  const subject = "We’d love your feedback (1–2 minutes)";

  const plainText = [
    `${name}`,
    "",
    "We’re running a short customer feedback survey to help improve our experience.",
    "It should take around 1–2 minutes.",
    "",
    `Take the survey: ${surveyUrl}`,
    "",
    "Thank you,",
    "NPS Me",
  ].join("\n");

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#0f172a">
      <p>${name}</p>
      <p>We’re running a short customer feedback survey to help improve our experience.</p>
      <p>It should take around <strong>1–2 minutes</strong>.</p>
      <p>
        <a href="${surveyUrl}"
           style="display:inline-block;padding:10px 18px;border-radius:999px;
                  background:#22c55e;color:#0f172a;text-decoration:none;font-weight:600;">
          Take the survey
        </a>
      </p>
      <p style="font-size:12px;color:#6b7280;margin-top:16px;">
        This invitation is linked to a unique reference so we can avoid pestering you with duplicate reminders.
        If this wasn’t intended for you, you can ignore it.
      </p>
      <p>Thank you,<br/>NPS Me</p>
    </div>
  `;
  return { invitationId, subject, plainText, html };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PROD = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3000;

// --- Adjust if you ever move away from www ---
const CANONICAL_HOST = "www.npsme.com";
const dist = path.join(__dirname, "dist");
const baseIndexHtml = fs.readFileSync(path.join(dist, "index.html"), "utf8");

// Needed behind Heroku/Cloudflare so req.ip / x-forwarded-proto work
app.set("trust proxy", 1);

// Core middleware
app.use(express.json());
app.use(compression());

// Security headers (CSP off so we don’t break your current inline styles/scripts)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

// HSTS (only in production)
if (PROD) {
  app.use(
    helmet.hsts({
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true,
    })
  );
}

// Redirect HTTP → HTTPS and non-canonical hosts → canonical host
app.use((req, res, next) => {
  if (!PROD) return next();

  const proto = req.headers["x-forwarded-proto"];
  const host = req.headers.host;

  if (proto !== "https") {
    return res.redirect(301, `https://${CANONICAL_HOST}${req.originalUrl}`);
  }

  if (host !== CANONICAL_HOST) {
    return res.redirect(301, `https://${CANONICAL_HOST}${req.originalUrl}`);
  }

  return next();
});

// ---- Dropbox token management (auto-refresh) ----
const DROPBOX_REFRESH_TOKEN = process.env.DROPBOX_REFRESH_TOKEN;
const DROPBOX_APP_KEY = process.env.DROPBOX_APP_KEY;
const DROPBOX_APP_SECRET = process.env.DROPBOX_APP_SECRET;

// Legacy fallback (short-lived token) – used only if no refresh token is configured
const LEGACY_DROPBOX_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;

const INVITATIONS_PATH =
  process.env.DROPBOX_INVITATIONS_PATH || "/npsme/invitations.csv";
const DEMO_RESPONSES_PATH =
  process.env.DROPBOX_DEMO_RESPONSES_PATH || "/npsme/demo-responses.csv";
const RESPONSES_PATH =
  process.env.DROPBOX_RESPONSES_PATH || "/npsme/responses.csv";

if (!DROPBOX_REFRESH_TOKEN && !LEGACY_DROPBOX_TOKEN) {
  console.warn(
    "[npsme] WARNING: No DROPBOX_REFRESH_TOKEN or DROPBOX_ACCESS_TOKEN set - Dropbox logging will fail."
  );
}

// In-memory cache for the current access token
let cachedDropboxToken = null;
let cachedDropboxExpiry = 0; // unix timestamp (seconds)

/**
 * Get a valid Dropbox access token.
 * - If refresh token is configured, use it to fetch/refresh short-lived tokens.
 * - If not, fall back to legacy DROPBOX_ACCESS_TOKEN (no auto-refresh).
 */
async function getDropboxAccessToken() {
  // No refresh token configured: use legacy static token as a fallback
  if (!DROPBOX_REFRESH_TOKEN) {
    if (!LEGACY_DROPBOX_TOKEN) {
      console.warn(
        "[npsme] No Dropbox token available; skipping Dropbox operations."
      );
      return null;
    }
    return LEGACY_DROPBOX_TOKEN;
  }

  const now = Date.now() / 1000;

  // If we have a cached token that's still valid (with 60s buffer), reuse it
  if (cachedDropboxToken && now < cachedDropboxExpiry - 60) {
    return cachedDropboxToken;
  }

  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", DROPBOX_REFRESH_TOKEN);
  params.append("client_id", DROPBOX_APP_KEY);
  params.append("client_secret", DROPBOX_APP_SECRET);

  const resp = await fetch("https://api.dropbox.com/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    console.error(
      `[npsme] Dropbox token refresh failed (${resp.status}):`,
      text
    );
    throw new Error(
      `Dropbox token refresh failed (${resp.status}): ${text || "no body"}`
    );
  }

  const data = await resp.json();
  cachedDropboxToken = data.access_token;
  const expiresIn =
    typeof data.expires_in === "number" ? data.expires_in : 4 * 60 * 60;
  cachedDropboxExpiry = now + expiresIn;

  return cachedDropboxToken;
}

// Small CSV escaper
function escapeCsv(value) {
  const v = value == null ? "" : String(value);
  if (/[",\n]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

async function readDropboxFile(path) {
  const token = await getDropboxAccessToken();
  if (!token) {
    console.warn("[npsme] readDropboxFile: no Dropbox token available.");
    return null;
  }

  const res = await fetch("https://content.dropboxapi.com/2/files/download", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Dropbox-API-Arg": JSON.stringify({ path }),
    },
  });

  if (res.status === 409) {
    // File not found
    return null;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Dropbox download failed (${res.status}): ${text}`);
  }

  return res.text();
}

async function writeDropboxFile(path, contents) {
  const token = await getDropboxAccessToken();
  if (!token) {
    console.warn("[npsme] writeDropboxFile: no Dropbox token available.");
    return;
  }

  const res = await fetch("https://content.dropboxapi.com/2/files/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/octet-stream",
      "Dropbox-API-Arg": JSON.stringify({
        path,
        mode: "overwrite",
        mute: true,
      }),
    },
    body: contents,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Dropbox upload failed (${res.status}): ${text}`);
  }
}

// Append a single invitation row into invitations.csv
async function appendInvitationRow(row) {
  if (!DROPBOX_REFRESH_TOKEN && !LEGACY_DROPBOX_TOKEN) {
    console.warn("[npsme] No Dropbox token configured; skipping ...");
    return;
  }

  const header =
  "invitationId,customerId,customerName,businessName,email,stage,surveyId,sentAt,resentCount,lastSentAt,status,responseId";

  const existing = await readDropboxFile(INVITATIONS_PATH).catch((err) => {
    console.error("[npsme] Error reading invitations.csv", err);
    return null;
  });

  const fields = [
    row.invitationId,
    row.customerId || "",
    row.customerName || "",
    row.businessName || "",
    row.email,
    row.stage || "",
    row.surveyId || "",
    row.sentAt,
    row.resentCount ?? 0,
    row.lastSentAt || row.sentAt,
    row.status || "sent",
    row.responseId || "",
  ];

  const line = fields.map(escapeCsv).join(",");

  const contents = existing
    ? `${existing.replace(/\n*$/, "")}\n${line}\n`
    : `${header}\n${line}\n`;

  await writeDropboxFile(INVITATIONS_PATH, contents);
}

// Parse invitations.csv into an array of objects
async function loadInvitations() {
  const csv = await readDropboxFile(INVITATIONS_PATH);
  if (!csv) return [];

  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];

  const header = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    const obj = {};
    header.forEach((h, i) => {
      obj[h] = cols[i] ?? "";
    });
    return obj;
  });
}

async function findInvitationById(invitationId) {
  const rows = await loadInvitations();
  return rows.find((r) => r.invitationId === invitationId) || null;
}

async function markInvitationResponded(invitationId, responseId) {
  const csv = await readDropboxFile(INVITATIONS_PATH);
  if (!csv) return;

  const lines = csv.trim().split("\n");
  if (lines.length < 2) return;

  const header = lines[0].split(",");
  const updatedLines = [lines[0]]; // keep header

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const rowObj = {};
    header.forEach((h, idx) => {
      rowObj[h] = cols[idx] ?? "";
    });

    if (rowObj.invitationId === invitationId) {
      rowObj.status = "responded";
      rowObj.responseId = responseId;
    }

    const updatedCols = header.map((h) => escapeCsv(rowObj[h] ?? ""));
    updatedLines.push(updatedCols.join(","));
  }

  const updatedCsv = updatedLines.join("\n") + "\n";
  await writeDropboxFile(INVITATIONS_PATH, updatedCsv);
}

function generateResponseId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `R-${ts}-${rand}`;
}

async function appendResponseRow(row) {
  if (!DROPBOX_REFRESH_TOKEN && !LEGACY_DROPBOX_TOKEN) {
    console.warn("[npsme] No Dropbox token configured; skipping ...");
    return;
  }

  const header = "responseId,invitationId,score,comment,createdAt";

  const existing = await readDropboxFile(RESPONSES_PATH).catch((err) => {
    console.error("[npsme] Error reading responses.csv", err);
    return null;
  });

  const fields = [
    row.responseId,
    row.invitationId || "",
    row.score,
    row.comment || "",
    row.createdAt,
  ];

  const line = fields.map(escapeCsv).join(",");

  const contents = existing
    ? `${existing.replace(/\n*$/, "")}\n${line}\n`
    : `${header}\n${line}\n`;

  await writeDropboxFile(RESPONSES_PATH, contents);
}

async function appendDemoResponseRow(row) {
  if (!DROPBOX_REFRESH_TOKEN && !LEGACY_DROPBOX_TOKEN) {
    console.warn("[npsme] No Dropbox token configured; skipping ...");
    return;
  }

  const header =
    "responseId,invitationId,customerId,customerName,email,stage,surveyId,type,score,comment,createdAt";

  const existing = await readDropboxFile(DEMO_RESPONSES_PATH).catch((err) => {
    console.error("[npsme] Error reading demo-responses.csv", err);
    return null;
  });

  const fields = [
    row.responseId,
    row.invitationId,
    row.customerId || "",
    row.customerName || "",
    row.email || "",
    row.stage || "",
    row.surveyId || "",
    row.type || "",
    row.score,
    row.comment || "",
    row.createdAt,
  ];

  const line = fields.map(escapeCsv).join(",");

  const contents = existing
    ? `${existing.replace(/\n*$/, "")}\n${line}\n`
    : `${header}\n${line}\n`;

  await writeDropboxFile(DEMO_RESPONSES_PATH, contents);
}

// --- CSV parser for demo responses (handles quoted fields) ---
function splitCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      // Toggle quotes, but handle escaped quotes ("")
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip the second quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
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
  const lines = csvText.trim().split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const header = splitCsvLine(lines[0]).map((h) => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const obj = {};
    header.forEach((h, idx) => {
      let value = cols[idx] ?? "";
      // Unwrap quotes & unescape
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(/""/g, '"');
      }
      obj[h] = value;
    });
    rows.push(obj);
  }

  return rows;
}

// --- Demo API (in-memory) ---
let demoResponses = [];

app.post("/api/demo/response", async (req, res) => {
  try {
    const { score, comment, invitationId } = req.body || {};

    if (typeof score !== "number" || score < 0 || score > 10) {
      return res.status(400).json({ error: "Invalid score" });
    }

    const trimmedComment = (comment || "").slice(0, 500);

    // Keep the in-memory demo metric for the homepage widget
    demoResponses.push({ score, comment: trimmedComment, ts: Date.now() });

    // Log to Dropbox for later analysis
    const responseId = generateResponseId();
    const createdAt = new Date().toISOString();

    await appendResponseRow({
      responseId,
      invitationId: invitationId || "",
      score,
      comment: trimmedComment,
      createdAt,
    });

    res.json({ ok: true, responseId });
  } catch (err) {
    console.error("[npsme] Error in /api/demo/response", err);
    res.status(500).json({ error: "Failed to save response" });
  }
});

app.get("/api/demo/metrics", (_req, res) => {
  if (!demoResponses.length) return res.json({ nps: null, count: 0 });
  const promoters = demoResponses.filter((r) => r.score >= 9).length;
  const detractors = demoResponses.filter((r) => r.score <= 6).length;
  const total = demoResponses.length;
  const nps = Math.round(((promoters - detractors) / total) * 100);
  res.json({ nps, count: total });
});

app.post("/api/intake", (req, res) => {
  console.log("INTAKE", req.body);
  res.json({ ok: true });
});

app.get("/sitemap.xml", (_req, res) => {
  res.set("Cache-Control", "public, max-age=0");
  res.sendFile(path.join(__dirname, "public", "sitemap.xml"));
});

// Health check
app.get("/healthz", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.type("text/plain").send("ok");
});
app.head("/healthz", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.status(200).end();
});

app.post("/api/send-test-email", async (req, res) => {
  const { to } = req.body;

  try {
    const info = await mailer.sendMail({
      from: `"NPS Me" <hello@npsme.com>`,
      to,
      subject: "NPS Me SMTP Test",
      text: "This is a test email from the NPS Me server. Everything works!",
    });

    res.json({ ok: true, info });
  } catch (err) {
    console.error("SMTP ERROR", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post("/api/send-invitation", async (req, res) => {
  try {
    const { email, customerId, customerName, businessName, stage, surveyId } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Build content + ID
    const { subject, plainText, html, invitationId } = await sendInvitationEmail({
      email,
      customerId,
      customerName,
      businessName,
      stage,
      surveyId,
    });

    const sentAt = new Date().toISOString();

    // 1) Log to Dropbox
    await appendInvitationRow({
      invitationId,
      customerId,
      customerName,
      businessName,
      email,
      stage,
      surveyId,
      sentAt,
      resentCount: 0,
      lastSentAt: sentAt,
      status: "sent",
      responseId: "",
    });

    // 2) Send email via Zoho (single send)
    const info = await mailer.sendMail({
      from: '"NPS Me" <hello@npsme.com>',
      to: email,
      bcc: "hello@npsme.com",
      subject,
      text: plainText,
      html,
    });

    res.json({
      ok: true,
      invitationId,
      messageId: info.messageId,
    });
  } catch (err) {
    console.error("[npsme] Error in /api/send-invitation", err);
    res.status(500).json({ error: "Failed to send invitation" });
  }
});


// Validate a demo survey link
app.get("/api/demo-survey/lookup", async (req, res) => {
  try {
    const inv = req.query.inv;
    if (!inv) {
      return res.status(400).json({ error: "Missing invitation id" });
    }

        const invitation = await findInvitationById(inv);
    if (!invitation) {
      return res.status(404).json({ error: "Invitation not found" });
    }

    // Be defensive: treat as responded only if status is "responded"
    // OR responseId is present and non-empty
    const status = (invitation.status || "").toLowerCase().trim();
    const responseId =
      typeof invitation.responseId === "string"
        ? invitation.responseId.trim()
        : invitation.responseId;

    const alreadyResponded =
      status === "responded" || (responseId && responseId !== "");

    if (alreadyResponded) {
      return res.status(409).json({ error: "Invitation already responded" });
    }

    return res.json({
      ok: true,
      invitation: {
        invitationId: invitation.invitationId,
        customerId: invitation.customerId || "",
        customerName: invitation.customerName || "",
        businessName: invitation.businessName || "",
        email: invitation.email || "",
        stage: invitation.stage || "",
        surveyId: invitation.surveyId || "",
      },
    });
  } catch (err) {
    console.error("[npsme] Error in /api/demo-survey/lookup", err);
    res.status(500).json({ error: "Lookup failed" });
  }
});

// Submit a demo survey response
app.post("/api/demo-survey/submit", async (req, res) => {
  try {
    const { invitationId, score, comment } = req.body || {};

    if (!invitationId || typeof score !== "number" || score < 0 || score > 10) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const invitation = await findInvitationById(invitationId);
    if (!invitation) {
      return res.status(404).json({ error: "Invitation not found" });
    }
    if (invitation.responseId) {
      return res.status(409).json({ error: "Invitation already responded" });
    }

    // Decide whether this is an overall NPS or milestone NPS response
    const rawStage = (invitation.stage || "").toLowerCase().trim();

    const type =
      !rawStage || rawStage === "overall"
        ? "overall"
        : "milestone";

    const responseId = `RESP-${Date.now().toString(36).toUpperCase()}`;
    const createdAt = new Date().toISOString();

    await appendDemoResponseRow({
      responseId,
      invitationId,
      customerId: invitation.customerId || "",
      customerName: invitation.customerName || "",
      email: invitation.email || "",
      stage: invitation.stage || "",
      surveyId: invitation.surveyId || "",
      type, // 👈 NEW FIELD, matches the header we added
      score,
      comment: (comment || "").slice(0, 1000),
      createdAt,
    });

    await markInvitationResponded(invitationId, responseId);

    res.json({ ok: true, responseId });
  } catch (err) {
    console.error("[npsme] Error in /api/demo-survey/submit", err);
    res.status(500).json({ error: "Failed to save response" });
  }
});

// Load all demo responses (for the demo dashboard)
app.get("/api/demo-responses", async (req, res) => {
  try {
    const csv = await readDropboxFile(DEMO_RESPONSES_PATH).catch((err) => {
      console.error("[npsme] Error reading demo-responses.csv", err);
      return null;
    });

    if (!csv) {
      return res.json({ rows: [] });
    }

    const rows = parseCsvWithHeader(csv);

    // Optionally normalise score + createdAt types here
    const normalised = rows.map((r) => ({
      ...r,
      score: r.score !== undefined && r.score !== "" ? Number(r.score) : null,
      createdAt: r.createdAt || r.createdAt,
    }));

    res.json({ rows: normalised });
  } catch (err) {
    console.error("[npsme] Error in /api/demo-responses", err);
    res.status(500).json({ error: "Failed to load demo responses" });
  }
});

// ---------- Static assets & caching ----------

// Long cache for hashed assets (Vite puts them in /assets)
app.use(
  "/assets",
  express.static(path.join(dist, "assets"), { maxAge: "1y", immutable: true })
);

// Short cache for other static assets
app.use(
  express.static(dist, {
    maxAge: "1h",
    index: false,
  })
);

// ---------- Inject canonical + og:url for SEO ----------
app.get("*", (req, res) => {
  res.set("Cache-Control", "no-store, must-revalidate");

  const pathOnly = req.originalUrl.split("?")[0] || "/";
  const fullUrl = `https://${CANONICAL_HOST}${pathOnly}`;

  let html = baseIndexHtml;

  // Replace or insert canonical tag
  if (html.match(/<link\s+rel=["']canonical["'][^>]*>/i)) {
    html = html.replace(
      /<link\s+rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${fullUrl}" />`
    );
  } else {
    html = html.replace(
      /<\/head>/i,
      `  <link rel="canonical" href="${fullUrl}" />\n</head>`
    );
  }

  // Replace or insert og:url
  if (html.match(/<meta\s+property=["']og:url["'][^>]*>/i)) {
    html = html.replace(
      /<meta\s+property=["']og:url["'][^>]*>/i,
      `<meta property="og:url" content="${fullUrl}" />`
    );
  } else {
    html = html.replace(
      /<\/head>/i,
      `  <meta property="og:url" content="${fullUrl}" />\n</head>`
    );
  }

  res.type("html").send(html);
});

app.listen(PORT, () => {
  console.log(`NPS Me running on :${PORT} (${PROD ? "prod" : "dev"})`);
});
