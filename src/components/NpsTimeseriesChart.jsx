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

// Width-only observer (height no longer needed because we give chart a fixed px height)
function useElementWidth() {
  const ref = React.useRef(null);
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;

    const measure = () => {
      const r = el.getBoundingClientRect();
      const w = r.width || 0;

      // Debug: only log when width collapses
      if (w <= 0.5) {
        console.log("[useElementWidth] collapsed:", { width: w, rect: r, el });
      }

      setWidth(w);
    };

    measure();
    raf = requestAnimationFrame(measure);

    let ro = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
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

  return { ref, width };
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

  const { ref, width } = useElementWidth();
  const ready = width > 1;

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
    <div ref={ref} className="w-full min-w-0">
      {!ready ? (
        // Placeholder keeps layout stable while width is 0 during route/layout settle
        <div className="w-full" style={{ height: 170 }} />
      ) : (
        <ResponsiveContainer width="100%" height={170}>
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
              formatter={(value, name) =>
                name === "nps" ? [value, "NPS"] : [value, name]
              }
              contentStyle={{ borderRadius: 12 }}
            />
            <Line
              type="monotone"
              dataKey="nps"
              stroke="#7C3AED"
              strokeWidth={3}
              dot={{ r: 4, fill: "#22C55E", stroke: "#22C55E" }}
              activeDot={{ r: 6, fill: "#22C55E", stroke: "#22C55E" }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
