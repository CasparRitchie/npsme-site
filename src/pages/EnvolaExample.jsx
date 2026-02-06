import React, { useEffect, useState } from "react";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";
import { useLocation, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";
import { localizePath } from "../i18n/pathHelpers";

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
      {sub ? <div className="mt-2 text-sm text-slate-300">{sub}</div> : null}
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
      {children}
    </span>
  );
}

function TogglePill({ active, onClick, color, children }) {
  // color: "green" | "amber" | "red"
  const base =
    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition select-none";
  const inactive = "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10";
  const activeMap = {
    green: "bg-green-400 text-black border-green-400",
    amber: "bg-amber-400 text-black border-amber-400",
    red: "bg-red-400 text-black border-red-400",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${active ? activeMap[color] : inactive}`}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

function prettyDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EnvolaExample() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);
  const location = useLocation();

  const [live, setLive] = useState({ loading: true, data: null, error: null });
  const [rate, setRate] = useState({ loading: true, data: null, error: null });
  const [themes, setThemes] = useState({ loading: true, data: null, error: null });
  const [comments, setComments] = useState({ loading: true, data: null, error: null });

  const [bucketFilter, setBucketFilter] = useState({
    promoters: true,
    passives: true,
    detractors: true,
  });

  const isAllOff =
    !bucketFilter.promoters && !bucketFilter.passives && !bucketFilter.detractors;

  function bucketAllowed(bucket) {
    if (isAllOff) return true;
    if (bucket === "promoter") return bucketFilter.promoters;
    if (bucket === "passive") return bucketFilter.passives;
    if (bucket === "detractor") return bucketFilter.detractors;
    return true;
  }

  function labelBucket(bucket) {
    if (bucket === "promoter") return tr("envola.filters.promoters", "Promoters");
    if (bucket === "passive") return tr("envola.filters.passives", "Passives");
    if (bucket === "detractor") return tr("envola.filters.detractors", "Detractors");
    return bucket || tr("common.unknown", "Unknown");
  }

  function labelTheme(themeKey) {
    // If you later add theme label translations, this will pick them up.
    return tr(`envola.themeLabels.${themeKey}`, themeKey);
  }

  // LIVE
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(
          "/api/intercom/public/nps-summary?content_id=189616&days=30"
        );
        const j = await r.json();
        if (!cancelled) {
          setLive({
            loading: false,
            data: j,
            error: r.ok ? null : j?.error || "Error",
          });
        }
      } catch (e) {
        if (!cancelled)
          setLive({ loading: false, data: null, error: e.message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // RATE
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(
          "/api/intercom/public/nps-response-rate?content_id=189616&days=30"
        );
        const j = await r.json();
        if (!cancelled) {
          setRate({
            loading: false,
            data: j,
            error: r.ok ? null : j?.error || "Error",
          });
        }
      } catch (e) {
        if (!cancelled)
          setRate({ loading: false, data: null, error: e.message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // THEMES (refetches when toggles change)
  useEffect(() => {
    let cancelled = false;

    setThemes((s) => ({ ...s, loading: true }));

    (async () => {
      try {
        const selected = [];
        if (bucketFilter.promoters) selected.push("promoter");
        if (bucketFilter.passives) selected.push("passive");
        if (bucketFilter.detractors) selected.push("detractor");

        const bucketsParam =
          selected.length === 0
            ? ""
            : `&buckets=${encodeURIComponent(selected.join(","))}`;

        const r = await fetch(
          `/api/intercom/public/nps-themes?content_id=189616&days=30${bucketsParam}`
        );
        const j = await r.json();

        if (!cancelled) {
          setThemes({
            loading: false,
            data: j,
            error: r.ok ? null : j?.error || "Error",
          });
        }
      } catch (e) {
        if (!cancelled)
          setThemes({ loading: false, data: null, error: e.message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bucketFilter.promoters, bucketFilter.passives, bucketFilter.detractors]);

  // COMMENTS (fetch once; filter client-side)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(
          "/api/intercom/public/nps-comments?content_id=189616&days=30&limit=50"
        );
        const j = await r.json();
        if (!cancelled) {
          setComments({
            loading: false,
            data: j,
            error: r.ok ? null : j?.error || "Error",
          });
        }
      } catch (e) {
        if (!cancelled)
          setComments({ loading: false, data: null, error: e.message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={location.pathname}
        lang={lang}
        title={tr(
          "envola.seo.title",
          "Envola - Intercom NPS Analytics (Live Example) | NPSme"
        )}
        description={tr(
          "envola.seo.description",
          "A live, anonymised example showing how NPSme layers analytics on top of Intercom NPS."
        )}
        altPaths={{
          en: "/envola",
          fr: "/fr/exemple-envola",
        }}
      />

      <PageHeader iconLabel="NPS Me" tag={tr("envola.tag", "Client example / Envola")}>
        <div className="pt-4 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl leading-tight font-semibold tracking-tight text-white">
              {tr("envola.h1", "Envola - Intercom NPS Analytics")}
            </h1>

            <p className="mt-5 text-slate-300 max-w-2xl">
              {tr(
                "envola.intro",
                "This is a live, anonymised example. It shows what NPSme can surface once an NPS survey is running in Intercom - starting with score + distribution, and soon drivers, themes, and recommendations."
              )}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                to={localizePath("/intercom-nps-analytics", lang)}
                className="group inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
              >
                {tr("envola.ctaPrimary", "See how it works")}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>

              <Link
                to={localizePath("/book", lang)}
                className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"
              >
                {tr("envola.ctaSecondary", "Book a CX review")}
              </Link>
            </div>
          </div>
        </div>
      </PageHeader>

      {/* Live snapshot */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            {tr("envola.live.title", "Live snapshot (last 30 days)")}
          </h2>
          <p className="mt-3 text-slate-300 max-w-3xl">
            {tr(
              "envola.live.subtitle",
              "Aggregated only - no personal data. Data source: Intercom survey completions → NPSme clean store."
            )}
          </p>

          {live.loading && (
            <p className="mt-6 text-sm text-slate-300">{tr("common.loading", "Loading…")}</p>
          )}
          {!live.loading && live.error && (
            <p className="mt-6 text-sm text-red-300">Error: {live.error}</p>
          )}

          {!live.loading && live.data?.ok && (
            <>
              {live.data.responses === 0 ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-5 text-sm text-slate-300">
                  {tr(
                    "envola.live.noData",
                    `No completions yet in the last ${live.data.window_days} days. Once responses arrive, this panel updates automatically.`
                  )}
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-4">
                  <StatCard
                    label={tr("envola.live.kpiNps", `NPS (last ${live.data.window_days} days)`)}
                    value={live.data.nps === null ? "-" : live.data.nps}
                    sub={tr(
                      "envola.live.kpiSub",
                      `${live.data.responses} responses • confidence: ${live.data.confidence}`
                    )}
                  />
                  <StatCard
                    label={tr("envola.live.promoters", "Promoters")}
                    value={live.data.promoters}
                    sub={tr("envola.live.promotersSub", "Scores 9–10")}
                  />
                  <StatCard
                    label={tr("envola.live.passives", "Passives")}
                    value={live.data.passives}
                    sub={tr("envola.live.passivesSub", "Scores 7–8")}
                  />
                  <StatCard
                    label={tr("envola.live.detractors", "Detractors")}
                    value={live.data.detractors}
                    sub={tr("envola.live.detractorsSub", "Scores 0–6")}
                  />
                </div>
              )}

              <div className="mt-6 text-xs text-slate-400">
                {tr("envola.live.meta", "Survey ID: 189616")} •{" "}
                {tr("envola.live.lastResponse", "Last response")}{" "}
                {prettyDate(live.data.newest_response_at)}
              </div>

              {live.data.responses < 10 && (
                <div className="mt-4 text-xs text-slate-400">
                  {tr(
                    "envola.live.earlyNote",
                    "Note: early sample. NPS will stabilise as response volume increases."
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Response rate + completion time */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-white">
                {tr("envola.metrics.title", "Response funnel & timing")}
              </h2>
              <p className="mt-2 text-sm text-slate-300 max-w-3xl">
                {tr(
                  "envola.metrics.subtitle",
                  "Pulled from Intercom content stats export (shown → completed) and summarised for fast reporting."
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Pill>{tr("envola.meta.publicSafe", "Public-safe (aggregated)")}</Pill>
              <Pill>{tr("envola.meta.window", "Window: 30 days")}</Pill>
            </div>
          </div>

          {rate.loading && (
            <p className="mt-6 text-sm text-slate-300">{tr("common.loading", "Loading…")}</p>
          )}
          {!rate.loading && rate.error && (
            <p className="mt-6 text-sm text-red-300">Error: {rate.error}</p>
          )}

          {!rate.loading && rate.data?.ok && (
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <StatCard
                label={tr("envola.metrics.shown", "Shown")}
                value={rate.data.shown ?? "-"}
                sub={tr("envola.metrics.shownSub", "Survey displayed to users")}
              />
              <StatCard
                label={tr("envola.metrics.completed", "Completed")}
                value={rate.data.completed ?? "-"}
                sub={tr("envola.metrics.completedSub", "Survey fully completed")}
              />
              <StatCard
                label={tr("envola.metrics.responseRate", "Response rate")}
                value={
                  rate.data.response_rate_pct == null ? "-" : `${rate.data.response_rate_pct}%`
                }
                sub={tr("envola.metrics.responseRateSub", "Completed ÷ shown")}
              />
              <StatCard
                label={tr("envola.metrics.medianCompletion", "Median completion time")}
                value={rate.data.median_time_to_completion || "-"}
                sub={
                  rate.data.median_time_to_first_answer
                    ? tr(
                        "envola.metrics.medianAnswerSub",
                        `Median time to first answer: ${rate.data.median_time_to_first_answer}`
                      )
                    : tr(
                        "envola.metrics.medianAnswerSubFallback",
                        "Median time to first answer: -"
                      )
                }
              />
            </div>
          )}

          <div className="mt-6 text-xs text-slate-400">
            {tr(
              "envola.metrics.note",
              "Tip: run the export-stats ingest periodically to keep response-rate and timing up to date."
            )}
          </div>
        </div>
      </section>

      {/* Themes */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-white">
                {tr("envola.themes.title", "Themes in comments (early view)")}
              </h2>
              <p className="mt-2 text-sm text-slate-300 max-w-3xl">
                {tr(
                  "envola.themes.subtitle",
                  "Simple theme detection for now. This will evolve into driver analysis and richer NLP over time."
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Pill>{tr("envola.meta.publicSafe", "Public-safe (aggregated)")}</Pill>
              <Pill>{tr("envola.meta.window", "Window: 30 days")}</Pill>
            </div>
          </div>

          {/* Filter toggles */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">
              {tr("envola.filters.label", "Filter:")}
            </span>

            <TogglePill
              color="green"
              active={bucketFilter.promoters}
              onClick={() => setBucketFilter((s) => ({ ...s, promoters: !s.promoters }))}
            >
              {tr("envola.filters.promoters", "Promoters")}
            </TogglePill>

            <TogglePill
              color="amber"
              active={bucketFilter.passives}
              onClick={() => setBucketFilter((s) => ({ ...s, passives: !s.passives }))}
            >
              {tr("envola.filters.passives", "Passives")}
            </TogglePill>

            <TogglePill
              color="red"
              active={bucketFilter.detractors}
              onClick={() => setBucketFilter((s) => ({ ...s, detractors: !s.detractors }))}
            >
              {tr("envola.filters.detractors", "Detractors")}
            </TogglePill>

            {isAllOff && (
              <span className="text-xs text-slate-400">
                {tr("envola.filters.noneSelected", "No filter selected - showing all")}
              </span>
            )}
          </div>

          {themes.loading && (
            <p className="mt-6 text-sm text-slate-300">{tr("common.loading", "Loading…")}</p>
          )}
          {!themes.loading && themes.error && (
            <p className="mt-6 text-sm text-red-300">Error: {themes.error}</p>
          )}

          {!themes.loading && themes.data?.ok && (
            <>
              {(!themes.data.themes || themes.data.themes.length === 0) ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-5 text-sm text-slate-300">
                  {tr(
                    "envola.themes.noThemes",
                    "No themes detected yet (this is normal with a small sample). As comments grow, this table will populate."
                  )}
                </div>
              ) : (
                <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
                  <table className="w-full border-collapse">
                    <thead className="bg-white/5">
                      <tr className="text-left text-xs text-slate-300">
                        <th className="px-4 py-3">{tr("envola.themes.cols.theme", "Theme")}</th>
                        <th className="px-4 py-3">{tr("envola.themes.cols.mentions", "Mentions")}</th>
                        <th className="px-4 py-3">{tr("envola.themes.cols.avgScore", "Avg score")}</th>
                        <th className="px-4 py-3">{tr("envola.themes.cols.detrShare", "Detractor share")}</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {themes.data.themes.slice(0, 8).map((t) => (
                        <tr key={t.theme} className="border-t border-white/10">
                          <td className="px-4 py-3 text-white">{labelTheme(t.theme)}</td>
                          <td className="px-4 py-3 text-slate-200">{t.mentions}</td>
                          <td className="px-4 py-3 text-slate-200">{t.avg_score ?? "-"}</td>
                          <td className="px-4 py-3 text-slate-200">
                            {t.share_of_detractor_mentions == null ? "-" : `${t.share_of_detractor_mentions}%`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-6 text-xs text-slate-400">
                {tr(
                  "envola.themes.note",
                  "Next: upgrade this into “drivers” (what correlates with detractors), and generate AI-assisted recommendations based on evidence."
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Comments */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-semibold text-white">
            {tr("envola.comments.title", "What customers are saying")}
          </h2>
          <p className="mt-2 text-sm text-slate-300 max-w-3xl">
            {tr("envola.comments.subtitle", "Real comments from the last 30 days (redacted for privacy).")}
          </p>

          {/* Filter toggles */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">
              {tr("envola.filters.label", "Filter:")}
            </span>

            <TogglePill
              color="green"
              active={bucketFilter.promoters}
              onClick={() => setBucketFilter((s) => ({ ...s, promoters: !s.promoters }))}
            >
              {tr("envola.filters.promoters", "Promoters")}
            </TogglePill>

            <TogglePill
              color="amber"
              active={bucketFilter.passives}
              onClick={() => setBucketFilter((s) => ({ ...s, passives: !s.passives }))}
            >
              {tr("envola.filters.passives", "Passives")}
            </TogglePill>

            <TogglePill
              color="red"
              active={bucketFilter.detractors}
              onClick={() => setBucketFilter((s) => ({ ...s, detractors: !s.detractors }))}
            >
              {tr("envola.filters.detractors", "Detractors")}
            </TogglePill>

            {isAllOff && (
              <span className="text-xs text-slate-400">
                {tr("envola.filters.noneSelected", "No filter selected - showing all")}
              </span>
            )}
          </div>

          {comments.loading && (
            <p className="mt-6 text-sm text-slate-300">{tr("common.loading", "Loading…")}</p>
          )}
          {!comments.loading && comments.error && (
            <p className="mt-6 text-sm text-red-300">Error: {comments.error}</p>
          )}

          {!comments.loading && comments.data?.ok && (
            <>
              <div className="mt-4 text-xs text-slate-400">
                {(() => {
                  const filtered = (comments.data.comments || []).filter((c) =>
                    bucketAllowed(c.bucket)
                  );
                  const substantive = filtered.filter((c) => c.is_substantive).length;
                  return (
                    <>
                      {substantive} of {filtered.length}{" "}
                      {tr(
                        "envola.comments.substantiveLabel",
                        "comments are “substantive” (8+ words)."
                      )}
                    </>
                  );
                })()}
              </div>

              {(comments.data.comments || []).filter((c) => bucketAllowed(c.bucket)).length ? (
                <div className="mt-6 space-y-3">
                  {comments.data.comments
                    .filter((c) => bucketAllowed(c.bucket))
                    .map((c, idx) => (
                      <div
                        key={`${c.submitted_at}-${idx}`}
                        className="rounded-2xl border border-white/10 bg-black/10 p-5"
                      >
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                            {labelBucket(c.bucket)} • {c.score_0_10}/10
                          </span>
                          <span className="text-slate-400">{prettyDate(c.submitted_at)}</span>
                          {c.is_substantive && (
                            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                              {tr("envola.comments.tookTime", "Took time to write")}
                            </span>
                          )}
                        </div>

                        <p className="mt-3 text-sm text-slate-200 leading-relaxed">
                          “{c.comment}”
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-5 text-sm text-slate-300">
                  {tr("envola.comments.none", "No comments returned for this filter yet.")}
                </div>
              )}
            </>
          )}

          <div className="mt-6 text-xs text-slate-400">
            {tr(
              "envola.comments.redactionNote",
              "Comments are redacted automatically (emails, phone numbers, links, IDs)."
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
