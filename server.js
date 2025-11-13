// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";
import helmet from "helmet";
import fs from "fs";
import nodemailer from "nodemailer";

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false, // TLS later
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function generateInvitationId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `INV-${ts}-${rand}`;
}

async function sendInvitationEmail({ email, customerId, stage, surveyId }) {
  const invitationId = generateInvitationId();
  const surveyUrl = `https://www.npsme.com/demo-survey?inv=${encodeURIComponent(invitationId)}`;

  const subject = "We’d love your feedback (1–2 minutes)";
  const plainText = [
    `Hi,`,
    "",
    `We’re running a short customer feedback survey to help improve our experience.`,
    `It should take 1–2 minutes.`,
    "",
    `Take the survey: ${surveyUrl}`,
    "",
    `Thank you,`,
    `NPS Me`,
  ].join("\n");

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#0f172a">
      <p>Hi,</p>
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

  const info = await mailer.sendMail({
    from: `"NPS Me" <hello@npsme.com>`,
    to: email,
    bcc: "hello@npsme.com",
    subject,
    text: plainText,
    html,
    headers: {
      "X-Customer-Id": customerId || "",
      "X-Stage": stage || "",
      "X-Survey-Id": surveyId || "",
      "X-Invitation-Id": invitationId,
    },
  });

  return { invitationId, info };
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

// --- Demo API (in-memory) ---
let demoResponses = [];

app.post("/api/demo/response", (req, res) => {
  const { score, comment } = req.body || {};
  if (typeof score !== "number" || score < 0 || score > 10) {
    return res.status(400).json({ error: "Invalid score" });
  }
  demoResponses.push({ score, comment: (comment || "").slice(0, 500), ts: Date.now() });
  res.json({ ok: true });
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
  const { email, customerId, stage, surveyId } = req.body || {};
  if (!email) {
    return res.status(400).json({ ok: false, error: "Missing email" });
  }

  try {
    const result = await sendInvitationEmail({ email, customerId, stage, surveyId });
    res.json({ ok: true, invitationId: result.invitationId });
  } catch (err) {
    console.error("INVITE EMAIL ERROR", err);
    res.status(500).json({ ok: false, error: err.message });
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
