// src/scripts/create-workspace-user.mjs
import "dotenv/config";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "../../supabaseClient.js";

/**
 * Create/find a workspace, create/update a user, and link that user
 * to the workspace.
 *
 * Usage:
 * node src/scripts/create-workspace-user.mjs \
 *   --workspace-name "Test Customer Ltd" \
 *   --workspace-slug "test-customer" \
 *   --email "customer@example.com" \
 *   --full-name "Customer User" \
 *   --role "owner"
 *
 * Optional:
 *   --password "manually-chosen-password"
 *
 * If --password is omitted, a secure temporary password is generated
 * and printed once.
 */

const args = parseArgs(process.argv.slice(2));

const workspaceName = String(args["workspace-name"] || "").trim();
const workspaceSlug = slugify(args["workspace-slug"] || workspaceName);
const email = String(args.email || "").trim().toLowerCase();
const fullName = String(args["full-name"] || "").trim();
const role = normaliseRole(args.role || "owner");
const suppliedPassword = args.password ? String(args.password) : "";
const password =
  suppliedPassword || crypto.randomBytes(18).toString("base64url");

if (!supabaseAdmin) {
  console.error("Supabase admin client is not configured.");
  process.exit(1);
}

if (!workspaceName) {
  console.error("Missing required argument: --workspace-name");
  process.exit(1);
}

if (!workspaceSlug) {
  console.error("Missing required argument: --workspace-slug");
  process.exit(1);
}

if (!email || !email.includes("@")) {
  console.error("Missing or invalid required argument: --email");
  process.exit(1);
}

if (password.length < 10) {
  console.error("Password must be at least 10 characters.");
  process.exit(1);
}

async function main() {
  console.log("Creating/finding workspace user...");
  console.log({
    workspaceName,
    workspaceSlug,
    email,
    fullName: fullName || null,
    role,
    passwordMode: suppliedPassword ? "supplied" : "generated",
  });

  const workspace = await findOrCreateWorkspace({
    workspaceName,
    workspaceSlug,
  });

  const user = await findOrCreateUser({
    email,
    fullName,
    password,
  });

  const membership = await findOrCreateMembership({
    workspaceId: workspace.id,
    userId: user.id,
    email,
    role,
  });

  console.log("");
  console.log("Done.");
  console.log({
    workspaceId: workspace.id,
    workspaceName: workspace.workspace_name,
    workspaceSlug: workspace.slug,
    userId: user.id,
    email: user.email,
    membershipId: membership.id,
    role: membership.role,
    loginUrl: "https://www.npsme.com/workspace/login",
  });

  console.log("");
  console.log("Temporary password:");
  console.log(password);
  console.log("");
  console.log(
    "Save this password securely. It is only shown here because password reset/change-password is not built yet."
  );
}

async function findOrCreateWorkspace({ workspaceName, workspaceSlug }) {
  const { data: existing, error: findError } = await supabaseAdmin
    .from("workspaces")
    .select("*")
    .eq("slug", workspaceSlug)
    .maybeSingle();

  if (findError) {
    throw findError;
  }

  if (existing) {
    console.log("Found existing workspace:", existing.id);

    const needsNameUpdate = existing.workspace_name !== workspaceName;

    if (!needsNameUpdate) {
      return existing;
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("workspaces")
      .update({
        workspace_name: workspaceName,
      })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (updateError) throw updateError;

    console.log("Updated workspace name:", updated.id);
    return updated;
  }

  const { data: created, error: createError } = await supabaseAdmin
    .from("workspaces")
    .insert({
      workspace_name: workspaceName,
      slug: workspaceSlug,
    })
    .select("*")
    .single();

  if (createError) {
    throw createError;
  }

  console.log("Created workspace:", created.id);
  return created;
}

async function findOrCreateUser({ email, fullName, password }) {
  const passwordHash = await bcrypt.hash(password, 12);

  const { data: existing, error: findError } = await supabaseAdmin
    .from("app_users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (findError) {
    throw findError;
  }

  if (existing) {
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("app_users")
      .update({
        password_hash: passwordHash,
        full_name: fullName || existing.full_name || null,
        is_active: true,
      })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (updateError) throw updateError;

    console.log("Updated existing user password/details:", updated.id);
    return updated;
  }

  const { data: created, error: createError } = await supabaseAdmin
    .from("app_users")
    .insert({
      email,
      password_hash: passwordHash,
      full_name: fullName || null,
      is_active: true,
    })
    .select("*")
    .single();

  if (createError) {
    throw createError;
  }

  console.log("Created app user:", created.id);
  return created;
}

async function findOrCreateMembership({ workspaceId, userId, email, role }) {
  const { data: existing, error: findError } = await supabaseAdmin
    .from("workspace_members")
    .select("*")
    .eq("workspace_id", workspaceId)
    .ilike("email", email)
    .maybeSingle();

  if (findError) {
    throw findError;
  }

  if (existing) {
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("workspace_members")
      .update({
        user_id: userId,
        email,
        role,
      })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (updateError) throw updateError;

    console.log("Updated existing workspace membership:", updated.id);
    return updated;
  }

  const { data: created, error: createError } = await supabaseAdmin
    .from("workspace_members")
    .insert({
      workspace_id: workspaceId,
      user_id: userId,
      email,
      role,
    })
    .select("*")
    .single();

  if (createError) {
    throw createError;
  }

  console.log("Created workspace membership:", created.id);
  return created;
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    if (!current.startsWith("--")) {
      continue;
    }

    const key = current.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith("--")) {
      parsed[key] = true;
      continue;
    }

    parsed[key] = next;
    index += 1;
  }

  return parsed;
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normaliseRole(value) {
  const role = String(value || "owner").trim().toLowerCase();

  if (role === "owner") return "owner";
  if (role === "admin") return "admin";
  if (role === "member") return "member";

  return "owner";
}

main().catch((err) => {
  console.error("Failed to create workspace user:", err);
  process.exit(1);
});
