import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { ADMIN_SESSION_COOKIE } from '@/lib/admin/auth/constants';
import { verifyAdminSessionToken } from '@/lib/admin/auth/session-token';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { updateSupabaseSession } from '@/lib/supabase/middleware';

const PUBLIC_ADMIN_PATHS = ['/admin/login'];
const PUBLIC_ADMIN_API = ['/api/admin/login', '/api/auth/callback'];

function useSupabaseAdminAuth(): boolean {
  if (process.env.ADMIN_AUTH_MODE === 'password') return false;
  return isSupabaseConfigured();
}

async function isDevPasswordAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

async function isSupabaseAdminAuthenticated(request: NextRequest): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return false;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {
        // Read-only cookie access in middleware auth check.
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return false;

  const { data, error } = await supabase.rpc('is_admin_user');
  if (error) return false;
  return Boolean(data);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    if (useSupabaseAdminAuth()) {
      return updateSupabaseSession(request);
    }
    return NextResponse.next();
  }

  if (
    PUBLIC_ADMIN_PATHS.some((path) => pathname === path) ||
    PUBLIC_ADMIN_API.some((path) => pathname === path)
  ) {
    if (useSupabaseAdminAuth()) {
      return updateSupabaseSession(request);
    }
    return NextResponse.next();
  }

  const authenticated = useSupabaseAdminAuth()
    ? await isSupabaseAdminAuthenticated(request)
    : await isDevPasswordAuthenticated(request);

  if (!authenticated) {
    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (useSupabaseAdminAuth()) {
    return updateSupabaseSession(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/auth/callback'],
};
