import test from "node:test";
import assert from "node:assert/strict";

import {
  getDateRangeError,
  matchesWorkspaceDateFilter,
} from "../src/utils/workspaceDateFilters.js";

test("custom ranges include the whole start and end dates", () => {
  const range = { period: "custom", from: "2026-07-01", to: "2026-09-30" };

  assert.equal(matchesWorkspaceDateFilter("2026-07-01T00:00:00.000Z", range), true);
  assert.equal(matchesWorkspaceDateFilter("2026-09-30T23:59:59.999Z", range), true);
  assert.equal(matchesWorkspaceDateFilter("2026-06-30T23:59:59.999Z", range), false);
  assert.equal(matchesWorkspaceDateFilter("2026-10-01T00:00:00.000Z", range), false);
});

test("custom ranges reject incomplete and reversed selections", () => {
  assert.equal(
    getDateRangeError({ period: "custom", from: "2026-07-01", to: "" }),
    "incomplete"
  );
  assert.equal(
    getDateRangeError({ period: "custom", from: "2026-10-01", to: "2026-09-30" }),
    "reversed"
  );
});

test("all-time filtering retains rows without a usable date", () => {
  assert.equal(
    matchesWorkspaceDateFilter(null, { period: "all", from: "", to: "" }),
    true
  );
});
