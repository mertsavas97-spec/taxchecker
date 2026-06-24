import { describe, expect, it } from 'vitest';

import {
  ANALYTICS_INTERNAL_COOKIE,
  buildGa4InitScript,
  GA4_INTERNAL_TRAFFIC_TYPE,
  hasAnalyticsInternalCookie,
  isAdminAnalyticsPath,
  shouldSkipGa4Tracking,
  shouldTagGa4InternalTraffic,
} from '@/lib/analytics/internal-traffic';

describe('GA4 internal traffic helpers', () => {
  it('detects admin analytics paths', () => {
    expect(isAdminAnalyticsPath('/admin')).toBe(true);
    expect(isAdminAnalyticsPath('/admin/analytics')).toBe(true);
    expect(isAdminAnalyticsPath('/admin/blog/new')).toBe(true);
    expect(isAdminAnalyticsPath('/blog')).toBe(false);
    expect(isAdminAnalyticsPath('/calculators/1099-tax')).toBe(false);
  });

  it('reads the analytics internal cookie marker', () => {
    expect(
      hasAnalyticsInternalCookie(`${ANALYTICS_INTERNAL_COOKIE}=1; other=value`),
    ).toBe(true);
    expect(hasAnalyticsInternalCookie('other=value')).toBe(false);
  });

  it('skips GA4 on admin paths and authenticated admin sessions', () => {
    expect(
      shouldSkipGa4Tracking({
        pathname: '/admin/blog',
        hasAdminSession: false,
      }),
    ).toBe(true);

    expect(
      shouldSkipGa4Tracking({
        pathname: '/blog/example',
        hasAdminSession: true,
      }),
    ).toBe(true);

    expect(
      shouldSkipGa4Tracking({
        pathname: '/blog/example',
        hasAdminSession: false,
      }),
    ).toBe(false);
  });

  it('tags internal traffic for authenticated admins on public pages', () => {
    expect(
      shouldTagGa4InternalTraffic({
        pathname: '/blog/example',
        hasAdminSession: true,
      }),
    ).toBe(true);

    expect(
      shouldTagGa4InternalTraffic({
        pathname: '/admin/analytics',
        hasAdminSession: true,
      }),
    ).toBe(false);
  });

  it('builds GA4 init scripts with internal traffic classification', () => {
    const internalScript = buildGa4InitScript({
      measurementId: 'G-TEST123',
      tagInternalTraffic: true,
    });

    expect(internalScript).toContain(`traffic_type: '${GA4_INTERNAL_TRAFFIC_TYPE}'`);
    expect(internalScript).toContain("gtag('config', 'G-TEST123'");

    const publicScript = buildGa4InitScript({
      measurementId: 'G-TEST123',
      tagInternalTraffic: false,
    });

    expect(publicScript).not.toContain('traffic_type');
  });
});
