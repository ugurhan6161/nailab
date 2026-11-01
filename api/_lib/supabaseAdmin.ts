import { createClient } from '@supabase/supabase-js';

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} ortam değişkeni tanımlanmamış.`);
  return value;
}

export function getSupabaseAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL ortam değişkeni tanımlanmamış.');
  }

  return createClient(
    supabaseUrl,
    requiredEnvironment('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
