// src/pages/DemoSurveyPage.jsx
import React from "react";
import Seo from "../components/Seo";
import DemoResultsPanel from "../components/DemoResultsPanel";
import PageHeader from "../components/PageHeader";


const STAGES = [
  "Overall NPS",
  "Discovery",
  "Ordering",
  "Delivery",
  "Installation & setup",
  "After-sales service",
  "Cease / leaving",
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Helpers to group by period
function getMonthKey(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "Unknown";
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

function getQuarterKey(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "Unknown";
  const y = d.getFullYear();
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `${y} Q${q}`;
}

function computeNpsStats(responses) {
  if (!responses.length) return { nps: null, total: 0, promoters: 0, passives: 0, detractors: 0 };

  let promoters = 0;
  let passives = 0;
  let detractors = 0;

  for (const r of responses) {
    if (typeof r.score !== "number" || Number.isNaN(r.score)) continue;
    if (r.score >= 9) promoters++;
    else if (r.score >= 7) passives++;
    else detractors++;
  }

  const total = promoters + passives + detractors;
  if (!total) return { nps: null, total: 0, promoters, passives, detractors };

  const nps = Math.round(((promoters - detractors) / total) * 100);
  return { nps, total, promoters, passives, detractors };
}

export default function DemoSurveyPage() {
  // ----- Form state (send invitation) -----
  const [email, setEmail] = React.useState("");
  const [customerName, setCustomerName] = React.useState("");
  const [businessName, setBusinessName] = React.useState("");
  const [stage, setStage] = React.useState("Overall NPS");  const [sending, setSending] = React.useState(false);
  const [sendError, setSendError] = React.useState("");
  const [sendSuccess, setSendSuccess] = React.useState("");

  // ----- Results state -----
  const [period, setPeriod] = React.useState("monthly");
  const [responses, setResponses] = React.useState([]);
  const [loadingResults, setLoadingResults] = React.useState(false);
  const [resultsError, setResultsError] = React.useState("");
  const [customerFilter, setCustomerFilter] = React.useState("ALL");
  const [resultType, setResultType] = React.useState("ALL");

  // Load results from backend
  async function loadResults() {
    try {
      setLoadingResults(true);
      setResultsError("");

      const res = await fetch("/api/demo-responses");
      if (!res.ok) {
        throw new Error("Server returned an error");
      }

      const data = await res.json();
      setResponses(data.rows || []);
    } catch (err) {
      console.error("Error loading demo responses", err);
      setResultsError("We couldn’t load demo results. Please try again in a moment.");
    } finally {
      setLoadingResults(false);
    }
  }

  React.useEffect(() => {
    loadResults();
  }, []);

  async function handleSendDemo(e) {
    e.preventDefault();
    setSendError("");
    setSendSuccess("");

    if (!email) {
      setSendError("Please enter an email address.");
      return;
    }

    try {
      setSending(true);

      const body = {
        email,
        customerId: "", // optional for now
        customerName: customerName || "",
        businessName: businessName || "",
        stage: stage || "",
        surveyId: "NPS-DEMO-1",
      };

      const res = await fetch("/api/send-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to send invitation");
      }

      setSendSuccess("Invitation sent. Check your inbox and follow the link to complete the survey.");
      // Soft reset (keep business name for convenience)
      // setEmail("");
      // setCustomerName("");
    } catch (err) {
      console.error("send demo error", err);
      setSendError("We couldn’t send that invitation. Please check the details and try again.");
    } finally {
      setSending(false);
    }
  }

  // ----- Derived results -----
  const filteredResponses = React.useMemo(() => {
    let rows = responses;

    // Filter by customer
    if (customerFilter !== "ALL") {
      rows = rows.filter((r) => (r.customerName || "").trim() === customerFilter);
    }

    // Filter by result type
    if (resultType === "OVERALL") {
      rows = rows.filter((r) => (r.stage || "").trim() === "Overall NPS");
    } else if (resultType === "MILESTONE") {
      rows = rows.filter(
        (r) =>
          r.stage &&
          r.stage.trim() !== "" &&
          r.stage.trim() !== "Overall NPS"
      );
    }

    return rows;
  }, [responses, customerFilter, resultType]);

  // Period grouping
  const grouped = React.useMemo(() => {
    if (!filteredResponses.length) return [];

    const now = new Date();
    const groupsMap = new Map();

    for (const r of filteredResponses) {
      if (!r.createdAt) continue;
      const d = new Date(r.createdAt);
      if (Number.isNaN(d.getTime())) continue;

      let key;
      let label;

      if (period === "monthly") {
        key = getMonthKey(d);
        label = key;
      } else if (period === "quarterly") {
        key = getQuarterKey(d);
        label = key;
      } else {
        // rolling12 → put everything from last 12 months into a single bucket
        const twelveMonthsAgo = new Date(
          now.getFullYear(),
          now.getMonth() - 11,
          1
        );
        if (d < twelveMonthsAgo) continue;
        key = "last-12";
        label = "Last 12 months";
      }

      if (!groupsMap.has(key)) {
        groupsMap.set(key, []);
        groupsMap.get(key).label = label;
      }
      groupsMap.get(key).push(r);
    }

    const result = [];
    for (const [key, arr] of groupsMap.entries()) {
      const stats = computeNpsStats(arr);
      result.push({
        key,
        label: groupsMap.get(key).label || key,
        stats,
      });
    }

    // Sort by key so months / quarters are in order
    result.sort((a, b) => (a.key > b.key ? 1 : -1));
    return result;
  }, [filteredResponses, period]);

  const overallStats = React.useMemo(
    () => computeNpsStats(filteredResponses),
    [filteredResponses]
  );

  const uniqueCustomers = React.useMemo(() => {
    const names = new Set();
    for (const r of responses) {
      if (r.customerName && r.customerName.trim()) {
        names.add(r.customerName.trim());
      }
    }
    return Array.from(names).sort();
  }, [responses]);

  const title = "NPS Demo Experience | NPS Me";
  const description =
    "See the full NPS Me demo: send yourself an invitation, experience the survey, and view live NPS results.";

  const milestoneStats = React.useMemo(() => {
    const map = {};

    // Start from whatever is already filtered by customer + resultType
    const base = filteredResponses.filter(
      (r) =>
        r.stage &&
        r.stage.trim() !== "" &&
        r.stage.trim() !== "Overall NPS"
    );

    STAGES.filter((s) => s !== "Overall NPS").forEach((stage) => {
      const rowsForStage = base.filter(
        (r) => (r.stage || "").trim() === stage
      );
      map[stage] = computeNpsStats(rowsForStage);
    });

    return map;
  }, [filteredResponses]);


  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      <Seo path="/demo-survey-page" title={title} description={description} />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Page header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-violet-500 flex items-center justify-center text-xs font-semibold">
              N
            </div>
            <div>
              <p className="text-xs tracking-widest text-slate-400 uppercase">Demo experience</p>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-50">
                Try the full NPS Me survey flow
              </h1>
              <p className="mt-1 text-sm text-slate-400 max-w-xl">
                Send yourself a live invitation, answer the one-question NPS survey, and see the
                results update here in real time.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] items-start">
          {/* LEFT: Run the demo */}
          <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6 lg:p-7 shadow-xl shadow-black/40">
            <h2 className="text-lg font-semibold text-slate-50 mb-2">
              1. Send yourself a demo invitation
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              Use this form to trigger the same email flow we’d use in a live programme. The link
              will take you to the customer-facing survey page.
            </p>

            <form onSubmit={handleSendDemo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Contact name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    placeholder="e.g. Alex Carter"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Business name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    placeholder="e.g. Example Ltd"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email address to send the demo to
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Journey stage (for this question)
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-500">
                  Choose <span className="font-medium text-slate-300">Overall NPS</span> for a general question,
                  or tag it to a specific journey stage (e.g. delivery, after-sales).
                </p>
              </div>

              {sendError && (
                <div className="rounded-2xl border border-rose-500/70 bg-rose-950/50 px-3 py-2 text-xs text-rose-100">
                  {sendError}
                </div>
              )}

              {sendSuccess && (
                <div className="rounded-2xl border border-emerald-500/70 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-100">
                  {sendSuccess}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 gap-3">
                <button
                  type="submit"
                  disabled={sending}
                  className={classNames(
                    "inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold shadow-lg shadow-emerald-500/30",
                    sending
                      ? "bg-emerald-500/60 cursor-not-allowed"
                      : "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                  )}
                >
                  {sending ? "Sending…" : "Run demo"}
                </button>
                <p className="text-[11px] text-slate-500 max-w-xs text-right">
                  Step 2: open the email, follow the link, and submit your score and comment. Then
                  refresh the results on the right.
                </p>
              </div>
            </form>
          </section>

                    {/* RIGHT: Live results */}
          <section className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5 sm:p-6 lg:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-50">
                  2. See live NPS results from this demo
                </h2>
                <p className="text-xs text-slate-400">
                  Every time someone completes the demo survey, their response is logged and feeds
                  into these metrics.
                </p>
              </div>
              <div className="inline-flex rounded-full border border-slate-700 bg-slate-900/60 text-[11px] text-slate-300 overflow-hidden">
                {["monthly", "quarterly", "rolling12"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={classNames(
                      "px-3 py-1.5",
                      period === p ? "bg-slate-800 text-emerald-300" : "hover:bg-slate-800/60"
                    )}
                  >
                    {p === "monthly" && "Monthly"}
                    {p === "quarterly" && "Quarterly"}
                    {p === "rolling12" && "Last 12 months"}
                  </button>
                ))}
              </div>
            </div>

            <DemoResultsPanel />
                        {/* New: example visualisations built from the same data */}
            <div className="mt-8 border-t border-slate-800 pt-6 space-y-6">
              <h3 className="text-sm font-semibold text-slate-200">
                3. Example CX visualisations built from this demo data
              </h3>

              {/* Card 1: Overall NPS snapshot */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Overall NPS (filtered view)
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-slate-50">
                      {overallStats.nps ?? "–"}
                      {overallStats.nps !== null && (
                        <span className="ml-1 text-sm text-slate-400">/ 100</span>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {overallStats.total
                        ? `${overallStats.total} responses • ${overallStats.promoters} Promoters • ${overallStats.passives} Passives • ${overallStats.detractors} Detractors`
                        : "Once you and a few colleagues complete the demo survey, this panel will populate with a live NPS snapshot."}
                    </p>
                  </div>

                  {overallStats.total > 0 && (
                    <div className="mt-2 sm:mt-0 w-full sm:w-56">
                      <div className="text-[11px] text-slate-400 mb-1">
                        Promoter / Passive / Detractor mix
                      </div>
                      <div className="h-2 rounded-full bg-slate-900 flex overflow-hidden">
                        {["promoters", "passives", "detractors"].map((k) => {
                          const value = overallStats[k];
                          const width =
                            overallStats.total > 0
                              ? `${(value / overallStats.total) * 100}%`
                              : "0%";
                          const label =
                            k === "promoters"
                              ? "Promoters"
                              : k === "passives"
                              ? "Passives"
                              : "Detractors";
                          return (
                            <div
                              key={k}
                              className={
                                k === "promoters"
                                  ? "bg-emerald-400"
                                  : k === "passives"
                                  ? "bg-amber-400"
                                  : "bg-rose-500"
                              }
                              style={{ width }}
                              aria-label={label}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: NPS over time (by chosen period) */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      NPS trend ({period === "monthly"
                        ? "by month"
                        : period === "quarterly"
                        ? "by quarter"
                        : "last 12 months"}
                      )
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      A simple bar view showing how NPS moves over time for the current filter.
                    </p>
                  </div>
                </div>

                {grouped.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Submit a few demo responses and refresh to see the trend appear here.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {grouped.map((g) => {
                      const { nps } = g.stats;
                      const width =
                        nps === null
                          ? "0%"
                          : `${Math.max(0, ((nps + 100) / 200) * 100).toFixed(1)}%`;
                      return (
                        <div key={g.key} className="flex items-center gap-3">
                          <div className="w-28 text-[11px] text-slate-400">{g.label}</div>
                          <div className="flex-1">
                            <div className="h-1.5 rounded-full bg-slate-900 overflow-hidden">
                              <div
                                className="h-full bg-emerald-400"
                                style={{ width }}
                              />
                            </div>
                          </div>
                          <div className="w-10 text-right text-xs text-slate-300">
                            {nps === null ? "–" : nps}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Card 3: Journey stage heatmap-style tiles */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5">
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                  NPS by journey stage
                </p>
                <p className="text-sm text-slate-300 mb-4">
                  Each tile shows NPS for one stage of the journey, based on the demo responses
                  you&apos;ve collected so far. In a live programme this becomes a quick
                  friction-map of where customers struggle.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {STAGES.filter((s) => s !== "Overall NPS").map((s) => {
                    const stats = milestoneStats[s] || {
                      nps: null,
                      total: 0,
                    };
                    let tone = "bg-slate-900/80 border-slate-800";
                    if (stats.total > 0 && stats.nps !== null) {
                      if (stats.nps >= 50) tone = "bg-emerald-900/40 border-emerald-500/40";
                      else if (stats.nps >= 0) tone = "bg-amber-900/40 border-amber-500/40";
                      else tone = "bg-rose-900/40 border-rose-500/40";
                    }

                    return (
                      <div
                        key={s}
                        className={`rounded-2xl border px-3 py-2.5 text-xs ${tone}`}
                      >
                        <div className="font-medium text-slate-100 truncate">{s}</div>
                        <div className="mt-1 text-lg font-semibold text-slate-50">
                          {stats.nps === null ? "–" : stats.nps}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {stats.total
                            ? `${stats.total} responses`
                            : "No demo responses yet"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
