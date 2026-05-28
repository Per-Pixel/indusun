// Service role client for admin operations that bypass RLS
// ⚠️ WARNING: Only use this server-side for admin operations

import { createClient } from '@supabase/supabase-js';

export const createServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Debug logging to help identify missing credentials
  console.log('Service client debug:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!serviceRoleKey,
    urlPrefix: supabaseUrl?.substring(0, 20) + '...',
    keyPrefix: serviceRoleKey?.substring(0, 10) + '...'
  });

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Please add it to your .env.local file.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
