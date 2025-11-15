import React from "react";

export default function DemoResultsPanel({ compact = false }) {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState(null);
  const [customerFilter, setCustomerFilter] = React.useState("ALL");
  const [period, setPeriod] = React.useState("monthly");
  const [resultType, setResultType] = React.useState("overall"); // overall | milestone

  // Fetch full dataset once
  React.useEffect(() => {
    fetch("/api/demo/full-results")
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="text-slate-300 text-sm p-4">
        Loading demo results…
      </div>
    );
  }

  const customers = ["ALL", ...data.customers];

  return (
    <div className={`rounded-3xl border border-white/10 bg-white/5 p-6 ${compact ? "mt-4" : "mt-8"}`}>
      {!compact && (
        <h3 className="text-xl font-semibold text-white">Demo results</h3>
      )}

      {/* Filters */}
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {/* Customer */}
        <select
          value={customerFilter}
          onChange={(e) => setCustomerFilter(e.target.value)}
          className="rounded-xl bg-black/30 border border-white/10 p-2 text-sm text-slate-200"
        >
          {customers.map(c => (
            <option key={c} value={c}>{c === "ALL" ? "All customers" : c}</option>
          ))}
        </select>

        {/* Period */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-xl bg-black/30 border border-white/10 p-2 text-sm text-slate-200"
        >
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="rolling">Rolling 12m</option>
        </select>

        {/* Result type */}
        <select
          value={resultType}
          onChange={(e) => setResultType(e.target.value)}
          className="rounded-xl bg-black/30 border border-white/10 p-2 text-sm text-slate-200"
        >
          <option value="overall">Overall NPS</option>
          <option value="milestone">Milestone NPS</option>
        </select>
      </div>

      {/* Overall NPS section */}
      {resultType === "overall" && (
        <div className="mt-6">
          <h4 className="text-white font-medium">Overall NPS</h4>
          <div className="mt-2 text-slate-200 text-4xl font-semibold">
            {data.overallNps ?? "-"}
          </div>
        </div>
      )}

      {/* Milestone NPS section */}
      {resultType === "milestone" && (
        <div className="mt-6">
          <h4 className="text-white font-medium">Milestone NPS</h4>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {data.milestones.map(m => (
              <div
                key={m.stage}
                className="rounded-xl bg-black/20 border border-white/10 p-4 text-center"
              >
                <div className="text-slate-300 text-sm">{m.stage}</div>
                <div className="text-white text-3xl font-semibold mt-2">
                  {m.nps === null ? "–" : m.nps}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="mt-6">
        <h4 className="text-white font-medium">Score distribution</h4>

        <div className="mt-2 p-4 rounded-xl bg-black/20 border border-white/10 text-slate-300 text-sm">
          🔧 Chart placeholder – this pulls from `/api/demo/chart?period=${period}&customer=${customerFilter}&type=${resultType}`
        </div>
      </div>
    </div>
  );
}
