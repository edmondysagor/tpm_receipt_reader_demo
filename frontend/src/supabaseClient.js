import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────
// 🔧 Replace with your own Supabase credentials
// ─────────────────────────────────────────────
const SUPABASE_URL = "https://mkurgptwgpnyqzjbcuou.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_LQY_K59OlT-l3y1JJrIpew_WKymenz1";

// ─────────────────────────────────────────────
// Supabase client – import this wherever needed
// ─────────────────────────────────────────────
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
