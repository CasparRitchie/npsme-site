// scripts/generate-sitemap.mjs
// Node ESM script: generates public/sitemap.xml from ROUTES_MANIFEST
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ROUTES_MANIFEST } from "../src/routesManifest.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Change this if you run in another environment
const BASE_URL = process.env.SITEMAP_BASE_URL || "https://www.npsme.com";

// Filter: enabled, valid top-level, not hash, not dynamic (no ":")
const pages = ROUTES_MANIFEST.filter(
  (r) =>
    r.enabled &&
    r.path.startsWith("/") &&
    !r.isHash &&
    !r.path.includes(":")
);

// Simple priority/changefreq rules
function priorityFor(path) {
  if (path === "/") return "1.0";
  if (path === "/products") return "0.9";
  if (path === "/social-listening") return "0.8";
  return "0.7";
}

function changefreqFor(path) {
  if (path === "/") return "weekly";
  if (path === "/social-listening") return "weekly";
  return "monthly";
}

const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  pages
    .map(
      (r) => `  <url>
    <loc>${BASE_URL}${r.path === "/" ? "/" : r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreqFor(r.path)}</changefreq>
    <priority>${priorityFor(r.path)}</priority>
  </url>`
    )
    .join("\n") +
  `\n</urlset>\n`;

const outDir = resolve(__dirname, "..", "public");
mkdirSync(outDir, { recursive: true });
const outFile = resolve(outDir, "sitemap.xml");
writeFileSync(outFile, xml, "utf8");
console.log(`✓ Wrote sitemap: ${outFile}`);
