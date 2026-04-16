// src/components/NpsBucketStackedColumns.jsx
import React from "react";

function clamp01(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function safeInt(n) {
  return Number.isFinite(n) ? n : 0;
}

function formatBucketLabel(dateStr, granularity = "week") {
  if (!dateStr) return "";

  const d = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return dateStr;

  if (granularity === "month") {
    return d.toLocaleDateString("en-GB", {
      month: "short",
      year: "2-digit",
      timeZone: "UTC",
    });
  }

  return d.toLocaleDateString("en-GB", {
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  });
}

export default function NpsBucketStackedColumns({
  points = [],
  granularity = "week",
  height = 160,
  maxBars = 36,
  title = "Distribution over time",
  subtitle = "Promoters / Passives / Detractors per time bucket",
}) {
  const data = React.useMemo(() => {
    const arr = Array.isArray(points) ? points : [];
    return arr.slice(Math.max(0, arr.length - maxBars));
  }, [points, maxBars]);

  const maxTotal = React.useMemo(() => {
    if (!data.length) return 1;
    return Math.max(
      1,
      ...data.map((p) => safeInt(p.promoters) + safeInt(p.passives) + safeInt(p.detractors))
    );
  }, [data]);

  const W = 1000;
  const H = 200;

  const labelAreaHeight = granularity === "month" ? 36 : 48;
  const pad = { l: 22, r: 10, t: 10, b: labelAreaHeight };

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
    return pad.t + (1 - clamp01(value)) * innerH;
  }

  const rotateLabels = granularity !== "month";

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

            {data.map((p, i) => {
              const promoters = safeInt(p.promoters);
              const passives = safeInt(p.passives);
              const detractors = safeInt(p.detractors);
              const total = Math.max(1, promoters + passives + detractors);

              const promoterFrac = promoters / maxTotal;
              const passiveFrac = passives / maxTotal;
              const detractorFrac = detractors / maxTotal;

              const x = xFor(i);
              const y0 = yFor(0);

              const hProm = clamp01(promoterFrac) * innerH;
              const hPass = clamp01(passiveFrac) * innerH;
              const hDetr = clamp01(detractorFrac) * innerH;

              const yDetr = y0 - hDetr;
              const yPass = yDetr - hPass;
              const yProm = yPass - hProm;

              const label = `${p.date || ""} • total ${total} (P${promoters} / Pa${passives} / D${detractors})`;

              return (
                <g key={p.date || i}>
                  <title>{label}</title>

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

                  <text
                    x={x + barW / 2}
                    y={H - 10}
                    textAnchor={rotateLabels ? "end" : "middle"}
                    fontSize="11"
                    fill="rgba(148,163,184,0.9)"
                    transform={
                      rotateLabels
                        ? `rotate(-35 ${x + barW / 2} ${H - 10})`
                        : undefined
                    }
                  >
                    {formatBucketLabel(p.date, granularity)}
                  </text>
                </g>
              );
            })}

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
