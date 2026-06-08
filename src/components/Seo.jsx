// src/components/Seo.jsx
import React from "react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../i18n/LanguageContext";

const BASE_URL = "https://www.npsme.com";

function normalisePath(path) {
  if (!path) return "/";
  let p = path.startsWith("/") ? path : `/${path}`;
  if (p !== "/" && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

function computeLangUrls({ path, lang, enPathOverride, frPathOverride }) {
  const p = normalisePath(path);

  // If overrides provided, use them directly
  if (enPathOverride || frPathOverride) {
    const enPath = normalisePath(enPathOverride || (p.startsWith("/fr") ? p.replace(/^\/fr/, "") || "/" : p));
    const frPath = normalisePath(frPathOverride || (enPath === "/" ? "/fr" : `/fr${enPath}`));

    const canonicalUrl = lang === "fr" ? `${BASE_URL}${frPath}` : `${BASE_URL}${enPath}`;

    return {
      enUrl: `${BASE_URL}${enPath}`,
      frUrl: `${BASE_URL}${frPath}`,
      xDefaultUrl: `${BASE_URL}${enPath}`,
      canonicalUrl,
    };
  }

  // Default behaviour (your existing logic)
  if (lang === "fr") {
    const frPath = p === "/" ? "/fr" : (p.startsWith("/fr") ? p : `/fr${p}`);
    const enPath = frPath === "/fr" ? "/" : frPath.replace(/^\/fr/, "") || "/";

    return {
      enUrl: `${BASE_URL}${enPath}`,
      frUrl: `${BASE_URL}${frPath}`,
      xDefaultUrl: `${BASE_URL}${enPath}`,
      canonicalUrl: `${BASE_URL}${frPath}`,
    };
  }

  const frPath = p === "/" ? "/fr" : (p.startsWith("/fr") ? p : `/fr${p}`);
  return {
    enUrl: `${BASE_URL}${p}`,
    frUrl: `${BASE_URL}${frPath}`,
    xDefaultUrl: `${BASE_URL}${p}`,
    canonicalUrl: `${BASE_URL}${p}`,
  };
}

export default function Seo({
  path = "/",
  title,
  description,
  image = `${BASE_URL}/og-image.jpg?v=3`,
  lang,
  // NEW: optional overrides for pages where FR slug isn't "/fr" + EN slug
  altPaths = null, // { en: "/intercom-nps-analytics", fr: "/fr/analyse-nps-intercom" }
  noindex = false,
}) {
  const { lang: ctxLang } = useLanguage();
  const effectiveLang = lang || ctxLang || "en";

  const { enUrl, frUrl, xDefaultUrl, canonicalUrl } = computeLangUrls({
    path,
    lang: effectiveLang,
    enPathOverride: altPaths?.en,
    frPathOverride: altPaths?.fr,
  });

  // Keep hreflang consistent
  const finalAlternates = [
    { lang: "en", href: enUrl },
    { lang: "fr", href: frUrl },
    { lang: "x-default", href: xDefaultUrl },
  ];

  return (
    <Helmet htmlAttributes={{ lang: effectiveLang }}>
      {title ? <title>{title}</title> : null}
      <link rel="canonical" href={canonicalUrl} />
      {description ? <meta name="description" content={description} /> : null}

      {!noindex
        ? finalAlternates.map((alt) => (
            <link
              key={`${alt.lang}-${alt.href}`}
              rel="alternate"
              hrefLang={alt.lang}
              href={alt.href}
            />
          ))
        : null}

      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow"}
      />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      {title ? <meta property="og:title" content={title} /> : null}
      {description ? <meta property="og:description" content={description} /> : null}
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="NPS Me" />

      <meta name="twitter:card" content="summary_large_image" />
      {title ? <meta name="twitter:title" content={title} /> : null}
      {description ? <meta name="twitter:description" content={description} /> : null}
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
