import { createClient } from '@supabase/supabase-js';

export const BUCKET = 'cro-screenshots';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseSecret) {
  throw new Error('Server Supabase credentials are not configured');
}

export const sb = createClient(supabaseUrl, supabaseSecret, {
  auth: { persistSession: false },
});
