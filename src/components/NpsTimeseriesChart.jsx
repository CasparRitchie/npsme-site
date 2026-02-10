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

export default function NpsTimeseriesChart({
  points = [],
  granularity = "week",
  onPointClick,
}) {
  const data = [...points].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Make clicks reliable by attaching the handler to the actual dot payload,
  // not the chart surface (which often gives you no activePayload).
  const ClickableDot = (props) => {
    const { cx, cy, payload } = props || {};
    if (cx == null || cy == null) return null;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        className="cursor-pointer"
        onClick={() => {
          if (typeof onPointClick === "function" && payload) onPointClick(payload);
        }}
      />
    );
  };

  const ActiveClickableDot = (props) => <ClickableDot {...props} />;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 16, bottom: 0, left: 0 }}
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
            formatter={(value, name) => {
              if (name === "nps") return [value, "NPS"];
              return [value, name];
            }}
            contentStyle={{ borderRadius: 12 }}
          />
          <Line
            type="monotone"
            dataKey="nps"
            dot={<ClickableDot />}
            activeDot={<ActiveClickableDot />}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
