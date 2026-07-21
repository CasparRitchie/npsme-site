import assert from "node:assert/strict";
import test from "node:test";

import {
  CLOSING_LOOP_THEME_RULES,
  detectClosingLoopThemes,
  formatClosingLoopTheme,
} from "../shared/closingLoopThemes.js";

test("detects the existing English and French theme vocabulary", () => {
  assert.deepEqual(
    detectClosingLoopThemes(
      "Installation difficile, problèmes de connexion WiFi et support lent"
    ),
    ["onboarding", "wifi", "support", "setup", "support_speed"]
  );
});

test("returns unique keys for the canonical Workspace contract", () => {
  assert.deepEqual(detectClosingLoopThemes("Le produit a un bug"), ["reliability"]);
});

test("can preserve duplicate legacy hits during compatibility migration", () => {
  assert.deepEqual(
    detectClosingLoopThemes("Le produit a un bug", { unique: false }),
    ["reliability", "reliability"]
  );
});

test("returns an empty list for empty feedback", () => {
  assert.deepEqual(detectClosingLoopThemes("  "), []);
});

test("keeps the legacy key list available for endpoint validation", () => {
  assert.equal(CLOSING_LOOP_THEME_RULES.some((rule) => rule.key === "billing"), true);
});

test("uses translated labels when supplied and a readable fallback otherwise", () => {
  assert.equal(formatClosingLoopTheme("wifi", { wifi: "Connexion / WiFi" }), "Connexion / WiFi");
  assert.equal(formatClosingLoopTheme("feature_requests"), "feature requests");
});
