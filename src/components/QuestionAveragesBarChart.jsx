import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

// ---- color helpers (green -> purple gradient across bars)
function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}
function hexToRgb(hex) {
  const h = String(hex || "").replace("#", "").trim();
  if (h.length !== 6) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}
function rgbToHex({ r, g, b }) {
  const to = (x) => clamp(Math.round(x), 0, 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}
function lerpColor(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex({
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  });
}

// ---- label wrapping helper
function wrapByChars(text, maxCharsPerLine) {
  const s = String(text || "").trim();
  if (!s) return ["—"];
  const words = s.split(/\s+/).filter(Boolean);

  const lines = [];
  let line = "";

  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length <= maxCharsPerLine) {
      line = next;
    } else {
      if (line) lines.push(line);
      if (w.length > maxCharsPerLine) {
        lines.push(w.slice(0, maxCharsPerLine));
        line = w.slice(maxCharsPerLine);
      } else {
        line = w;
      }
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4); // cap to keep axis tidy
}

// ---- custom X-axis tick: horizontal + wrapped + centered
function WrappedCenteredTick(props) {
  const { x, y, payload, widthPxForTick = 90 } = props;
  const value = payload?.value ?? "";

  // heuristic: chars-per-line based on tick width
  const maxChars = clamp(Math.floor(widthPxForTick / 6.8), 10, 26);
  const lines = wrapByChars(value, maxChars);
  const lineHeight = 12;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={10}
        textAnchor="middle"
        fill="rgba(226,232,240,0.85)" // readable on dark background
        fontSize={11}
      >
        {lines.map((ln, i) => (
          <tspan key={i} x={0} dy={i === 0 ? 0 : lineHeight}>
            {ln}
          </tspan>
        ))}
      </text>
    </g>
  );
}

// ---- tooltip (readable)
function QaTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;

  return (
    <div
      style={{
        background: "white",
        color: "#0B0F19",
        borderRadius: 14,
        padding: "10px 12px",
        border: "1px solid rgba(15, 23, 42, 0.10)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        maxWidth: 340,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
        {label || d?.label || "—"}
      </div>
      <div style={{ fontSize: 12, color: "rgba(15, 23, 42, 0.75)" }}>
        Average: <span style={{ fontWeight: 800 }}>{d?.avg ?? "—"}</span> / 10
        {d?.count != null ? (
          <>
            {" "}
            • Sample: <span style={{ fontWeight: 800 }}>{d.count}</span>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function QuestionAveragesBarChart({ data }) {
  if (!Array.isArray(data) || data.length === 0) return null;

  const GREEN = "#22C55E";
  const PURPLE = "#A855F7";

  // click modal state
  const [selected, setSelected] = React.useState(null);

  // ensure clean rows
  const chartData = data
    .filter((d) => d && typeof d.avg === "number")
    .map((d, i) => ({
      ...d,
      label: String(d.label || "—"),
      avg: Number(d.avg),
      count: d.count == null ? null : Number(d.count),
      __idx: i,
    }));

  if (!chartData.length) return null;

  return (
    <div style={{ width: "100%", height: 420 }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{ top: 12, right: 18, left: 6, bottom: 95 }} // room for wrapped labels
          barCategoryGap={18}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            interval={0}
            height={95}
            tickMargin={18}
            axisLine={{ stroke: "rgba(255,255,255,0.15)" }}
            tickLine={{ stroke: "rgba(255,255,255,0.15)" }}
            tick={(tickProps) => {
              // width heuristic for wrapping
              const n = chartData.length || 1;
              const w = Math.max(60, Math.floor(900 / n));
              return <WrappedCenteredTick {...tickProps} widthPxForTick={w} />;
            }}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fill: "rgba(226,232,240,0.85)", fontSize: 12 }}
            axisLine={{ stroke: "rgba(255,255,255,0.15)" }}
            tickLine={{ stroke: "rgba(255,255,255,0.15)" }}
          />
          <Tooltip content={<QaTooltip />} />

          <Bar
            dataKey="avg"
            radius={[12, 12, 6, 6]}
            isAnimationActive={false}
            onClick={(_, idx) => {
              const d = chartData[idx];
              if (d) setSelected(d);
            }}
          >
            {chartData.map((d, i) => {
              const t = chartData.length <= 1 ? 0 : i / (chartData.length - 1);
              const fill = lerpColor(GREEN, PURPLE, t);
              return <Cell key={d.id || `${d.label}-${i}`} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Modal (white bg, dark readable text) */}
      {selected ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            aria-label="Close modal overlay"
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              border: "none",
              padding: 0,
              margin: 0,
              cursor: "pointer",
            }}
          />
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 720,
              borderRadius: 24,
              background: "white",
              padding: 20,
              boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
            }}
          >
            <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(15,23,42,0.60)" }}>
                  Question
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#0B0F19", // ✅ readable on white
                    lineHeight: 1.25,
                    wordBreak: "break-word",
                  }}
                >
                  {selected.label}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                style={{
                  borderRadius: 12,
                  border: "1px solid rgba(15,23,42,0.12)",
                  background: "white",
                  padding: "10px 12px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "rgba(15,23,42,0.75)",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>

            <div
              style={{
                marginTop: 16,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
              }}
            >
              <div
                style={{
                  borderRadius: 18,
                  border: "1px solid rgba(15,23,42,0.12)",
                  background: "rgba(15,23,42,0.03)",
                  padding: 14,
                }}
              >
                <div style={{ fontSize: 12, color: "rgba(15,23,42,0.70)" }}>Average score</div>
                <div style={{ marginTop: 6, fontSize: 34, fontWeight: 800, color: "#0B0F19" }}>
                  {selected.avg} <span style={{ fontSize: 16, fontWeight: 700, color: "rgba(15,23,42,0.55)" }}>/10</span>
                </div>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  border: "1px solid rgba(15,23,42,0.12)",
                  background: "rgba(15,23,42,0.03)",
                  padding: 14,
                }}
              >
                <div style={{ fontSize: 12, color: "rgba(15,23,42,0.70)" }}>Sample size</div>
                <div style={{ marginTop: 6, fontSize: 34, fontWeight: 800, color: "#0B0F19" }}>
                  {selected.count ?? "—"}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12, fontSize: 13, color: "rgba(15,23,42,0.65)" }}>
              Tip: click another bar to compare questions.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
