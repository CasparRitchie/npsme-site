// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";
import helmet from "helmet";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PROD = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3000;

// --- Adjust if you ever move away from www ---
const CANONICAL_HOST = "www.npsme.com";

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

// HSTS (only in production). OK for SEO; improves trust.
// NOTE: After verifying everything is solid, you can submit for preload at hstspreload.org.
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

  // Force HTTPS
  if (proto !== "https") {
    return res.redirect(301, `https://${CANONICAL_HOST}${req.originalUrl}`);
  }

  // Force single host (avoid duplicate content for SEO)
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

// robots.txt — minimal + cacheless & locked down
app.get("/robots.txt", (_req, res) => {
  res.type("text/plain");
  res.set("Content-Security-Policy", "default-src 'none'");
  res.send("User-agent: *\nAllow: /\nSitemap: https://www.npsme.com/sitemap.xml");
});

// sitemap.xml
app.get("/sitemap.xml", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "sitemap.xml"));
});

// ---------- Static assets & caching ----------
// --- Serve Vite build ---
const dist = path.join(__dirname, "dist");

// Long cache for hashed assets (Vite puts them in /assets)
app.use(
  "/assets",
  express.static(path.join(dist, "assets"), { maxAge: "1y", immutable: true })
);

// Short cache for everything else in /dist, BUT do not let static serve index.html
app.use(
  express.static(dist, {
    maxAge: "1h",
    index: false, // <— critical: do NOT auto-serve index.html here
  })
);

// Serve index.html with no-cache for any app route
app.get("*", (_req, res) => {
  res.set("Cache-Control", "no-cache");
  res.sendFile(path.join(dist, "index.html"));
});

app.listen(PORT, () => {
  console.log(`NPS Me running on :${PORT} (${PROD ? "prod" : "dev"})`);
});
