// supabaseClient.js
import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
  console.warn("[npsme] SUPABASE_URL is not set");
}

if (!supabaseSecretKey) {
  console.warn("[npsme] SUPABASE_SECRET_KEY is not set");
}

export const supabaseAdmin =
  supabaseUrl && supabaseSecretKey
    ? createClient(supabaseUrl, supabaseSecretKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        realtime: {
          transport: ws,
        },
      })
    : null;
