'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { AdminEmptyState } from '@/components/admin/admin-empty-state';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminStatCard } from '@/components/admin/admin-stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  formatAnalyticsCountryLabel,
  formatAnalyticsDateLabel,
  formatAnalyticsNumber,
  isAnalyticsOverviewEmpty,
  truncateAnalyticsLabel,
} from '@/lib/analytics/format';
import type { AnalyticsRange } from '@/lib/analytics/ga4-range';
import {
  ANALYTICS_RANGE_OPTIONS,
  type AnalyticsOverviewResponse,
} from '@/lib/analytics/types';

const CHART_COLORS = {
  pageViews: 'oklch(0.42 0.1 250)',
  activeUsers: 'oklch(0.45 0.1 155)',
  sessions: 'oklch(0.55 0.14 75)',
  countries: 'oklch(0.5 0.12 200)',
} as const;

function AnalyticsChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="shadow-tc-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-72">{children}</CardContent>
    </Card>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-tc-sm">
      {label ? <p className="mb-1 font-medium text-foreground">{label}</p> : null}
      {payload.map((entry) => (
        <p key={entry.name} className="text-muted-foreground">
          <span style={{ color: entry.color }}>{entry.name}</span>:{' '}
          {formatAnalyticsNumber(entry.value ?? 0)}
        </p>
      ))}
    </div>
  );
}

function AnalyticsLoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-80 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-lg" />
    </div>
  );
}

function AnalyticsTableSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-tc-sm">
        {children}
      </div>
    </section>
  );
}

export function AnalyticsDashboard() {
  const [range, setRange] = useState<AnalyticsRange>('30d');
  const [data, setData] = useState<AnalyticsOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOverview() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/analytics/overview?range=${range}`, {
          signal: controller.signal,
          cache: 'no-store',
        });

        const body = (await response.json()) as AnalyticsOverviewResponse & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(body.error ?? 'Failed to load analytics.');
        }

        setData(body);
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          return;
        }

        setData(null);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : 'Failed to load analytics.',
        );
      } finally {
        setLoading(false);
      }
    }

    void loadOverview();

    return () => controller.abort();
  }, [range]);

  const dailyChartData = useMemo(
    () =>
      (data?.daily ?? []).map((point) => ({
        ...point,
        label: formatAnalyticsDateLabel(point.date),
      })),
    [data?.daily],
  );

  const topPagesChartData = useMemo(
    () =>
      (data?.topPages ?? []).slice(0, 10).map((page) => ({
        ...page,
        label: truncateAnalyticsLabel(page.title || page.path, 24),
      })),
    [data?.topPages],
  );

  const trafficChartData = useMemo(
    () =>
      (data?.trafficSources ?? []).map((source) => ({
        ...source,
        label: truncateAnalyticsLabel(source.source, 20),
      })),
    [data?.trafficSources],
  );

  const countryChartData = useMemo(
    () =>
      (data?.countries ?? []).map((country) => ({
        ...country,
        label: truncateAnalyticsLabel(formatAnalyticsCountryLabel(country.country), 18),
      })),
    [data?.countries],
  );

  const showEmptyState =
    !loading && !error && data && isAnalyticsOverviewEmpty(data.summary);

  return (
    <div>
      <AdminPageHeader
        title="Analytics"
        description="Simple GA4 summary for TaxChecker"
        actions={
          <Select
            value={range}
            onValueChange={(value) => setRange(value as AnalyticsRange)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ANALYTICS_RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {loading ? <AnalyticsLoadingState /> : null}

      {!loading && error ? (
        <AdminEmptyState
          title="Unable to load analytics"
          description={error}
        />
      ) : null}

      {!loading && !error && showEmptyState ? (
        <AdminEmptyState
          title="No analytics data yet"
          description="There is no GA4 activity for the selected date range."
        />
      ) : null}

      {!loading && !error && data && !showEmptyState ? (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard
              label="Page views"
              value={formatAnalyticsNumber(data.summary.pageViews)}
            />
            <AdminStatCard
              label="Active users"
              value={formatAnalyticsNumber(data.summary.activeUsers)}
            />
            <AdminStatCard
              label="New users"
              value={formatAnalyticsNumber(data.summary.newUsers)}
            />
            <AdminStatCard
              label="Sessions"
              value={formatAnalyticsNumber(data.summary.sessions)}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <AnalyticsChartCard title="Daily page views">
              {dailyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 12 }} width={40} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="pageViews"
                      name="Page views"
                      stroke={CHART_COLORS.pageViews}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <AdminEmptyState
                  title="No daily page view data"
                  className="h-full border-0 shadow-none"
                />
              )}
            </AnalyticsChartCard>

            <AnalyticsChartCard title="Daily active users">
              {dailyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 12 }} width={40} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="activeUsers"
                      name="Active users"
                      stroke={CHART_COLORS.activeUsers}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <AdminEmptyState
                  title="No daily active user data"
                  className="h-full border-0 shadow-none"
                />
              )}
            </AnalyticsChartCard>

            <AnalyticsChartCard title="Top pages by page views">
              {topPagesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topPagesChartData} layout="vertical" margin={{ left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={110}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar
                      dataKey="pageViews"
                      name="Page views"
                      fill={CHART_COLORS.pageViews}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <AdminEmptyState
                  title="No top page data"
                  className="h-full border-0 shadow-none"
                />
              )}
            </AnalyticsChartCard>

            <AnalyticsChartCard title="Traffic sources by sessions">
              {trafficChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trafficChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-20} height={60} textAnchor="end" />
                    <YAxis tick={{ fontSize: 12 }} width={40} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar
                      dataKey="sessions"
                      name="Sessions"
                      fill={CHART_COLORS.sessions}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <AdminEmptyState
                  title="No traffic source data"
                  className="h-full border-0 shadow-none"
                />
              )}
            </AnalyticsChartCard>

            <AnalyticsChartCard title="Countries by active users">
              {countryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countryChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-20} height={60} textAnchor="end" />
                    <YAxis tick={{ fontSize: 12 }} width={40} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar
                      dataKey="activeUsers"
                      name="Active users"
                      fill={CHART_COLORS.countries}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <AdminEmptyState
                  title="No country data"
                  className="h-full border-0 shadow-none"
                />
              )}
            </AnalyticsChartCard>
          </div>

          <AnalyticsTableSection title="Top pages">
            {data.topPages.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page title</TableHead>
                    <TableHead>Path</TableHead>
                    <TableHead className="text-right">Page views</TableHead>
                    <TableHead className="text-right">Active users</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topPages.map((page) => (
                    <TableRow key={`${page.path}-${page.title}`}>
                      <TableCell className="font-medium">{page.title}</TableCell>
                      <TableCell className="text-muted-foreground">{page.path}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatAnalyticsNumber(page.pageViews)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatAnalyticsNumber(page.activeUsers)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <AdminEmptyState title="No top pages" className="border-0 shadow-none" />
            )}
          </AnalyticsTableSection>

          <AnalyticsTableSection title="Traffic sources">
            {data.trafficSources.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Sessions</TableHead>
                    <TableHead className="text-right">Active users</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.trafficSources.map((source) => (
                    <TableRow key={source.source}>
                      <TableCell className="font-medium">{source.source}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatAnalyticsNumber(source.sessions)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatAnalyticsNumber(source.activeUsers)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <AdminEmptyState
                title="No traffic sources"
                className="border-0 shadow-none"
              />
            )}
          </AnalyticsTableSection>

          <AnalyticsTableSection title="Countries">
            {data.countries.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead className="text-right">Active users</TableHead>
                    <TableHead className="text-right">Sessions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.countries.map((country) => (
                    <TableRow key={country.country}>
                      <TableCell className="font-medium">
                        {formatAnalyticsCountryLabel(country.country)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatAnalyticsNumber(country.activeUsers)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatAnalyticsNumber(country.sessions)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <AdminEmptyState title="No country data" className="border-0 shadow-none" />
            )}
          </AnalyticsTableSection>
        </div>
      ) : null}
    </div>
  );
}
