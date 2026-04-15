// closingTheLoopSchema.js
import {
  STATUS_TRANSITIONS,
  CASE_TIMELINE_FIELDS,
} from "./shared/closingTheLoopConfig.js";

function nowIso() {
  return new Date().toISOString();
}

function toIsoOrNull(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function uniqStrings(values) {
  return Array.from(
    new Set(
      asArray(values)
        .map((v) => (typeof v === "string" ? v.trim() : ""))
        .filter(Boolean)
    )
  );
}

function minutesBetween(start, end) {
  const s = Date.parse(start);
  const e = Date.parse(end);
  if (!Number.isFinite(s) || !Number.isFinite(e) || e < s) return null;
  return Math.round((e - s) / 60000);
}

function daysBetween(start, end) {
  const mins = minutesBetween(start, end);
  if (mins == null) return null;
  return +(mins / 1440).toFixed(2);
}

function makeId(prefix = "id") {
  const ts = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${ts}_${rand}`;
}

const CASE_STATUSES = Object.freeze([
  "new",
  "triaged",
  "customer_followup_planned",
  "customer_followup_completed",
  "owner_assigned",
  "improvement_planned",
  "improvement_scheduled",
  "improvement_in_progress",
  "improvement_completed",
  "customer_informed",
  "impact_check_pending",
  "impact_checked",
  "closed",
  "paused",
  "cancelled",
]);

const ACTION_STATUSES = Object.freeze([
  "proposed",
  "approved",
  "planned",
  "scheduled",
  "in_progress",
  "blocked",
  "completed",
  "cancelled",
]);

const PRIORITIES = Object.freeze(["low", "medium", "high", "critical"]);
const SEVERITIES = Object.freeze(["low", "medium", "high"]);

const CLOSURE_TYPES = Object.freeze([
  "fully_closed_with_customer_confirmation",
  "acknowledged_only",
  "resolved_internally",
  "merged_into_broader_initiative",
  "no_action_required",
  "duplicate_case",
  "customer_unreachable",
  "customer_declined_followup",
  "not_pursued",
]);

const PAUSE_CATEGORIES = Object.freeze(["external", "internal", "process"]);

const PAUSE_REASON_CODES = Object.freeze([
  "customer_unavailable",
  "customer_requested_delay",
  "awaiting_customer_confirmation",
  "awaiting_owner_assignment",
  "awaiting_prioritisation_decision",
  "awaiting_release_cycle",
  "technical_dependency",
  "resource_constraint",
  "duplicate_case",
  "merged_into_broader_initiative",
  "intentionally_parked",
  "awaiting_more_evidence",
]);

const CONTACT_TYPES = Object.freeze([
  "thank_you",
  "callback",
  "clarification",
  "resolution_update",
  "impact_check",
]);

const CONTACT_OUTCOMES = Object.freeze([
  "completed",
  "no_answer",
  "left_message",
  "email_sent",
  "responded",
  "declined",
  "unreachable",
]);

const IMPACT_CHECK_TYPES = Object.freeze([
  "followup_survey",
  "manual_confirmation",
  "support_feedback",
  "usage_signal",
  "mixed_evidence",
]);

const IMPACT_RESULTS = Object.freeze([
  "improved",
  "unchanged",
  "worsened",
  "inconclusive",
  "not_measurable_yet",
]);

const IMPACT_CONFIDENCE = Object.freeze(["low", "medium", "high"]);

const AUDIT_EVENT_TYPES = Object.freeze([
  "case_created",
  "status_changed",
  "owner_assigned",
  "action_created",
  "action_updated",
  "pause_started",
  "pause_ended",
  "customer_contact_logged",
  "impact_check_logged",
  "case_closed",
]);

const CASE_MILESTONE_FIELDS = Object.freeze([
  "survey_received_at",
  "customer_followup_attempted_at",
  ...Object.values(CASE_TIMELINE_FIELDS),
]);

function isValidEnum(value, validValues) {
  return validValues.includes(value);
}

function assertEnum(value, validValues, field) {
  if (value == null) return;
  if (!validValues.includes(value)) {
    throw new Error(`Invalid ${field}: ${value}`);
  }
}

function createEmptyCase(overrides = {}) {
  const timestamp = nowIso();
  return {
    case_id: makeId("ctl"),
    content_id: "",
    contact_id: "",
    response_id: null,
    account_id: null,
    customer_id: null,
    contact_name: null,
    contact_email: null,

    status: "new",
    status_before_pause: null,
    priority: "medium",
    severity: "medium",

    theme_primary: null,
    theme_secondary: [],
    journey_stage: null,

    owner_team: null,
    owner_user: null,

    current_pause_event_id: null,
    is_paused: false,
    pause_reason_current: null,
    pause_started_at_current: null,

    closure_type: null,
    closure_reason: null,

    requires_customer_followup: true,
    requires_internal_action: true,
    requires_customer_confirmation: true,
    requires_impact_check: true,

    latest_score_0_10: null,
    latest_bucket: null,
    risk_score: null,
    recommendation: null,
    comment_excerpt: null,

    source_system: "intercom",
    source_url: null,

    survey_received_at: null,
    customer_followup_attempted_at: null,
    customer_followup_completed_at: null,
    owner_assigned_at: null,
    improvement_planned_at: null,
    improvement_scheduled_at: null,
    improvement_started_at: null,
    improvement_completed_at: null,
    customer_informed_at: null,
    impact_checked_at: null,
    closed_at: null,

    notes_internal: "",

    created_at: timestamp,
    updated_at: timestamp,
    ...overrides,
    theme_secondary: uniqStrings(overrides.theme_secondary ?? []),
  };
}

function createCaseFromQueueItem({
  contentId,
  queueItem,
  accountId = null,
  customerId = null,
  journeyStage = null,
  createdBy = null,
}) {
  const latest = queueItem?.latest || {};
  const surveyReceivedAt = toIsoOrNull(latest.submitted_at) || nowIso();

  const status =
    latest.bucket === "promoter" ? "triaged" : "new";

  const priority =
    latest.bucket === "detractor"
      ? "high"
      : latest.bucket === "passive"
      ? "medium"
      : "low";

  const severity =
    latest.bucket === "detractor"
      ? "high"
      : latest.bucket === "passive"
      ? "medium"
      : "low";

  return createEmptyCase({
    content_id: String(contentId || ""),
    contact_id: String(queueItem?.contact_id || ""),
    response_id: queueItem?.response_id || null,
    account_id: accountId,
    customer_id: customerId,
    status,
    priority,
    severity,
    theme_primary: queueItem?.themes?.[0] || null,
    theme_secondary: queueItem?.themes?.slice(1) || [],
    journey_stage: journeyStage,
    latest_score_0_10: latest.score_0_10 ?? null,
    latest_bucket: latest.bucket ?? null,
    risk_score: queueItem?.risk_score ?? null,
    recommendation: queueItem?.recommendation ?? null,
    comment_excerpt: latest.comment_excerpt ?? null,
    source_system: "intercom",
    source_url: queueItem?.intercom_contact_url || null,
    survey_received_at: surveyReceivedAt,
    notes_internal: createdBy ? `Case created by ${createdBy}` : "",
  });
}

function validateCase(record) {
  if (!record || typeof record !== "object") {
    throw new Error("Case must be an object");
  }
  if (!record.case_id) throw new Error("case_id is required");
  if (!record.content_id) throw new Error("content_id is required");
  if (!record.contact_id) throw new Error("contact_id is required");

  assertEnum(record.status, CASE_STATUSES, "case status");
  assertEnum(record.priority, PRIORITIES, "priority");
  assertEnum(record.severity, SEVERITIES, "severity");

  if (record.closure_type) {
    assertEnum(record.closure_type, CLOSURE_TYPES, "closure_type");
  }
  if (record.is_paused && !record.current_pause_event_id) {
    throw new Error("current_pause_event_id is required when case is paused");
  }

  return true;
}

function canTransitionStatus(fromStatus, toStatus) {
  if (fromStatus === toStatus) return true;
  if (toStatus === "paused" || toStatus === "cancelled") return true;
  const allowed = STATUS_TRANSITIONS[fromStatus] || [];
  return allowed.includes(toStatus);
}

function transitionCaseStatus(caseRecord, toStatus, opts = {}) {
  validateCase(caseRecord);
  assertEnum(toStatus, CASE_STATUSES, "case status");

  const fromStatus = caseRecord.status;
  if (!canTransitionStatus(fromStatus, toStatus)) {
    throw new Error(`Invalid status transition: ${fromStatus} -> ${toStatus}`);
  }

  const updated = {
    ...caseRecord,
    status: toStatus,
    updated_at: nowIso(),
  };

  const at = toIsoOrNull(opts.at) || nowIso();

  if (toStatus === "customer_followup_completed" && !updated.customer_followup_completed_at) {
    updated.customer_followup_completed_at = at;
  }
  if (toStatus === "owner_assigned" && !updated.owner_assigned_at) {
    updated.owner_assigned_at = at;
  }
  if (toStatus === "improvement_planned" && !updated.improvement_planned_at) {
    updated.improvement_planned_at = at;
  }
  if (toStatus === "improvement_scheduled" && !updated.improvement_scheduled_at) {
    updated.improvement_scheduled_at = at;
  }
  if (toStatus === "improvement_in_progress" && !updated.improvement_started_at) {
    updated.improvement_started_at = at;
  }
  if (toStatus === "improvement_completed" && !updated.improvement_completed_at) {
    updated.improvement_completed_at = at;
  }
  if (toStatus === "customer_informed" && !updated.customer_informed_at) {
    updated.customer_informed_at = at;
  }
  if (toStatus === "impact_checked" && !updated.impact_checked_at) {
    updated.impact_checked_at = at;
  }
  if (toStatus === "closed" && !updated.closed_at) {
    updated.closed_at = at;
  }

  return updated;
}

function pauseCase(caseRecord, {
  reasonCode,
  reasonLabel = null,
  category,
  countsAgainstSla = false,
  notes = "",
  createdBy = null,
  startedAt = null,
} = {}) {
  validateCase(caseRecord);
  assertEnum(reasonCode, PAUSE_REASON_CODES, "pause reason_code");
  assertEnum(category, PAUSE_CATEGORIES, "pause category");

  if (caseRecord.is_paused) {
    throw new Error("Case is already paused");
  }

  const started = toIsoOrNull(startedAt) || nowIso();
  const pauseId = makeId("pause");

  const pauseEvent = {
    pause_id: pauseId,
    case_id: caseRecord.case_id,
    content_id: caseRecord.content_id,
    started_at: started,
    ended_at: null,
    reason_code: reasonCode,
    reason_label: reasonLabel || reasonCode,
    category,
    counts_against_sla: !!countsAgainstSla,
    notes,
    created_by: createdBy,
    created_at: nowIso(),
  };

  const updatedCase = {
    ...caseRecord,
    status_before_pause: caseRecord.status,
    status: "paused",
    is_paused: true,
    current_pause_event_id: pauseId,
    pause_reason_current: reasonCode,
    pause_started_at_current: started,
    updated_at: nowIso(),
  };

  return { updatedCase, pauseEvent };
}

function resumeCase(caseRecord, pauseEvent, resumedAt = null) {
  validateCase(caseRecord);
  if (!caseRecord.is_paused) {
    throw new Error("Case is not paused");
  }
  if (!pauseEvent || pauseEvent.pause_id !== caseRecord.current_pause_event_id) {
    throw new Error("Pause event does not match current paused case");
  }

  const resumeStatus = caseRecord.status_before_pause || "triaged";
  const endedAt = toIsoOrNull(resumedAt) || nowIso();

  const endedPauseEvent = {
    ...pauseEvent,
    ended_at: endedAt,
  };

  const updatedCase = {
    ...caseRecord,
    status: resumeStatus,
    status_before_pause: null,
    is_paused: false,
    current_pause_event_id: null,
    pause_reason_current: null,
    pause_started_at_current: null,
    updated_at: nowIso(),
  };

  return { updatedCase, pauseEvent: endedPauseEvent };
}

function createAction({
  caseId,
  contentId,
  title,
  description = "",
  ownerTeam = null,
  ownerUser = null,
  status = "proposed",
  priority = "medium",
  plannedAt = null,
  scheduledAt = null,
  startedAt = null,
  completedAt = null,
  cancelledAt = null,
  dueDate = null,
  blockedReason = null,
  blockedSince = null,
  resolutionNotes = "",
  customerVisibleSummary = "",
} = {}) {
  if (!caseId) throw new Error("caseId is required");
  if (!contentId) throw new Error("contentId is required");
  if (!title) throw new Error("title is required");
  assertEnum(status, ACTION_STATUSES, "action status");
  assertEnum(priority, PRIORITIES, "action priority");

  return {
    action_id: makeId("act"),
    case_id: caseId,
    content_id: contentId,
    title,
    description,
    owner_team: ownerTeam,
    owner_user: ownerUser,
    status,
    priority,
    planned_at: toIsoOrNull(plannedAt),
    scheduled_at: toIsoOrNull(scheduledAt),
    started_at: toIsoOrNull(startedAt),
    completed_at: toIsoOrNull(completedAt),
    cancelled_at: toIsoOrNull(cancelledAt),
    due_date: dueDate || null,
    blocked_reason: blockedReason,
    blocked_since: toIsoOrNull(blockedSince),
    resolution_notes: resolutionNotes,
    customer_visible_summary: customerVisibleSummary,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
}

function createContactEvent({
  caseId,
  contentId,
  contactType,
  contactDirection = "outbound",
  channel = "phone",
  attemptedAt = null,
  completedAt = null,
  contactOutcome,
  summary = "",
  requestedMoreDetail = false,
  moreDetailReceived = false,
  customerSentimentAfterContact = null,
  createdBy = null,
} = {}) {
  if (!caseId) throw new Error("caseId is required");
  if (!contentId) throw new Error("contentId is required");
  assertEnum(contactType, CONTACT_TYPES, "contact_type");
  assertEnum(contactOutcome, CONTACT_OUTCOMES, "contact_outcome");

  return {
    contact_event_id: makeId("contact"),
    case_id: caseId,
    content_id: contentId,
    contact_type: contactType,
    contact_direction: contactDirection,
    channel,
    attempted_at: toIsoOrNull(attemptedAt),
    completed_at: toIsoOrNull(completedAt),
    contact_outcome: contactOutcome,
    summary,
    requested_more_detail: !!requestedMoreDetail,
    more_detail_received: !!moreDetailReceived,
    customer_sentiment_after_contact: customerSentimentAfterContact,
    created_by: createdBy,
    created_at: nowIso(),
  };
}

function createImpactCheck({
  caseId,
  actionId = null,
  contentId,
  checkedAt = null,
  checkType,
  baselineScore = null,
  followupScore = null,
  baselineCommentSummary = "",
  followupCommentSummary = "",
  impactConfidence,
  impactResult,
  notes = "",
  linkedFollowupResponseId = null,
} = {}) {
  if (!caseId) throw new Error("caseId is required");
  if (!contentId) throw new Error("contentId is required");
  assertEnum(checkType, IMPACT_CHECK_TYPES, "impact check_type");
  assertEnum(impactConfidence, IMPACT_CONFIDENCE, "impact confidence");
  assertEnum(impactResult, IMPACT_RESULTS, "impact result");

  const scoreDelta =
    typeof baselineScore === "number" && typeof followupScore === "number"
      ? followupScore - baselineScore
      : null;

  return {
    impact_check_id: makeId("impact"),
    case_id: caseId,
    action_id: actionId,
    content_id: contentId,
    checked_at: toIsoOrNull(checkedAt) || nowIso(),
    check_type: checkType,
    baseline_score: baselineScore,
    followup_score: followupScore,
    score_delta: scoreDelta,
    baseline_comment_summary: baselineCommentSummary,
    followup_comment_summary: followupCommentSummary,
    impact_confidence: impactConfidence,
    impact_result: impactResult,
    notes,
    linked_followup_response_id: linkedFollowupResponseId,
  };
}

function createAuditEvent({
  caseId,
  contentId,
  eventType,
  fromValue = null,
  toValue = null,
  changedBy = null,
  notes = "",
} = {}) {
  if (!caseId) throw new Error("caseId is required");
  if (!contentId) throw new Error("contentId is required");
  assertEnum(eventType, AUDIT_EVENT_TYPES, "audit event_type");

  return {
    audit_id: makeId("audit"),
    case_id: caseId,
    content_id: contentId,
    event_type: eventType,
    from_value: fromValue,
    to_value: toValue,
    changed_by: changedBy,
    changed_at: nowIso(),
    notes,
  };
}

function calculatePauseSummary(pauseEvents = []) {
  let totalMinutes = 0;
  let excludedMinutes = 0;

  for (const evt of pauseEvents) {
    const mins = minutesBetween(evt.started_at, evt.ended_at);
    if (mins == null) continue;
    totalMinutes += mins;
    if (!evt.counts_against_sla) excludedMinutes += mins;
  }

  return {
    paused_minutes_total: totalMinutes,
    paused_days_total: +(totalMinutes / 1440).toFixed(2),
    paused_minutes_excluded: excludedMinutes,
    paused_days_excluded: +(excludedMinutes / 1440).toFixed(2),
  };
}

function calculateCaseDurations(caseRecord, pauseEvents = []) {
  const calendarCloseDays = daysBetween(
    caseRecord.survey_received_at,
    caseRecord.closed_at || nowIso()
  );

  const pauseSummary = calculatePauseSummary(pauseEvents);
  const activeCloseDays =
    calendarCloseDays == null
      ? null
      : +(calendarCloseDays - pauseSummary.paused_days_excluded).toFixed(2);

  return {
    calendar_close_days: calendarCloseDays,
    active_close_days: activeCloseDays,
    time_to_first_followup_days: daysBetween(
      caseRecord.survey_received_at,
      caseRecord.customer_followup_completed_at
    ),
    time_to_owner_assignment_days: daysBetween(
      caseRecord.survey_received_at,
      caseRecord.owner_assigned_at
    ),
    time_to_implementation_days: daysBetween(
      caseRecord.owner_assigned_at,
      caseRecord.improvement_completed_at
    ),
    time_to_customer_informed_days: daysBetween(
      caseRecord.improvement_completed_at,
      caseRecord.customer_informed_at
    ),
    time_to_impact_check_days: daysBetween(
      caseRecord.survey_received_at,
      caseRecord.impact_checked_at
    ),
    ...pauseSummary,
  };
}

function buildLatestMapFromJsonlRows(rows, idField) {
  const map = new Map();
  for (const row of asArray(rows)) {
    if (!row || !row[idField]) continue;
    map.set(row[idField], row);
  }
  return map;
}

export {
  CASE_STATUSES,
  ACTION_STATUSES,
  PRIORITIES,
  SEVERITIES,
  CLOSURE_TYPES,
  PAUSE_CATEGORIES,
  PAUSE_REASON_CODES,
  CONTACT_TYPES,
  CONTACT_OUTCOMES,
  IMPACT_CHECK_TYPES,
  IMPACT_RESULTS,
  IMPACT_CONFIDENCE,
  AUDIT_EVENT_TYPES,
  CASE_MILESTONE_FIELDS,
  STATUS_TRANSITIONS,

  createEmptyCase,
  createCaseFromQueueItem,
  validateCase,
  canTransitionStatus,
  transitionCaseStatus,
  pauseCase,
  resumeCase,
  createAction,
  createContactEvent,
  createImpactCheck,
  createAuditEvent,

  calculatePauseSummary,
  calculateCaseDurations,
  buildLatestMapFromJsonlRows,

  nowIso,
  toIsoOrNull,
  makeId,
  daysBetween,
  minutesBetween,
};
