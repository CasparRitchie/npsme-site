import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import CsvNpsWorkspaceNav from "../components/CsvNpsWorkspaceNav";
import WorkspaceDatasetHeader from "../components/WorkspaceDatasetHeader";

const PAGE_COPY = {
  eyebrow: "NPS Me Workspace",
  title: "Responses",
  savedSubtitle:
    "Review, search and filter the customer responses in this saved feedback dataset.",
  sessionSubtitle:
    "Review, search and filter the customer responses in the latest browser-session dataset.",
  intercomSubtitle:
    "Review, search and filter the customer responses from the active Intercom source for this workspace.",
};

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
  const bothNumeric =
    Number.isFinite(an) && Number.isFinite(bn) && av !== "" && bv !== "";

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

function SortableTh({ label, sortKey, sort, dir, onSort, className = "" }) {
  const active = sort === sortKey;

  return (
    <th className={`px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-200 ${className}`}>
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-white"
        onClick={() => onSort(sortKey)}
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

export default function CsvNpsResponses() {
  const { datasetId } = useParams();

  const [dataset, setDataset] = useState(null);
  const [loadingDataset, setLoadingDataset] = useState(Boolean(datasetId));
  const [datasetError, setDatasetError] = useState("");
  const [mode, setMode] = useState(datasetId ? "saved" : "unknown");

  const [bucketFilter, setBucketFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState("submitted_at");
  const [dir, setDir] = useState("desc");

  const [replyDraftRow, setReplyDraftRow] = useState(null);
  const [replyDraft, setReplyDraft] = useState(null);
  const [replyDraftLoading, setReplyDraftLoading] = useState(false);
  const [replyDraftError, setReplyDraftError] = useState("");
  const [replyDraftCopied, setReplyDraftCopied] = useState(false);

  useEffect(() => {
    setReplyDraftRow(null);
    setReplyDraft(null);
    setReplyDraftError("");
    setReplyDraftCopied(false);

    async function loadSavedDataset() {
      setLoadingDataset(true);
      setDatasetError("");

      try {
        const datasetMetaRes = await fetch(`/api/workspace/datasets/${datasetId}`, {
          credentials: "include",
        });

        const datasetMeta = await datasetMetaRes.json();

        if (!datasetMetaRes.ok || !datasetMeta.ok) {
          throw new Error(datasetMeta.error || "Failed to load saved dataset");
        }

        const sourceType = String(datasetMeta?.dataset?.source_type || "").trim();

        if (sourceType === "workspace_intercom") {
          const params = new URLSearchParams();
          params.set("limit", "2000");

          const intercomRes = await fetch(
            `/api/workspace-intercom/responses?${params.toString()}`,
            {
              credentials: "include",
            }
          );

          const intercomData = await intercomRes.json();

          if (!intercomRes.ok || !intercomData.ok) {
            throw new Error(
              intercomData.error || "Failed to load workspace Intercom responses"
            );
          }

          setDataset(
            normaliseWorkspaceIntercomResponsesDataset({
              dataset: intercomData.dataset || datasetMeta.dataset,
              source: intercomData.source,
              summary: intercomData.summary,
              rows: intercomData.rows,
            })
          );
          setMode("intercom");
          return;
        }

        const params = new URLSearchParams();
        params.set("limit", "500");

        const res = await fetch(
          `/api/workspace/datasets/${datasetId}/responses?${params.toString()}`,
          {
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Failed to load saved dataset");
        }

        setDataset(normaliseWorkspaceResponsesDataset(data));
        setMode("saved");
      } catch (err) {
        console.error("Failed to load saved workspace responses dataset:", err);
        setDatasetError(err.message || "Failed to load saved dataset");
      } finally {
        setLoadingDataset(false);
      }
    }

    async function loadActiveIntercomDataset() {
      try {
        const params = new URLSearchParams();
        params.set("limit", "2000");

        const res = await fetch(
          `/api/workspace-intercom/responses?${params.toString()}`,
          {
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Failed to load active Intercom responses");
        }

        setDataset(
          normaliseWorkspaceIntercomResponsesDataset({
            dataset: data.dataset || {
              id: null,
              dataset_name: data?.source?.source_name || "Active Intercom source",
              source_type: "workspace_intercom",
              content_id: data?.content_id || data?.source?.survey_content_id || null,
              raw_row_count: data?.summary?.total || data?.rows?.length || 0,
              valid_row_count: data?.summary?.total || data?.rows?.length || 0,
              skipped_row_count: 0,
              summary_json: data?.summary || {},
            },
            source: data.source,
            summary: data.summary,
            rows: data.rows,
          })
        );
        setMode("intercom");
        return true;
      } catch (_err) {
        return false;
      }
    }

    function loadSessionDataset() {
      const saved = sessionStorage.getItem("csvNpsLatestDataset");

      if (!saved) {
        setDataset(null);
        return false;
      }

      try {
        const parsed = JSON.parse(saved);
        setDataset(normaliseSessionDataset(parsed));
        setMode("session");
        return true;
      } catch (err) {
        console.error("Failed to read CSV NPS dataset from sessionStorage", err);
        setDatasetError("Failed to read latest browser-session dataset");
        return false;
      }
    }

    async function loadWithoutDatasetId() {
      setLoadingDataset(true);
      setDatasetError("");

      try {
        const loadedIntercom = await loadActiveIntercomDataset();

        if (!loadedIntercom) {
          loadSessionDataset();
        }
      } finally {
        setLoadingDataset(false);
      }
    }

    if (datasetId) {
      loadSavedDataset();
    } else {
      loadWithoutDatasetId();
    }
  }, [datasetId]);

  function handleSort(sortKey) {
    if (sort === sortKey) {
      setDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSort(sortKey);
    setDir("asc");
  }

  function getClosingLoopUrl(row) {
    const responseRef =
      row.db_row_id ||
      row.dataset_row_id ||
      row.id ||
      row.response_id;

    if (!responseRef) {
      return "/workspace/closing-the-loop";
    }

    return `/workspace/closing-the-loop?response=${encodeURIComponent(responseRef)}`;
  }

  function handleRowClick(row, event) {
    const interactiveTarget = event.target.closest(
      "a, button, input, select, textarea"
    );

    if (interactiveTarget) return;

    window.location.href = getClosingLoopUrl(row);
  }

  async function generateReplyDraft(row) {
    const datasetRowId = row.db_row_id || row.dataset_row_id;

    if (!datasetRowId) {
      setReplyDraftRow(row);
      setReplyDraft(null);
      setReplyDraftError(
        "This response does not have a saved workspace row ID yet, so a reply draft cannot be generated."
      );
      return;
    }

    setReplyDraftRow(row);
    setReplyDraft(null);
    setReplyDraftError("");
    setReplyDraftCopied(false);
    setReplyDraftLoading(true);

    try {
      const res = await fetch(`/api/nps-data/rows/${datasetRowId}/reply-draft`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: "fr",
          tone: "warm_professional",
          channel: "intercom",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to generate reply draft");
      }

      setReplyDraft(data.draft || null);
    } catch (err) {
      console.error("Failed to generate reply draft:", err);
      setReplyDraftError(err.message || "Failed to generate reply draft");
    } finally {
      setReplyDraftLoading(false);
    }
  }

  async function copyReplyDraft() {
    const body = replyDraft?.body || "";

    if (!body) return;

    try {
      await navigator.clipboard.writeText(body);
      setReplyDraftCopied(true);

      window.setTimeout(() => {
        setReplyDraftCopied(false);
      }, 1800);
    } catch (err) {
      console.error("Failed to copy reply draft:", err);
      setReplyDraftError("Could not copy the draft automatically. Please copy it manually.");
    }
  }

  const filteredRows = useMemo(() => {
    const rows = dataset?.rows || [];
    const q = searchTerm.trim().toLowerCase();

    const filtered = rows.filter((row) => {
      const matchesBucket = bucketFilter === "all" || row.bucket === bucketFilter;

      const haystack = [
        row.contact_label,
        row.contact_name,
        row.company,
        row.stage,
        row.comment,
        row.score,
        row.bucket,
        row.response_id,
        row.pioupiou,
        row.reader_serial,
        row.q_recommend_score,
        row.q_recommend_comment,
        row.q_install_score,
        row.q_install_comment,
        row.q_daily_use_score,
        row.q_benefits,
        row.q_parent_relation_score,
        row.q_parent_relation_comment,
        row.q_support_score,
        row.q_support_comment,
        row.q_final_comment,
        ...(row.selected_options || []),
        JSON.stringify(row.extra_scores || {}),
      ]
        .map((x) => String(x || "").toLowerCase())
        .join(" ");

      const matchesSearch = !q || haystack.includes(q);

      return matchesBucket && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      const result = compareValues(a?.[sort], b?.[sort], dir);
      if (result !== 0) return result;
      return compareValues(a?.submitted_at, b?.submitted_at, "desc");
    });
  }, [dataset, bucketFilter, searchTerm, sort, dir]);

  const subtitle = datasetId
    ? PAGE_COPY.savedSubtitle
    : mode === "intercom"
      ? PAGE_COPY.intercomSubtitle
      : PAGE_COPY.sessionSubtitle;

  if (loadingDataset) {
    return (
      <main className="csv-nps-page">
        <section className="csv-nps-hero csv-nps-hero-compact">
          <p className="eyebrow">{PAGE_COPY.eyebrow}</p>
          <h1>{PAGE_COPY.title}</h1>
          <p>Loading response data...</p>
        </section>

        <CsvNpsWorkspaceNav />

        <section className="csv-nps-panel">
          <p>Loading response data from workspace.</p>
        </section>
      </main>
    );
  }

  if (datasetError) {
    return (
      <main className="csv-nps-page">
        <section className="csv-nps-hero csv-nps-hero-compact">
          <p className="eyebrow">{PAGE_COPY.eyebrow}</p>
          <h1>{PAGE_COPY.title}</h1>
          <p>There was a problem loading this dataset.</p>
        </section>

        <CsvNpsWorkspaceNav />

        <section className="csv-nps-error">{datasetError}</section>
      </main>
    );
  }

  if (!dataset) {
    return (
      <main className="csv-nps-page">
        <section className="csv-nps-hero csv-nps-hero-compact">
          <p className="eyebrow">{PAGE_COPY.eyebrow}</p>
          <h1>{PAGE_COPY.title}</h1>
          <p>No feedback dataset has been loaded yet.</p>
        </section>

        <CsvNpsWorkspaceNav />

        <section className="csv-nps-panel">
          <p>
            Go to{" "}
            <a className="text-link" href="/workspace/import">
              Import feedback data
            </a>{" "}
            and analyse or save a dataset first.
          </p>
        </section>
      </main>
    );
  }

  const isIntercomMode = mode === "intercom" || dataset?.sourceType === "workspace_intercom";

  return (
    <main className="csv-nps-page">
      <section className="csv-nps-hero csv-nps-hero-compact">
        <p className="eyebrow">{PAGE_COPY.eyebrow}</p>
        <h1>{PAGE_COPY.title}</h1>
        <p>{subtitle}</p>
      </section>

      <CsvNpsWorkspaceNav />

      {datasetId && <WorkspaceDatasetHeader dataset={dataset} />}

      <section className="csv-nps-results">
        <div className="csv-nps-responses-header">
          <div>
            <h2>Responses</h2>
            <p>
              Showing {filteredRows.length} of {dataset.rows.length} response
              {dataset.rows.length === 1 ? "" : "s"}.
            </p>
          </div>
        </div>

        {isIntercomMode && (
          <div className="csv-nps-panel mb-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="eyebrow">AI-assisted close-the-loop</p>
                <h3 className="mt-1 text-xl font-semibold text-white">
                  Suggested reply draft
                </h3>
                <p className="mt-2 max-w-3xl text-sm text-slate-300">
                  Select a response to generate a short French draft that Clémence can
                  review, copy and paste into Intercom.
                </p>
              </div>

              {replyDraftRow && replyDraftRow.intercom_contact_url && (
                <a
                  href={replyDraftRow.intercom_contact_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-2 text-sm font-medium text-indigo-200 hover:bg-indigo-500/20"
                >
                  Open selected contact in Intercom
                </a>
              )}
            </div>

            {replyDraftRow ? (
              <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Draft for {replyDraftRow.contact_name || replyDraftRow.contact_label || "selected contact"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Score {replyDraftRow.score ?? "—"} · {replyDraftRow.bucket || "unknown"} ·{" "}
                      {shortDate(replyDraftRow.submitted_at)}
                    </p>
                  </div>

                  {replyDraft?.body && (
                    <button
                      type="button"
                      onClick={copyReplyDraft}
                      className="inline-flex items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-500/20"
                    >
                      {replyDraftCopied ? "Copied" : "Copy draft"}
                    </button>
                  )}
                </div>

                {replyDraftLoading && (
                  <p className="mt-4 text-sm text-slate-300">
                    Generating suggested reply...
                  </p>
                )}

                {replyDraftError && (
                  <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
                    {replyDraftError}
                  </div>
                )}

                {replyDraft?.body && (
                  <textarea
                    value={replyDraft.body}
                    onChange={(e) =>
                      setReplyDraft((current) => ({
                        ...(current || {}),
                        body: e.target.value,
                      }))
                    }
                    rows={7}
                    className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-sm leading-relaxed text-slate-100 outline-none focus:border-indigo-400/50"
                  />
                )}

                {!replyDraftLoading && !replyDraft?.body && !replyDraftError && (
                  <p className="mt-4 text-sm text-slate-400">
                    The draft will appear here after you select a response.
                  </p>
                )}

                <p className="mt-3 text-xs text-slate-500">
                  Human-in-the-loop: this is a suggested draft only. Review before sending.
                </p>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-slate-950/30 p-4 text-sm text-slate-400">
                Choose “Draft reply” on a response row to generate a suggested message.
              </div>
            )}
          </div>
        )}

        <div className="csv-nps-filters">
          <label className="csv-nps-filter-field">
            <span>Search responses</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                isIntercomMode
                  ? "Search contact, response id, Pioupiou, reader, comments, benefits..."
                  : "Search reference, company, stage, comment, benefit..."
              }
            />
          </label>

          <label className="csv-nps-filter-field">
            <span>Bucket</span>
            <select
              value={bucketFilter}
              onChange={(e) => setBucketFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="promoter">Promoters</option>
              <option value="passive">Passives</option>
              <option value="detractor">Detractors</option>
            </select>
          </label>
        </div>

        {isIntercomMode ? (
          <div className="csv-nps-table-wrap">
            <table className="min-w-[2450px] table-fixed border-collapse text-xs csv-nps-table">
              <thead className="sticky top-0 z-30 bg-[#0F172A]">
                <tr>
                  <SortableTh
                    label="Contact"
                    sortKey="contact_name"
                    sort={sort}
                    dir={dir}
                    onSort={handleSort}
                    className="sticky left-0 z-40 w-[150px] min-w-[150px] bg-[#0F172A]"
                  />
                  <SortableTh
                    label="Date"
                    sortKey="submitted_at"
                    sort={sort}
                    dir={dir}
                    onSort={handleSort}
                    className="sticky left-[150px] z-40 w-[95px] min-w-[95px] bg-[#0F172A]"
                  />
                  <SortableTh
                    label="Bucket"
                    sortKey="bucket"
                    sort={sort}
                    dir={dir}
                    onSort={handleSort}
                    className="sticky left-[245px] z-40 w-[88px] min-w-[88px] bg-[#0F172A]"
                  />

                  <SortableTh label="NPS" sortKey="score" sort={sort} dir={dir} onSort={handleSort} className="w-[70px]" />
                  <SortableTh label="Response ID" sortKey="response_id" sort={sort} dir={dir} onSort={handleSort} className="w-[115px]" />
                  <SortableTh label="Pioupiou" sortKey="pioupiou" sort={sort} dir={dir} onSort={handleSort} className="w-[120px]" />
                  <SortableTh label="Reader" sortKey="reader_serial" sort={sort} dir={dir} onSort={handleSort} className="w-[110px]" />
                  <SortableTh label="Recommend" sortKey="q_recommend_score" sort={sort} dir={dir} onSort={handleSort} className="w-[105px]" />
                  <SortableTh label="Why?" sortKey="q_recommend_comment" sort={sort} dir={dir} onSort={handleSort} className="w-[280px]" />
                  <SortableTh label="Install" sortKey="q_install_score" sort={sort} dir={dir} onSort={handleSort} className="w-[90px]" />
                  <SortableTh label="Install comment" sortKey="q_install_comment" sort={sort} dir={dir} onSort={handleSort} className="w-[240px]" />
                  <SortableTh label="Daily use" sortKey="q_daily_use_score" sort={sort} dir={dir} onSort={handleSort} className="w-[100px]" />
                  <SortableTh label="Benefits" sortKey="q_benefits" sort={sort} dir={dir} onSort={handleSort} className="w-[240px]" />
                  <SortableTh label="Parent relation" sortKey="q_parent_relation_score" sort={sort} dir={dir} onSort={handleSort} className="w-[115px]" />
                  <SortableTh label="Parent relation comment" sortKey="q_parent_relation_comment" sort={sort} dir={dir} onSort={handleSort} className="w-[260px]" />
                  <SortableTh label="Support" sortKey="q_support_score" sort={sort} dir={dir} onSort={handleSort} className="w-[95px]" />
                  <SortableTh label="Support comment" sortKey="q_support_comment" sort={sort} dir={dir} onSort={handleSort} className="w-[220px]" />
                  <SortableTh label="Final comment" sortKey="q_final_comment" sort={sort} dir={dir} onSort={handleSort} className="w-[240px]" />
                  <SortableTh label="Previous responses" sortKey="previous_response_dates" sort={sort} dir={dir} onSort={handleSort} className="w-[170px]" />
                </tr>
              </thead>

              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan="18" className="px-3 py-4">
                      No responses match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row, i) => {
                    const rowBg = i % 2 === 0 ? "bg-slate-950/60" : "bg-slate-900/60";
                    const stickyBg = i % 2 === 0 ? "bg-[#020817]" : "bg-[#0b1730]";

                    return (
                      <tr
                        key={row.response_id || `${row.contact_name}-${row.submitted_at}-${i}`}
                        onClick={(event) => handleRowClick(row, event)}
                        title="Click to manage this response in Closing the Loop"
                        className={`cursor-pointer border-b border-white/10 align-top hover:bg-white/5 ${rowBg}`}
                      >
                        <td className={`sticky left-0 z-20 w-[150px] min-w-[150px] border-r border-white/10 px-3 py-3 ${stickyBg}`}>
                          <CellText>{row.contact_name}</CellText>

                          <div className="mt-3 flex flex-col gap-2">
                            <a
                              href={getClosingLoopUrl(row)}
                              className="inline-flex items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-200 hover:bg-emerald-500/20"
                            >
                              Manage
                            </a>

                            {row.intercom_contact_url ? (
                              <a
                                href={row.intercom_contact_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-medium text-indigo-200 hover:bg-indigo-500/20"
                              >
                                Open
                              </a>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </div>
                        </td>

                        <td className={`sticky left-[150px] z-20 w-[95px] min-w-[95px] border-r border-white/10 px-3 py-3 ${stickyBg}`}>
                          <CellText>{shortDate(row.submitted_at)}</CellText>
                        </td>

                        <td className={`sticky left-[245px] z-20 w-[88px] min-w-[88px] border-r border-white/10 px-3 py-3 ${stickyBg}`}>
                          <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${bucketBadge(row.bucket)}`}>
                            {row.bucket || "—"}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-center">
                          <span className={`font-semibold ${scoreTextClass(Number(row.score))}`}>
                            {row.score ?? "—"}
                          </span>
                        </td>

                        <td className="px-3 py-3"><CellText>{row.response_id}</CellText></td>
                        <td className="px-3 py-3"><CellText>{row.pioupiou}</CellText></td>
                        <td className="px-3 py-3"><CellText>{row.reader_serial}</CellText></td>

                        <td className="px-3 py-3 text-center">
                          <span className={scoreTextClass(Number(row.q_recommend_score))}>
                            {row.q_recommend_score ?? "—"}
                          </span>
                        </td>

                        <td className="px-3 py-3"><CellText>{row.q_recommend_comment}</CellText></td>

                        <td className="px-3 py-3 text-center">
                          <span className={scoreTextClass(Number(row.q_install_score))}>
                            {row.q_install_score ?? "—"}
                          </span>
                        </td>

                        <td className="px-3 py-3"><CellText>{row.q_install_comment}</CellText></td>

                        <td className="px-3 py-3 text-center">
                          <span className={scoreTextClass(Number(row.q_daily_use_score))}>
                            {row.q_daily_use_score ?? "—"}
                          </span>
                        </td>

                        <td className="px-3 py-3"><CellText>{row.q_benefits}</CellText></td>

                        <td className="px-3 py-3 text-center">
                          <span className={scoreTextClass(Number(row.q_parent_relation_score))}>
                            {row.q_parent_relation_score ?? "—"}
                          </span>
                        </td>

                        <td className="px-3 py-3"><CellText>{row.q_parent_relation_comment}</CellText></td>

                        <td className="px-3 py-3 text-center">
                          <span className={scoreTextClass(Number(row.q_support_score))}>
                            {row.q_support_score ?? "—"}
                          </span>
                        </td>

                        <td className="px-3 py-3"><CellText>{row.q_support_comment}</CellText></td>

                        <td className="px-3 py-3"><CellText>{row.q_final_comment}</CellText></td>

                        <td className="px-3 py-3 text-[11px] text-slate-300">
                          {Array.isArray(row.previous_response_dates) &&
                          row.previous_response_dates.length > 0 ? (
                            <div className="space-y-1">
                              {row.previous_response_dates.map((d, idx) => (
                                <div key={`${row.response_id || i}-prev-${idx}`}>
                                  {shortDate(d)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="csv-nps-table-wrap">
            <table className="csv-nps-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reference</th>
                  <th>Score</th>
                  <th>Bucket</th>
                  <th>Comment</th>
                  <th>Selected options</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan="6">No responses match the current filters.</td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr
                      key={row.response_id || row.id}
                      onClick={(event) => handleRowClick(row, event)}
                      title="Click to manage this response in Closing the Loop"
                      className="cursor-pointer"
                    >
                      <td>{row.submitted_at?.slice(0, 10) || "—"}</td>

                      <td>
                        <div>{row.contact_label || "—"}</div>

                        {(row.company || row.stage) && (
                          <div className="csv-nps-muted-cell">
                            {[row.company, row.stage].filter(Boolean).join(" · ")}
                          </div>
                        )}

                        {row.intercom_contact_url && (
                          <div className="csv-nps-muted-cell">
                            <a
                              href={row.intercom_contact_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-link"
                            >
                              Open in Intercom
                            </a>
                          </div>
                        )}
                      </td>

                      <td>{row.score ?? "—"}</td>

                      <td>
                        <span className={`csv-nps-bucket csv-nps-bucket-${row.bucket}`}>
                          {row.bucket}
                        </span>
                      </td>

                      <td>{row.comment || "—"}</td>

                      <td>
                        {row.selected_options?.length
                          ? row.selected_options.join(", ")
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function normaliseWorkspaceResponsesDataset(apiResponse) {
  const savedDataset = apiResponse.dataset || {};
  const savedRows = Array.isArray(apiResponse.rows) ? apiResponse.rows : [];

  return {
    id: savedDataset.id,
    datasetName: savedDataset.dataset_name,
    sourceType: savedDataset.source_type,
    content_id: savedDataset.content_id,
    rawRowCount: savedDataset.raw_row_count,
    validRowCount: savedDataset.valid_row_count,
    skippedRowCount: savedDataset.skipped_row_count,
    summary: savedDataset.summary_json || {},
    rows: savedRows.map((row) => ({
      id: row.id,
      response_id: row.response_id || row.id,
      source: row.source,
      row_number: row.row_number,
      submitted_at: row.submitted_at,
      score: row.score,
      bucket: row.bucket,
      company: row.company,
      stage: row.stage,
      comment: row.comment,
      contact_label: row.contact_label || "Contact",
      intercom_contact_url: row.intercom_contact_url,
      selected_options: row.selected_options_json || [],
      extra_scores: row.extra_scores_json || {},
      closeLoopActions: row.close_loop_actions || [],
    })),
  };
}

function normaliseWorkspaceIntercomResponsesDataset(apiResponse) {
  const savedDataset = apiResponse.dataset || {};
  const savedRows = Array.isArray(apiResponse.rows) ? apiResponse.rows : [];
  const source = apiResponse.source || {};

  return {
    id: savedDataset.id,
    datasetName:
      savedDataset.dataset_name ||
      source.source_name ||
      "Workspace Intercom dataset",
    sourceType: savedDataset.source_type || "workspace_intercom",
    content_id: savedDataset.content_id || source.survey_content_id || null,
    rawRowCount: savedRows.length,
    validRowCount: apiResponse.summary?.total ?? savedRows.length,
    skippedRowCount: 0,
    summary: apiResponse.summary || {},
    rows: savedRows.map((row) => ({
      id: row.response_id || row.id,
      db_row_id: row.db_row_id || row.dataset_row_id || null,
      dataset_row_id: row.dataset_row_id || row.db_row_id || null,
      response_id: row.response_id || row.id,
      source: row.source || "workspace_intercom",
      row_number: row.row_number || null,
      submitted_at: row.submitted_at,
      score: row.score,
      bucket: row.bucket,
      company: row.company || null,
      stage: row.stage || null,
      comment: row.comment,
      contact_label: row.contact_label || "Contact",
      contact_name: row.contact_name || row.contact_label || "Contact",
      intercom_contact_url: row.intercom_contact_url,
      selected_options: row.selected_options_json || [],
      extra_scores: row.extra_scores_json || {},
      closeLoopActions: row.close_loop_actions || [],
      pioupiou: row.pioupiou || "-",
      reader_serial: row.reader_serial || "-",
      q_recommend_score: row.q_recommend_score ?? null,
      q_recommend_comment: row.q_recommend_comment ?? null,
      q_install_score: row.q_install_score ?? null,
      q_install_comment: row.q_install_comment ?? null,
      q_daily_use_score: row.q_daily_use_score ?? null,
      q_benefits: row.q_benefits ?? null,
      q_parent_relation_score: row.q_parent_relation_score ?? null,
      q_parent_relation_comment: row.q_parent_relation_comment ?? null,
      q_support_score: row.q_support_score ?? null,
      q_support_comment: row.q_support_comment ?? null,
      q_final_comment: row.q_final_comment ?? null,
      previous_response_dates: Array.isArray(row.previous_response_dates)
        ? row.previous_response_dates
        : [],
      previous_response_links: Array.isArray(row.previous_response_links)
        ? row.previous_response_links
        : [],
    })),
  };
}

function normaliseSessionDataset(sessionDataset) {
  const rows = Array.isArray(sessionDataset?.rows) ? sessionDataset.rows : [];

  return {
    id: sessionDataset?.id || null,
    datasetName: sessionDataset?.datasetName || "Latest session dataset",
    sourceType: sessionDataset?.sourceType || "session",
    content_id: sessionDataset?.content_id || null,
    rawRowCount: sessionDataset?.rawRowCount || rows.length,
    validRowCount: sessionDataset?.validRowCount || rows.length,
    skippedRowCount: sessionDataset?.skippedRowCount || 0,
    summary: sessionDataset?.summary || {},
    rows: rows.map((row) => ({
      id: row.id || row.response_id,
      response_id: row.response_id || row.id,
      source: row.source,
      row_number: row.row_number,
      submitted_at: row.submitted_at,
      score: row.score,
      bucket: row.bucket,
      company: row.company || null,
      stage: row.stage || null,
      comment: row.comment,
      contact_label:
        row.contact_label ||
        row.company ||
        row.stage ||
        row.response_id ||
        "Contact",
      intercom_contact_url: row.intercom_contact_url || null,
      selected_options: row.selected_options || [],
      extra_scores: row.extra_scores || {},
      closeLoopActions: row.loopActions || [],
    })),
  };
}
