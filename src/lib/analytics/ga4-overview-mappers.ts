import type { protos } from '@google-analytics/data';

import { normalizeGa4Date } from '@/lib/analytics/ga4-range';

type RunReportResponse = protos.google.analytics.data.v1beta.IRunReportResponse;

export function parseMetricValue(value: string | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapSummaryMetrics(response: RunReportResponse) {
  const metricValues = response.rows?.[0]?.metricValues ?? [];

  return {
    pageViews: parseMetricValue(metricValues[0]?.value),
    activeUsers: parseMetricValue(metricValues[1]?.value),
    newUsers: parseMetricValue(metricValues[2]?.value),
    sessions: parseMetricValue(metricValues[3]?.value),
  };
}

export function mapDailyMetrics(response: RunReportResponse) {
  const rows = response.rows ?? [];

  return rows
    .map((row) => ({
      date: normalizeGa4Date(row.dimensionValues?.[0]?.value),
      pageViews: parseMetricValue(row.metricValues?.[0]?.value),
      activeUsers: parseMetricValue(row.metricValues?.[1]?.value),
      sessions: parseMetricValue(row.metricValues?.[2]?.value),
    }))
    .filter((row) => row.date)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function mapTopPages(response: RunReportResponse) {
  return (response.rows ?? []).map((row) => ({
    path: row.dimensionValues?.[0]?.value?.trim() || '(not set)',
    title: row.dimensionValues?.[1]?.value?.trim() || '(not set)',
    pageViews: parseMetricValue(row.metricValues?.[0]?.value),
    activeUsers: parseMetricValue(row.metricValues?.[1]?.value),
  }));
}

export function mapTrafficSources(response: RunReportResponse) {
  return (response.rows ?? []).map((row) => ({
    source: row.dimensionValues?.[0]?.value?.trim() || '(not set)',
    sessions: parseMetricValue(row.metricValues?.[0]?.value),
    activeUsers: parseMetricValue(row.metricValues?.[1]?.value),
  }));
}

export function mapCountries(response: RunReportResponse) {
  return (response.rows ?? []).map((row) => ({
    country: row.dimensionValues?.[0]?.value?.trim() || '(not set)',
    activeUsers: parseMetricValue(row.metricValues?.[0]?.value),
    sessions: parseMetricValue(row.metricValues?.[1]?.value),
  }));
}

export const EMPTY_ANALYTICS_SUMMARY = {
  pageViews: 0,
  activeUsers: 0,
  newUsers: 0,
  sessions: 0,
} as const;
