import { NextResponse } from 'next/server';

import { signOutAdminSession } from '@/lib/admin/auth/server';

export async function POST() {
  await signOutAdminSession();
  return NextResponse.json({ ok: true });
}
