import { useEffect, useState } from "react";

export default function NpsResponsesExplorer() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/intercom/private/nps-responses-explorer")
      .then((r) => r.json())
      .then((d) => {
        setRows(d.rows || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">
        NPS Responses Explorer
      </h1>

      <div className="overflow-auto border rounded">
        <table className="min-w-[1600px] text-sm">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="sticky left-0 bg-slate-800 p-2">
                Contact
              </th>
              <th className="sticky left-[200px] bg-slate-800 p-2">
                Date
              </th>
              <th className="sticky left-[350px] bg-slate-800 p-2">
                Response ID
              </th>

              <th className="p-2">NPS</th>
              <th className="p-2">Pioupiou</th>
              <th className="p-2">Reader</th>
              <th className="p-2">Question</th>
              <th className="p-2">Answer</th>
              <th className="p-2">Comment</th>
              <th className="p-2">Previous dates</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b">
                <td className="sticky left-0 bg-white p-2 w-[200px]">
                  <a
                    href={r.intercom_contact_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    {r.contact_name}
                  </a>
                </td>

                <td className="sticky left-[200px] bg-white p-2 w-[150px]">
                  {new Date(r.submitted_at).toLocaleDateString()}
                </td>

                <td className="sticky left-[350px] bg-white p-2 w-[200px]">
                  {r.response_id}
                </td>

                <td className="p-2">{r.nps_score}</td>
                <td className="p-2">{r.pioupiou}</td>
                <td className="p-2">{r.reader_serial}</td>
                <td className="p-2 w-[300px]">
                  {r.question_text}
                </td>
                <td className="p-2 w-[250px]">{r.answer}</td>
                <td className="p-2 w-[300px]">
                  {r.associated_comment}
                </td>
                <td className="p-2">
                  {(r.previous_response_dates || []).join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
