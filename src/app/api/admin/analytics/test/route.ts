import { NextResponse } from 'next/server';

import { isAdminAuthenticated } from '@/lib/admin/auth/server';
import { fetchGa4Last30DaysOverviewMetrics } from '@/lib/analytics/ga4-client';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const report = await fetchGa4Last30DaysOverviewMetrics();
    return NextResponse.json(report);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch GA4 metrics.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
