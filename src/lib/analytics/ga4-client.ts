import 'server-only';

import { BetaAnalyticsDataClient } from '@google-analytics/data';

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
    throw new Error('GA4_PROPERTY_ID is not configured.');
  }
  if (!clientEmail) {
    throw new Error('GA4_CLIENT_EMAIL is not configured.');
  }
  if (!privateKey) {
    throw new Error('GA4_PRIVATE_KEY is not configured.');
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

function parseMetricValue(value: string | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function fetchGa4Last30DaysOverviewMetrics(): Promise<Ga4Last30DaysReport> {
  const config = readGa4EnvConfig();
  const client = createGa4Client(config);

  const [response] = await client.runReport({
    property: toGa4PropertyResource(config.propertyId),
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
