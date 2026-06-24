import { describe, expect, it } from 'vitest';

import { filterTopPages, isInternalAnalyticsPath } from '@/lib/analytics/filters';

describe('analytics path filters', () => {
  it('detects internal admin and api paths', () => {
    expect(isInternalAnalyticsPath('/admin')).toBe(true);
    expect(isInternalAnalyticsPath('/admin/analytics')).toBe(true);
    expect(isInternalAnalyticsPath('/api/admin/login')).toBe(true);
    expect(isInternalAnalyticsPath('http://localhost:3000/blog')).toBe(true);
    expect(isInternalAnalyticsPath('/blog/example')).toBe(false);
    expect(isInternalAnalyticsPath('/calculators/1099-tax')).toBe(false);
  });

  it('filters top pages unless internal traffic is included', () => {
    const pages = [
      {
        path: '/blog/example',
        title: 'Example',
        pageViews: 10,
        activeUsers: 4,
      },
      {
        path: '/admin/analytics',
        title: 'Admin Analytics',
        pageViews: 5,
        activeUsers: 1,
      },
    ];

    expect(filterTopPages(pages, false)).toHaveLength(1);
    expect(filterTopPages(pages, false)[0]?.path).toBe('/blog/example');
    expect(filterTopPages(pages, true)).toHaveLength(2);
  });
});
