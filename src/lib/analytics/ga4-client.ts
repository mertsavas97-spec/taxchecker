import 'server-only';

import { BetaAnalyticsDataClient } from '@google-analytics/data';

import {
  EMPTY_ANALYTICS_SUMMARY,
  mapCountries,
  mapDailyMetrics,
  mapSummaryMetrics,
  mapTopPages,
  mapTrafficSources,
  parseMetricValue,
} from '@/lib/analytics/ga4-overview-mappers';
import {
  type AnalyticsRange,
  toGa4DateRange,
} from '@/lib/analytics/ga4-range';
import type { AnalyticsOverviewResponse } from '@/lib/analytics/types';

export type { AnalyticsOverviewResponse } from '@/lib/analytics/types';

export interface Ga4OverviewMetrics {
  activeUsers: number;
  sessions: number;
  screenPageViews: number;
}

export interface Ga4Last30DaysReport {
  period: {
    startDate: '30daysAgo';
    endDate: 'today';
  };
  metrics: Ga4OverviewMetrics;
}

interface Ga4EnvConfig {
  propertyId: string;
  clientEmail: string;
  privateKey: string;
}

function readGa4EnvConfig(): Ga4EnvConfig {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim();
  const clientEmail = process.env.GA4_CLIENT_EMAIL?.trim();
  const privateKey = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, '\n').trim();

  if (!propertyId) {
    throw new Error('GA4 is not configured.');
  }
  if (!clientEmail) {
    throw new Error('GA4 is not configured.');
  }
  if (!privateKey) {
    throw new Error('GA4 is not configured.');
  }

  return { propertyId, clientEmail, privateKey };
}

function toGa4PropertyResource(propertyId: string): string {
  const normalized = propertyId.replace(/^properties\//, '');
  return `properties/${normalized}`;
}

function createGa4Client(config: Ga4EnvConfig): BetaAnalyticsDataClient {
  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: config.clientEmail,
      private_key: config.privateKey,
    },
  });
}

function getGa4Runtime() {
  const config = readGa4EnvConfig();
  return {
    config,
    client: createGa4Client(config),
    property: toGa4PropertyResource(config.propertyId),
  };
}

export async function fetchGa4Last30DaysOverviewMetrics(): Promise<Ga4Last30DaysReport> {
  const { client, property } = getGa4Runtime();

  const [response] = await client.runReport({
    property,
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'screenPageViews' },
    ],
  });

  const metricValues = response.rows?.[0]?.metricValues ?? [];

  return {
    period: {
      startDate: '30daysAgo',
      endDate: 'today',
    },
    metrics: {
      activeUsers: parseMetricValue(metricValues[0]?.value),
      sessions: parseMetricValue(metricValues[1]?.value),
      screenPageViews: parseMetricValue(metricValues[2]?.value),
    },
  };
}

export async function fetchGa4AnalyticsOverview(
  range: AnalyticsRange,
): Promise<AnalyticsOverviewResponse> {
  const { client, property } = getGa4Runtime();
  const dateRange = toGa4DateRange(range);

  const [
    summaryResponse,
    dailyResponse,
    topPagesResponse,
    trafficSourcesResponse,
    countriesResponse,
  ] = await Promise.all([
    client.runReport({
      property,
      dateRanges: [dateRange],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
        { name: 'newUsers' },
        { name: 'sessions' },
      ],
    }),
    client.runReport({
      property,
      dateRanges: [dateRange],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
        { name: 'sessions' },
      ],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
    }),
    client.runReport({
      property,
      dateRanges: [dateRange],
      dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 20,
    }),
    client.runReport({
      property,
      dateRanges: [dateRange],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    }),
    client.runReport({
      property,
      dateRanges: [dateRange],
      dimensions: [{ name: 'country' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 10,
    }),
  ]);

  const [summary] = summaryResponse;
  const [daily] = dailyResponse;
  const [topPages] = topPagesResponse;
  const [trafficSources] = trafficSourcesResponse;
  const [countries] = countriesResponse;

  return {
    range,
    summary: summary?.rows?.length ? mapSummaryMetrics(summary) : { ...EMPTY_ANALYTICS_SUMMARY },
    daily: daily ? mapDailyMetrics(daily) : [],
    topPages: topPages ? mapTopPages(topPages) : [],
    trafficSources: trafficSources ? mapTrafficSources(trafficSources) : [],
    countries: countries ? mapCountries(countries) : [],
  };
}
