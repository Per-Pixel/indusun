// Service role client for admin operations that bypass RLS
// ⚠️ WARNING: Only use this server-side for admin operations

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const g = globalThis as unknown as { __indusunServiceClient?: SupabaseClient };

export const createServiceClient = () => {
  if (g.__indusunServiceClient) return g.__indusunServiceClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Please add it to your .env.local file.');
  }

  g.__indusunServiceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return g.__indusunServiceClient;
};
