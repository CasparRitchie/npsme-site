// src/components/SiteFooter.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../routesRegistry";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { t } from "../i18n/translations.js";

export default function SiteFooter() {
  const footerLinks = ROUTES.filter((r) => r.enabled && r.inFooter);
  const { lang } = useLanguage();

  const isExternal = (to = "") => /^https?:\/\//i.test(to);
  const isHash = (to = "") => to.includes("#");

  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-slate-400 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div>© {new Date().getFullYear()} NPS Me. All rights reserved.</div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {footerLinks.map(({ path, label, labelKey }) => {
            const text = t(lang, labelKey, label);

            if (isExternal(path)) {
              return (
                <a key={label} href={path} className="hover:text-slate-200" target="_blank" rel="noreferrer">
                  {text}
                </a>
              );
            }
            if (isHash(path)) {
              return (
                <a key={label} href={path} className="hover:text-slate-200">
                  {text}
                </a>
              );
            }
            return (
              <Link key={label} to={localizePath(path, lang)} className="hover:text-slate-200">
                {/* {t(lang, labelKey, label)} */}
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-8 text-[11px] leading-snug text-slate-500">
        NPS® and Net Promoter Score® are registered service marks of Bain &amp; Company, Inc., Fred Reichheld, and
        Satmetrix Systems, Inc. References are descriptive only. NPS Me is independent and is not affiliated with, sponsored,
        or endorsed by those parties.
      </div>
    </footer>
  );
}
