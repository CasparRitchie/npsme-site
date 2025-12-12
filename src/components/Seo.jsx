// src/components/Seo.jsx
import React from "react";
import { Helmet } from "react-helmet-async";

export default function Seo({
  path = "/",
  title,
  description,
  image = "https://www.npsme.com/og-image.jpg?v=3",
  lang = "en",
  alternates = [],
}) {
  const url = `https://www.npsme.com${path}`;

  return (
    <Helmet htmlAttributes={{ lang }}>
      <title>{title}</title>
      <link rel="canonical" href={url} />

      <meta name="description" content={description} />

      {/* hreflang */}
      {alternates.map((alt) => (
        <link
          key={alt.lang}
          rel="alternate"
          hrefLang={alt.lang}
          href={alt.href}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href="https://www.npsme.com/products" />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="NPS Me" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
