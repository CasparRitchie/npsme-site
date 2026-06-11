// scripts/audit-seo-routes.mjs
import { ROUTES_MANIFEST } from "../routesManifest.js";

const BASE_URL = "http://localhost:3000";

const REQUEST_HEADERS = {
  Host: "www.npsme.com",
  "X-Forwarded-Proto": "https",
};

function extractTag(html, pattern) {
  const match = html.match(pattern);
  return match?.[1]?.trim() || "";
}

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

async function inspectRoute(route) {
  const response = await fetch(`${BASE_URL}${route.path}`, {
    headers: REQUEST_HEADERS,
    redirect: "manual",
  });

  const html = await response.text();

  const title = decodeHtml(
    extractTag(
      html,
      /<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/i
    )
  );

  const description = decodeHtml(
    extractTag(
      html,
      /<meta\b(?=[^>]*\bname=["']description["'])[^>]*\bcontent=["']([^"']*)["'][^>]*>/i
    )
  );

  const canonical = decodeHtml(
    extractTag(
      html,
      /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\bhref=["']([^"']*)["'][^>]*>/i
    )
  );

  const robots = decodeHtml(
    extractTag(
      html,
      /<meta\b(?=[^>]*\bname=["']robots["'])[^>]*\bcontent=["']([^"']*)["'][^>]*>/i
    )
  );

  return {
    path: route.path,
    status: response.status,
    lang: route.lang,
    title,
    description,
    canonical,
    robots,
  };
}

const routes = ROUTES_MANIFEST.filter(
  (route) =>
    route.enabled === true &&
    route.indexable === true &&
    route.isHash !== true &&
    !route.path.includes(":")
);

const results = [];

for (const route of routes) {
  try {
    results.push(await inspectRoute(route));
  } catch (error) {
    results.push({
      path: route.path,
      status: "ERROR",
      lang: route.lang,
      title: "",
      description: error.message,
      canonical: "",
      robots: "",
    });
  }
}

const titleCounts = new Map();
const descriptionCounts = new Map();

for (const result of results) {
  titleCounts.set(
    result.title,
    (titleCounts.get(result.title) || 0) + 1
  );

  descriptionCounts.set(
    result.description,
    (descriptionCounts.get(result.description) || 0) + 1
  );
}

const report = results.map((result) => ({
  ...result,
  duplicateTitle:
    result.title &&
    titleCounts.get(result.title) > 1
      ? titleCounts.get(result.title)
      : 0,

  duplicateDescription:
    result.description &&
    descriptionCounts.get(result.description) > 1
      ? descriptionCounts.get(result.description)
      : 0,

  canonicalMatches:
    result.canonical ===
    `https://www.npsme.com${result.path}`,

  validRobots:
    result.robots === "index, follow",
}));

console.table(
  report.map((result) => ({
    path: result.path,
    status: result.status,
    titleDuplicates: result.duplicateTitle,
    descriptionDuplicates: result.duplicateDescription,
    canonical: result.canonicalMatches ? "OK" : "CHECK",
    robots: result.validRobots ? "OK" : result.robots,
    title: result.title,
  }))
);

const problems = report.filter(
  (result) =>
    result.status !== 200 ||
    !result.title ||
    !result.description ||
    result.duplicateTitle > 1 ||
    result.duplicateDescription > 1 ||
    !result.canonicalMatches ||
    !result.validRobots
);

console.log("\nSEO routes checked:", report.length);
console.log("Routes needing attention:", problems.length);

if (problems.length) {
  console.log("\nDetailed problems:");

  for (const problem of problems) {
    console.log("\n----------------------------------------");
    console.log("Path:", problem.path);
    console.log("Status:", problem.status);
    console.log("Title:", problem.title);
    console.log(
      "Title used by:",
      problem.duplicateTitle || 1,
      "route(s)"
    );
    console.log("Description:", problem.description);
    console.log(
      "Description used by:",
      problem.duplicateDescription || 1,
      "route(s)"
    );
    console.log("Canonical:", problem.canonical);
    console.log("Robots:", problem.robots);
  }
}
