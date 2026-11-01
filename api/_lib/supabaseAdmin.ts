import { createClient } from '@supabase/supabase-js';

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} ortam değişkeni tanımlanmamış.`);
  return value;
}

export function getSupabaseAdminClient() {
  return createClient(
    requiredEnvironment('VITE_SUPABASE_URL'),
    requiredEnvironment('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
