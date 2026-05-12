// scripts/create-auth-user.mjs
import "dotenv/config";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "../../supabaseClient.js";

const EMAIL = process.argv[2];
const PASSWORD = process.argv[3];
const FULL_NAME = process.argv[4] || "";
const WORKSPACE_ID = process.env.DEFAULT_WORKSPACE_ID;
const ROLE = "owner";

if (!EMAIL || !PASSWORD) {
  console.error(
    "Usage: node scripts/create-auth-user.mjs <email> <password> [full name]"
  );
  process.exit(1);
}

if (!WORKSPACE_ID) {
  console.error("DEFAULT_WORKSPACE_ID is not set in .env");
  process.exit(1);
}

if (!supabaseAdmin) {
  console.error("Supabase admin client is not configured");
  process.exit(1);
}

const normalisedEmail = EMAIL.trim().toLowerCase();

if (!normalisedEmail.includes("@")) {
  console.error("Please provide a valid email address");
  process.exit(1);
}

if (PASSWORD.length < 10) {
  console.error("Password should be at least 10 characters");
  process.exit(1);
}

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  // 1) Create or update user
  const { data: existingUser, error: existingUserError } = await supabaseAdmin
    .from("app_users")
    .select("*")
    .eq("email", normalisedEmail)
    .maybeSingle();

  if (existingUserError) {
    throw existingUserError;
  }

  let user = existingUser;

  if (!user) {
    const { data, error } = await supabaseAdmin
      .from("app_users")
      .insert({
        email: normalisedEmail,
        password_hash: passwordHash,
        full_name: FULL_NAME || null,
        is_active: true,
      })
      .select("*")
      .single();

    if (error) throw error;
    user = data;

    console.log("Created app user:", user.id);
  } else {
    const { data, error } = await supabaseAdmin
      .from("app_users")
      .update({
        password_hash: passwordHash,
        full_name: FULL_NAME || user.full_name || null,
        is_active: true,
      })
      .eq("id", user.id)
      .select("*")
      .single();

    if (error) throw error;
    user = data;

    console.log("Updated existing app user:", user.id);
  }

  // 2) Link to workspace_members.
  // Reuse existing email-only membership if present.
  const { data: existingMember, error: existingMemberError } =
    await supabaseAdmin
      .from("workspace_members")
      .select("*")
      .eq("workspace_id", WORKSPACE_ID)
      .ilike("email", normalisedEmail)
      .maybeSingle();

  if (existingMemberError) {
    throw existingMemberError;
  }

  if (existingMember) {
    const { error } = await supabaseAdmin
      .from("workspace_members")
      .update({
        user_id: user.id,
        email: normalisedEmail,
        role: existingMember.role || ROLE,
      })
      .eq("id", existingMember.id);

    if (error) throw error;

    console.log("Linked existing workspace member:", existingMember.id);
  } else {
    const { data, error } = await supabaseAdmin
      .from("workspace_members")
      .insert({
        workspace_id: WORKSPACE_ID,
        user_id: user.id,
        email: normalisedEmail,
        role: ROLE,
      })
      .select("*")
      .single();

    if (error) throw error;

    console.log("Created workspace member:", data.id);
  }

  console.log("Done.");
  console.log({
    email: normalisedEmail,
    userId: user.id,
    workspaceId: WORKSPACE_ID,
    role: ROLE,
  });
}

main().catch((err) => {
  console.error("Failed to create auth user:", err);
  process.exit(1);
});
