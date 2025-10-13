import React from "react";
import { Link } from "react-router-dom";
import { NAV } from "../navConfig";

export default function SiteFooter() {
  const footerLinks = NAV.footer.filter((l) => l.enabled !== false);

  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-slate-400 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div>© {new Date().getFullYear()} NPS Me. All rights reserved.</div>
        <div className="flex gap-6">
          {footerLinks.map((l) =>
            l.to?.startsWith("http") ? (
              <a key={l.label} href={l.to} className="hover:text-slate-200" target="_blank" rel="noreferrer">
                {l.label}
              </a>
            ) : (
              <Link key={l.label} to={l.to} className="hover:text-slate-200">
                {l.label}
              </Link>
            )
          )}
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 pb-8 text-[11px] leading-snug text-slate-500">
        NPS® and Net Promoter Score® are registered service marks of Bain &amp; Company, Inc., Fred Reichheld, and
        Satmetrix Systems, Inc. NPS Me is independent and is not affiliated with, sponsored, or endorsed by Bain &amp; Company.
      </div>
    </footer>
  );
}
