// src/components/Seo.jsx
import React from "react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../i18n/LanguageContext";
import {
  SEO_BASE_URL,
  getSeoUrls,
} from "../seoRoutes";

export default function Seo({
  path = "/",
  title,
  description,
  image = `${SEO_BASE_URL}/og-image.jpg?v=3`,
  lang,

  // Kept for backwards compatibility with existing pages.
  // Example:
  // {
  //   en: "/intercom-nps-analytics",
  //   fr: "/fr/analyse-nps-intercom",
  // }
  altPaths = null,

  noindex = false,
}) {
  const { lang: contextLang } = useLanguage();

  const {
    enUrl,
    frUrl,
    xDefaultUrl,
    canonicalUrl,
    isFrench,
  } = getSeoUrls(path, {
    enPathOverride: altPaths?.en,
    frPathOverride: altPaths?.fr,
  });

  /*
   * Prefer the language derived from the URL.
   *
   * The canonical URL should never depend solely on React context because
   * language context can briefly lag behind client-side navigation.
   */
  const effectiveLang =
    lang ||
    (isFrench ? "fr" : "en") ||
    contextLang ||
    "en";

  const robotsContent = noindex
    ? "noindex, nofollow"
    : "index, follow";

  return (
    <Helmet htmlAttributes={{ lang: effectiveLang }}>
      {title ? <title>{title}</title> : null}

      <link
        rel="canonical"
        href={canonicalUrl}
      />

      {description ? (
        <meta
          name="description"
          content={description}
        />
      ) : null}

      {!noindex ? (
        <>
          <link
            rel="alternate"
            hrefLang="en-GB"
            href={enUrl}
          />

          <link
            rel="alternate"
            hrefLang="fr-FR"
            href={frUrl}
          />

          <link
            rel="alternate"
            hrefLang="x-default"
            href={xDefaultUrl}
          />
        </>
      ) : null}

      <meta
        name="robots"
        content={robotsContent}
      />

      <meta
        property="og:type"
        content="website"
      />

      <meta
        property="og:url"
        content={canonicalUrl}
      />

      {title ? (
        <meta
          property="og:title"
          content={title}
        />
      ) : null}

      {description ? (
        <meta
          property="og:description"
          content={description}
        />
      ) : null}

      <meta
        property="og:image"
        content={image}
      />

      <meta
        property="og:site_name"
        content="NPS Me"
      />

      <meta
        name="twitter:card"
        content="summary_large_image"
      />

      {title ? (
        <meta
          name="twitter:title"
          content={title}
        />
      ) : null}

      {description ? (
        <meta
          name="twitter:description"
          content={description}
        />
      ) : null}

      <meta
        name="twitter:image"
        content={image}
      />
    </Helmet>
  );
}
