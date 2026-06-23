import { describe, expect, it } from 'vitest';

import {
  mapCountries,
  mapDailyMetrics,
  mapSummaryMetrics,
  mapTopPages,
  mapTrafficSources,
} from '@/lib/analytics/ga4-overview-mappers';

describe('ga4 overview mappers', () => {
  it('maps summary metrics in response order', () => {
    const summary = mapSummaryMetrics({
      rows: [
        {
          metricValues: [
            { value: '21' },
            { value: '12' },
            { value: '8' },
            { value: '14' },
          ],
        },
      ],
    });

    expect(summary).toEqual({
      pageViews: 21,
      activeUsers: 12,
      newUsers: 8,
      sessions: 14,
    });
  });

  it('returns zero summary values when rows are missing', () => {
    expect(mapSummaryMetrics({})).toEqual({
      pageViews: 0,
      activeUsers: 0,
      newUsers: 0,
      sessions: 0,
    });
  });

  it('maps daily metrics and normalizes dates', () => {
    const daily = mapDailyMetrics({
      rows: [
        {
          dimensionValues: [{ value: '20260614' }],
          metricValues: [{ value: '10' }, { value: '4' }, { value: '5' }],
        },
        {
          dimensionValues: [{ value: '20260615' }],
          metricValues: [{ value: '11' }, { value: '8' }, { value: '9' }],
        },
      ],
    });

    expect(daily).toEqual([
      { date: '2026-06-14', pageViews: 10, activeUsers: 4, sessions: 5 },
      { date: '2026-06-15', pageViews: 11, activeUsers: 8, sessions: 9 },
    ]);
  });

  it('maps top pages, traffic sources, and countries', () => {
    expect(
      mapTopPages({
        rows: [
          {
            dimensionValues: [{ value: '/blog/example' }, { value: 'Example Post' }],
            metricValues: [{ value: '9' }, { value: '3' }],
          },
        ],
      }),
    ).toEqual([
      {
        path: '/blog/example',
        title: 'Example Post',
        pageViews: 9,
        activeUsers: 3,
      },
    ]);

    expect(
      mapTrafficSources({
        rows: [
          {
            dimensionValues: [{ value: 'Organic Search' }],
            metricValues: [{ value: '6' }, { value: '4' }],
          },
        ],
      }),
    ).toEqual([{ source: 'Organic Search', sessions: 6, activeUsers: 4 }]);

    expect(
      mapCountries({
        rows: [
          {
            dimensionValues: [{ value: 'United States' }],
            metricValues: [{ value: '7' }, { value: '5' }],
          },
        ],
      }),
    ).toEqual([{ country: 'United States', activeUsers: 7, sessions: 5 }]);
  });

  it('returns empty arrays when report rows are missing', () => {
    expect(mapDailyMetrics({})).toEqual([]);
    expect(mapTopPages({})).toEqual([]);
    expect(mapTrafficSources({})).toEqual([]);
    expect(mapCountries({})).toEqual([]);
  });
});
