import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
} from '@/lib/admin/auth/constants';
import { ANALYTICS_INTERNAL_COOKIE } from '@/lib/analytics/internal-traffic';
import {
  isSupabaseAdminAuthenticated,
  useSupabaseAdminAuth,
} from '@/lib/admin/auth/supabase-auth';
import {
  createAdminSessionToken,
  verifyAdminSessionToken,
} from '@/lib/admin/auth/session-token';
import { createClient } from '@/lib/supabase/server';

export const adminNoIndexMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export async function getAdminSession(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
}

export async function isDevPasswordAuthenticated(): Promise<boolean> {
  if (useSupabaseAdminAuth()) return false;
  const token = await getAdminSession();
  return verifyAdminSessionToken(token);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  if (useSupabaseAdminAuth()) {
    return isSupabaseAdminAuthenticated();
  }
  return isDevPasswordAuthenticated();
}

export async function requireAdminSession(): Promise<void> {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }
}

export async function setAnalyticsInternalCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ANALYTICS_INTERNAL_COOKIE, '1', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
}

export async function clearAnalyticsInternalCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ANALYTICS_INTERNAL_COOKIE);
}

export async function setAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, await createAdminSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  await setAnalyticsInternalCookie();
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  await clearAnalyticsInternalCookie();
}

export async function signOutAdminSession(): Promise<void> {
  if (useSupabaseAdminAuth()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
    await clearAnalyticsInternalCookie();
    return;
  }
  await clearAdminSessionCookie();
}
