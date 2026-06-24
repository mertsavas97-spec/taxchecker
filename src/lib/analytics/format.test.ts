import { describe, expect, it } from 'vitest';

import {
  formatAnalyticsCountryLabel,
  formatAnalyticsDateLabel,
  formatAnalyticsNumber,
  isAnalyticsOverviewEmpty,
  isLowAnalyticsData,
} from '@/lib/analytics/format';

describe('analytics format helpers', () => {
  it('formats numbers for display', () => {
    expect(formatAnalyticsNumber(1234)).toBe('1,234');
  });

  it('formats daily chart labels', () => {
    expect(formatAnalyticsDateLabel('2026-06-15')).toBe('Jun 15');
  });

  it('maps unknown countries', () => {
    expect(formatAnalyticsCountryLabel('(not set)')).toBe('Unknown');
    expect(formatAnalyticsCountryLabel('United States')).toBe('United States');
  });

  it('detects empty summary totals', () => {
    expect(
      isAnalyticsOverviewEmpty({
        pageViews: 0,
        activeUsers: 0,
        newUsers: 0,
        sessions: 0,
      }),
    ).toBe(true);
    expect(
      isAnalyticsOverviewEmpty({
        pageViews: 1,
        activeUsers: 0,
        newUsers: 0,
        sessions: 0,
      }),
    ).toBe(false);
  });

  it('detects low analytics data', () => {
    expect(isLowAnalyticsData({ pageViews: 50, sessions: 25 })).toBe(true);
    expect(isLowAnalyticsData({ pageViews: 51, sessions: 26 })).toBe(false);
  });
});
