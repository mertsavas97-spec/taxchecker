import { NextResponse } from 'next/server';

import { isAdminAuthenticated } from '@/lib/admin/auth/server';
import { fetchGa4AnalyticsOverview } from '@/lib/analytics/ga4-client';
import { parseAnalyticsRange } from '@/lib/analytics/ga4-range';

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = parseAnalyticsRange(searchParams.get('range'));

  if (!range) {
    return NextResponse.json(
      { error: 'Invalid range. Allowed values: 7d, 30d, 90d, 12m.' },
      { status: 400 },
    );
  }

  try {
    const overview = await fetchGa4AnalyticsOverview(range);
    return NextResponse.json(overview);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch GA4 analytics overview.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
