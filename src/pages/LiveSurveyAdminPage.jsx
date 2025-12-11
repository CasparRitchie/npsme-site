// src/pages/LiveSurveyAdminPage.jsx
import React from "react";
import Seo from "../components/Seo";

export default function LiveSurveyAdminPage() {
  const [rows, setRows] = React.useState([]);
  const [selectedIds, setSelectedIds] = React.useState(new Set());
  const [loading, setLoading] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState("");
  const [statusMsg, setStatusMsg] = React.useState("");

  const title = "Live Survey Admin | NPS Me";
  const description =
    "Review and send live NPS invitations from your Envola customer list.";

  // Load invitations on mount
  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/live-invitations");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load invitations");
        }
        setRows(data.rows || []);
        setSelectedIds(new Set()); // reset selections
      } catch (err) {
        console.error("load live invitations error", err);
        setError("Unable to load invitations from Dropbox.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleOne = (invitationId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(invitationId)) {
        next.delete(invitationId);
      } else {
        next.add(invitationId);
      }
      return next;
    });
  };

  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.invitationId));
  const anySelected = selectedIds.size > 0;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(rows.map((r) => r.invitationId)));
    }
  };

  async function handleSendSelected() {
    setError("");
    setStatusMsg("");

    if (!anySelected) {
      setError("Please select at least one invitation to send.");
      return;
    }

    try {
      setSending(true);
      const res = await fetch("/api/live-invitations/send-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationIds: Array.from(selectedIds) }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Batch send failed");
      }

      const successes = (data.results || []).filter((r) => r.ok).length;
      const failures = (data.results || []).filter((r) => !r.ok).length;

      setStatusMsg(
        `Sent ${successes} invitation${successes === 1 ? "" : "s"} successfully` +
          (failures ? `, ${failures} failed.` : ".")
      );

      // Refresh the table to pick up updated statuses
      const refreshRes = await fetch("/api/live-invitations");
      const refreshData = await refreshRes.json();
      if (refreshRes.ok) {
        setRows(refreshData.rows || []);
        setSelectedIds(new Set());
      }
    } catch (err) {
      console.error("send batch error", err);
      setError(err.message || "We couldn’t send those invitations.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      <Seo path="/live-survey-admin" title={title} description={description} />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs tracking-widest text-slate-400 uppercase">
              Live programme · Envola
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-50">
              Live survey admin
            </h1>
            <p className="mt-1 text-sm text-slate-400 max-w-2xl">
              Review the invitations queued in Dropbox, deselect anyone you don’t want to contact,
              then send the selected surveys in one click.
            </p>
          </div>
        </header>

        <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6 lg:p-7 shadow-xl shadow-black/40">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-50">Queued invitations</h2>
              <p className="text-xs text-slate-400">
                Pulled from <code className="text-[10px] bg-slate-900/80 px-1.5 py-0.5 rounded">
                  /npsme/live/invitations.csv
                </code>{" "}
                in Dropbox.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleAll}
                disabled={loading || rows.length === 0}
                className="text-xs rounded-full border border-slate-700 px-3 py-1 hover:bg-slate-800 disabled:opacity-50"
              >
                {allSelected ? "Deselect all" : "Select all"}
              </button>
              <button
                type="button"
                onClick={handleSendSelected}
                disabled={loading || !anySelected || sending}
                className={`text-xs rounded-full px-4 py-1.5 font-semibold shadow-lg shadow-emerald-500/30 ${
                  sending || !anySelected
                    ? "bg-emerald-500/50 cursor-not-allowed"
                    : "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                }`}
              >
                {sending ? "Sending…" : "Send selected"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-3 rounded-2xl border border-rose-500/70 bg-rose-950/50 px-3 py-2 text-xs text-rose-100">
              {error}
            </div>
          )}

          {statusMsg && (
            <div className="mb-3 rounded-2xl border border-emerald-500/70 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-100">
              {statusMsg}
            </div>
          )}

          {loading ? (
            <p className="text-sm text-slate-400">Loading invitations…</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-slate-400">No invitations found in the live file.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-900/70">
                  <tr>
                    <th className="px-3 py-2 text-left">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                      />
                    </th>
                    <th className="px-3 py-2 text-left text-slate-300">Invitation ID</th>
                    <th className="px-3 py-2 text-left text-slate-300">Name</th>
                    <th className="px-3 py-2 text-left text-slate-300">Email</th>
                    <th className="px-3 py-2 text-left text-slate-300">Business</th>
                    <th className="px-3 py-2 text-left text-slate-300">Stage</th>
                    <th className="px-3 py-2 text-left text-slate-300">Device</th>
                    <th className="px-3 py-2 text-left text-slate-300">AM</th>
                    <th className="px-3 py-2 text-left text-slate-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => {
                    const selected = selectedIds.has(row.invitationId);
                    const stripe = idx % 2 === 0 ? "bg-slate-950/40" : "bg-slate-950/10";
                    return (
                      <tr key={row.invitationId} className={stripe}>
                        <td className="px-3 py-2 align-middle">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleOne(row.invitationId)}
                          />
                        </td>
                        <td className="px-3 py-2 align-middle font-mono text-[11px] text-slate-300">
                          {row.invitationId}
                        </td>
                        <td className="px-3 py-2 align-middle">{row.customerName}</td>
                        <td className="px-3 py-2 align-middle text-slate-300">
                          {row.email}
                        </td>
                        <td className="px-3 py-2 align-middle">{row.businessName}</td>
                        <td className="px-3 py-2 align-middle">{row.stage}</td>
                        <td className="px-3 py-2 align-middle">
                          {row.typeOfDevice || <span className="text-slate-500">—</span>}
                        </td>
                        <td className="px-3 py-2 align-middle">
                          {row.assistanteMaternelle || <span className="text-slate-500">—</span>}
                        </td>
                        <td className="px-3 py-2 align-middle">
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] border border-slate-700">
                            {(row.status || "pending").toLowerCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
