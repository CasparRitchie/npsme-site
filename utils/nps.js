// src/utils/nps.js

export function computeNpsStats(rows) {
  if (!rows || !rows.length) {
    return { nps: null, total: 0, promoters: 0, passives: 0, detractors: 0 };
  }

  let promoters = 0;
  let passives = 0;
  let detractors = 0;

  for (const r of rows) {
    const s = Number(r.score);
    if (Number.isNaN(s)) continue;

    if (s >= 9) promoters++;
    else if (s >= 7) passives++;
    else detractors++;
  }

  const total = promoters + passives + detractors;

  if (total === 0) {
    return { nps: null, total, promoters, passives, detractors };
  }

  const nps = Math.round(((promoters - detractors) / total) * 100);

  return { nps, total, promoters, passives, detractors };
}
