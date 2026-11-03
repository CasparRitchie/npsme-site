import test from "node:test";
import assert from "node:assert/strict";

import { buildCanonicalResponsesFromSurveyEvents } from "../envola.routes.js";
import { buildDynamicSurveyAnswerFields } from "../workspaceIntercom.routes.js";

function completion({
  contentId,
  receiptId,
  receivedAt,
  score,
  questionId = "nps-question",
  questionText = "Would you recommend us?",
}) {
  return {
    stat_type: "completion",
    content_id: contentId,
    receipt_id: receiptId,
    received_at: receivedAt,
    answers_json: JSON.stringify([
      {
        question_id: questionId,
        question_text: questionText,
        response: String(score),
      },
    ]),
  };
}

test("canonical survey responses retain completions from every survey content id", () => {
  const rows = buildCanonicalResponsesFromSurveyEvents([
    completion({
      contentId: "global-nps",
      receiptId: "global-1",
      receivedAt: "2026-10-01T10:00:00.000Z",
      score: 8,
    }),
    completion({
      contentId: "milestone-j40",
      receiptId: "j40-1",
      receivedAt: "2026-10-02T10:00:00.000Z",
      score: 9,
    }),
    completion({
      contentId: "milestone-one-year",
      receiptId: "year-1",
      receivedAt: "2026-10-03T10:00:00.000Z",
      score: 10,
    }),
  ]);

  assert.equal(rows.length, 3);
  assert.deepEqual(
    new Set(rows.map((row) => row.content_id)),
    new Set(["global-nps", "milestone-j40", "milestone-one-year"])
  );
});

test("canonical survey responses keep the newest duplicate without dropping other surveys", () => {
  const rows = buildCanonicalResponsesFromSurveyEvents([
    completion({
      contentId: "global-nps",
      receiptId: "same-receipt",
      receivedAt: "2026-10-01T10:00:00.000Z",
      score: 7,
    }),
    completion({
      contentId: "milestone-j40",
      receiptId: "j40-1",
      receivedAt: "2026-10-02T10:00:00.000Z",
      score: 9,
    }),
    completion({
      contentId: "global-nps",
      receiptId: "same-receipt",
      receivedAt: "2026-10-03T10:00:00.000Z",
      score: 10,
      questionId: "edited-nps-question",
      questionText: "Updated recommendation question",
    }),
  ]);

  assert.equal(rows.length, 2);
  const global = rows.find((row) => row.content_id === "global-nps");
  assert.equal(global.score_0_10, 10);
  assert.equal(global.answers[0].question_id, "edited-nps-question");
});

test("non-completion survey events are not presented as responses", () => {
  const rows = buildCanonicalResponsesFromSurveyEvents([
    {
      stat_type: "answer",
      content_id: "global-nps",
      receipt_id: "answer-only",
      answers_json: "[]",
    },
  ]);

  assert.deepEqual(rows, []);
});

test("edited and milestone question IDs are retained without duplicating legacy fields", () => {
  const fields = buildDynamicSurveyAnswerFields([
    {
      question_id: "707808",
      question_text: "Recommanderiez-vous Envola ?",
      response: "9",
    },
    {
      question_id: "707809",
      question_text: "Pourquoi ?",
      response: "Très simple à utiliser",
    },
    {
      question_id: "707810",
      question_text: "Autonomie dans l'application",
      response: "8",
    },
    {
      question_id: "612565",
      question_text: "Pourquoi ?",
      response: "Legacy comment already has a named field",
    },
  ]);

  assert.equal(fields.npsScore, 9);
  assert.deepEqual(fields.additionalAnswers, {
    "Pourquoi ?": "Très simple à utiliser",
    "Autonomie dans l'application": 8,
  });
});
