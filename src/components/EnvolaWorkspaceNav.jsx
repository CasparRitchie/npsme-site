import React from "react";
import { Link } from "react-router-dom";
import { localizePath } from "../i18n/pathHelpers";

export default function EnvolaWorkspaceNav({ lang, currentPath }) {
  const items = [
    {
      key: "performance",
      labelEn: "Performance",
      labelFr: "Performance",
      path: "/envola/performance",
    },
    {
      key: "responses",
      labelEn: "Responses",
      labelFr: "Réponses",
      path: "/envola/responses",
    },
    {
      key: "invitations",
      labelEn: "Invitations",
      labelFr: "Invitations",
      path: "/envola/invitations",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const to = localizePath(item.path, lang);
        const active = currentPath === to;

        return (
          <Link
            key={item.key}
            to={to}
            className={`inline-flex items-center rounded-2xl border px-4 py-2 text-sm font-medium transition ${
              active
                ? "border-white bg-white text-black"
                : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
            }`}
          >
            {lang === "fr" ? item.labelFr : item.labelEn}
          </Link>
        );
      })}
    </div>
  );
}
