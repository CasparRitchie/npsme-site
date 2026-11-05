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
