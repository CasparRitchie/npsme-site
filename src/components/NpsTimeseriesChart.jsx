import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function formatDateLabel(iso, granularity) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  if (granularity === "day") {
    return d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
  }
  if (granularity === "month") {
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
  }
  // week (default): show week starting date
  return d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
}

function tooltipLabelFormatter(label, granularity) {
  const d = new Date(label);
  if (Number.isNaN(d.getTime())) return label;
  const base = d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  return granularity === "week" ? `Week of ${base}` : base;
}

export default function NpsTimeseriesChart({ points = [], granularity = "week", onPointClick }) {
  const data = [...points].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 16, bottom: 0, left: 0 }}
          onClick={(e) => {
            // Recharts gives activePayload when you click near a point
            const p = e?.activePayload?.[0]?.payload;
            if (p && onPointClick) onPointClick(p);
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(v) => formatDateLabel(v, granularity)}
            minTickGap={16}
          />
          <YAxis domain={[-100, 100]} />
          <Tooltip
            labelFormatter={(label) => tooltipLabelFormatter(label, granularity)}
            formatter={(value, name, item) => {
              if (name === "nps") return [value, "NPS"];
              return [value, name];
            }}
            contentStyle={{ borderRadius: 12 }}
          />
          <Line
            type="monotone"
            dataKey="nps"
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
