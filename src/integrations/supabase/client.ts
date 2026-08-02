// Supabase browser client for the Software Vala backend.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Software Vala backend. Publishable (anon) credentials are safe in client code.
const DEFAULT_SUPABASE_URL = "https://jhakecdrthukbsfcqegq.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoYWtlY2RydGh1a2JzZmNxZWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMDEzMTcsImV4cCI6MjA5MzU3NzMxN30.1EjVKYmH4m_vC5E54TFF-u4yIgDDH2KY2ZYGp3kGK68";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_PUBLISHABLE_KEY;

const isBrowser = typeof window !== "undefined";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: isBrowser ? window.localStorage : undefined,
    persistSession: isBrowser,
    autoRefreshToken: isBrowser,
  },
});

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
