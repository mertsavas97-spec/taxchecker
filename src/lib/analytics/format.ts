export function formatAnalyticsNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatAnalyticsDateLabel(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatAnalyticsCountryLabel(country: string): string {
  const trimmed = country.trim();
  if (!trimmed || trimmed === '(not set)') {
    return 'Unknown';
  }
  return trimmed;
}

export function truncateAnalyticsLabel(value: string, maxLength = 28): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 1)}…`;
}

export function isAnalyticsOverviewEmpty(summary: {
  pageViews: number;
  activeUsers: number;
  newUsers: number;
  sessions: number;
}): boolean {
  return (
    summary.pageViews === 0 &&
    summary.activeUsers === 0 &&
    summary.newUsers === 0 &&
    summary.sessions === 0
  );
}
