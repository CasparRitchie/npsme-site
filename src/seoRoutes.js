// src/seoRoutes.js

export const SEO_BASE_URL = "https://www.npsme.com";

/**
 * Routes whose English and French paths are not simply:
 *
 *   /english-path
 *   /fr/english-path
 *
 * Add future translated slugs here.
 */
const STATIC_ROUTE_PAIRS = [
  {
    en: "/",
    fr: "/fr",
  },
  {
    en: "/intercom-nps-analytics",
    fr: "/fr/analyse-nps-intercom",
  },
  {
    en: "/envola",
    fr: "/fr/exemple-envola",
  },
];

/**
 * Normalise a URL pathname for canonical use.
 *
 * - Always starts with /
 * - Removes query strings and hashes
 * - Removes trailing slash except for /
 */
export function normaliseSeoPath(pathname) {
  if (!pathname) return "/";

  let path = String(pathname).trim();

  path = path.split("?")[0];
  path = path.split("#")[0];

  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  path = path.replace(/\/{2,}/g, "/");

  if (path !== "/") {
    path = path.replace(/\/+$/, "");
  }

  return path || "/";
}

function getStaticRoutePair(pathname) {
  return (
    STATIC_ROUTE_PAIRS.find(
      (pair) => pair.en === pathname || pair.fr === pathname
    ) || null
  );
}

/**
 * Deal with translated dynamic routes.
 *
 * These are not currently indexable, but keeping their canonical language
 * mapping correct avoids conflicting metadata and makes the resolver complete.
 */
function getDynamicRoutePair(pathname) {
  const englishEnvolaQuestionPrefix = "/envola/questions/";
  const frenchEnvolaQuestionPrefix = "/fr/exemple-envola/questions/";

  if (pathname.startsWith(englishEnvolaQuestionPrefix)) {
    const suffix = pathname.slice(englishEnvolaQuestionPrefix.length);

    return {
      en: `/envola/questions/${suffix}`,
      fr: `/fr/exemple-envola/questions/${suffix}`,
    };
  }

  if (pathname.startsWith(frenchEnvolaQuestionPrefix)) {
    const suffix = pathname.slice(frenchEnvolaQuestionPrefix.length);

    return {
      en: `/envola/questions/${suffix}`,
      fr: `/fr/exemple-envola/questions/${suffix}`,
    };
  }

  return null;
}

/**
 * Resolve the canonical English and French paths.
 *
 * Optional overrides remain supported for backwards compatibility with
 * existing <Seo altPaths={...} /> usage.
 */
export function getSeoPaths(
  pathname,
  {
    enPathOverride = null,
    frPathOverride = null,
  } = {}
) {
  const currentPath = normaliseSeoPath(pathname);

  if (enPathOverride || frPathOverride) {
    const inferredIsFrench =
      currentPath === "/fr" || currentPath.startsWith("/fr/");

    let enPath = enPathOverride
      ? normaliseSeoPath(enPathOverride)
      : inferredIsFrench
        ? normaliseSeoPath(currentPath.replace(/^\/fr/, "") || "/")
        : currentPath;

    let frPath = frPathOverride
      ? normaliseSeoPath(frPathOverride)
      : enPath === "/"
        ? "/fr"
        : normaliseSeoPath(`/fr${enPath}`);

    return {
      currentPath,
      enPath,
      frPath,
      canonicalPath: inferredIsFrench ? frPath : enPath,
      isFrench: inferredIsFrench,
    };
  }

  const explicitPair =
    getStaticRoutePair(currentPath) ||
    getDynamicRoutePair(currentPath);

  if (explicitPair) {
    const isFrench = currentPath === explicitPair.fr;

    return {
      currentPath,
      enPath: explicitPair.en,
      frPath: explicitPair.fr,
      canonicalPath: isFrench ? explicitPair.fr : explicitPair.en,
      isFrench,
    };
  }

  const isFrench =
    currentPath === "/fr" || currentPath.startsWith("/fr/");

  if (isFrench) {
    const enPath =
      currentPath === "/fr"
        ? "/"
        : normaliseSeoPath(currentPath.replace(/^\/fr/, "") || "/");

    return {
      currentPath,
      enPath,
      frPath: currentPath,
      canonicalPath: currentPath,
      isFrench: true,
    };
  }

  const frPath =
    currentPath === "/"
      ? "/fr"
      : normaliseSeoPath(`/fr${currentPath}`);

  return {
    currentPath,
    enPath: currentPath,
    frPath,
    canonicalPath: currentPath,
    isFrench: false,
  };
}

export function getSeoUrls(
  pathname,
  options = {}
) {
  const {
    currentPath,
    enPath,
    frPath,
    canonicalPath,
    isFrench,
  } = getSeoPaths(pathname, options);

  return {
    currentPath,
    enPath,
    frPath,
    canonicalPath,
    isFrench,

    enUrl: `${SEO_BASE_URL}${enPath}`,
    frUrl: `${SEO_BASE_URL}${frPath}`,
    canonicalUrl: `${SEO_BASE_URL}${canonicalPath}`,

    // The default version should be the English equivalent of this page,
    // rather than always pointing to the homepage.
    xDefaultUrl: `${SEO_BASE_URL}${enPath}`,
  };
}
