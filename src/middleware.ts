import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { ADMIN_SESSION_COOKIE } from '@/lib/admin/auth/constants';
import { verifyAdminSessionToken } from '@/lib/admin/auth/session-token';
import {
  buildCanonicalRedirectUrl,
  CANONICAL_REDIRECT_STATUS,
  getRequestHostname,
  NON_CANONICAL_ROBOTS_HEADER,
  nonCanonicalRedirectHeaders,
  resolveHostPolicy,
  shouldNoIndexHost,
} from '@/lib/seo/host-canonicalization';
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

async function handleApplicationRequest(request: NextRequest): Promise<NextResponse> {
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

export async function middleware(request: NextRequest) {
  const hostname = getRequestHostname(request);
  const hostPolicy = resolveHostPolicy(hostname);

  if (hostPolicy.action === 'redirect') {
    const redirectUrl = buildCanonicalRedirectUrl(request.url);
    return new NextResponse(null, {
      status: CANONICAL_REDIRECT_STATUS,
      headers: nonCanonicalRedirectHeaders(redirectUrl),
    });
  }

  const response = await handleApplicationRequest(request);

  if (shouldNoIndexHost(hostname)) {
    response.headers.set('X-Robots-Tag', NON_CANONICAL_ROBOTS_HEADER);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$).*)',
  ],
};
