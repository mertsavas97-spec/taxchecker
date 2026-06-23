export const ANALYTICS_RANGES = ['7d', '30d', '90d', '12m'] as const;

export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

export interface Ga4DateRange {
  startDate: string;
  endDate: 'today';
}

const GA4_START_DATES: Record<AnalyticsRange, string> = {
  '7d': '7daysAgo',
  '30d': '30daysAgo',
  '90d': '90daysAgo',
  '12m': '365daysAgo',
};

export function isAnalyticsRange(value: string): value is AnalyticsRange {
  return (ANALYTICS_RANGES as readonly string[]).includes(value);
}

export function parseAnalyticsRange(value: string | null | undefined): AnalyticsRange | null {
  const normalized = value?.trim() ?? '30d';
  return isAnalyticsRange(normalized) ? normalized : null;
}

export function toGa4DateRange(range: AnalyticsRange): Ga4DateRange {
  return {
    startDate: GA4_START_DATES[range],
    endDate: 'today',
  };
}

/** Normalize GA4 `date` dimension values from YYYYMMDD to YYYY-MM-DD. */
export function normalizeGa4Date(value: string | null | undefined): string {
  const raw = value?.trim() ?? '';
  if (/^\d{8}$/.test(raw)) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  }
  return raw;
}
