// src/pages/EnvolaResponses.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";
import EnvolaWorkspaceNav from "../components/EnvolaWorkspaceNav";

const DEFAULT_CONTENT_ID = "189616";

function shortDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function daysAgoYmd(days) {
  const d = new Date();
  d.setDate(d.getDate() - Number(days || 90));
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function todayYmdLocal() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
      {children}
    </span>
  );
}

function useExplorerFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    return {
      contentId: searchParams.get("content_id") || DEFAULT_CONTENT_ID,
      mode: searchParams.get("mode") || "rolling",
      days: Number(searchParams.get("days") || 120),
      from: searchParams.get("from") || daysAgoYmd(120),
      to: searchParams.get("to") || todayYmdLocal(),
      bucket: searchParams.get("bucket") || "all",
      search: searchParams.get("search") || "",
      sort: searchParams.get("sort") || "submitted_at",
      dir: searchParams.get("dir") || "desc",
    };
  }, [searchParams]);

  function updateFilters(patch) {
    const next = new URLSearchParams(searchParams);

    Object.entries(patch).forEach(([key, value]) => {
      if (value == null || value === "") {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });

    setSearchParams(next, { replace: true });
  }

  return { filters, updateFilters };
}

function bucketLabel(bucket, tr) {
  if (bucket === "promoter") return tr("envola.filters.promoters", "Promoters");
  if (bucket === "passive") return tr("envola.filters.passives", "Passives");
  if (bucket === "detractor") return tr("envola.filters.detractors", "Detractors");
  return tr("envola.filters.all", "All");
}

function bucketBadge(bucket) {
  if (bucket === "promoter") {
    return "bg-emerald-500/15 text-emerald-200 border-emerald-500/30";
  }
  if (bucket === "passive") {
    return "bg-amber-500/15 text-amber-200 border-amber-500/30";
  }
  if (bucket === "detractor") {
    return "bg-rose-500/15 text-rose-200 border-rose-500/30";
  }
  return "bg-white/5 text-slate-200 border-white/10";
}

function scoreTextClass(score) {
  if (!Number.isFinite(score)) return "text-slate-300";
  if (score >= 9) return "text-emerald-300";
  if (score >= 7) return "text-amber-300";
  return "text-rose-300";
}

function compareValues(a, b, dir = "asc") {
  const direction = dir === "desc" ? -1 : 1;

  const av = a ?? "";
  const bv = b ?? "";

  const an = Number(av);
  const bn = Number(bv);
  const bothNumeric = Number.isFinite(an) && Number.isFinite(bn) && av !== "" && bv !== "";

  if (bothNumeric) {
    if (an < bn) return -1 * direction;
    if (an > bn) return 1 * direction;
    return 0;
  }

  const ad = Date.parse(av);
  const bd = Date.parse(bv);
  const bothDateLike = Number.isFinite(ad) && Number.isFinite(bd);

  if (bothDateLike) {
    if (ad < bd) return -1 * direction;
    if (ad > bd) return 1 * direction;
    return 0;
  }

  const as = String(av).toLowerCase();
  const bs = String(bv).toLowerCase();

  if (as < bs) return -1 * direction;
  if (as > bs) return 1 * direction;
  return 0;
}

function SortableTh({ label, sortKey, filters, updateFilters, className = "" }) {
  const active = filters.sort === sortKey;
  const dir = active ? filters.dir : null;

  return (
    <th
      className={`px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-200 ${className}`}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-white"
        onClick={() =>
          updateFilters({
            sort: sortKey,
            dir: active && dir === "asc" ? "desc" : "asc",
          })
        }
      >
        <span>{label}</span>
        <span className="text-slate-400">
          {active ? (dir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </button>
    </th>
  );
}

function CellText({ children, className = "" }) {
  const content =
    children == null || children === "" || (typeof children === "string" && !children.trim())
      ? "—"
      : children;

  return (
    <div className={`whitespace-normal break-words leading-snug text-slate-100 ${className}`}>
      {content}
    </div>
  );
}

export default function EnvolaResponses() {
  const location = useLocation();
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);
  const { filters, updateFilters } = useExplorerFilters();
  const navAnchorRef = useRef(null);
  const [isNavPinned, setIsNavPinned] = useState(false);

  const [state, setState] = useState({
    loading: true,
    error: null,
    rows: [],
    summary: null,
  });

  const dateParams =
    filters.mode === "range"
      ? `from=${encodeURIComponent(filters.from)}&to=${encodeURIComponent(filters.to)}`
      : `days=${encodeURIComponent(filters.days)}`;

  useEffect(() => {
    let cancelled = false;

    setState((s) => ({ ...s, loading: true, error: null }));

    (async () => {
      try {
        const bucketParam =
          filters.bucket && filters.bucket !== "all"
            ? `&bucket=${encodeURIComponent(filters.bucket)}`
            : "";

        const url = `/api/envola/responses?content_id=${encodeURIComponent(
          filters.contentId
        )}&${dateParams}${bucketParam}&limit=2000`;

        const r = await fetch(url, { credentials: "include" });
        const t = await r.text();

        let j;
        try {
          j = JSON.parse(t);
        } catch {
          throw new Error(
            `Expected JSON but got non-JSON (status ${r.status}). First chars: ${t
              .slice(0, 160)
              .replace(/\s+/g, " ")
              .trim()}`
          );
        }

        if (!r.ok || !j?.ok) {
          throw new Error(j?.error || `Request failed (${r.status})`);
        }

        if (!cancelled) {
          setState({
            loading: false,
            error: null,
            rows: Array.isArray(j.rows) ? j.rows : [],
            summary: j.summary || null,
          });
        }
      } catch (e) {
        if (!cancelled) {
          setState({
            loading: false,
            error: String(e?.message || e),
            rows: [],
            summary: null,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filters.contentId, dateParams, filters.bucket]);

  useEffect(() => {
    function handleScroll() {
      if (!navAnchorRef.current) return;
      const rect = navAnchorRef.current.getBoundingClientRect();
      setIsNavPinned(rect.top <= 0);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const responseRows = useMemo(() => {
    const rawRows = Array.isArray(state.rows) ? state.rows : [];

    const filteredByBucket =
      filters.bucket === "all"
        ? rawRows
        : rawRows.filter((r) => String(r?.bucket || "") === filters.bucket);

    const search = filters.search.trim().toLowerCase();

    const searched = !search
      ? filteredByBucket
      : filteredByBucket.filter((r) => {
        const haystack = [
          r.contact_name,
          r.response_id,
          r.pioupiou,
          r.reader_serial,
          r.q_recommend_score,
          r.q_recommend_comment,
          r.q_install_score,
          r.q_install_comment,
          r.q_daily_use_score,
          r.q_benefits,
          r.q_parent_relation_score,
          r.q_parent_relation_comment,
          r.q_support_score,
          r.q_support_comment,
          r.q_final_comment,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(search);
      });

    const sorted = [...searched].sort((a, b) => {
      const result = compareValues(a?.[filters.sort], b?.[filters.sort], filters.dir);
      if (result !== 0) return result;
      return compareValues(a?.submitted_at, b?.submitted_at, "desc");
    });

    return sorted;
  }, [state.rows, filters.bucket, filters.search, filters.sort, filters.dir]);

  const activeWindowLabel =
    filters.mode === "range"
      ? `${filters.from} → ${filters.to}`
      : `${filters.days}d`;

  const bucketParams =
  filters.bucket && filters.bucket !== "all"
    ? `&bucket=${encodeURIComponent(filters.bucket)}`
    : "";

  const exportCsvUrl = useMemo(() => {
    return `/api/envola/responses-export.csv?content_id=${encodeURIComponent(
      filters.contentId
    )}&${dateParams}${bucketParams}`;
  }, [filters.contentId, dateParams, bucketParams]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={location.pathname}
        lang={lang}
        title={tr("envola.responses.seoTitle", "Envola — Responses | NPS Me")}
        description={tr(
          "envola.responses.seoDesc",
          "Private Envola responses explorer with one row per response."
        )}
      />

      <PageHeader iconLabel="NPS Me" tag={tr("envola.tag", "Client workspace / Envola")}>
        <div className="pt-4">
          <h1 className="text-3xl md:text-4xl font-semibold text-white">
            {tr("envola.responses.title", "Envola — Responses")}
          </h1>

          <p className="mt-3 max-w-3xl text-slate-300">
            {tr(
              "envola.responses.subtitle",
              "Vue détaillée des réponses, une ligne par réponse, avec tri et filtres globaux."
            )}
          </p>
        </div>
      </PageHeader>

      <div ref={navAnchorRef} className="h-px w-full" />

      {isNavPinned && <div className="h-[66px]" />}

      <section
        className={`border-y border-white/10 bg-[#0B1220]/95 backdrop-blur-md ${
          isNavPinned ? "fixed inset-x-0 top-0 z-[80]" : "relative"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 py-3">
          <EnvolaWorkspaceNav lang={lang} currentPath={location.pathname} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 md:p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {tr("envola.filters.title", "Global filters")}
              </h2>
              <p className="mt-0.5 text-xs md:text-sm text-slate-400">
                {tr(
                  "envola.responses.filtersSubtitle",
                  "Filter and sort responses before exploring the table."
                )}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <div>
              <label className="text-[11px] text-slate-400">
                {tr("envola.filters.mode", "Mode")}
              </label>
              <select
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                value={filters.mode}
                onChange={(e) => updateFilters({ mode: e.target.value })}
              >
                <option value="rolling">{tr("envola.filters.rolling", "Rolling")}</option>
                <option value="range">{tr("envola.filters.range", "Date range")}</option>
              </select>
            </div>

            {filters.mode === "rolling" ? (
              <div>
                <label className="text-[11px] text-slate-400">
                  {tr("common.window", "Window")}
                </label>
                <select
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                  value={filters.days}
                  onChange={(e) => updateFilters({ days: Number(e.target.value) })}
                >
                  <option value={30}>30d</option>
                  <option value={90}>90d</option>
                  <option value={180}>180d</option>
                  <option value={365}>365d</option>
                </select>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-[11px] text-slate-400">
                    {tr("common.from", "From")}
                  </label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                    value={filters.from}
                    onChange={(e) => updateFilters({ from: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400">
                    {tr("common.to", "To")}
                  </label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                    value={filters.to}
                    onChange={(e) => updateFilters({ to: e.target.value })}
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-[11px] text-slate-400">
                {tr("common.bucket", "Bucket")}
              </label>
              <select
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                value={filters.bucket}
                onChange={(e) => updateFilters({ bucket: e.target.value })}
              >
                <option value="all">{tr("envola.filters.all", "All")}</option>
                <option value="promoter">{tr("envola.filters.promoters", "Promoters")}</option>
                <option value="passive">{tr("envola.filters.passives", "Passives")}</option>
                <option value="detractor">{tr("envola.filters.detractors", "Detractors")}</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400">
                {tr("common.search", "Search")}
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                placeholder={tr("common.search", "Search")}
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400">
                {tr("envola.common.contentId", "content_id")}
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                value={filters.contentId}
                onChange={(e) => updateFilters({ content_id: e.target.value })}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {tr("envola.responses.tableTitle", "Responses")}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {tr(
                  "envola.responses.tableSubtitle",
                  "Export the currently filtered response set as CSV."
                )}
              </p>
            </div>

            <a
              href={exportCsvUrl}
              className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              {tr("envola.exports.downloadCsv", "Download CSV")}
            </a>
          </div>

          <div className="overflow-auto rounded-2xl border border-white/10">
            <table className="min-w-[2450px] table-fixed border-collapse text-xs">
                <thead className="sticky top-0 z-30 bg-[#0F172A]">
                  <tr className="border-b border-white/10">
                    <SortableTh
                      label={tr("common.contact", "Contact")}
                      sortKey="contact_name"
                      filters={filters}
                      updateFilters={updateFilters}
                      className="sticky left-0 z-40 w-[150px] min-w-[150px] bg-[#0F172A]"
                    />
                    <SortableTh
                      label={tr("common.date", "Date")}
                      sortKey="submitted_at"
                      filters={filters}
                      updateFilters={updateFilters}
                      className="sticky left-[150px] z-40 w-[95px] min-w-[95px] bg-[#0F172A]"
                    />
                    <SortableTh
                      label={tr("common.bucket", "Bucket")}
                      sortKey="bucket"
                      filters={filters}
                      updateFilters={updateFilters}
                      className="sticky left-[245px] z-40 w-[88px] min-w-[88px] bg-[#0F172A]"
                    />

                    <SortableTh
                      label="NPS"
                      sortKey="nps_score"
                      filters={filters}
                      updateFilters={updateFilters}
                      className="w-[70px]"
                    />

                    <SortableTh
                      label="Response ID"
                      sortKey="response_id"
                      filters={filters}
                      updateFilters={updateFilters}
                      className="w-[115px]"
                    />
                    <SortableTh
                      label="Pioupiou"
                      sortKey="pioupiou"
                      filters={filters}
                      updateFilters={updateFilters}
                      className="w-[120px]"
                    />
                    <SortableTh
                      label="Reader"
                      sortKey="reader_serial"
                      filters={filters}
                      updateFilters={updateFilters}
                      className="w-[110px]"
                    />
                    <SortableTh
                      label="Recommend"
                      sortKey="q_recommend_score"
                      filters={filters}
                      updateFilters={updateFilters}
                      className="w-[105px]"
                    />
                    <SortableTh
                      label="Why?"
                      sortKey="q_recommend_comment"
                      filters={filters}
                      updateFilters={updateFilters}
                      className="w-[280px]"
                    />
                    <SortableTh
                      label="Install"
                      sortKey="q_install_score"
                      filters={filters}
                      updateFilters={updateFilters}
                      className="w-[90px]"
                    />
                    <SortableTh
                      label="Install comment"
                      sortKey="q_install_comment"
                      filters={filters}
                      updateFilters={updateFilters}
                      className="w-[240px]"
                    />
                    <SortableTh
                      label="Daily use"
                      sortKey="q_daily_use_score"
                      filters={filters}
                      updateFilters={updateFilters}
                      className="w-[100px]"
                    />
                    <SortableTh
                      label="Benefits"
                      sortKey="q_benefits"
                      filters={filters}
                      updateFilters={updateFilters}
                      className="w-[240px]"
                    />
                    <SortableTh
                      label="Parent relation"
                      sortKey="q_parent_relation_score"
                      filters={filters}
                      updateFilters={updateFilters}
                      className="w-[115px]"
                    />
                    <SortableTh
                      label="Parent relation comment"
                      sortKey="q_parent_relation_comment"
                      filters={filters}
                      updateFilters={updateFilters}
                      className="w-[260px]"
                    />
                    <SortableTh
                      label="Support"
                      sortKey="q_support_score"
                      filters={filters}
                      updateFilters={updateFilters}
                      className="w-[95px]"
                    />
                    <SortableTh
                      label="Support comment"
                      sortKey="q_support_comment"
                      filters={filters}
                      updateFilters={updateFilters}
                      className="w-[220px]"
                    />
                    <SortableTh
                      label="Final comment"
                      sortKey="q_final_comment"
                      filters={filters}
                      updateFilters={updateFilters}
                      className="w-[240px]"
                    />
                    <SortableTh
                      label="Previous responses"
                      sortKey="previous_response_dates"
                      filters={filters}
                      updateFilters={updateFilters}
                      className="w-[170px]"
                    />
                  </tr>
                </thead>

                <tbody>
                  {responseRows.map((r, i) => {
                    const rowBg = i % 2 === 0 ? "bg-slate-950/60" : "bg-slate-900/60";
                    const stickyBg = i % 2 === 0 ? "bg-[#020817]" : "bg-[#0b1730]";

                    return (
                      <tr
                        key={r.response_id || `${r.contact_name}-${r.submitted_at}-${i}`}
                        className={`border-b border-white/10 align-top hover:bg-white/5 ${rowBg}`}
                      >
                        <td
                          className={`sticky left-0 z-20 w-[150px] min-w-[150px] border-r border-white/10 px-3 py-3 ${stickyBg}`}
                        >
                          <CellText>{r.contact_name}</CellText>

                          <div className="mt-3">
                            {r.intercom_contact_url ? (
                              <a
                                href={r.intercom_contact_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-medium text-indigo-200 hover:bg-indigo-500/20"
                              >
                                {tr("common.open", "Open")}
                              </a>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </div>
                        </td>

                        <td
                          className={`sticky left-[150px] z-20 w-[95px] min-w-[95px] border-r border-white/10 px-3 py-3 ${stickyBg}`}
                        >
                          <CellText>{shortDate(r.submitted_at)}</CellText>
                        </td>

                        <td
                          className={`sticky left-[245px] z-20 w-[88px] min-w-[88px] border-r border-white/10 px-3 py-3 ${stickyBg}`}
                        >
                          <span
                            className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${bucketBadge(
                              r.bucket
                            )}`}
                          >
                            {r.bucket || "—"}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-center">
                          <span className={`font-semibold ${scoreTextClass(Number(r.nps_score))}`}>
                            {r.nps_score ?? "—"}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <CellText>{r.response_id || "—"}</CellText>
                        </td>

                        <td className="px-3 py-3">
                          <CellText>{r.pioupiou}</CellText>
                        </td>

                        <td className="px-3 py-3">
                          <CellText>{r.reader_serial}</CellText>
                        </td>

                        <td className="px-3 py-3 text-center">
                          <span className={scoreTextClass(Number(r.q_recommend_score))}>
                            {r.q_recommend_score ?? "—"}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <CellText>{r.q_recommend_comment}</CellText>
                        </td>

                        <td className="px-3 py-3 text-center">
                          <span className={scoreTextClass(Number(r.q_install_score))}>
                            {r.q_install_score ?? "—"}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <CellText>{r.q_install_comment}</CellText>
                        </td>

                        <td className="px-3 py-3 text-center">
                          <span className={scoreTextClass(Number(r.q_daily_use_score))}>
                            {r.q_daily_use_score ?? "—"}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <CellText>{r.q_benefits}</CellText>
                        </td>

                        <td className="px-3 py-3 text-center">
                          <span className={scoreTextClass(Number(r.q_parent_relation_score))}>
                            {r.q_parent_relation_score ?? "—"}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <CellText>{r.q_parent_relation_comment}</CellText>
                        </td>

                        <td className="px-3 py-3 text-center">
                          <span className={scoreTextClass(Number(r.q_support_score))}>
                            {r.q_support_score ?? "—"}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <CellText>{r.q_support_comment}</CellText>
                        </td>

                        <td className="px-3 py-3">
                          <CellText>{r.q_final_comment}</CellText>
                        </td>

                        <td className="px-3 py-3 text-[11px] text-slate-300">
                          {Array.isArray(r.previous_response_dates) &&
                          r.previous_response_dates.length > 0 ? (
                            <div className="space-y-1">
                              {r.previous_response_dates.map((d, idx) => (
                                <div key={`${r.response_id || i}-prev-${idx}`}>{shortDate(d)}</div>
                              ))}
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
          </div>

          <div className="mt-4 text-xs text-slate-500">
            {tr(
              "envola.responses.sortTip",
              "Tip: click any column header to sort. Sticky headers and first columns stay visible while scrolling."
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
