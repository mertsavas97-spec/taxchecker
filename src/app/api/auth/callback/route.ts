import { NextResponse } from 'next/server';

import { isEmailRegisteredAdmin } from '@/lib/admin/auth/supabase-auth';
import { setAnalyticsInternalCookie } from '@/lib/admin/auth/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/admin';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user?.email) {
      const isAdmin = await isEmailRegisteredAdmin(data.user.email);
      if (isAdmin) {
        await setAnalyticsInternalCookie();
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
