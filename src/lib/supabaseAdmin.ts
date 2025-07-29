// src/lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

// Ensure these environment variables are set in your server environment
// (e.g., .env.local for Next.js, or your deployment platform's secrets)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables for admin client');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false, // No need to persist session on server
  },
});