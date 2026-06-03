// utils/workspaceAuth.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabaseAdmin } from "../supabaseClient.js";

import { logWorkspaceEvent } from "./workspaceEvents.js";

const DEFAULT_COOKIE_NAME = "npsme_workspace_access";
const JWT_EXPIRES_IN = "7d";

export const WORKSPACE_AUTH_COOKIE_NAME =
  process.env.NPSME_ACCESS_COOKIE_NAME || DEFAULT_COOKIE_NAME;

function getJwtSecret() {
  const secret = process.env.NPSME_JWT_SECRET;

  if (!secret) {
    throw new Error("NPSME_JWT_SECRET is not configured");
  }

  return secret;
}

function getCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
    ...(isProd ? { domain: ".npsme.com" } : {}),
  };
}

export function clearWorkspaceAuthCookie(res) {
  const isProd = process.env.NODE_ENV === "production";

  res.clearCookie(WORKSPACE_AUTH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    ...(isProd ? { domain: ".npsme.com" } : {}),
  });
}

export function setWorkspaceAuthCookie(res, payload) {
  const token = jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  });

  res.cookie(WORKSPACE_AUTH_COOKIE_NAME, token, getCookieOptions());

  return token;
}

export function verifyWorkspaceToken(token) {
  if (!token) return null;

  try {
    return jwt.verify(token, getJwtSecret());
  } catch (_err) {
    return null;
  }
}

export function getWorkspaceTokenFromRequest(req) {
  return (
    req.cookies?.[WORKSPACE_AUTH_COOKIE_NAME] ||
    req.signedCookies?.[WORKSPACE_AUTH_COOKIE_NAME] ||
    null
  );
}

export function getWorkspaceAuth(req) {
  const token = getWorkspaceTokenFromRequest(req);
  const decoded = verifyWorkspaceToken(token);

  if (!decoded?.sub || !decoded?.workspaceId) {
    return null;
  }

  return {
    userId: decoded.sub,
    email: decoded.email,
    fullName: decoded.fullName || "",
    workspaceId: decoded.workspaceId,
    role: decoded.role || "member",
  };
}

export function requireWorkspaceAuth(req, res, next) {
  const auth = getWorkspaceAuth(req);

  if (!auth) {
    return res.status(401).json({
      ok: false,
      error: "Workspace authentication required",
    });
  }

  req.auth = auth;
  return next();
}

export async function loginWorkspaceUser({ email, password, req, res }) {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client is not configured");
  }

  const normalisedEmail = String(email || "").trim().toLowerCase();
  const rawPassword = String(password || "");

  if (!normalisedEmail || !rawPassword) {
    return {
      ok: false,
      status: 400,
      error: "Email and password are required",
    };
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from("app_users")
    .select("id,email,password_hash,full_name,is_active")
    .eq("email", normalisedEmail)
    .maybeSingle();

  if (userError) {
    console.error("[workspace-auth] Failed to load user", userError);
    return {
      ok: false,
      status: 500,
      error: "Login failed",
    };
  }

  if (!user || !user.is_active) {
    await logAuthEvent({
      eventType: "login_failed_user_not_found_or_inactive",
      req,
    });

    return {
      ok: false,
      status: 401,
      error: "Invalid email or password",
    };
  }

  const passwordOk = await bcrypt.compare(rawPassword, user.password_hash);

  if (!passwordOk) {
    await logAuthEvent({
      userId: user.id,
      eventType: "login_failed_invalid_password",
      req,
    });

    return {
      ok: false,
      status: 401,
      error: "Invalid email or password",
    };
  }

  const { data: memberships, error: membershipError } = await supabaseAdmin
    .from("workspace_members")
    .select(
      `
      id,
      workspace_id,
      role,
      workspaces (
        id,
        workspace_name,
        slug
      )
    `
    )
    .eq("user_id", user.id);

  if (membershipError) {
    console.error("[workspace-auth] Failed to load memberships", membershipError);
    return {
      ok: false,
      status: 500,
      error: "Login failed",
    };
  }

  const membership = memberships?.[0];

  if (!membership?.workspace_id) {
    await logAuthEvent({
      userId: user.id,
      eventType: "login_failed_no_workspace",
      req,
    });

    return {
      ok: false,
      status: 403,
      error: "No workspace access configured for this account",
    };
  }

  const authPayload = {
    sub: user.id,
    email: user.email,
    fullName: user.full_name || "",
    workspaceId: membership.workspace_id,
    role: membership.role || "member",
  };

  setWorkspaceAuthCookie(res, authPayload);

  await Promise.allSettled([
    supabaseAdmin
      .from("app_users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", user.id),

    logAuthEvent({
      userId: user.id,
      workspaceId: membership.workspace_id,
      eventType: "login_success",
      req,
    }),

    logWorkspaceEvent(req, {
      workspaceId: membership.workspace_id,
      userId: user.id,
      eventType: "workspace_login_success",
      entityType: "user",
      entityId: user.id,
      metadata: {
        email: user.email,
        role: membership.role || "member",
      },
    }),
  ]);

  return {
    ok: true,
    status: 200,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name || "",
    },
    workspace: {
      id: membership.workspace_id,
      name: membership.workspaces?.workspace_name || "",
      slug: membership.workspaces?.slug || "",
      role: membership.role || "member",
    },
  };
}

export async function changeWorkspacePassword({
  userId,
  currentPassword,
  newPassword,
  req,
}) {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client is not configured");
  }

  const rawCurrentPassword = String(currentPassword || "");
  const rawNewPassword = String(newPassword || "");

  if (!userId) {
    return {
      ok: false,
      status: 401,
      error: "Workspace authentication required",
    };
  }

  if (!rawCurrentPassword || !rawNewPassword) {
    return {
      ok: false,
      status: 400,
      error: "Current password and new password are required",
    };
  }

  if (rawNewPassword.length < 12) {
    return {
      ok: false,
      status: 400,
      error: "New password must be at least 12 characters",
    };
  }

  if (rawCurrentPassword === rawNewPassword) {
    return {
      ok: false,
      status: 400,
      error: "New password must be different from the current password",
    };
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from("app_users")
    .select("id,email,password_hash,is_active")
    .eq("id", userId)
    .maybeSingle();

  if (userError) {
    console.error("[workspace-auth] Failed to load user for password change", userError);

    return {
      ok: false,
      status: 500,
      error: "Failed to change password",
    };
  }

  if (!user || !user.is_active) {
    await Promise.allSettled([
      logAuthEvent({
        userId: user?.id || userId || null,
        workspaceId: req?.auth?.workspaceId || null,
        eventType: "password_change_failed_user_not_found_or_inactive",
        req,
      }),

      logWorkspaceEvent(req, {
        workspaceId: req?.auth?.workspaceId || null,
        userId: user?.id || userId || null,
        eventType: "password_change_failed_user_not_found_or_inactive",
        entityType: "user",
        entityId: user?.id || userId || null,
        metadata: {
          source: "workspace_account",
        },
      }),
    ]);

    return {
      ok: false,
      status: 401,
      error: "Workspace authentication required",
    };
  }

  const currentPasswordOk = await bcrypt.compare(
    rawCurrentPassword,
    user.password_hash
  );

  if (!currentPasswordOk) {
    await logAuthEvent({
      userId,
      eventType: "password_change_failed_invalid_current_password",
      req,
    });

    return {
      ok: false,
      status: 401,
      error: "Current password is incorrect",
    };
  }

  const newPasswordHash = await bcrypt.hash(rawNewPassword, 12);

  const { error: updateError } = await supabaseAdmin
    .from("app_users")
    .update({
      password_hash: newPasswordHash,
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("[workspace-auth] Failed to update password", updateError);

    return {
      ok: false,
      status: 500,
      error: "Failed to change password",
    };
  }

  await logAuthEvent({
    userId: user.id,
    eventType: "password_changed",
    req,
  });

  return {
    ok: true,
    status: 200,
  };
}

export async function logoutWorkspaceUser({ req, res }) {
  const auth = getWorkspaceAuth(req);

  if (auth) {
    await Promise.allSettled([
      logAuthEvent({
        userId: auth.userId,
        workspaceId: auth.workspaceId,
        eventType: "workspace_logout",
        req,
      }),

      logWorkspaceEvent(req, {
        workspaceId: auth.workspaceId,
        userId: auth.userId,
        eventType: "workspace_logout",
        entityType: "user",
        entityId: auth.userId,
        metadata: {
          role: auth.role || "member",
        },
      }),
    ]);
  }

  clearWorkspaceAuthCookie(res);

  return {
    ok: true,
    status: 200,
  };
}

export async function logAuthEvent({
  userId = null,
  workspaceId = null,
  eventType,
  req,
}) {
  if (!supabaseAdmin || !eventType) return;

  try {
    await supabaseAdmin.from("auth_audit_events").insert({
      user_id: userId,
      workspace_id: workspaceId,
      event_type: eventType,
      ip_address:
        req?.headers?.["x-forwarded-for"]?.split(",")?.[0]?.trim() ||
        req?.ip ||
        null,
      user_agent: req?.headers?.["user-agent"] || null,
    });
  } catch (err) {
    console.error("[workspace-auth] Failed to log auth event", err);
  }
}
