// src/pages/DemoSurveyPage.jsx
import React from "react";
import Seo from "../components/Seo";

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

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadResults}
                  disabled={loadingResults}
                  className={classNames(
                    "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold border",
                    loadingResults
                      ? "border-slate-700 text-slate-400 cursor-not-allowed"
                      : "border-slate-600 text-slate-100 hover:border-emerald-400"
                  )}
                >
                  {loadingResults ? "Refreshing…" : "Refresh results"}
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">View for:</span>
                <select
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  className="rounded-2xl border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="ALL">All demo responses</option>
                  {uniqueCustomers.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Period:</span>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="rounded-2xl border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="rolling12">Last 12 months</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Result type:</span>
                <select
                  value={resultType}
                  onChange={(e) => setResultType(e.target.value)}
                  className="rounded-2xl border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="ALL">All</option>
                  <option value="OVERALL">Overall NPS only</option>
                  <option value="MILESTONE">Milestone NPS only</option>
                </select>
              </div>
            </div>

            {/* Results area */}
            {resultsError && (
              <div className="rounded-2xl border border-rose-500/60 bg-rose-950/40 px-3 py-2 text-xs text-rose-100 mb-3">
                {resultsError}
              </div>
            )}

            {!resultsError && !filteredResponses.length && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-6 text-sm text-slate-300">
                No demo responses yet.
                <br />
                <span className="text-xs text-slate-500">
                  Run the demo on the left, complete the survey from your inbox, then refresh this
                  section.
                </span>
              </div>
            )}

            {filteredResponses.length > 0 && (
              <div className="space-y-6">
                {/* Overall NPS */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-4 flex flex-wrap gap-4 items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
                      {resultType === "MILESTONE"
                        ? "Overall Milestone NPS"
                        : "Overall NPS"}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-semibold text-slate-50">
                        {overallStats.nps === null ? "–" : overallStats.nps}
                      </span>
                      {overallStats.nps !== null && (
                        <span className="text-sm text-slate-400">NPS</span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Based on {overallStats.total} responses in this demo
                      {customerFilter !== "ALL" ? " for this contact." : "."}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />
                      <span>
                        Detractors:{" "}
                        <span className="font-semibold">{overallStats.detractors}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                      <span>
                        Passives:{" "}
                        <span className="font-semibold">{overallStats.passives}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                      <span>
                        Promoters:{" "}
                        <span className="font-semibold">{overallStats.promoters}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Period bar “chart” */}
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    NPS by {period === "monthly" ? "month" : period === "quarterly" ? "quarter" : "last 12 months"}
                  </p>

                  <div className="space-y-3">
                    {grouped.map(({ key, label, stats }) => {
                      const total = stats.total || 1;
                      const detPct = (stats.detractors / total) * 100;
                      const pasPct = (stats.passives / total) * 100;
                      const proPct = (stats.promoters / total) * 100;

                      return (
                        <div
                          key={key}
                          className="rounded-2xl border border-slate-800 bg-slate-950/80 px-3 py-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs text-slate-300">
                              <span className="font-medium">{label}</span>{" "}
                              <span className="text-slate-500">
                                • NPS{" "}
                                {stats.nps === null ? "–" : stats.nps}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {stats.total} response{stats.total === 1 ? "" : "s"}
                            </div>
                          </div>

                          <div className="h-3 w-full rounded-full bg-slate-900 overflow-hidden flex">
                            {detPct > 0 && (
                              <div
                                style={{ width: `${detPct}%` }}
                                className="bg-rose-500"
                              />
                            )}
                            {pasPct > 0 && (
                              <div
                                style={{ width: `${pasPct}%` }}
                                className="bg-amber-400"
                              />
                            )}
                            {proPct > 0 && (
                              <div
                                style={{ width: `${proPct}%` }}
                                className="bg-emerald-400"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Milestone NPS section */}
                <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-4">
                  <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">
                    Milestone NPS
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {STAGES.filter(s => s !== "Overall NPS").map(stage => {
                      const stats = milestoneStats[stage];

                      return (
                        <div
                          key={stage}
                          className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 flex flex-col items-center text-center"
                        >
                          <p className="text-xs text-slate-400 mb-1">{stage}</p>

                          {/* NPS dial */}
                          <div className="text-2xl font-semibold text-slate-50 mb-1">
                            {stats.nps === null ? "–" : stats.nps}
                          </div>

                          <p className="text-[11px] text-slate-500">
                            {stats.total} responses
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
