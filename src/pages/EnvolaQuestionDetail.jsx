import React from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";
import { localizePath } from "../i18n/pathHelpers";

export default function EnvolaQuestionDetail() {
  const { questionId } = useParams();
  const location = useLocation();
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={location.pathname}
        lang={lang}
        title={tr("envola.qd.seoTitle", "Envola — Question detail | NPSme")}
        description={tr("envola.qd.seoDesc", "Question-level evidence and verbatims.")}
        altPaths={{ en: "/envola", fr: "/fr/exemple-envola" }}
      />

      <PageHeader iconLabel="NPS Me" tag={tr("envola.tag", "Client example / Envola")}>
        <div className="pt-4">
          <h1 className="text-3xl md:text-4xl font-semibold text-white">
            {tr("envola.qd.title", "Question detail")}
          </h1>
          <p className="mt-3 text-slate-300">
            {tr("envola.qd.questionId", "Question ID")}:{" "}
            <span className="text-white font-semibold">{questionId}</span>
          </p>

          <div className="mt-6">
            <Link
              to={localizePath("/envola", lang)}
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-white/10 hover:bg-white/15 transition"
            >
              ← {tr("common.back", "Back")}
            </Link>
          </div>
        </div>
      </PageHeader>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <p className="text-slate-300">
            Next: fetch responses and show evidence for this question (scores + verbatims + Intercom links).
          </p>
        </div>
      </section>
    </div>
  );
}
