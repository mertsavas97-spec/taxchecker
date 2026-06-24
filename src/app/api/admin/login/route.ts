import { NextResponse } from 'next/server';

import {
  setAdminSessionCookie,
  setAnalyticsInternalCookie,
} from '@/lib/admin/auth/server';
import {
  isEmailRegisteredAdmin,
  useSupabaseAdminAuth,
} from '@/lib/admin/auth/supabase-auth';
import { validateAdminPassword } from '@/lib/admin/auth/session';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  if (useSupabaseAdminAuth()) {
    let email = '';
    let password = '';

    try {
      const body = (await request.json()) as { email?: string; password?: string };
      email = body.email?.trim() ?? '';
      password = body.password ?? '';
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const allowed = await isEmailRegisteredAdmin(email);
    if (!allowed) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await setAnalyticsInternalCookie();
    return NextResponse.json({ ok: true });
  }

  let password = '';

  try {
    const body = (await request.json()) as { password?: string };
    password = body.password ?? '';
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!validateAdminPassword(password)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  await setAdminSessionCookie();
  return NextResponse.json({ ok: true });
}
