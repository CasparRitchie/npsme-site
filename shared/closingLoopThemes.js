// Neutral, side-effect-free theme detection shared by Workspace and legacy
// Closing the Loop adapters. Keep route authentication and response projection
// outside this module.
export const CLOSING_LOOP_THEME_RULES = Object.freeze([
  { key: "onboarding", patterns: [/onboard/i, /mise en (route|place)/i, /d[eé]marr/i, /installation/i] },
  { key: "wifi", patterns: [/wifi/i, /connexion/i, /internet/i, /r[eé]seau/i] },
  { key: "support", patterns: [/support/i, /réponse/i, /lenteur/i, /ticket/i] },
  { key: "billing", patterns: [/factur/i, /paiement/i, /prix/i, /tarif/i] },
  { key: "reliability", patterns: [/bug/i, /plante/i, /crash/i, /marche pas/i, /fiab/i] },
  { key: "attendance_sheet", patterns: [/fiche de pr[eé]sence/i, /feuilles? de pr[eé]sence/i] },
  { key: "time_tracking", patterns: [/horaires?/i, /heures?/i, /pointage/i, /\bpointer\b/i, /heures suppl[eé]mentaires/i] },
  { key: "lateness", patterns: [/retards?/i, /[aà]\s*l['’]?heure/i, /ponctual/i] },
  { key: "parents", patterns: [/parents?/i, /employeurs?/i, /rapport(s)? avec les parents/i] },
  { key: "setup", patterns: [/installation/i, /prise en main/i, /d[eé]marr/i, /onboard/i] },
  // Preserve this legacy rule separately: callers can request duplicate hits
  // while Workspace uses the canonical unique-key result.
  { key: "reliability", patterns: [/ne fonctionne pas/i, /fonctionne pas/i, /marche pas/i, /bug/i, /fait parfois des siennes/i] },
  { key: "feature_requests", patterns: [/ajouter/i, /ce serait bien/i, /am[eé]lior/i, /repas/i, /sieste/i, /changes?/i, /carnet de liaison/i, /brochures?/i] },
  { key: "support_speed", patterns: [/r[eé]actif/i, /support/i, /disponibil/i, /[eé]coute/i] },
]);

export function detectClosingLoopThemes(input, { unique = true } = {}) {
  const text = String(input || "").trim();
  if (!text) return [];

  const hits = CLOSING_LOOP_THEME_RULES
    .filter((rule) => rule.patterns.some((pattern) => pattern.test(text)))
    .map((rule) => rule.key);

  return unique ? Array.from(new Set(hits)) : hits;
}

export function formatClosingLoopTheme(theme, labels = {}) {
  const key = String(theme || "").trim();
  if (!key) return "";
  return labels[key] || key.replaceAll("_", " ");
}
