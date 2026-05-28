// src/components/landing/LandingScreenshotCard.jsx
import React from "react";

export default function LandingScreenshotCard({
  image,
  className = "",
  priority = false,
}) {
  if (!image?.src) return null;

  return (
    <div
      className={`overflow-hidden rounded-3xl border border-white/10 bg-black/30 shadow-2xl shadow-black/30 ${className}`}
    >
      <div className="border-b border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
          <span className="ml-3 text-xs text-slate-400">
            {image.title || "NPS Me"}
          </span>
        </div>
      </div>

      <img
        src={image.src}
        alt={image.alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        width={800}
        height={479}
        className="w-full bg-[#0B0F19] object-cover"
      />
    </div>
  );
}
