import test from "node:test";
import assert from "node:assert/strict";

import { buildAdditionalSurveyQuestionRows } from "../src/utils/workspaceSurveyAnswers.js";

test("renders every retained milestone answer as a response-detail row", () => {
  const rows = buildAdditionalSurveyQuestionRows({
    "Qu’est-ce qui explique votre note ?": "La simplicité",
    "Les nouveautés vous ont-elles été utiles ?": 8,
    "Avez-vous recommandé Envola ?": "Oui",
  });

  assert.deepEqual(
    rows.map(({ question, score, comment }) => ({ question, score, comment })),
    [
      {
        question: "Qu’est-ce qui explique votre note ?",
        score: null,
        comment: "La simplicité",
      },
      {
        question: "Les nouveautés vous ont-elles été utiles ?",
        score: 8,
        comment: "",
      },
      {
        question: "Avez-vous recommandé Envola ?",
        score: null,
        comment: "Oui",
      },
    ]
  );
});

test("ignores empty or invalid additional-answer containers", () => {
  assert.deepEqual(buildAdditionalSurveyQuestionRows(null), []);
  assert.deepEqual(buildAdditionalSurveyQuestionRows([]), []);
  assert.deepEqual(buildAdditionalSurveyQuestionRows({ Empty: "" }), []);
});
