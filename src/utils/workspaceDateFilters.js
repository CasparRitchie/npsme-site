const DAY_MS = 24 * 60 * 60 * 1000;

export function getDateRangeError({ period, from, to }) {
  if (period !== "custom") return "";
  if (!from || !to) return "incomplete";

  const bounds = getCustomDateBounds(from, to);
  if (!bounds) return "invalid";
  if (bounds.fromMs > bounds.toMs) return "reversed";

  return "";
}

export function matchesWorkspaceDateFilter(isoDate, { period, from, to }) {
  if (!period || period === "all") return true;

  const valueMs = Date.parse(isoDate || "");
  if (!Number.isFinite(valueMs)) return false;

  if (period === "custom") {
    const bounds = getCustomDateBounds(from, to);
    if (!bounds || bounds.fromMs > bounds.toMs) return false;
    return valueMs >= bounds.fromMs && valueMs <= bounds.toMs;
  }

  const now = new Date();

  if (period === "this_month") {
    const value = new Date(valueMs);
    return (
      value.getFullYear() === now.getFullYear() &&
      value.getMonth() === now.getMonth()
    );
  }

  const days = Number.parseInt(String(period).replace(/d$/, ""), 10);
  if (!Number.isFinite(days)) return true;

  return valueMs >= Date.now() - days * DAY_MS;
}

export function describeWorkspaceDateFilter({ period, from, to, lang = "en" }) {
  if (period === "custom" && from && to) {
    return lang === "fr" ? `du ${from} au ${to}` : `from ${from} to ${to}`;
  }

  const labels = lang === "fr"
    ? {
        all: "toute la période",
        "7d": "les 7 derniers jours",
        "30d": "les 30 derniers jours",
        "90d": "les 90 derniers jours",
        this_month: "ce mois-ci",
      }
    : {
        all: "all time",
        "7d": "the last 7 days",
        "30d": "the last 30 days",
        "90d": "the last 90 days",
        this_month: "this month",
      };

  return labels[period] || labels.all;
}

function getCustomDateBounds(from, to) {
  const fromMs = Date.parse(`${from || ""}T00:00:00.000Z`);
  const toMs = Date.parse(`${to || ""}T23:59:59.999Z`);

  if (!Number.isFinite(fromMs) || !Number.isFinite(toMs)) return null;
  return { fromMs, toMs };
}
