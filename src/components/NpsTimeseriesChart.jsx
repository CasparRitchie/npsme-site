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

  // week
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
  const data = [...points].sort((a, b) => new Date(a.date) - new Date(b.date));

  // ✅ Prevent Recharts mounting while width = 0 (fixes -1 width/height warning)
  const wrapRef = React.useRef(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.getBoundingClientRect().width;
      setReady(w > 0);
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      const t1 = setTimeout(measure, 0);
      const t2 = setTimeout(measure, 50);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ClickableDot = ({ cx, cy, payload }) => {
    if (cx == null || cy == null) return null;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        className="cursor-pointer"
        onClick={() => {
          if (onPointClick && payload) onPointClick(payload);
        }}
      />
    );
  };

  return (
    <div ref={wrapRef} className="w-full min-w-0">
      {!ready ? (
        <div style={{ aspectRatio: "2.6 / 1" }} />
      ) : (
        <ResponsiveContainer width="100%" aspect={2.6}>
          <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatDateLabel(v, granularity)}
              minTickGap={16}
            />

            <YAxis domain={[-100, 100]} />

            <Tooltip
              labelFormatter={(label) =>
                tooltipLabelFormatter(label, granularity)
              }
              formatter={(value, name) =>
                name === "nps" ? [value, "NPS"] : [value, name]
              }
              contentStyle={{ borderRadius: 12 }}
            />

            <Line
              type="monotone"
              dataKey="nps"
              dot={<ClickableDot />}
              activeDot={<ClickableDot />}
              strokeWidth={2}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
