// src/components/Seo.jsx
import React from "react";
import { Helmet } from "react-helmet-async";

/**
 * <Seo /> – lightweight per-page meta helper.
 * - `path` should be the pathname (e.g., "/products")
 * - `title` is the full page <title>
 * - `description` is the meta description
 * - `image` optional: absolute OG/Twitter image URL
 */
export default function Seo({
  path = "/",
  title = "NPS Me",
  description = "Customer experience (CX) consulting to improve NPS®, retention, and revenue.",
  image = "https://www.npsme.com/og-image.jpg?v=3",
}) {
  const url = `https://www.npsme.com${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <link rel="canonical" href={url} />

      <meta name="description" content={description} />

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
