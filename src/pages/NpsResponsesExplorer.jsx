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
        <table className="min-w-[1800px] text-sm">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="sticky left-0 bg-slate-800 p-2 w-[220px]">Contact</th>
              <th className="sticky left-[220px] bg-slate-800 p-2 w-[160px]">Date</th>
              <th className="sticky left-[380px] bg-slate-800 p-2 w-[240px]">Response ID</th>

              <th className="p-2">NPS</th>
              <th className="p-2">Bucket</th>
              <th className="p-2">Pioupiou</th>
              <th className="p-2">Reader</th>
              <th className="p-2 w-[360px]">Question</th>
              <th className="p-2 w-[260px]">Answer</th>
              <th className="p-2 w-[360px]">Associated comment</th>
              <th className="p-2">Previous responses</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b hover:bg-slate-50">
                <td className="sticky left-0 bg-white p-2">
                  <a
                    href={r.intercom_contact_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    {r.contact_name}
                  </a>
                </td>

                <td className="sticky left-[220px] bg-white p-2">
                  {new Date(r.submitted_at).toLocaleDateString()}
                </td>

                <td className="sticky left-[380px] bg-white p-2">
                  {r.response_id}
                </td>

                <td className="p-2">{r.nps_score}</td>
                <td className="p-2">{r.bucket}</td>
                <td className="p-2">{r.pioupiou}</td>
                <td className="p-2">{r.reader_serial}</td>

                <td className="p-2">{r.question_text}</td>
                <td className="p-2">{r.answer}</td>
                <td className="p-2">{r.associated_comment}</td>

                <td className="p-2 text-xs">
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
