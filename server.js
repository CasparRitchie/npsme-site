// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";
import helmet from "helmet";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Core middleware
app.use(express.json());
app.use(compression());
app.use(
  helmet({
    contentSecurityPolicy: false,      // keep off unless you whitelist inline scripts/styles
    crossOriginEmbedderPolicy: false,
  })
);

// --- Demo API (in-memory) ---
let demoResponses = [];

app.post("/api/demo/response", (req, res) => {
  const { score, comment } = req.body || {};
  if (typeof score !== "number" || score < 0 || score > 10) {
    return res.status(400).json({ error: "Invalid score" });
  }
  demoResponses.push({
    score,
    comment: (comment || "").slice(0, 500),
    ts: Date.now(),
  });
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

// --- Robots & Sitemap ---
app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.set("Content-Security-Policy", "default-src 'none'");
  res.set("Cache-Control", "public, max-age=14400"); // 4h
  res.removeHeader("Content-Signals");
  res.send("User-agent: *\nAllow: /\nSitemap: https://www.npsme.com/sitemap.xml");
});

app.get("/sitemap.xml", (req, res) => {
  res.type("application/xml");
  res.set("Cache-Control", "public, max-age=14400");
  res.sendFile(path.join(__dirname, "public", "sitemap.xml"));
});

// --- Serve Vite build ---
const dist = path.join(__dirname, "dist");

// 1) Long cache for hashed assets (Vite puts them in /assets)
app.use(
  "/assets",
  express.static(path.join(dist, "assets"), { maxAge: "1y", immutable: true })
);

// 2) Short cache for other static files in /dist (images, OG image, etc.)
app.use(express.static(dist, { maxAge: "1h" }));

// 3) SPA routing: serve index.html (never cache it)
app.get("*", (_req, res) => {
  res.set("Cache-Control", "no-cache");
  res.sendFile(path.join(dist, "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`NPS Me running on :${port}`));
