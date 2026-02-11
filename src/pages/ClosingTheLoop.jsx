import React from "react";

const DEFAULT_CONTENT_ID = "189616";

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function bucketPill(bucket) {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border";
  if (bucket === "detractor")
    return `${base} border-rose-400/30 bg-rose-500/10 text-rose-200`;
  if (bucket === "passive")
    return `${base} border-amber-400/30 bg-amber-500/10 text-amber-200`;
  if (bucket === "promoter")
    return `${base} border-emerald-400/30 bg-emerald-500/10 text-emerald-200`;
  return `${base} border-white/10 bg-white/5 text-slate-200`;
}

export default function ClosingTheLoop() {
  const [contentId, setContentId] = React.useState(DEFAULT_CONTENT_ID);
  const [days, setDays] = React.useState(30);
  const [limit, setLimit] = React.useState(50);

  const [bucket, setBucket] = React.useState("all"); // all|detractor|passive|promoter
  const [sortBy, setSortBy] = React.useState("risk"); // risk|date|score

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [data, setData] = React.useState(null);

  const fetchQueue = React.useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const qs = new URLSearchParams({
        content_id: String(contentId || "").trim(),
        days: String(days),
        limit: String(limit),
      });

      const r = await fetch(`/api/intercom/private/closing-the-loop?${qs.toString()}`, {
        credentials: "include",
      });

      const j = await r.json().catch(() => null);

      if (!r.ok || !j?.ok) {
        const msg = j?.error || `Request failed (${r.status})`;
        throw new Error(msg);
      }

      setData(j);
    } catch (e) {
      setData(null);
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }, [contentId, days, limit]);

  React.useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const queue = React.useMemo(() => {
    const raw = Array.isArray(data?.queue) ? data.queue : [];

    const filtered =
      bucket === "all"
        ? raw
        : raw.filter((x) => String(x?.latest?.bucket || "") === bucket);

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "date") {
        const at = Date.parse(a?.latest?.submitted_at || "");
        const bt = Date.parse(b?.latest?.submitted_at || "");
        return (Number.isFinite(bt) ? bt : 0) - (Number.isFinite(at) ? at : 0);
      }
      if (sortBy === "score") {
        const as = typeof a?.latest?.score_0_10 === "number" ? a.latest.score_0_10 : -1;
        const bs = typeof b?.latest?.score_0_10 === "number" ? b.latest.score_0_10 : -1;
        return bs - as; // higher first
      }
      // risk (default)
      const ar = typeof a?.risk_score === "number" ? a.risk_score : -1;
      const br = typeof b?.risk_score === "number" ? b.risk_score : -1;
      return br - ar;
    });

    return sorted;
  }, [data, bucket, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold text-white">Closing the loop</h1>
          <p className="mt-3 text-slate-300">
            Action queue from recent NPS responses, prioritised by risk.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchQueue}
          className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium
                     bg-white/10 hover:bg-white/15 text-white border border-white/10
                     transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]/60"
          disabled={loading}
          title="Refresh"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Controls */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-4">
          <label className="text-xs text-slate-400">content_id</label>
          <input
            value={contentId}
            onChange={(e) => setContentId(e.target.value)}
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
            placeholder="e.g. 189616"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-slate-400">days</label>
          <input
            type="number"
            min={1}
            max={3650}
            value={days}
            onChange={(e) => setDays(Number(e.target.value || 30))}
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-slate-400">limit</label>
          <input
            type="number"
            min={1}
            max={2000}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value || 50))}
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-slate-400">bucket</label>
          <select
            value={bucket}
            onChange={(e) => setBucket(e.target.value)}
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
          >
            <option value="all">All</option>
            <option value="detractor">Detractors</option>
            <option value="passive">Passives</option>
            <option value="promoter">Promoters</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-slate-400">sort</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
          >
            <option value="risk">Risk</option>
            <option value="date">Latest date</option>
            <option value="score">Score</option>
          </select>
        </div>
      </div>

      {/* Status */}
      {error && (
        <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-rose-100">
          <div className="font-medium">Error</div>
          <div className="mt-1 text-sm opacity-90">{error}</div>
          <div className="mt-3 text-xs text-rose-100/80">
            If you see “Not authorised”, log in again at <span className="font-mono">/private/login</span>.
          </div>
        </div>
      )}

      {!error && loading && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
          Loading queue…
        </div>
      )}

      {!error && !loading && data && queue.length === 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
          No results for this filter/window.
        </div>
      )}

      {/* Table */}
      {!error && !loading && queue.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F19]/40">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5 text-slate-300">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Risk</th>
                  <th className="text-left px-4 py-3 font-medium">Latest</th>
                  <th className="text-left px-4 py-3 font-medium">Score</th>
                  <th className="text-left px-4 py-3 font-medium">Bucket</th>
                  <th className="text-left px-4 py-3 font-medium">Themes</th>
                  <th className="text-left px-4 py-3 font-medium">Recommendation</th>
                  <th className="text-left px-4 py-3 font-medium">Intercom</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {queue.map((it) => {
                  const latest = it.latest || {};
                  return (
                    <tr key={it.contact_id} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-white font-semibold">
                        {typeof it.risk_score === "number" ? it.risk_score : "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-200">
                        <div className="text-white/90">{formatDate(latest.submitted_at)}</div>
                        <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {latest.comment_excerpt || "—"}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-200">
                        {typeof latest.score_0_10 === "number" ? latest.score_0_10 : "—"}
                      </td>

                      <td className="px-4 py-3">
                        <span className={bucketPill(latest.bucket)}>{latest.bucket || "—"}</span>
                      </td>

                      <td className="px-4 py-3 text-slate-200">
                        {Array.isArray(it.themes) && it.themes.length
                          ? it.themes.join(", ")
                          : "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-200">{it.recommendation || "—"}</td>

                      <td className="px-4 py-3">
                        {it.intercom_contact_url ? (
                          <a
                            href={it.intercom_contact_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-medium
                                       bg-white/10 hover:bg-white/15 text-white border border-white/10 transition"
                          >
                            Open
                          </a>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 text-xs text-slate-400 border-t border-white/10">
            Showing <span className="text-slate-200">{queue.length}</span> items (content_id{" "}
            <span className="text-slate-200">{data?.content_id}</span>, {data?.days} days)
          </div>
        </div>
      )}
    </div>
  );
}
