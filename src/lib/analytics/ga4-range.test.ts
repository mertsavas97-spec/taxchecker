import { describe, expect, it } from 'vitest';

import {
  normalizeGa4Date,
  parseAnalyticsRange,
  toGa4DateRange,
} from '@/lib/analytics/ga4-range';

describe('ga4 range helpers', () => {
  it('defaults to 30d when range is missing', () => {
    expect(parseAnalyticsRange(null)).toBe('30d');
    expect(parseAnalyticsRange(undefined)).toBe('30d');
  });

  it('accepts allowed ranges', () => {
    expect(parseAnalyticsRange('7d')).toBe('7d');
    expect(parseAnalyticsRange('90d')).toBe('90d');
    expect(parseAnalyticsRange('12m')).toBe('12m');
  });

  it('rejects invalid ranges', () => {
    expect(parseAnalyticsRange('14d')).toBeNull();
    expect(parseAnalyticsRange('')).toBeNull();
    expect(parseAnalyticsRange('month')).toBeNull();
  });

  it('maps ranges to GA4 date ranges', () => {
    expect(toGa4DateRange('7d')).toEqual({ startDate: '7daysAgo', endDate: 'today' });
    expect(toGa4DateRange('12m')).toEqual({ startDate: '365daysAgo', endDate: 'today' });
  });

  it('normalizes GA4 YYYYMMDD dates', () => {
    expect(normalizeGa4Date('20260615')).toBe('2026-06-15');
    expect(normalizeGa4Date('20260101')).toBe('2026-01-01');
  });
});
