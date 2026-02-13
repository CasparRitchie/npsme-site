import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function QuestionAveragesBarChart({ data }) {
  if (!data?.length) return null;

  return (
    <div style={{ width: "100%", height: 360 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            angle={-30}
            textAnchor="end"
            interval={0}
            height={80}
          />
          <YAxis domain={[0, 10]} />
          <Tooltip />
          <Bar dataKey="avg" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
