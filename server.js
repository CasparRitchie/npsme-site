// server.js
import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";
import helmet from "helmet";
import fs from "fs";
import nodemailer from "nodemailer";
import OpenAI from "openai";
import rateLimit from "express-rate-limit";
import { LRUCache } from "lru-cache";
import crypto from "crypto";
import { supabaseAdmin } from "./supabaseClient.js";
import cookieParser from "cookie-parser";

import {
  changeWorkspacePassword,
  clearWorkspaceAuthCookie,
  getWorkspaceAuth,
  loginWorkspaceUser,
  requireWorkspaceAuth,
} from "./utils/workspaceAuth.js";
import { createIntercomRouter } from "./intercom.routes.js";
import { createEnvolaRouter } from "./envola.routes.js";
import { createCsvNpsRouter } from "./csvNps.routes.js";
import { createNpsDataRouter } from "./npsData.routes.js";

// Rate limit: tune as you like
const socialSummaryLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,             // 10 req/min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Rate limit exceeded. Please try again shortly." },
});

// Cache results to reduce cost
const socialCache = new LRUCache({
  max: 500,                 // store up to 500 companies
  ttl: 1000 * 60 * 60 * 6,  // 6 hours
});

function normaliseCompany(raw) {
  const company = String(raw || "").trim();

  // basic caps
  if (!company) return "";
  if (company.length > 120) return "";

  // Optional allowlist to reduce prompt-injection/junk.
  // Adjust if you need to support more characters.
  if (!/^[\p{L}\p{N} .&'’\-(),/]+$/u.test(company)) return "";

  return company;
}

function cacheKey(company) {
  return company.toLowerCase();
}

/* -----------------------------
   External clients (OpenAI / SMTP)
------------------------------ */

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

/* -----------------------------
   Small ID + email template helpers
------------------------------ */

function generateInvitationId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `INV-${ts}-${rand}`;
}

async function sendInvitationEmail({
  email,
  customerId,
  customerName,
  businessName,
  stage,
  surveyId,
}) {
  const name = customerName ? `Hi ${customerName},` : "Hi,";
  const invitationId = generateInvitationId();
  const surveyUrl = `https://www.npsme.com/demo-invitation-survey?inv=${encodeURIComponent(
    invitationId
  )}`;

  const subject = "We’d love your feedback (1-2 minutes)";

  const plainText = [
    `${name}`,
    "",
    "We’re running a short customer feedback survey to help improve our experience.",
    "It should take around 1-2 minutes.",
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
      <p>It should take around <strong>1-2 minutes</strong>.</p>
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

async function sendLiveInvitationEmail({
  email,
  customerId,
  customerName,
  businessName,
  stage,
  surveyId,
  fromName,
  fromEmail,
  invitationId: explicitInvitationId, // <- allow override
}) {
  const politeName = customerName ? `Bonjour ${customerName},` : "Bonjour,";

  const invitationId = explicitInvitationId || generateInvitationId();
  const surveyUrl = `https://www.npsme.com/live-invitation-survey?inv=${encodeURIComponent(
    invitationId
  )}`;

  const _businessName = businessName || "Envola";
  const _fromName = fromName || "Nicholas d'Envola"; // 🔹 with the H

  const subject = `Votre avis compte beaucoup pour ${_businessName}`;

  const plainTextLines = [
    politeName,
    "",
    `Nous vous invitons à répondre à un court questionnaire de satisfaction (1-2 minutes) pour nous aider à améliorer l'expérience proposée par ${_businessName}.`,
    "",
    `Répondre au questionnaire : ${surveyUrl}`,
    "",
    "Merci beaucoup pour votre aide,",
    _fromName,
  ];

  const plainText = plainTextLines.join("\n");

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#152238; background:#f5f7ff; padding:24px;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;border:1px solid #e0e7ff;box-shadow:0 20px 40px rgba(15,23,42,0.06);padding:24px 28px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <div style="font-weight:700;font-size:18px;letter-spacing:0.04em;color:#263b87;">
            Envola
          </div>
          <div style="font-size:12px;padding:4px 10px;border-radius:999px;background:#e3ebff;color:#263b87;font-weight:500;">
            Questionnaire de satisfaction
          </div>
        </div>

        <p style="margin:0 0 12px 0;">${politeName}</p>
        <p style="margin:0 0 8px 0;">
          Nous vous invitons à répondre à un court questionnaire de satisfaction (1-2 minutes)
          pour nous aider à améliorer l'expérience proposée par <strong>${_businessName}</strong>.
        </p>
        <p style="margin:16px 0;">
          <a href="${surveyUrl}"
             style="display:inline-block;padding:10px 20px;border-radius:999px;
                    background:#263b87;color:#ffffff;text-decoration:none;font-weight:600;
                    box-shadow:0 10px 20px rgba(38,59,135,0.25);">
            Répondre au questionnaire
          </a>
        </p>
        <p style="font-size:12px;color:#6b7280;margin-top:16px;line-height:1.5;">
          Ce lien est associé à une référence unique afin d'éviter de vous relancer inutilement.
          Si ce message ne vous était pas destiné, vous pouvez simplement l'ignorer.
        </p>
        <p style="margin-top:16px;">
          Merci beaucoup pour votre aide,<br/>
          ${_fromName}
        </p>

        <p style="margin-top:20px;font-size:11px;color:#9ca3af;">
          Propulsé par <a href="https://www.npsme.com" style="color:#263b87;text-decoration:underline;">NPS Me</a>.
        </p>
      </div>
    </div>
  `;

  return { invitationId, subject, plainText, html };
}

function generateResponseId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `R-${ts}-${rand}`;
}

/* -----------------------------
   Paths / runtime constants
------------------------------ */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PROD = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3000;

// --- Adjust if you ever move away from www ---
const CANONICAL_HOST = "www.npsme.com";

const dist = path.join(__dirname, "dist");
const baseIndexHtml = fs.readFileSync(path.join(dist, "index.html"), "utf8");

/* -----------------------------
   Core Express config + middleware
------------------------------ */

// Needed behind Heroku/Cloudflare so req.ip / x-forwarded-proto work
app.set("trust proxy", 1);

// Always compress (including HTML)
app.use(
  compression({
    threshold: 0,
  })
);

// Ensure proper caching variation
app.use((req, res, next) => {
  res.setHeader("Vary", "Accept-Encoding");
  next();
});


// Mount Intercom router ONCE, before express.json()
app.use("/api/intercom", createIntercomRouter());

app.use("/api/envola", createEnvolaRouter());

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(cookieParser());

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// ---------------------------------------------------------------------------
// Workspace user auth
// - New individual-login auth for customer workspaces
// - Runs alongside existing shared-password private auth
// ---------------------------------------------------------------------------

app.post("/api/workspace-auth/login", async (req, res) => {
  try {
    const result = await loginWorkspaceUser({
      email: req.body?.email,
      password: req.body?.password,
      req,
      res,
    });

    return res.status(result.status || 200).json(result);
  } catch (err) {
    console.error("[workspace-auth] Login route failed", err);

    return res.status(500).json({
      ok: false,
      error: "Login failed",
    });
  }
});

app.post("/api/workspace-auth/logout", (req, res) => {
  clearWorkspaceAuthCookie(res);

  return res.json({
    ok: true,
  });
});

app.get("/api/workspace-auth/me", (req, res) => {
  const auth = getWorkspaceAuth(req);

  if (!auth) {
    return res.status(401).json({
      ok: false,
      authed: false,
      error: "Workspace authentication required",
    });
  }

  return res.json({
    ok: true,
    authed: true,
    user: {
      id: auth.userId,
      email: auth.email,
      fullName: auth.fullName,
    },
    workspace: {
      id: auth.workspaceId,
      role: auth.role,
    },
  });
});

app.post("/api/workspace-auth/change-password", requireWorkspaceAuth, async (req, res) => {
  try {
    const result = await changeWorkspacePassword({
      userId: req.auth.userId,
      currentPassword: req.body?.currentPassword,
      newPassword: req.body?.newPassword,
      req,
    });

    return res.status(result.status || 200).json(result);
  } catch (err) {
    console.error("[workspace-auth] Change password route failed", err);

    return res.status(500).json({
      ok: false,
      error: "Failed to change password",
    });
  }
});


// =====================================================
// CSV NPS API ROUTES
// Base path: /api/csv-nps
// =====================================================
app.use(
  "/api/csv-nps",
  (req, res, next) => {
    if (req.path === "/ping") return next();
    return requireWorkspaceAuth(req, res, next);
  },
  createCsvNpsRouter()
);

// =====================================================
// NPS DATA API ROUTES
// Persistent saved NPS datasets + rows + close-loop data
// Base path: /api/nps-data
// =====================================================
app.use("/api/nps-data",
  (req, res, next) => {
    if (req.path === "/ping") return next();
    return requireWorkspaceAuth(req, res, next);
  },
  createNpsDataRouter({ openai })
);


// ---------------------------------------------------------------------------
// Simple shared-password protection (Option B)
// - POST /api/auth/login { password }
// - POST /api/auth/logout
// - GET  /api/auth/me
// Sets an HttpOnly cookie that unlocks "private" routes.
// ---------------------------------------------------------------------------

const PRIVATE_COOKIE_NAME = "npsme_private";

function parseCookies(header = "") {
  // Minimal cookie parser (avoids adding cookie-parser dependency)
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
  const secret = process.env.PRIVATE_DASH_COOKIE_SECRET || process.env.PRIVATE_DASH_PASSWORD || "";
  if (!secret) return null;
  return crypto.createHmac("sha256", secret).update("npsme_private_v1").digest("hex");
}

function hasPrivateAuth(req) {
  const expected = expectedPrivateCookieValue();
  if (!expected) return false;
  const cookies = parseCookies(req.headers.cookie || "");
  return cookies[PRIVATE_COOKIE_NAME] === expected;
}

function requirePrivateAuth(req, res, next) {
  const expectedValue = expectedPrivateCookieValue();

  if (!expectedValue) {
    return res.status(500).json({
      ok: false,
      error: "PRIVATE_DASH_COOKIE_SECRET is not set",
    });
  }

  if (!hasPrivateAuth(req)) {
    return res.status(401).json({
      ok: false,
      error: "Authentication required",
    });
  }

  return next();
}

app.post("/api/auth/login", (req, res) => {
  const password = String(req.body?.password || "");
  const expectedPassword = process.env.PRIVATE_DASH_PASSWORD || "";

  if (!expectedPassword) {
    return res.status(500).json({
      ok: false,
      error: "PRIVATE_DASH_PASSWORD is not set",
    });
  }

  if (!password || password !== expectedPassword) {
    return res.status(401).json({
      ok: false,
      error: "Invalid password",
    });
  }

  const value = expectedPrivateCookieValue();

  if (!value) {
    return res.status(500).json({
      ok: false,
      error: "PRIVATE_DASH_COOKIE_SECRET is not set",
    });
  }

  const isProd = process.env.NODE_ENV === "production";

  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };

  if (isProd) {
    cookieOptions.domain = ".npsme.com";
  }

  res.cookie(PRIVATE_COOKIE_NAME, value, cookieOptions);

  return res.json({ ok: true });
});

app.post("/api/auth/logout", (_req, res) => {
  const isProd = process.env.NODE_ENV === "production";

  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
  };

  if (isProd) {
    cookieOptions.domain = ".npsme.com";
  }

  res.clearCookie(PRIVATE_COOKIE_NAME, cookieOptions);

  return res.json({ ok: true });
});

app.get("/api/auth/me", (req, res) => {
  return res.json({ ok: true, authed: hasPrivateAuth(req) });
});

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

const BLOCKED_PREFIXES = [
  // secrets / env
  "/.env",
  "/.git",
  "/.svn",
  "/.hg",
  "/backup",
  "/config",
  "/credentials",
  "/aws",
  "/.aws",

  // common debug tools
  "/debug",
  "/_debug",
  "/debugbar",
  "/_debugbar",
  "/_ignition",

  // wordpress/php junk scans
  "/wp-admin",
  "/wp-login.php",
  "/phpmyadmin",
  "/cgi-bin",
  "/vendor",
  "/xmlrpc.php",
  "/phpinfo.php",
];

app.use((req, res, next) => {
  const p = (req.path || "").toLowerCase();

  if (BLOCKED_PREFIXES.some((b) => p.startsWith(b))) {
    return res.status(404).type("text/plain").send("Not found");
  }

  next();
});

/* -----------------------------
   Dropbox token management (auto-refresh)
------------------------------ */

const DROPBOX_REFRESH_TOKEN = process.env.DROPBOX_REFRESH_TOKEN;
const DROPBOX_APP_KEY = process.env.DROPBOX_APP_KEY;
const DROPBOX_APP_SECRET = process.env.DROPBOX_APP_SECRET;

// Legacy fallback (short-lived token) - used only if no refresh token is configured
const LEGACY_DROPBOX_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;

const INVITATIONS_PATH =
  process.env.DROPBOX_INVITATIONS_PATH || "/npsme/invitations.csv";
const DEMO_RESPONSES_PATH =
  process.env.DROPBOX_DEMO_RESPONSES_PATH || "/npsme/demo-responses.csv";
const RESPONSES_PATH = process.env.DROPBOX_RESPONSES_PATH || "/npsme/responses.csv";

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
      console.warn("[npsme] No Dropbox token available; skipping Dropbox operations.");
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
    console.error(`[npsme] Dropbox token refresh failed (${resp.status}):`, text);
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

// Small CSV escaper (supports , or ;)
function escapeCsv(value, delimiter = ",") {
  const v = value == null ? "" : String(value);

  // We must quote if the value contains a quote, newline, or the delimiter itself
  const pattern =
    delimiter === ","
      ? /[",\n]/
      : new RegExp(`[\"${delimiter}\n]`);

  if (pattern.test(v)) {
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

/* -----------------------------
   Demo invitations / responses (Dropbox CSV)
------------------------------ */

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
  const normalise = (id) =>
    (id ?? "")
      .toString()
      .trim()
      .replace(/^"+|"+$/g, ""); // strip leading/trailing double quotes if present

  const target = normalise(invitationId);

  const rows = await loadInvitations();
  console.log(
    "[npsme] findInvitationById: looking for",
    JSON.stringify(target),
    "in",
    rows.length,
    "rows"
  );

  const match = rows.find((r) => normalise(r.invitationId) === target) || null;

  if (!match) {
    const sample = rows.slice(0, 5).map((r) => normalise(r.invitationId));
    console.log("[npsme] findInvitationById: not found. Sample IDs:", sample);
  } else {
    console.log(
      "[npsme] findInvitationById: found invitation",
      JSON.stringify(match.invitationId)
    );
  }

  return match;
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

async function markInvitationStarted(invitationId) {
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
      const currentStatus = (rowObj.status || "").toLowerCase().trim();

      // Only move from empty / "sent" → "started"
      if (!currentStatus || currentStatus === "sent") {
        rowObj.status = "started";
      }
    }

    const updatedCols = header.map((h) => escapeCsv(rowObj[h] ?? ""));
    updatedLines.push(updatedCols.join(","));
  }

  const updatedCsv = updatedLines.join("\n") + "\n";
  await writeDropboxFile(INVITATIONS_PATH, updatedCsv);
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

  const existing = await readDropboxFile(DEMO_RESPONSES_PATH).catch((err) => {
    console.error("[npsme] Error reading demo-responses.csv", err);
    return null;
  });

  // Decide delimiter: if file exists and clearly uses ;, keep that, otherwise use ,
  let delimiter = ",";
  if (existing) {
    const firstLine = existing.split(/\r?\n/)[0] || "";
    delimiter = detectDelimiter(firstLine);
  }

  const headerFields = [
    "responseId",
    "invitationId",
    "customerId",
    "customerName",
    "businessName",
    "email",
    "stage",
    "surveyId",
    "type",
    "score",
    "comment",
    "createdAt",
  ];
  const header = headerFields.join(delimiter);

  const fields = [
    row.responseId,
    row.invitationId,
    row.customerId || "",
    row.customerName || "",
    row.businessName || "",
    row.email || "",
    row.stage || "",
    row.surveyId || "",
    row.type || "",
    row.score,
    row.comment || "",
    row.createdAt,
  ];

  const line = fields.map((v) => escapeCsv(v, delimiter)).join(delimiter);

  const contents = existing
    ? `${existing.replace(/\n*$/, "")}\n${line}\n`
    : `${header}\n${line}\n`;

  await writeDropboxFile(DEMO_RESPONSES_PATH, contents);
}

/* -----------------------------
   CSV helpers for demo responses (handles , and ;)
------------------------------ */

function detectDelimiter(headerLine) {
  const commaCount = (headerLine.match(/,/g) || []).length;
  const semiCount = (headerLine.match(/;/g) || []).length;

  if (semiCount && !commaCount) return ";";
  if (commaCount && !semiCount) return ",";
  // If both or neither are present, default to comma
  return ",";
}

function splitCsvLine(line, delimiter) {
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
  // Split CRLF / LF robustly and trim each line
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  // Detect whether we're dealing with , or ;
  const delimiter = detectDelimiter(lines[0]);

  const header = splitCsvLine(lines[0], delimiter).map((h) => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i], delimiter);
    const obj = {};

    header.forEach((h, idx) => {
      let value = cols[idx] ?? "";

      // Unwrap quotes & unescape
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(/""/g, '"');
      }

      obj[h] = value.trim();
    });

    rows.push(obj);
  }

  return rows;
}

/* -----------------------------
   Invitation summary helpers (for response rate visuals)
------------------------------ */

function isInvitationResponded(invitation) {
  const status = (invitation.status || "").toLowerCase().trim();
  const responseId =
    typeof invitation.responseId === "string"
      ? invitation.responseId.trim()
      : invitation.responseId;

  return status === "responded" || (responseId && responseId !== "");
}

function getMonthKeyFromDateString(dateString) {
  if (!dateString) return "Unknown";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "Unknown";

  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

async function buildInvitationSummary() {
  const rows = await loadInvitations();
  if (!rows || !rows.length) {
    return {
      totals: { sent: 0, responded: 0, opened: 0, started: 0 },
      stages: [],
      months: [],
    };
  }

  const totals = { sent: 0, responded: 0, opened: 0, started: 0 };
  const stagesMap = new Map();
  const monthsMap = new Map();

  for (const raw of rows) {
    totals.sent += 1;

    const responded = isInvitationResponded(raw) ? 1 : 0;
    totals.responded += responded;

    // opened / started: placeholder for future tracking
    const opened = 0;
    const started = 0;
    totals.opened += opened;
    totals.started += started;

    // ----- Group by stage -----
    const stageName = (raw.stage || "Overall NPS").trim() || "Unspecified";
    if (!stagesMap.has(stageName)) {
      stagesMap.set(stageName, {
        stage: stageName,
        sent: 0,
        responded: 0,
        opened: 0,
        started: 0,
      });
    }
    const stageStats = stagesMap.get(stageName);
    stageStats.sent += 1;
    stageStats.responded += responded;
    stageStats.opened += opened;
    stageStats.started += started;

    // ----- Group by month (based on sentAt or lastSentAt) -----
    const sentAt = raw.sentAt || raw.lastSentAt || null;
    if (sentAt) {
      const key = getMonthKeyFromDateString(sentAt);
      if (!monthsMap.has(key)) {
        monthsMap.set(key, {
          key,
          label: key,
          sent: 0,
          responded: 0,
          opened: 0,
          started: 0,
        });
      }
      const monthStats = monthsMap.get(key);
      monthStats.sent += 1;
      monthStats.responded += responded;
      monthStats.opened += opened;
      monthStats.started += started;
    }
  }

  const stages = Array.from(stagesMap.values()).sort((a, b) =>
    a.stage.localeCompare(b.stage)
  );
  const months = Array.from(monthsMap.values()).sort((a, b) =>
    a.key > b.key ? 1 : -1
  );

  return { totals, stages, months };
}

async function loadDemoResponses() {
  const csv = await readDropboxFile(DEMO_RESPONSES_PATH).catch((err) => {
    console.error(
      "[npsme] Error reading demo-responses.csv in loadDemoResponses",
      err
    );
    return null;
  });

  if (!csv) return [];
  return parseCsvWithHeader(csv);
}

function buildDemoFunnelFromInvites(invitations, demoResponses) {
  const totalSent = invitations.length;

  // Completed = unique invitations with at least one demo response
  const completedIds = new Set(
    demoResponses.map((r) => (r.invitationId || "").trim()).filter(Boolean)
  );

  let started = 0;
  let completed = 0;

  const byMonthMap = new Map();
  const byStageMap = new Map();

  const monthKeyFromDate = (dateStr) => {
    if (!dateStr) return "Unknown";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "Unknown";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  };

  for (const inv of invitations) {
    const id = (inv.invitationId || "").trim();
    const stage = (inv.stage || "").trim() || "Unspecified";
    const status = (inv.status || "").toLowerCase().trim();
    const isCompleted = id && completedIds.has(id);

    if (isCompleted) completed++;

    // "started" means survey link opened or completed
    if (status === "started" || status === "responded" || isCompleted) {
      started++;
    }

    // --- By month (based on sentAt) ---
    const monthKey = monthKeyFromDate(inv.sentAt);
    if (!byMonthMap.has(monthKey)) {
      byMonthMap.set(monthKey, {
        month: monthKey,
        sent: 0,
        started: 0,
        completed: 0,
      });
    }
    const monthBucket = byMonthMap.get(monthKey);
    monthBucket.sent++;
    if (status === "started" || status === "responded" || isCompleted) {
      monthBucket.started++;
    }
    if (isCompleted) {
      monthBucket.completed++;
    }

    // --- By stage ---
    if (!byStageMap.has(stage)) {
      byStageMap.set(stage, {
        stage,
        sent: 0,
        started: 0,
        completed: 0,
      });
    }
    const stageBucket = byStageMap.get(stage);
    stageBucket.sent++;
    if (status === "started" || status === "responded" || isCompleted) {
      stageBucket.started++;
    }
    if (isCompleted) {
      stageBucket.completed++;
    }
  }

  // For now, "opened" ~= "started"
  const opened = started;

  const overall = {
    sent: totalSent,
    opened,
    started,
    completed,
    startRate: totalSent ? +((started / totalSent) * 100).toFixed(1) : null,
    responseRate: totalSent ? +((completed / totalSent) * 100).toFixed(1) : null,
  };

  const byMonth = Array.from(byMonthMap.values()).sort((a, b) =>
    a.month > b.month ? 1 : -1
  );

  const byStage = Array.from(byStageMap.values());

  return { overall, byMonth, byStage };
}

/* -----------------------------
   LIVE CSV (Dropbox) helpers
------------------------------ */

// PSEUDO PATHS - adjust to your actual Dropbox paths
const LIVE_INVITATIONS_PATH = "/npsme/live/invitations.csv";
const LIVE_RESPONSES_PATH = "/npsme/live/responses.csv";

async function loadLiveInvitations() {
  const csv = await readDropboxFile(LIVE_INVITATIONS_PATH);
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

async function appendLiveInvitationRow(row) {
  if (!DROPBOX_REFRESH_TOKEN && !LEGACY_DROPBOX_TOKEN) {
    console.warn("[npsme] No Dropbox token configured; skipping ...");
    return;
  }

  const header =
    "invitationId,customerId,customerName,businessName,email,stage,surveyId,typeOfDevice,assistanteMaternelle,sentAt,resentCount,lastSentAt,status,responseId";

  const fields = [
    row.invitationId,
    row.customerId || "",
    row.customerName || "",
    row.businessName || "",
    row.email,
    row.stage || "",
    row.surveyId || "",
    row.typeOfDevice || "",
    row.assistanteMaternelle || "",
    row.sentAt,
    row.resentCount ?? 0,
    row.lastSentAt || row.sentAt,
    row.status || "sent",
    row.responseId || "",
  ];

  const existing = await readDropboxFile(LIVE_INVITATIONS_PATH).catch((err) => {
    console.error("[npsme] Error reading live invitations.csv", err);
    return null;
  });

  const line = fields.map(escapeCsv).join(",");

  const contents = existing
    ? `${existing.replace(/\n*$/, "")}\n${line}\n`
    : `${header}\n${line}\n`;

  await writeDropboxFile(LIVE_INVITATIONS_PATH, contents);
}

async function loadLiveResponses() {
  const csv = await readDropboxFile(LIVE_RESPONSES_PATH).catch((err) => {
    console.error(
      "[npsme] Error reading live-responses.csv in loadLiveResponses",
      err
    );
    return null;
  });

  if (!csv) return [];
  return parseCsvWithHeader(csv);
}

async function appendLiveResponseRow(row) {
  if (!DROPBOX_REFRESH_TOKEN && !LEGACY_DROPBOX_TOKEN) {
    console.warn("[npsme] No Dropbox token configured; skipping ...");
    return;
  }

  const header = "responseId,invitationId,score,comment,createdAt";

  const existing = await readDropboxFile(LIVE_RESPONSES_PATH).catch((err) => {
    console.error("[npsme] Error reading live-responses.csv", err);
    return null;
  });

  const fields = [
    row.responseId,
    row.invitationId || "",
    row.score,
    row.comment || "",
    row.createdAt,
  ];

  const line = fields.map((v) => escapeCsv(v, ",")).join(",");

  const contents = existing
    ? `${existing.replace(/\n*$/, "")}\n${line}\n`
    : `${header}\n${line}\n`;

  await writeDropboxFile(LIVE_RESPONSES_PATH, contents);
}

async function findLiveInvitationById(invitationId) {
  const rows = await loadLiveInvitations();
  return (
    rows.find(
      (r) => (r.invitationId || "").trim() === (invitationId || "").trim()
    ) || null
  );
}

async function markLiveInvitationStarted(invitationId) {
  const csv = await readDropboxFile(LIVE_INVITATIONS_PATH);
  if (!csv) return;

  const lines = csv.trim().split("\n");
  if (lines.length < 2) return;

  const header = lines[0].split(",");
  const updatedLines = [lines[0]];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const rowObj = {};
    header.forEach((h, idx) => {
      rowObj[h] = cols[idx] ?? "";
    });

    if (rowObj.invitationId === invitationId) {
      const currentStatus = (rowObj.status || "").toLowerCase().trim();
      if (!currentStatus || currentStatus === "sent") {
        rowObj.status = "started";
      }
    }

    const updatedCols = header.map((h) => escapeCsv(rowObj[h] ?? ""));
    updatedLines.push(updatedCols.join(","));
  }

  const updatedCsv = updatedLines.join("\n") + "\n";
  await writeDropboxFile(LIVE_INVITATIONS_PATH, updatedCsv);
}

async function markLiveInvitationSent(invitationId, sentAtIso) {
  const csv = await readDropboxFile(LIVE_INVITATIONS_PATH);
  if (!csv) return;

  const lines = csv.trim().split("\n");
  if (lines.length < 2) return;

  const header = lines[0].split(",");
  const updatedLines = [lines[0]];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const rowObj = {};
    header.forEach((h, idx) => {
      rowObj[h] = cols[idx] ?? "";
    });

    if ((rowObj.invitationId || "").trim() === (invitationId || "").trim()) {
      const currentResent = Number(rowObj.resentCount || 0);
      const alreadyHadSentAt = !!rowObj.sentAt;

      const now = sentAtIso || new Date().toISOString();
      if (!alreadyHadSentAt) {
        // first time we send this one
        rowObj.sentAt = now;
        rowObj.resentCount = currentResent;
      } else {
        // resend
        rowObj.resentCount = currentResent + 1;
      }
      rowObj.lastSentAt = now;
      rowObj.status = "sent";
    }

    const updatedCols = header.map((h) => escapeCsv(rowObj[h] ?? ""));
    updatedLines.push(updatedCols.join(","));
  }

  const updatedCsv = updatedLines.join("\n") + "\n";
  await writeDropboxFile(LIVE_INVITATIONS_PATH, updatedCsv);
}

async function markLiveInvitationCancelled(invitationId) {
  const csv = await readDropboxFile(LIVE_INVITATIONS_PATH);
  if (!csv) return;

  const lines = csv.trim().split("\n");
  if (lines.length < 2) return;

  const header = lines[0].split(",");
  const updatedLines = [lines[0]];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const rowObj = {};
    header.forEach((h, idx) => {
      rowObj[h] = cols[idx] ?? "";
    });

    if ((rowObj.invitationId || "").trim() === (invitationId || "").trim()) {
      rowObj.status = "cancelled";
      // optional: keep lastSentAt unchanged; do NOT touch resentCount
    }

    const updatedCols = header.map((h) => escapeCsv(rowObj[h] ?? ""));
    updatedLines.push(updatedCols.join(","));
  }

  const updatedCsv = updatedLines.join("\n") + "\n";
  await writeDropboxFile(LIVE_INVITATIONS_PATH, updatedCsv);
}

async function markLiveInvitationResponded(invitationId, responseId) {
  const csv = await readDropboxFile(LIVE_INVITATIONS_PATH);
  if (!csv) return;

  const lines = csv.trim().split("\n");
  if (lines.length < 2) return;

  const header = lines[0].split(",");
  const updatedLines = [lines[0]];

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
  await writeDropboxFile(LIVE_INVITATIONS_PATH, updatedCsv);
}

/* -----------------------------
   In-memory demo metrics store
------------------------------ */

let demoResponses = [];

/* -----------------------------
   Core / misc endpoints
------------------------------ */

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

// Supabase

app.get("/api/db/health", async (_req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({
        ok: false,
        error: "Supabase is not configured",
      });
    }

    const { error } = await supabaseAdmin
      .from("datasets")
      .select("id")
      .limit(1);

    if (error) {
      return res.status(500).json({
        ok: false,
        error: error.message,
      });
    }

    return res.json({
      ok: true,
      database: "supabase",
    });
  } catch (err) {
    console.error("[npsme] DB health check failed", err);
    return res.status(500).json({
      ok: false,
      error: "Database health check failed",
    });
  }
});

/* -----------------------------
   Email endpoints
------------------------------ */

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
    const {
      email,
      customerId,
      customerName,
      businessName,
      stage,
      surveyId,
      fromName,
      fromEmail,
      replyToEmail,
    } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // 1) Decide who the email appears to come from
    const effectiveFromName = fromName || process.env.ZOHO_FROM_NAME || "NPS Me";

    const effectiveFromEmail = fromEmail || process.env.ZOHO_FROM_EMAIL;

    // Reply-To: explicitly provided, or fall back to from
    const effectiveReplyTo = replyToEmail || effectiveFromEmail;

    if (!effectiveFromEmail) {
      console.error("[npsme] No from email configured");
      return res.status(500).json({ error: "Email configuration error" });
    }

    // 2) Build content + ID (still pass the raw values so the template can personalise signature etc.)
    const { subject, plainText, html, invitationId } = await sendInvitationEmail({
      email,
      customerId,
      customerName,
      businessName,
      stage,
      surveyId,
      fromName: effectiveFromName,
      fromEmail: effectiveFromEmail,
      replyToEmail: effectiveReplyTo,
    });

    const sentAt = new Date().toISOString();

    // 3) Log to Dropbox (including invitationId)
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

    // 4) Send email via Zoho
    const info = await mailer.sendMail({
      from: `"${effectiveFromName}" <${effectiveFromEmail}>`,
      to: email,
      replyTo: effectiveReplyTo,
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

// NEW: send LIVE Envola invitation
app.post("/api/send-live-invitation", async (req, res) => {
  try {
    const {
      email,
      customerId,
      customerName,
      businessName,
      stage,
      surveyId,
      fromName,
      fromEmail,
      replyToEmail,
      typeOfDevice,
      assistanteMaternelle, // frontend will POST this as free-text
    } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // 1) Decide who the email appears to come from
    const effectiveFromName = fromName || "Nicholas d'Envola"; // default with the H and Envola brand

    const effectiveFromEmail = fromEmail || process.env.ZOHO_FROM_EMAIL;

    const effectiveReplyTo = replyToEmail || effectiveFromEmail;

    if (!effectiveFromEmail) {
      console.error("[npsme] LIVE: No from email configured");
      return res.status(500).json({ error: "Email configuration error" });
    }

    // 2) Build LIVE email content + ID
    const { subject, plainText, html, invitationId } = await sendLiveInvitationEmail({
      email,
      customerId,
      customerName,
      businessName,
      stage,
      surveyId,
      fromName: effectiveFromName,
      fromEmail: effectiveFromEmail,
    });

    const sentAt = new Date().toISOString();

    // 3) Log to LIVE invitations CSV (includes typeOfDevice + assistanteMaternelle)
    await appendLiveInvitationRow({
      invitationId,
      customerId,
      customerName,
      businessName,
      email,
      stage,
      surveyId,
      typeOfDevice: typeOfDevice || "",
      assistanteMaternelle: assistanteMaternelle || "",
      sentAt,
      resentCount: 0,
      lastSentAt: sentAt,
      status: "sent",
      responseId: "",
    });

    // 4) Send email via Zoho
    const info = await mailer.sendMail({
      from: `"${effectiveFromName}" <${effectiveFromEmail}>`,
      to: email,
      replyTo: effectiveReplyTo,
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
    console.error("[npsme] Error in /api/send-live-invitation", err);
    res.status(500).json({ error: "Failed to send live invitation" });
  }
});

/* -----------------------------
   Demo survey link + submit
------------------------------ */

// Validate a demo survey link
app.get("/api/demo-survey/lookup", async (req, res) => {
  try {
    const invRaw = req.query.inv;
    const inv = typeof invRaw === "string" ? invRaw.trim() : "";

    console.log("[npsme] /api/demo-survey/lookup called with inv =", inv);

    if (!inv) {
      return res.status(400).json({ error: "Missing invitation id" });
    }

    const invitation = await findInvitationById(inv);
    if (!invitation) {
      console.log("[npsme] lookup: no invitation found for id =", inv);
      return res.status(404).json({ error: "Invitation not found" });
    }

    // Be defensive: treat as responded only if status is "responded"
    // OR responseId is present and non-empty
    const status = (invitation.status || "").toLowerCase().trim();
    const responseId =
      typeof invitation.responseId === "string"
        ? invitation.responseId.trim()
        : invitation.responseId;

    const alreadyResponded = status === "responded" || (responseId && responseId !== "");

    if (alreadyResponded) {
      console.log(
        "[npsme] lookup: invitation already responded:",
        invitation.invitationId,
        "status =",
        status,
        "responseId =",
        responseId
      );
      return res.status(409).json({ error: "Invitation already responded" });
    }

    // 🔹 Mark this invitation as "started" the first time the survey is opened
    try {
      await markInvitationStarted(invitation.invitationId);
    } catch (e) {
      console.error("[npsme] Failed to mark invitation started", e);
      // non-fatal
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

    const type = !rawStage || rawStage === "overall" ? "overall" : "milestone";

    const responseId = `RESP-${Date.now().toString(36).toUpperCase()}`;
    const createdAt = new Date().toISOString();

    await appendDemoResponseRow({
      responseId,
      invitationId,
      customerId: invitation.customerId || "",
      customerName: invitation.customerName || "",
      businessName: invitation.businessName || "",
      email: invitation.email || "",
      stage: invitation.stage || "",
      surveyId: invitation.surveyId || "",
      type,
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

app.get("/api/demo-funnel", async (req, res) => {
  try {
    const { customer, company, stage } = req.query;

    const invitations = await loadInvitations();
    const demoResponses = await loadDemoResponses();

    // --- 1) Apply filters to invitations ---
    let filteredInvitations = invitations;

    if (customer) {
      filteredInvitations = filteredInvitations.filter(
        (inv) => (inv.customerName || "").trim() === customer
      );
    }

    if (company) {
      filteredInvitations = filteredInvitations.filter((inv) => {
        const name = (inv.businessName || inv.companyName || "").trim();
        return name === company;
      });
    }

    if (stage) {
      filteredInvitations = filteredInvitations.filter(
        (inv) => (inv.stage || "").trim() === stage
      );
    }
    // Set of invitationIds that survive the invite filter
    const allowedInvitationIds = new Set(
      filteredInvitations.map((inv) => (inv.invitationId || "").trim()).filter(Boolean)
    );

    const totalSent = filteredInvitations.length;

    // Completed = unique invitations (from filtered set) with at least one demo response
    const completedIds = new Set(
      demoResponses
        .map((r) => (r.invitationId || "").trim())
        .filter((id) => id && allowedInvitationIds.has(id))
    );

    let started = 0;
    let completed = 0;

    const byMonthMap = new Map();
    const byStageMap = new Map();

    const monthKeyFromDate = (dateStr) => {
      if (!dateStr) return "Unknown";
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return "Unknown";
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      return `${y}-${m}`;
    };

    // --- 2) Build month + stage buckets based on FILTERED invites ---
    for (const inv of filteredInvitations) {
      const id = (inv.invitationId || "").trim();
      const stage = (inv.stage || "").trim() || "Unspecified";
      const status = (inv.status || "").toLowerCase().trim();
      const isCompleted = id && completedIds.has(id);

      if (isCompleted) completed++;

      // "started" means survey link opened or completed
      if (status === "started" || status === "responded" || isCompleted) {
        started++;
      }

      // --- By month (based on sentAt) ---
      const monthKey = monthKeyFromDate(inv.sentAt);
      if (!byMonthMap.has(monthKey)) {
        byMonthMap.set(monthKey, {
          month: monthKey,
          sent: 0,
          started: 0,
          completed: 0,
        });
      }
      const monthBucket = byMonthMap.get(monthKey);
      monthBucket.sent++;
      if (status === "started" || status === "responded" || isCompleted) {
        monthBucket.started++;
      }
      if (isCompleted) {
        monthBucket.completed++;
      }

      // --- By stage ---
      if (!byStageMap.has(stage)) {
        byStageMap.set(stage, {
          stage,
          sent: 0,
          started: 0,
          completed: 0,
        });
      }
      const stageBucket = byStageMap.get(stage);
      stageBucket.sent++;
      if (status === "started" || status === "responded" || isCompleted) {
        stageBucket.started++;
      }
      if (isCompleted) {
        stageBucket.completed++;
      }
    }

    // For now, "opened" ~= "started"
    const opened = started;

    const overall = {
      sent: totalSent,
      opened,
      started,
      completed,
      startRate: totalSent ? +((started / totalSent) * 100).toFixed(1) : null,
      responseRate: totalSent ? +((completed / totalSent) * 100).toFixed(1) : null,
    };

    const byMonth = Array.from(byMonthMap.values()).sort((a, b) =>
      a.month > b.month ? 1 : -1
    );

    const byStage = Array.from(byStageMap.values());

    res.json({
      overall,
      byMonth,
      byStage,
    });
  } catch (err) {
    console.error("[npsme] Error in /api/demo-funnel", err);
    res.status(500).json({ error: "Failed to compute demo funnel" });
  }
});

/* -----------------------------
   LIVE APIs
------------------------------ */

// Load all LIVE responses (for the live dashboard)
app.get("/api/live-responses", async (req, res) => {
  try {
    const rows = await loadLiveResponses(); // already defined helper
    res.json({ rows });
  } catch (err) {
    console.error("[npsme] Error in /api/live-responses", err);
    res.status(500).json({ error: "Failed to load live responses" });
  }
});

app.get("/api/live-survey/lookup", async (req, res) => {
  try {
    const inv = req.query.inv;
    console.log("[npsme] /api/live-survey/lookup called with inv =", inv);

    if (!inv) {
      return res.status(400).json({ error: "Missing invitation id" });
    }

    const invitation = await findLiveInvitationById(inv);
    if (!invitation) {
      console.warn("[npsme] live lookup: no invitation found for id =", inv);
      return res.status(404).json({ error: "Invitation not found" });
    }

    const status = (invitation.status || "").toLowerCase().trim();
    const responseId =
      typeof invitation.responseId === "string"
        ? invitation.responseId.trim()
        : invitation.responseId;

    const alreadyResponded = status === "responded" || (responseId && responseId !== "");

    if (alreadyResponded) {
      return res.status(409).json({ error: "Invitation already responded" });
    }

    // Mark as started (best effort)
    try {
      await markLiveInvitationStarted(invitation.invitationId);
    } catch (e) {
      console.error("[npsme] LIVE: failed to mark invitation started", e);
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
        typeOfDevice: invitation.typeOfDevice || "",
        assistanteMaternelle: invitation.assistanteMaternelle || "",
      },
    });
  } catch (err) {
    console.error("[npsme] Error in /api/live-survey/lookup", err);
    res.status(500).json({ error: "Lookup failed" });
  }
});

// Load ALL live invitations for the admin page (optionally filter by status)
app.get("/api/live-invitations", async (req, res) => {
  try {
    const rows = await loadLiveInvitations();

    const statusFilterRaw = (req.query.status || "").toString().trim().toLowerCase();
    const includeAll = req.query.all === "1" || req.query.all === "true";

    if (includeAll || !statusFilterRaw) {
      return res.json({ rows });
    }

    const filtered = rows.filter((row) => {
      const s = (row.status || "").toLowerCase().trim() || "pending";
      return s === statusFilterRaw;
    });

    res.json({ rows: filtered });
  } catch (err) {
    console.error("[npsme] Error in /api/live-invitations", err);
    res.status(500).json({ error: "Failed to load live invitations" });
  }
});

// Send a batch of LIVE invitations selected in the admin UI
app.post("/api/live-invitations/send-batch", async (req, res) => {
  try {
    const { invitationIds } = req.body || {};

    if (!Array.isArray(invitationIds) || invitationIds.length === 0) {
      return res
        .status(400)
        .json({ error: "invitationIds must be a non-empty array" });
    }

    const allRows = await loadLiveInvitations();

    const byId = new Map(allRows.map((row) => [(row.invitationId || "").trim(), row]));

    const results = [];

    for (const rawId of invitationIds) {
      const id = (rawId || "").trim();
      const row = byId.get(id);

      if (!row) {
        results.push({ invitationId: id, ok: false, error: "Not found in CSV" });
        continue;
      }

      const status = (row.status || "").toLowerCase().trim();
      if (status === "sent" || status === "responded") {
        results.push({
          invitationId: id,
          ok: false,
          error: `Already ${status}`,
        });
        continue;
      }

      try {
        // Build the live email using the *existing* invitationId from the CSV
        const { subject, plainText, html } = await sendLiveInvitationEmail({
          email: row.email,
          customerId: row.customerId || "",
          customerName: row.customerName || "",
          businessName: row.businessName || "",
          stage: row.stage || "",
          surveyId: row.surveyId || "",
          fromName: "Nicholas d'Envola",
          fromEmail: process.env.ZOHO_FROM_EMAIL,
          invitationId: id, // <- reuse existing ID
        });

        if (!process.env.ZOHO_FROM_EMAIL) {
          throw new Error("ZOHO_FROM_EMAIL not configured");
        }

        await mailer.sendMail({
          from: `"Nicholas d'Envola" <${process.env.ZOHO_FROM_EMAIL}>`,
          to: row.email,
          replyTo: process.env.ZOHO_FROM_EMAIL,
          bcc: "hello@npsme.com",
          subject,
          text: plainText,
          html,
        });

        await markLiveInvitationSent(id);

        results.push({ invitationId: id, ok: true });
      } catch (e) {
        console.error("[npsme] Error sending live invitation", id, e);
        results.push({ invitationId: id, ok: false, error: e.message });
      }
    }

    res.json({ ok: true, results });
  } catch (err) {
    console.error("[npsme] Error in /api/live-invitations/send-batch", err);
    res.status(500).json({ error: "Failed to send batch invitations" });
  }
});

// Resend a LIVE invitation (allowed for status "sent" or "started", blocked if "responded")
app.post("/api/live-invitations/resend", async (req, res) => {
  try {
    const { invitationId } = req.body || {};
    const id = (invitationId || "").trim();

    if (!id) {
      return res.status(400).json({ error: "invitationId is required" });
    }

    const inv = await findLiveInvitationById(id);
    if (!inv) {
      return res.status(404).json({ error: "Invitation not found" });
    }

    const status = (inv.status || "").toLowerCase().trim() || "pending";
    if (status === "responded") {
      return res.status(409).json({ error: "Invitation already responded" });
    }
    if (status === "pending") {
      return res.status(409).json({
        error: "Invitation not sent yet. Use Send from Pending.",
      });
    }

    if (!process.env.ZOHO_FROM_EMAIL) {
      return res.status(500).json({ error: "ZOHO_FROM_EMAIL not configured" });
    }

    const { subject, plainText, html } = await sendLiveInvitationEmail({
      email: inv.email,
      customerId: inv.customerId || "",
      customerName: inv.customerName || "",
      businessName: inv.businessName || "",
      stage: inv.stage || "",
      surveyId: inv.surveyId || "",
      fromName: "Nicholas d'Envola",
      fromEmail: process.env.ZOHO_FROM_EMAIL,
      invitationId: id,
    });

    await mailer.sendMail({
      from: `"Nicholas d'Envola" <${process.env.ZOHO_FROM_EMAIL}>`,
      to: inv.email,
      replyTo: process.env.ZOHO_FROM_EMAIL,
      bcc: "hello@npsme.com",
      subject,
      text: plainText,
      html,
    });

    await markLiveInvitationSent(id);

    res.json({ ok: true, invitationId: id });
  } catch (err) {
    console.error("[npsme] Error in /api/live-invitations/resend", err);
    res.status(500).json({ error: "Failed to resend invitation" });
  }
});

app.post("/api/live-invitations/cancel", async (req, res) => {
  try {
    const { invitationId } = req.body || {};
    const id = (invitationId || "").trim();
    if (!id) return res.status(400).json({ ok: false, error: "invitationId is required" });

    const inv = await findLiveInvitationById(id);
    if (!inv) return res.status(404).json({ ok: false, error: "Invitation not found" });

    const status = (inv.status || "").toLowerCase().trim() || "pending";
    if (status === "responded") {
      return res.status(409).json({ ok: false, error: "Cannot cancel: already responded" });
    }

    await markLiveInvitationCancelled(id);
    return res.json({ ok: true, invitationId: id });
  } catch (err) {
    console.error("[npsme] Error in /api/live-invitations/cancel", err);
    res.status(500).json({ ok: false, error: "Failed to cancel invitation" });
  }
});

app.post("/api/live-survey/submit", async (req, res) => {
  try {
    const { invitationId, score, comment } = req.body || {};

    if (!invitationId) {
      return res.status(400).json({ error: "Missing invitation id" });
    }
    if (typeof score !== "number" || Number.isNaN(score)) {
      return res.status(400).json({ error: "Score must be a number" });
    }

    const invitation = await findLiveInvitationById(invitationId);
    if (!invitation) {
      return res.status(404).json({ error: "Invitation not found" });
    }

    const status = (invitation.status || "").toLowerCase().trim();
    const existingResponseId =
      typeof invitation.responseId === "string"
        ? invitation.responseId.trim()
        : invitation.responseId;

    const alreadyResponded =
      status === "responded" || (existingResponseId && existingResponseId !== "");

    if (alreadyResponded) {
      return res.status(409).json({ error: "Invitation already responded" });
    }

    const responseId = generateResponseId(); // same helper as demo, e.g. RESP-...

    const createdAt = new Date().toISOString();

    await appendLiveResponseRow({
      responseId,
      invitationId,
      score,
      comment: (comment || "").trim(),
      createdAt,
    });

    await markLiveInvitationResponded(invitationId, responseId);

    return res.json({ ok: true, responseId });
  } catch (err) {
    console.error("[npsme] Error in /api/live-survey/submit", err);
    res.status(500).json({ error: "Failed to save response" });
  }
});

// --- LIVE merged view (Invitations + latest Response) ---
app.get("/api/live-merged", async (req, res) => {
  try {
    const stage = String(req.query.stage || "").trim();
    const device = String(req.query.device || "").trim();
    const am = String(req.query.am || "").trim();

    const [invites, responses] = await Promise.all([
      loadLiveInvitations(),
      loadLiveResponses(),
    ]);

    // Latest response per invitationId
    const latestByInvId = new Map();

    for (const r of responses || []) {
      const invId = String(r.invitationId || "").trim();
      if (!invId) continue;

      const t = r.createdAt ? new Date(r.createdAt).getTime() : 0;
      const prev = latestByInvId.get(invId);
      const prevT = prev?.createdAt ? new Date(prev.createdAt).getTime() : 0;

      if (!prev || t >= prevT) latestByInvId.set(invId, r);
    }

    let rows = (invites || []).map((inv) => {
      const invId = String(inv.invitationId || "").trim();
      const r = invId ? latestByInvId.get(invId) : null;

      // Normalise types
      const resentCount = Number.isFinite(Number(inv.resentCount)) ? Number(inv.resentCount) : 0;

      const scoreNum =
        r && r.score !== undefined && r.score !== null && String(r.score).trim() !== ""
          ? Number(r.score)
          : null;

      const responseCreatedAt = r?.createdAt ? String(r.createdAt) : "";

      return {
        ...inv,
        resentCount,
        response: r || null,

        // convenience flat fields
        responseId: r?.responseId ?? "",
        score: scoreNum, // ✅ number|null
        comment: r?.comment ?? "",
        createdAt: responseCreatedAt,
        hasResponse: !!r,
      };
    });

    // Optional filters (same ones as insights)
    if (stage) rows = rows.filter((x) => String(x.stage || "").trim() === stage);
    if (device) rows = rows.filter((x) => String(x.typeOfDevice || "").trim() === device);
    if (am) rows = rows.filter((x) => String(x.assistanteMaternelle || "").trim() === am);

    res.json({
      ok: true,
      totalInvitations: invites?.length || 0,
      totalResponses: responses?.length || 0,
      rows,
    });
  } catch (err) {
    console.error("[npsme] Error in /api/live-merged", err);
    res.status(500).json({ ok: false, error: "Failed to build merged dataset" });
  }
});

// --- LIVE insights (server computes n + nps; model does themes/actions/templates) ---
// NEW: POST insights using invitationIds (does not break existing GET)
app.post("/api/live-insights", async (req, res) => {
  try {
    const invitationIds = Array.isArray(req.body?.invitationIds) ? req.body.invitationIds : [];
    const limit = Math.min(Number(req.body?.limit || 200), 500);

    // If client sends nothing, return empty insights (don’t error)
    if (!invitationIds.length) {
      return res.json({
        ok: true,
        stage: null,
        device: null,
        am: null,
        generated_at: new Date().toISOString(),
        insights: {
          n: 0,
          nps: null,
          response_themes: [],
          delighters: [],
          top_actions: [],
          risk_flags: [],
          close_the_loop_templates: [],
        },
      });
    }

    const allowed = new Set(invitationIds.map((x) => String(x || "").trim()).filter(Boolean));

    const [invites, responses] = await Promise.all([
      loadLiveInvitations(),
      loadLiveResponses(),
    ]);

    // latest response per invitationId
    const latestByInvId = new Map();
    for (const r of responses || []) {
      const invId = String(r.invitationId || "").trim();
      if (!invId) continue;

      const t = r.createdAt ? new Date(r.createdAt).getTime() : 0;
      const prev = latestByInvId.get(invId);
      const prevT = prev?.createdAt ? new Date(prev.createdAt).getTime() : 0;

      if (!prev || t >= prevT) latestByInvId.set(invId, r);
    }

    // merge, then filter to allowed IDs
    const merged = (invites || [])
      .map((inv) => {
        const invId = String(inv.invitationId || "").trim();
        if (!invId || !allowed.has(invId)) return null;

        const r = latestByInvId.get(invId) || null;

        const scoreNum =
          r && r.score !== undefined && r.score !== null && String(r.score).trim() !== ""
            ? Number(r.score)
            : null;

        return {
          ...inv,
          response: r ? { ...r, score: scoreNum } : null,
        };
      })
      .filter(Boolean);

    const responded = merged
      .filter((x) => x.response && Number.isFinite(x.response.score))
      .slice(0, limit);

    const scores = responded.map((x) => x.response.score);
    const n = scores.length;
    const promoters = scores.filter((s) => s >= 9).length;
    const detractors = scores.filter((s) => s <= 6).length;
    const nps = n ? Math.round(((promoters - detractors) / n) * 100) : null;

    if (!responded.length) {
      return res.json({
        ok: true,
        stage: null,
        device: null,
        am: null,
        generated_at: new Date().toISOString(),
        insights: {
          n: 0,
          nps: null,
          response_themes: [],
          delighters: [],
          top_actions: [],
          risk_flags: [],
          close_the_loop_templates: [],
        },
      });
    }

    const compact = responded.map((x) => ({
      invitationId: x.invitationId,
      stage: x.stage || "",
      typeOfDevice: x.typeOfDevice || "",
      assistanteMaternelle: x.assistanteMaternelle || "",
      score: x.response.score,
      comment: String(x.response.comment || "").slice(0, 500),
      createdAt: x.response.createdAt || "",
    }));

    const prompt = `
You are a CX intelligence analyst. You will receive NPS survey responses.

Your job:
- Extract themes, delighters, actions, and risks grounded in the data.
- Draft "close the loop" templates by SEGMENT (do NOT include real emails).

Return VALID JSON only in this schema:
{
  "response_themes": [{"theme": string, "evidence_count": number, "example_quotes": [string]}],
  "delighters": [{"theme": string, "evidence_count": number, "example_quotes": [string]}],
  "top_actions": [{"action": string, "why": string, "impact": "high|medium|low", "effort": "high|medium|low"}],
  "risk_flags": [{"flag": string, "who": string, "detail": string}],
  "close_the_loop_templates": [{"segment": string, "subject": string, "body": string}]
}

Rules:
- Use specific, concrete language.
- Quotes must be short excerpts (max ~15 words).
- Keep it honest: only claim what the comments/scores support.
- Segments: "Detractors (0-6)", "Passives (7-8)", "Promoters (9-10)".
`.trim();

    const r = await openai.responses.create({
      model: "gpt-4o-mini",
      max_output_tokens: 900, // tune
      input: [
        { role: "system", content: prompt },
        { role: "user", content: JSON.stringify({ n, nps, rows: compact }) },
      ],
    });

    let text = String(r.output_text || "").trim();
    if (text.startsWith("```")) text = text.replace(/```json|```/gi, "").trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) text = jsonMatch[0];

    const parsed = JSON.parse(text);

    res.json({
      ok: true,
      stage: null,
      device: null,
      am: null,
      generated_at: new Date().toISOString(),
      insights: {
        n,
        nps,
        ...parsed,
      },
    });
  } catch (err) {
    console.error("[npsme] Error in POST /api/live-insights", err);
    res.status(500).json({ ok: false, error: "Failed to generate insights" });
  }
});


/* -----------------------------
   Static assets & caching
------------------------------ */

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

/* -----------------------------
   Social summary endpoint for npsme.com
------------------------------ */

app.get("/api/social-summary", socialSummaryLimiter, async (req, res) => {
  try {
    const company = normaliseCompany(req.query.company);
    if (!company) {
      return res.status(400).json({ error: "Valid company query parameter is required" });
    }

    // ✅ cache
    const key = cacheKey(company);
    const cached = socialCache.get(key);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      tools: [{ type: "web_search_preview" }],
      max_output_tokens: 650, // ✅ hard cap to control cost/output size
      input: [
        {
          role: "system",
          content:
            "You are a concise, neutral CX & NPS analyst. " +
            "Use web search to ground your answer in real, recent public information. " +
            "Return ONLY valid JSON in the exact schema requested, with no explanation or commentary outside the JSON. " +
            "Do NOT wrap the JSON in code fences or backticks.",
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                `Using web search, analyse public social / review sentiment about "${company}".\n\n` +
                `Return JSON of the form:\n` +
                `{\n` +
                `  "summary": "string",\n` +
                `  "competitor_summary": "string"\n` +
                `}\n\n` +
                `Where:\n` +
                `- "summary" (<= 180 words) includes:\n` +
                `  • Overall tone (positive / neutral / negative, with nuance)\n` +
                `  • Explicit sections labelled "CX Delighters:" and "CX Red Flags:" on their own lines,\n` +
                `    each followed by 2-4 bullet points using "- " at the start of each bullet.\n` +
                `- "competitor_summary" (<= 80 words) briefly compares ${company}'s\n` +
                `  sentiment and key CX themes with 2-3 named competitors in the same category.\n\n` +
                `If you find very little data, say so explicitly in BOTH fields.\n` +
                `Return ONLY the JSON object, no extra text, no backticks, no code fences.`,
            },
          ],
        },
      ],
    });

    // Raw model text
    let jsonText = response.output_text?.trim() || "";

    // 🧹 1) strip code fences
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```json|```/gi, "").trim();
    }

    // 🧹 2) try to extract JSON block (still imperfect, but kept for drop-in compatibility)
    const match = jsonText.match(/\{[\s\S]*\}/);
    if (match) jsonText = match[0];

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      console.error("Failed to parse JSON from /api/social-summary:", e);
      parsed = { summary: jsonText, competitor_summary: "" };
    }

    const normalise = (value) =>
      typeof value === "string" ? value.replace(/\\n/g, "\n").trim() : "";

    const summary = normalise(parsed.summary) || "No summary available for this company.";
    const competitorSummary = normalise(parsed.competitor_summary);

    const payload = {
      company,
      summary,
      competitor_summary: competitorSummary,
      generated_at: new Date().toISOString(),
    };

    // ✅ cache result
    socialCache.set(key, payload);

    res.json(payload);
  } catch (err) {
    console.error("Error in /api/social-summary:", err);
    res.status(500).json({ error: "Internal error generating social summary" });
  }
});

app.use((err, req, res, next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({
      ok: false,
      error: "The uploaded dataset is too large. Please reduce the file size or split it into smaller imports.",
    });
  }

  return next(err);
});

/* -----------------------------
   SPA HTML: inject canonical + og:url + per-route meta + hreflang
------------------------------ */

app.get("*", (req, res, next) => {
  // Never serve SPA HTML for API routes
  if (req.path.startsWith("/api/")) return next();

  // Never serve SPA HTML for file-ish paths (/.env, /.git/config, /favicon.ico, etc)
  if (req.path.includes(".")) return next();

  res.set("Cache-Control", "no-store, must-revalidate");

  const pathOnly = req.originalUrl.split("?")[0] || "/";
  const fullUrl = `https://${CANONICAL_HOST}${pathOnly}`;

  // --- Language detection (simple) ---
  const isFr = pathOnly === "/fr" || pathOnly.startsWith("/fr/");
  const htmlLang = isFr ? "fr" : "en";
  const inLang = isFr ? "fr-FR" : "en-GB";

  // --- Per-route meta (expand this map over time) ---
  const DEFAULT_META = {
    title: "Customer Experience (CX) Consulting & NPS Improvement | NPS Me",
    description:
      "NPS Me is a CX consulting firm helping teams improve Net Promoter Score (NPS)®, retention, and revenue-diagnose friction, prioritise fixes, ship measurable gains.",
  };

const ROUTE_META = {
  "/": {
    title: "Customer Experience (CX) Consulting & NPS Improvement | NPS Me",
    description:
      "NPS Me is a CX consulting firm helping teams improve Net Promoter Score (NPS)®, retention, and revenue-diagnose friction, prioritise fixes, ship measurable gains.",
  },

  "/fr": {
    title: "Conseil CX & Amélioration du NPS | NPS Me",
    description:
      "NPS Me aide les équipes à améliorer le NPS®, la rétention et la croissance - diagnostiquer les frictions, prioriser, déployer et mesurer.",
  },

  "/book": {
    title: "Book CX & NPS Consulting | NPS Me",
    description:
      "Book a call with NPS Me to diagnose customer friction, prioritise improvements, and increase NPS®, retention, and revenue.",
  },

  "/fr/book": {
    title: "Réserver un appel Conseil CX & NPS | NPS Me",
    description:
      "Réservez un échange avec NPS Me pour diagnostiquer les frictions clients, prioriser les actions et améliorer le NPS®, la rétention et la croissance.",
  },

  "/what-is-nps": {
    title: "What Is Net Promoter Score (NPS)? | NPS Me",
    description:
      "Learn what Net Promoter Score (NPS)® is, how it works, and how to use it to improve customer experience and retention.",
  },

  "/fr/what-is-nps": {
    title: "Qu’est-ce que le Net Promoter Score (NPS) ? | NPS Me",
    description:
      "Découvrez ce qu’est le Net Promoter Score (NPS)®, comment il fonctionne et comment l’utiliser pour améliorer l’expérience client.",
  },

  "/milestone-nps": {
    title: "Milestone NPS: Measuring CX at Key Moments | NPS Me",
    description:
      "Understand Milestone NPS and how measuring customer sentiment at key moments improves insight beyond overall NPS.",
  },

  "/fr/milestone-nps": {
    title: "NPS par étape : mesurer l’expérience aux moments clés | NPS Me",
    description:
      "Comprenez le NPS par étape et comment mesurer la satisfaction aux moments clés améliore l’analyse de l’expérience client.",
  },
};

  const meta = ROUTE_META[pathOnly] || DEFAULT_META;

  // --- Hreflang ---
  // You can add more languages later; keep this simple for now.
  const enPath = isFr ? pathOnly.replace(/^\/fr/, "") || "/" : pathOnly;
  const frPath = isFr ? pathOnly : `/fr${pathOnly === "/" ? "" : pathOnly}`;

  const hreflang = `
  <link rel="alternate" href="https://${CANONICAL_HOST}${enPath}" hreflang="en-GB" />
  <link rel="alternate" href="https://${CANONICAL_HOST}${frPath}" hreflang="fr-FR" />
  <link rel="alternate" href="https://${CANONICAL_HOST}/" hreflang="x-default" />
  `.trim();

  let html = baseIndexHtml;

  // 1) Replace placeholders introduced in index.html
  html = html.replace(/__TITLE__/g, meta.title);
  html = html.replace(/__DESCRIPTION__/g, meta.description);
  html = html.replace(/__LANG__/g, htmlLang);
  html = html.replace(/__INLANG__/g, inLang);
  html = html.replace(/__HREFLANG__/g, hreflang);

  // 2) Canonical
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

  // 3) og:url
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

  // 4) Keep OG/Twitter title/description aligned with <title>/<meta name="description">
  html = html.replace(
    /<meta\s+property=["']og:title["'][^>]*>/i,
    `<meta property="og:title" content="${meta.title}" />`
  );
  html = html.replace(
    /<meta\s+property=["']og:description["'][^>]*>/i,
    `<meta property="og:description" content="${meta.description}" />`
  );
  html = html.replace(
    /<meta\s+name=["']twitter:title["'][^>]*>/i,
    `<meta name="twitter:title" content="${meta.title}" />`
  );
  html = html.replace(
    /<meta\s+name=["']twitter:description["'][^>]*>/i,
    `<meta name="twitter:description" content="${meta.description}" />`
  );

  res.type("html").send(html);
});


/* -----------------------------
   Start server
------------------------------ */

app.listen(PORT, () => {
  console.log(`NPS Me running on :${PORT} (${PROD ? "prod" : "dev"})`);
});
