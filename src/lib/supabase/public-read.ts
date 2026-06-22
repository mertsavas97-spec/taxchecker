import { isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/client';

/** True when the server can read published CMS rows from Supabase (admin or anon). */
export function isSupabasePublicReadConfigured(): boolean {
  return isSupabaseAdminConfigured() || isSupabaseConfigured();
}
