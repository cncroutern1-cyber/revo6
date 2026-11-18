import { createClient } from "@supabase/supabase-js";

// The publishable key is meant to be public. Access is protected by login and database rules.
const SUPABASE_URL = "https://gdztsvxcxfoqptogvwhf.supabase.co";
const SUPABASE_KEY = "sb_publishable_gem3ctWVyChi3yEKqUJjvQ_gVdp4Cw2";

// The session is kept in the browser, so refreshing the page does not sign you out.
export const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: "ish-kuzatuv-auth",
  },
});
