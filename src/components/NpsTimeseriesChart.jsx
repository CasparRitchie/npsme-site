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
  return d.toLocaleDateString(undefined, { month: "short", day: "2-digit" }); // week
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

  const wrapRef = React.useRef(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    let raf1 = 0;
    let raf2 = 0;

    const measure = () => {
      const r = el.getBoundingClientRect();
      // Require BOTH width and height > 0 before mounting Recharts
      setReady(r.width > 0 && r.height > 0);
    };

    // Measure now, then again after layout settles
    measure();
    raf1 = window.requestAnimationFrame(() => {
      measure();
      raf2 = window.requestAnimationFrame(measure);
    });

    let ro = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    }

    return () => {
      if (ro) ro.disconnect();
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
    };
  }, []);

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

  return (
    // IMPORTANT: give the wrapper a real height so ResponsiveContainer has something to measure
    <div ref={wrapRef} className="w-full min-w-0 h-72">
      {!ready ? null : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatDateLabel(v, granularity)}
              minTickGap={16}
            />
            <YAxis domain={[-100, 100]} />
            <Tooltip
              labelFormatter={(label) => tooltipLabelFormatter(label, granularity)}
              formatter={(value, name) => (name === "nps" ? [value, "NPS"] : [value, name])}
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
