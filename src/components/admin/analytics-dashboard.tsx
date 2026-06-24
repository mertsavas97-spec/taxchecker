'use client';

import { RefreshCwIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  CombinedDailyTrendChart,
  CountriesBarChart,
  DailyActiveUsersChart,
  DailyPageViewsChart,
  DailySessionsChart,
  TopPagesBarChart,
  TrafficSourcesBarChart,
} from '@/components/admin/analytics/analytics-charts';
import {
  CountriesTable,
  DailyPerformanceTable,
  InternalTrafficToggle,
  TopPagesTable,
  TrafficSourcesTable,
} from '@/components/admin/analytics/analytics-tables';
import { AdminEmptyState } from '@/components/admin/admin-empty-state';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminStatCard } from '@/components/admin/admin-stat-card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { filterTopPages } from '@/lib/analytics/filters';
import {
  formatAnalyticsDateLabel,
  formatAnalyticsNumber,
  formatLastUpdated,
  isAnalyticsOverviewEmpty,
  isLowAnalyticsData,
} from '@/lib/analytics/format';
import type { AnalyticsRange } from '@/lib/analytics/ga4-range';
import {
  ANALYTICS_RANGE_OPTIONS,
  type AnalyticsOverviewResponse,
} from '@/lib/analytics/types';

const CHART_HEIGHT_OVERVIEW = 'h-64';
const CHART_HEIGHT_FULL = 'h-80';

const METRIC_HINTS = {
  pageViews: 'Total page loads',
  activeUsers: 'Unique engaged users',
  newUsers: 'First-time users',
  sessions: 'Visits',
} as const;

function AnalyticsLoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-9 w-72 rounded-lg" />
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-72 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function LowDataNotice() {
  return (
    <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
      Analytics data is still early. Trends will become more useful as traffic grows.
    </div>
  );
}

export function AnalyticsDashboard() {
  const [range, setRange] = useState<AnalyticsRange>('30d');
  const [data, setData] = useState<AnalyticsOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [includeInternalTraffic, setIncludeInternalTraffic] = useState(false);

  const loadOverview = useCallback(
    async (signal: AbortSignal, isRefresh: boolean) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await fetch(`/api/admin/analytics/overview?range=${range}`, {
          signal,
          cache: 'no-store',
        });

        const body = (await response.json()) as AnalyticsOverviewResponse & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(body.error ?? 'Failed to load analytics.');
        }

        setData(body);
        setLastUpdated(new Date());
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
        setRefreshing(false);
      }
    },
    [range],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadOverview(controller.signal, refreshKey > 0);
    return () => controller.abort();
  }, [loadOverview, refreshKey]);

  const dailyChartData = useMemo(
    () =>
      (data?.daily ?? []).map((point) => ({
        ...point,
        label: formatAnalyticsDateLabel(point.date),
      })),
    [data?.daily],
  );

  const filteredTopPages = useMemo(
    () => filterTopPages(data?.topPages ?? [], includeInternalTraffic),
    [data?.topPages, includeInternalTraffic],
  );

  const showLowDataNotice =
    data &&
    (isAnalyticsOverviewEmpty(data.summary) || isLowAnalyticsData(data.summary));

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      {lastUpdated ? (
        <p className="text-xs text-muted-foreground">
          Last updated {formatLastUpdated(lastUpdated)}
        </p>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={loading || refreshing}
        onClick={() => setRefreshKey((value) => value + 1)}
      >
        <RefreshCwIcon className={refreshing ? 'animate-spin' : undefined} />
        Refresh
      </Button>
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
    </div>
  );

  return (
    <div>
      <AdminPageHeader
        title="Analytics"
        description="GA4 summary for TaxChecker traffic and engagement"
        actions={headerActions}
      />

      {loading ? <AnalyticsLoadingState /> : null}

      {!loading && error ? (
        <AdminEmptyState
          title="Unable to load analytics"
          description={error}
        />
      ) : null}

      {!loading && !error && data ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard
              label="Page views"
              value={formatAnalyticsNumber(data.summary.pageViews)}
              hint={METRIC_HINTS.pageViews}
            />
            <AdminStatCard
              label="Active users"
              value={formatAnalyticsNumber(data.summary.activeUsers)}
              hint={METRIC_HINTS.activeUsers}
            />
            <AdminStatCard
              label="New users"
              value={formatAnalyticsNumber(data.summary.newUsers)}
              hint={METRIC_HINTS.newUsers}
            />
            <AdminStatCard
              label="Sessions"
              value={formatAnalyticsNumber(data.summary.sessions)}
              hint={METRIC_HINTS.sessions}
            />
          </div>

          {showLowDataNotice ? <LowDataNotice /> : null}

          <Tabs defaultValue="overview" className="gap-4">
            <TabsList variant="line">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="tables">Tables</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 xl:grid-cols-2">
                <CombinedDailyTrendChart
                  data={dailyChartData}
                  heightClassName={CHART_HEIGHT_OVERVIEW}
                />
                <TopPagesBarChart
                  pages={filteredTopPages}
                  heightClassName={CHART_HEIGHT_OVERVIEW}
                />
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <TopPagesTable pages={filteredTopPages} compact />
                <TrafficSourcesTable sources={data.trafficSources} compact />
              </div>
            </TabsContent>

            <TabsContent value="charts" className="space-y-4">
              <div className="grid gap-4 xl:grid-cols-2">
                <DailyPageViewsChart
                  data={dailyChartData}
                  heightClassName={CHART_HEIGHT_FULL}
                />
                <DailyActiveUsersChart
                  data={dailyChartData}
                  heightClassName={CHART_HEIGHT_FULL}
                />
                <DailySessionsChart
                  data={dailyChartData}
                  heightClassName={CHART_HEIGHT_FULL}
                />
                <CombinedDailyTrendChart
                  data={dailyChartData}
                  heightClassName={CHART_HEIGHT_FULL}
                />
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <TopPagesBarChart
                  pages={filteredTopPages}
                  heightClassName={CHART_HEIGHT_FULL}
                />
                <TrafficSourcesBarChart
                  sources={data.trafficSources}
                  heightClassName={CHART_HEIGHT_FULL}
                />
                <CountriesBarChart
                  countries={data.countries}
                  heightClassName={CHART_HEIGHT_FULL}
                />
              </div>
            </TabsContent>

            <TabsContent value="tables" className="space-y-6">
              <div className="flex flex-wrap items-center justify-end">
                <InternalTrafficToggle
                  checked={includeInternalTraffic}
                  onCheckedChange={setIncludeInternalTraffic}
                />
              </div>

              <DailyPerformanceTable daily={data.daily} />
              <TopPagesTable pages={filteredTopPages} />
              <TrafficSourcesTable sources={data.trafficSources} />
              <CountriesTable countries={data.countries} />
            </TabsContent>
          </Tabs>
        </div>
      ) : null}
    </div>
  );
}
