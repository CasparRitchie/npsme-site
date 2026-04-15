// src/shared/closingTheLoopConfig.js

export const CASE_STAGE_ORDER = Object.freeze([
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
]);

export const STATUS_TRANSITIONS = Object.freeze({
  new: ["triaged", "paused", "cancelled"],
  triaged: ["customer_followup_planned", "owner_assigned", "paused", "cancelled"],
  customer_followup_planned: ["customer_followup_completed", "paused", "cancelled"],
  customer_followup_completed: ["owner_assigned", "paused", "cancelled"],
  owner_assigned: ["improvement_planned", "paused", "cancelled"],
  improvement_planned: ["improvement_scheduled", "improvement_in_progress", "paused", "cancelled"],
  improvement_scheduled: ["improvement_in_progress", "paused", "cancelled"],
  improvement_in_progress: ["improvement_completed", "paused", "cancelled"],
  improvement_completed: ["customer_informed", "impact_check_pending", "paused", "cancelled"],
  customer_informed: ["impact_check_pending", "impact_checked", "closed", "paused", "cancelled"],
  impact_check_pending: ["impact_checked", "closed", "paused", "cancelled"],
  impact_checked: ["closed", "paused", "cancelled"],
  closed: [],
  paused: [],
  cancelled: [],
});

export const CASE_TIMELINE_FIELDS = Object.freeze({
  customer_followup_completed: "customer_followup_completed_at",
  owner_assigned: "owner_assigned_at",
  improvement_planned: "improvement_planned_at",
  improvement_scheduled: "improvement_scheduled_at",
  improvement_in_progress: "improvement_started_at",
  improvement_completed: "improvement_completed_at",
  customer_informed: "customer_informed_at",
  impact_checked: "impact_checked_at",
  closed: "closed_at",
});
