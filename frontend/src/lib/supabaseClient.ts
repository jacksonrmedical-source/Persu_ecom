import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,      // keeps the session in localStorage across reloads/navigation
    autoRefreshToken: true,    // refreshes the token before it expires, so you're never silently logged out
    detectSessionInUrl: true,  // picks up the session from the magic-link redirect URL
  },
});
