// src/components/landing/LandingSectionFallback.jsx
import React from "react";

export default function LandingSectionFallback({ className = "", minHeight = "240px" }) {
  return (
    <section className={`mx-auto max-w-7xl px-6 pb-20 ${className}`}>
      <div
        className="rounded-3xl border border-white/10 bg-white/5 animate-pulse"
        style={{ minHeight }}
      />
    </section>
  );
}
