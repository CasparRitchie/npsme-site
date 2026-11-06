import test from "node:test";
import assert from "node:assert/strict";
import { buildWorkspaceJourneyPayload } from "../workspaceIntercom.routes.js";

const sources = [
  {
    id: "source-global",
    workspace_id: "workspace-a",
    source_name: "Global NPS",
    survey_content_id: "global",
    intercom_app_id: "app-a",
  },
  {
    id: "source-j40",
    workspace_id: "workspace-a",
    source_name: "NPS J+40",
    survey_content_id: "j40",
    intercom_app_id: "app-a",
  },
];

test("journey payload joins repeated contacts without returning their raw identifier", () => {
  const payload = buildWorkspaceJourneyPayload({
    workspaceId: "workspace-a",
    sources,
    rows: [
      {
        response_id: "global:first",
        content_id: "global",
        contact_id: "private-contact-123456",
        submitted_at: "2026-01-10T12:00:00.000Z",
        score_0_10: 6,
        comment: "Connexion difficile, email me@example.com",
        answers: [{ question_text: "Recommendation", response: 6 }],
      },
      {
        response_id: "j40:second",
        content_id: "j40",
        contact_id: "private-contact-123456",
        submitted_at: "2026-03-10T12:00:00.000Z",
        score_0_10: 9,
        comment: "Support très réactif",
        answers: [{ question_text: "Recommendation", response: 9 }],
      },
      {
        response_id: "global:single",
        content_id: "global",
        contact_id: "single-contact",
        submitted_at: "2026-01-11T12:00:00.000Z",
        score_0_10: 8,
        answers: [],
      },
      {
        response_id: "foreign:row",
        content_id: "foreign-source",
        contact_id: "private-contact-123456",
        submitted_at: "2026-04-10T12:00:00.000Z",
        score_0_10: 1,
        answers: [],
      },
    ],
  });

  assert.equal(payload.summary.repeat_contacts, 1);
  assert.equal(payload.summary.improving, 1);
  assert.equal(payload.summary.ambassadors, 1);
  assert.equal(payload.contacts[0].delta, 3);
  assert.equal(payload.contacts[0].contact_ref.startsWith("Contact #"), true);
  assert.equal(payload.contacts[0].responses.length, 2);
  assert.equal(payload.themes.improving.some((theme) => theme.key === "wifi"), true);

  const serialised = JSON.stringify(payload);
  assert.equal(serialised.includes("private-contact-123456"), false);
  assert.equal(serialised.includes("single-contact"), false);
  assert.equal(serialised.includes("me@example.com"), false);
  assert.equal(serialised.includes("foreign-source"), false);
});

test("journey payload keeps falling scores separate from milestone NPS", () => {
  const payload = buildWorkspaceJourneyPayload({
    workspaceId: "workspace-a",
    sources,
    rows: [
      {
        response_id: "global:first",
        content_id: "global",
        contact_id: "contact-a",
        submitted_at: "2026-01-10T12:00:00.000Z",
        score_0_10: 10,
        answers: [],
      },
      {
        response_id: "j40:second",
        content_id: "j40",
        contact_id: "contact-a",
        submitted_at: "2026-03-10T12:00:00.000Z",
        score_0_10: 7,
        answers: [],
      },
    ],
  });

  assert.equal(payload.summary.declining, 1);
  assert.equal(payload.summary.churn_risks, 1);
  assert.equal(payload.milestones.find((item) => item.kind === "global").repeat_cohort.nps, 100);
  assert.equal(payload.milestones.find((item) => item.kind === "j40").repeat_cohort.nps, 0);
});

test("journey themes appear only in the cohort where they are more prevalent", () => {
  const rows = [];
  const addJourney = (contactId, firstScore, latestScore, comment) => {
    rows.push(
      {
        response_id: `global:${contactId}`,
        content_id: "global",
        contact_id: contactId,
        submitted_at: "2026-01-10T12:00:00.000Z",
        score_0_10: firstScore,
        answers: [],
      },
      {
        response_id: `j40:${contactId}`,
        content_id: "j40",
        contact_id: contactId,
        submitted_at: "2026-03-10T12:00:00.000Z",
        score_0_10: latestScore,
        comment,
        answers: [],
      }
    );
  };

  addJourney("declining-a", 10, 7, "Le suivi des heures est difficile");
  addJourney("declining-b", 9, 6, "Problème avec les horaires");
  addJourney("improving-a", 6, 9, "Les horaires sont maintenant simples");
  addJourney("improving-b", 7, 10, "Support très réactif");

  const payload = buildWorkspaceJourneyPayload({
    workspaceId: "workspace-a",
    sources,
    rows,
  });

  const decliningKeys = payload.themes.declining.map((theme) => theme.key);
  const improvingKeys = payload.themes.improving.map((theme) => theme.key);
  assert.equal(decliningKeys.includes("time_tracking"), true);
  assert.equal(improvingKeys.includes("time_tracking"), false);
  assert.equal(improvingKeys.includes("support_speed"), true);
  assert.deepEqual(
    decliningKeys.filter((key) => improvingKeys.includes(key)),
    []
  );

  const timeTracking = payload.themes.declining.find(
    (theme) => theme.key === "time_tracking"
  );
  assert.equal(timeTracking.prevalence_percent, 100);
  assert.equal(timeTracking.difference_pp, 50);
  assert.equal(timeTracking.examples[0], "Le suivi des heures est difficile");
});
