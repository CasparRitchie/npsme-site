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

// For a given current path + lang, compute the EN and FR equivalents
function computeLangUrls(path, lang) {
  const p = normalisePath(path);

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

  const frPath =
    p === "/" ? "/fr" : (p.startsWith("/fr") ? p : `/fr${p}`);
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
  // keep alternates optional: if provided we’ll use it, otherwise auto
  alternates = null,
  noindex = false,
}) {
  const { lang: ctxLang } = useLanguage();
  const effectiveLang = lang || ctxLang || "en";
  const { enUrl, frUrl, xDefaultUrl, canonicalUrl } = computeLangUrls(path, effectiveLang);

  // If caller passes alternates explicitly, use them; otherwise auto-generate EN/FR.
  const finalAlternates =
    Array.isArray(alternates) && alternates.length > 0
      ? alternates
      : [
          { lang: "en-GB", href: enUrl },
          { lang: "fr-FR", href: frUrl },
          { lang: "x-default", href: xDefaultUrl },
        ];

  return (
    <Helmet htmlAttributes={{ lang: effectiveLang }}>
      {title ? <title>{title}</title> : null}
      <link rel="canonical" href={canonicalUrl} />

      {description ? <meta name="description" content={description} /> : null}

      {/* hreflang */}
      {finalAlternates.map((alt) => (
        <link
          key={`${alt.lang}-${alt.href}`}
          rel="alternate"
          hrefLang={alt.lang}
          href={alt.href}
        />
      ))}

      {noindex ? <meta name="robots" content="noindex, follow" /> : null}
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      {title ? <meta property="og:title" content={title} /> : null}
      {description ? <meta property="og:description" content={description} /> : null}
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="NPS Me" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {title ? <meta name="twitter:title" content={title} /> : null}
      {description ? <meta name="twitter:description" content={description} /> : null}
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
