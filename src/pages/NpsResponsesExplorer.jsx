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

      <div className="overflow-auto border rounded bg-white">
        <table className="min-w-[2600px] text-xs">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="sticky left-0 bg-slate-800 p-2 w-[180px]">Contact</th>
              <th className="sticky left-[180px] bg-slate-800 p-2 w-[120px]">Date</th>
              <th className="sticky left-[300px] bg-slate-800 p-2 w-[220px]">Response ID</th>

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
              <tr key={i} className={`border-b align-top ${i % 2 ? "bg-slate-50" : ""}`}>
                <td className="sticky left-0 bg-white p-2 break-words">
                  <a
                    href={r.intercom_contact_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    {r.contact_name}
                  </a>
                </td>

                <td className="sticky left-[180px] bg-white p-2">
                  {new Date(r.submitted_at).toLocaleDateString()}
                </td>

                <td className="sticky left-[300px] bg-white p-2 break-all">
                  {r.response_id}
                </td>

                <td className="p-2">{r.nps_score}</td>
                <td className="p-2">{r.bucket}</td>
                <td className="p-2 break-words">{r.pioupiou}</td>
                <td className="p-2 break-words">{r.reader_serial}</td>

                <td className="p-2">{r.q_recommend_score}</td>
                <td className="p-2 whitespace-normal break-words">{r.q_recommend_comment}</td>

                <td className="p-2">{r.q_install_score}</td>
                <td className="p-2 whitespace-normal break-words">{r.q_install_comment}</td>

                <td className="p-2">{r.q_daily_use_score}</td>

                <td className="p-2 whitespace-normal break-words">{r.q_benefits}</td>

                <td className="p-2">{r.q_parent_relation_score}</td>
                <td className="p-2 whitespace-normal break-words">{r.q_parent_relation_comment}</td>

                <td className="p-2">{r.q_support_score}</td>
                <td className="p-2 whitespace-normal break-words">{r.q_final_comment}</td>

                <td className="p-2 text-[11px]">
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
