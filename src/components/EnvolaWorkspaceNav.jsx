// src/components/EnvolaWorkspaceNav.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { localizePath } from "../i18n/pathHelpers";
import { translations } from "../i18n/translations";

export default function EnvolaWorkspaceNav() {
  const location = useLocation();
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);

  const items = [
    {
      key: "performance",
      label: tr("envola.workspace.performance", "Performance"),
      path: "/envola/performance",
    },
    {
      key: "responses",
      label: tr("envola.workspace.responses", "Responses"),
      path: "/envola/responses",
    },
    {
      key: "invitations",
      label: tr("envola.workspace.invitations", "Invitations"),
      path: "/envola/invitations",
    },
  ];

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-2">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const to = localizePath(item.path, lang);
          const active = location.pathname === to;

          return (
            <Link
              key={item.key}
              to={to}
              className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium transition ${
                active
                  ? "bg-white text-[#0B0F19]"
                  : "text-slate-200 hover:bg-white/10"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
