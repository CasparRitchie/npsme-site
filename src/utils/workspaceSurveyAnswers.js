export function buildAdditionalSurveyQuestionRows(extraAnswers) {
  if (!extraAnswers || typeof extraAnswers !== "object" || Array.isArray(extraAnswers)) {
    return [];
  }

  return Object.entries(extraAnswers)
    .map(([question, answer], index) => {
      const numericAnswer =
        typeof answer === "number" && Number.isFinite(answer) ? answer : null;
      const textAnswer =
        numericAnswer === null
          ? Array.isArray(answer)
            ? answer.filter(Boolean).join(", ")
            : String(answer ?? "").trim()
          : "";

      return {
        key: `additional-${index}-${question}`,
        question,
        score: numericAnswer,
        comment: textAnswer,
      };
    })
    .filter(
      (item) =>
        item.score !== null || String(item.comment || "").trim().length > 0
    );
}

export function collectAdditionalSurveyQuestions(rows) {
  const questions = new Set();

  for (const row of Array.isArray(rows) ? rows : []) {
    const extraAnswers = row?.extra_scores;
    if (!extraAnswers || typeof extraAnswers !== "object" || Array.isArray(extraAnswers)) {
      continue;
    }

    for (const question of Object.keys(extraAnswers)) {
      if (String(question || "").trim()) questions.add(question);
    }
  }

  return Array.from(questions);
}
