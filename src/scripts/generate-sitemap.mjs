// scripts/generate-sitemap.mjs
// Generate /public/sitemap.xml from routes + social listening reports
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// --- Import route + report data (ESM) ---
import { ROUTES_MANIFEST } from "../routesManifest.js";
import { REPORTS } from "../data/socialReports.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = process.env.SITEMAP_BASE_URL || "https://www.npsme.com";
const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// --- Base pages from manifest (enabled, absolute path, not hash, not dynamic ":") ---
// --- Base pages from manifest (enabled, inSitemap !== false, absolute path, not hash, not dynamic ":") ---
const basePages = ROUTES_MANIFEST.filter(
  (r) =>
    r.enabled === true &&
    r.indexable === true &&
    r.inSitemap !== false &&
    r.path.startsWith("/") &&
    !r.isHash &&
    !r.path.includes(":")
).map((r) => r.path);

// --- Social Listening: index + each report page ---
const socialIndex = "/social-listening";
const socialReports = REPORTS.map((r) => `${socialIndex}/${r.slug}`);
const socialReportsFr = REPORTS.map((r) => `/fr/social-listening/${r.slug}`);

// Deduplicate and keep stable order: Home, Products, Impact, Social index, others…
const allPaths = Array.from(new Set([...basePages, socialIndex, ...socialReports, ...socialReportsFr]));

// --- Priority / changefreq rules ---
function priorityFor(path) {
  if (path === "/") return "1.0";
  if (path === "/products") return "0.9";
  if (path === socialIndex) return "0.8";
  if (path.startsWith(`${socialIndex}/`)) return "0.7"; // individual reports
  return "0.7";
}

function changefreqFor(path) {
  if (path === "/") return "weekly";
  if (path === socialIndex) return "weekly";
  if (path.startsWith(`${socialIndex}/`)) return "weekly"; // you’ll refresh/add reports
  return "monthly";
}

// --- Build XML ---
const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  allPaths
    .map(
      (p) => `  <url>
    <loc>${BASE_URL}${p === "/" ? "/" : p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreqFor(p)}</changefreq>
    <priority>${priorityFor(p)}</priority>
  </url>`
    )
    .join("\n") +
  `\n</urlset>\n`;

// --- Write to /public/sitemap.xml ---
const outDir = resolve(__dirname, "../../public");
mkdirSync(outDir, { recursive: true });
const outFile = resolve(outDir, "sitemap.xml");
writeFileSync(outFile, xml, "utf8");
console.log(`✓ Wrote sitemap: ${outFile}`);
console.log(
  `✓ Included ${allPaths.length} URLs (routes + ${socialReports.length + socialReportsFr.length} reports)`
);
