import { createClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from './env.js';

let supabaseClient = null;

if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err.message);
  }
}

export const getSupabase = () => supabaseClient;
export { isSupabaseConfigured };
