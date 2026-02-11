// src/components/NpsBucketStackedColumns.jsx
import React from "react";

function clamp01(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function safeInt(n) {
  return Number.isFinite(n) ? n : 0;
}

export default function NpsBucketStackedColumns({
  points = [],
  height = 160,
  maxBars = 36,
  title = "Distribution over time",
  subtitle = "Promoters / Passives / Detractors per time bucket",
}) {
  const data = React.useMemo(() => {
    const arr = Array.isArray(points) ? points : [];
    // keep most recent bars (nice + performant)
    return arr.slice(Math.max(0, arr.length - maxBars));
  }, [points, maxBars]);

  const maxTotal = React.useMemo(() => {
    if (!data.length) return 1;
    return Math.max(
      1,
      ...data.map((p) => safeInt(p.promoters) + safeInt(p.passives) + safeInt(p.detractors))
    );
  }, [data]);

  // SVG layout
  const W = 1000; // viewBox width
  const H = 200;  // viewBox height
  const pad = { l: 22, r: 10, t: 10, b: 26 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const barGap = 6;
  const barW = data.length
    ? Math.max(6, Math.floor((innerW - barGap * (data.length - 1)) / data.length))
    : 10;

  function xFor(i) {
    return pad.l + i * (barW + barGap);
  }

  function yFor(value) {
    // value in [0..1]
    return pad.t + (1 - clamp01(value)) * innerH;
  }

  // Simple axis labels (sparse)
  const labelEvery = data.length > 18 ? 6 : data.length > 10 ? 4 : 2;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-slate-400">{title}</div>
          <div className="mt-1 text-sm text-slate-300">{subtitle}</div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-300">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-400/80" />
            Promoters
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-400/80" />
            Passives
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-rose-400/80" />
            Detractors
          </span>
        </div>
      </div>

      {!data.length ? (
        <div className="mt-4 text-sm text-slate-400">No data yet for this period.</div>
      ) : (
        <div className="mt-4">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            height={height}
            className="block"
            role="img"
            aria-label="NPS bucket distribution over time"
          >
            {/* grid lines */}
            {[0.25, 0.5, 0.75].map((v) => {
              const y = yFor(v);
              return (
                <line
                  key={v}
                  x1={pad.l}
                  x2={W - pad.r}
                  y1={y}
                  y2={y}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
              );
            })}

            {/* bars */}
            {data.map((p, i) => {
              const promoters = safeInt(p.promoters);
              const passives = safeInt(p.passives);
              const detractors = safeInt(p.detractors);
              const total = Math.max(1, promoters + passives + detractors);

              // Use maxTotal scaling (so chart height is stable across buckets)
              const scaledTotal = (promoters + passives + detractors) / maxTotal;

              const promoterFrac = promoters / maxTotal;
              const passiveFrac = passives / maxTotal;
              const detractorFrac = detractors / maxTotal;

              const x = xFor(i);
              const y0 = yFor(0); // bottom baseline

              // Heights in px (innerH space)
              const hProm = clamp01(promoterFrac) * innerH;
              const hPass = clamp01(passiveFrac) * innerH;
              const hDetr = clamp01(detractorFrac) * innerH;

              // Stack from bottom: detractors (red) at bottom, passives, promoters at top
              const yDetr = y0 - hDetr;
              const yPass = yDetr - hPass;
              const yProm = yPass - hProm;

              // Tooltip label
              const label = `${p.date || ""} • total ${total} (P${promoters} / Pa${passives} / D${detractors})`;

              return (
                <g key={p.date || i}>
                  <title>{label}</title>

                  {/* detractors */}
                  <rect
                    x={x}
                    y={yDetr}
                    width={barW}
                    height={hDetr}
                    rx="4"
                    ry="4"
                    fill="rgba(251,113,133,0.85)"
                    style={{ transition: "all 350ms ease" }}
                  />

                  {/* passives */}
                  <rect
                    x={x}
                    y={yPass}
                    width={barW}
                    height={hPass}
                    rx="4"
                    ry="4"
                    fill="rgba(251,191,36,0.85)"
                    style={{ transition: "all 350ms ease" }}
                  />

                  {/* promoters */}
                  <rect
                    x={x}
                    y={yProm}
                    width={barW}
                    height={hProm}
                    rx="4"
                    ry="4"
                    fill="rgba(52,211,153,0.85)"
                    style={{ transition: "all 350ms ease" }}
                  />

                  {/* x-axis labels (sparse) */}
                  {i % labelEvery === 0 ? (
                    <text
                      x={x + barW / 2}
                      y={H - 8}
                      textAnchor="middle"
                      fontSize="11"
                      fill="rgba(148,163,184,0.9)"
                    >
                      {String(p.date || "").slice(5)} {/* MM-DD style */}
                    </text>
                  ) : null}
                </g>
              );
            })}

            {/* baseline */}
            <line
              x1={pad.l}
              x2={W - pad.r}
              y1={pad.t + innerH}
              y2={pad.t + innerH}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1"
            />
          </svg>

          <div className="mt-3 text-xs text-slate-400">
            Showing <span className="text-slate-200">{data.length}</span> buckets (max {maxBars}).
          </div>
        </div>
      )}
    </div>
  );
}
