import type { AnalyticsRange } from '@/lib/analytics/ga4-range';

export interface AnalyticsOverviewSummary {
  pageViews: number;
  activeUsers: number;
  newUsers: number;
  sessions: number;
}

export interface AnalyticsDailyPoint {
  date: string;
  pageViews: number;
  activeUsers: number;
  sessions: number;
}

export interface AnalyticsTopPage {
  path: string;
  title: string;
  pageViews: number;
  activeUsers: number;
}

export interface AnalyticsTrafficSource {
  source: string;
  sessions: number;
  activeUsers: number;
}

export interface AnalyticsCountry {
  country: string;
  activeUsers: number;
  sessions: number;
}

export interface AnalyticsOverviewResponse {
  range: AnalyticsRange;
  summary: AnalyticsOverviewSummary;
  daily: AnalyticsDailyPoint[];
  topPages: AnalyticsTopPage[];
  trafficSources: AnalyticsTrafficSource[];
  countries: AnalyticsCountry[];
}

export const ANALYTICS_RANGE_OPTIONS = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '12m', label: '12 months' },
] as const satisfies ReadonlyArray<{
  value: AnalyticsRange;
  label: string;
}>;
