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

function useElementSize() {
  const ref = React.useRef(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;

    const measure = () => {
      const r = el.getBoundingClientRect();
      const width = r.width || 0;
      const height = r.height || 0;

      // only log when it collapses (debug)
      if (width <= 0.5 || height <= 0.5) {
        console.log("[useElementSize] collapsed:", { width, height, rect: r, el });
      }

      setSize({ width, height });
    };

    // measure now + after layout settles
    measure();
    raf = requestAnimationFrame(measure);

    let ro = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => measure());
      ro.observe(el);
    } else {
      const t = window.setInterval(measure, 150);
      return () => window.clearInterval(t);
    }

    return () => {
      if (ro) ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return { ref, ...size };
}

export default function NpsTimeseriesChart({
  points = [],
  granularity = "week",
  onPointClick,
}) {
  const data = React.useMemo(
    () => [...points].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [points]
  );

  // IMPORTANT: this ref must be on the SAME element that defines the chart size
  const { ref, width, height } = useElementSize();
  const ready = width > 1 && height > 1;

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
    // Make sure this wrapper has REAL height (you already set h-72 on the parent in EnvolaExample)
    <div ref={ref} className="w-full h-full min-w-0">
      {!ready ? (
        <div className="w-full h-full" />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatDateLabel(v, granularity)}
              minTickGap={18}
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
