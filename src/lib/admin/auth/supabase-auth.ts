import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export function useSupabaseAdminAuth(): boolean {
  if (process.env.ADMIN_AUTH_MODE === 'password') {
    return false;
  }
  return isSupabaseConfigured();
}

export async function getSupabaseAuthUser() {
  if (!useSupabaseAdminAuth()) return null;

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) return null;
  return user;
}

export async function isEmailRegisteredAdmin(email: string): Promise<boolean> {
  if (!useSupabaseAdminAuth()) return false;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('admin_users')
      .select('id')
      .ilike('email', email)
      .maybeSingle();

    if (error) return false;
    return Boolean(data);
  } catch {
    return false;
  }
}

export async function isSupabaseAdminAuthenticated(): Promise<boolean> {
  const user = await getSupabaseAuthUser();
  if (!user?.email) return false;
  return isEmailRegisteredAdmin(user.email);
}
