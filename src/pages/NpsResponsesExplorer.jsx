import { useEffect, useState } from "react";

export default function NpsResponsesExplorer() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/intercom/private/nps-responses-explorer")
      .then(r => r.json())
      .then(d => {
        setRows(d.rows || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-6">Loading NPS Explorer…</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">NPS Responses Explorer</h1>

      <div className="overflow-auto border border-slate-300 rounded bg-slate-100 max-h-[75vh]">

        <table className="min-w-[2600px] text-xs">

          {/* ===== STICKY HEADER ===== */}
          <thead className="sticky top-0 z-40 bg-[#0F172A] text-slate-100 text-[11px] uppercase tracking-wide shadow-md">
            <tr>
              <th className="sticky left-0 z-50 bg-[#0F172A] p-2 w-[180px]">Contact</th>
              <th className="sticky left-[180px] z-50 bg-[#0F172A] p-2 w-[120px]">Date</th>
              <th className="sticky left-[300px] z-50 bg-[#0F172A] p-2 w-[220px]">Response ID</th>

              <th className="p-2 w-[60px]">NPS</th>
              <th className="p-2 w-[90px]">Bucket</th>
              <th className="p-2 w-[140px]">Pioupiou</th>
              <th className="p-2 w-[140px]">Reader</th>

              <th className="p-2 w-[120px]">Recommend</th>
              <th className="p-2 w-[260px]">Why?</th>

              <th className="p-2 w-[120px]">Install</th>
              <th className="p-2 w-[260px]">Install comment</th>

              <th className="p-2 w-[120px]">Daily use</th>

              <th className="p-2 w-[300px]">Benefits</th>

              <th className="p-2 w-[140px]">Parent relation</th>
              <th className="p-2 w-[300px]">Parent relation comment</th>

              <th className="p-2 w-[120px]">Support</th>
              <th className="p-2 w-[300px]">Final comment</th>

              <th className="p-2 w-[200px]">Previous responses</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
                className={`border-b border-slate-200 align-top ${
                  i % 2 ? "bg-white" : "bg-slate-50"
                } hover:bg-indigo-50 transition-colors`}
              >
                <td className="sticky left-0 z-30 bg-slate-100 p-2 break-words text-slate-900 leading-snug">
                  <a
                    href={r.intercom_contact_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 underline"
                  >
                    {r.contact_name}
                  </a>
                </td>

                <td className="sticky left-[180px] z-30 bg-slate-100 p-2 text-slate-900">
                  {new Date(r.submitted_at).toLocaleDateString()}
                </td>

                <td className="sticky left-[300px] z-30 bg-slate-100 p-2 break-all text-slate-900">
                  {r.response_id}
                </td>

                <td className={`p-2 font-semibold text-center ${
                  r.nps_score >= 9
                    ? "text-green-700"
                    : r.nps_score >= 7
                    ? "text-amber-600"
                    : "text-red-600"
                }`}>
                  {r.nps_score}
                </td>

                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-[10px] font-semibold ${
                    r.bucket === "promoter"
                      ? "bg-green-100 text-green-700"
                      : r.bucket === "passive"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {r.bucket}
                  </span>
                </td>

                <td className="p-2 break-words text-slate-900">{r.pioupiou}</td>
                <td className="p-2 break-words text-slate-900">{r.reader_serial}</td>

                <td className="p-2">{r.q_recommend_score}</td>
                <td className="p-2 whitespace-normal break-words text-slate-900">{r.q_recommend_comment}</td>

                <td className="p-2">{r.q_install_score}</td>
                <td className="p-2 whitespace-normal break-words text-slate-900">{r.q_install_comment}</td>

                <td className="p-2">{r.q_daily_use_score}</td>

                <td className="p-2 whitespace-normal break-words text-slate-900">{r.q_benefits}</td>

                <td className="p-2">{r.q_parent_relation_score}</td>
                <td className="p-2 whitespace-normal break-words text-slate-900">{r.q_parent_relation_comment}</td>

                <td className="p-2">{r.q_support_score}</td>
                <td className="p-2 whitespace-normal break-words text-slate-900">{r.q_final_comment}</td>

                <td className="p-2 text-[11px] text-slate-900">
                  {(r.previous_response_dates || []).map((d, idx) => (
                    <div key={idx}>{new Date(d).toLocaleDateString()}</div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
