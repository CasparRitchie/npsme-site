// utils/workspaceEvents.js
import { supabaseAdmin } from "../supabaseClient.js";

export async function logWorkspaceEvent(req, event) {
  try {
    if (!supabaseAdmin) return;

    const workspaceId = req.auth?.workspaceId || event.workspaceId || null;
    const userId = req.auth?.userId || event.userId || null;

    if (!workspaceId || !event.eventType) return;

    const forwardedFor = req.headers["x-forwarded-for"];
    const ipAddress = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : String(forwardedFor || req.ip || "")
          .split(",")[0]
          .trim();

    const userAgent = String(req.headers["user-agent"] || "").slice(0, 500);

    const { error } = await supabaseAdmin.from("workspace_events").insert({
      workspace_id: workspaceId,
      user_id: userId,
      event_type: event.eventType,
      entity_type: event.entityType || null,
      entity_id: event.entityId || null,
      metadata_json: event.metadata || {},
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    });

    if (error) {
      console.error("[workspace-events] Failed to log event", {
        eventType: event.eventType,
        workspaceId,
        error,
      });
    }
  } catch (err) {
    console.error("[workspace-events] Unexpected logging error", err);
  }
}
