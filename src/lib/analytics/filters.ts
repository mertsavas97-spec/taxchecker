import type { AnalyticsTopPage } from '@/lib/analytics/types';

export function isInternalAnalyticsPath(path: string): boolean {
  const normalized = path.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  if (normalized.includes('localhost')) {
    return true;
  }

  if (normalized === '/admin' || normalized.startsWith('/admin/')) {
    return true;
  }

  if (normalized === '/api' || normalized.startsWith('/api/')) {
    return true;
  }

  return false;
}

export function filterTopPages(
  pages: AnalyticsTopPage[],
  includeInternalTraffic: boolean,
): AnalyticsTopPage[] {
  if (includeInternalTraffic) {
    return pages;
  }

  return pages.filter((page) => !isInternalAnalyticsPath(page.path));
}
