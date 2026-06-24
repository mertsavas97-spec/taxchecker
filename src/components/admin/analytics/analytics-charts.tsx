'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { AdminEmptyState } from '@/components/admin/admin-empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  formatAnalyticsCountryLabel,
  formatAnalyticsNumber,
  truncateAnalyticsLabel,
} from '@/lib/analytics/format';
import type {
  AnalyticsCountry,
  AnalyticsDailyPoint,
  AnalyticsTopPage,
  AnalyticsTrafficSource,
} from '@/lib/analytics/types';

export const CHART_COLORS = {
  pageViews: 'oklch(0.42 0.1 250)',
  activeUsers: 'oklch(0.45 0.1 155)',
  sessions: 'oklch(0.55 0.14 75)',
  countries: 'oklch(0.5 0.12 200)',
} as const;

const AXIS_TICK = { fontSize: 12, fill: 'var(--muted-foreground)' } as const;

export function AnalyticsChartCard({
  title,
  description,
  heightClassName = 'h-72',
  children,
}: {
  title: string;
  description?: string;
  heightClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex h-full flex-col shadow-tc-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent className={heightClassName}>{children}</CardContent>
    </Card>
  );
}

export function ChartTooltip({
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

function ChartEmpty({ title }: { title: string }) {
  return (
    <AdminEmptyState title={title} className="h-full border-0 shadow-none" />
  );
}

function DailyXAxis() {
  return (
    <XAxis
      dataKey="label"
      tick={AXIS_TICK}
      interval="preserveStartEnd"
      minTickGap={16}
      tickMargin={8}
    />
  );
}

function DailyYAxis() {
  return (
    <YAxis
      tick={AXIS_TICK}
      width={48}
      tickFormatter={(value: number) => formatAnalyticsNumber(value)}
    />
  );
}

export type DailyChartPoint = AnalyticsDailyPoint & { label: string };

export function DailyPageViewsChart({
  data,
  heightClassName,
}: {
  data: DailyChartPoint[];
  heightClassName?: string;
}) {
  return (
    <AnalyticsChartCard
      title="Daily page views"
      description="Total page loads per day"
      heightClassName={heightClassName}
    >
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <DailyXAxis />
            <DailyYAxis />
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
        <ChartEmpty title="No daily page view data" />
      )}
    </AnalyticsChartCard>
  );
}

export function DailyActiveUsersChart({
  data,
  heightClassName,
}: {
  data: DailyChartPoint[];
  heightClassName?: string;
}) {
  return (
    <AnalyticsChartCard
      title="Daily active users"
      description="Unique engaged users per day"
      heightClassName={heightClassName}
    >
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <DailyXAxis />
            <DailyYAxis />
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
        <ChartEmpty title="No daily active user data" />
      )}
    </AnalyticsChartCard>
  );
}

export function DailySessionsChart({
  data,
  heightClassName,
}: {
  data: DailyChartPoint[];
  heightClassName?: string;
}) {
  return (
    <AnalyticsChartCard
      title="Daily sessions"
      description="Visits per day"
      heightClassName={heightClassName}
    >
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <DailyXAxis />
            <DailyYAxis />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="sessions"
              name="Sessions"
              stroke={CHART_COLORS.sessions}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <ChartEmpty title="No daily session data" />
      )}
    </AnalyticsChartCard>
  );
}

export function CombinedDailyTrendChart({
  data,
  heightClassName,
}: {
  data: DailyChartPoint[];
  heightClassName?: string;
}) {
  return (
    <AnalyticsChartCard
      title="Combined daily trend"
      description="Page views, active users, and sessions"
      heightClassName={heightClassName}
    >
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <DailyXAxis />
            <DailyYAxis />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              verticalAlign="top"
              height={28}
              iconType="line"
              wrapperStyle={{ fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="pageViews"
              name="Page views"
              stroke={CHART_COLORS.pageViews}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="activeUsers"
              name="Active users"
              stroke={CHART_COLORS.activeUsers}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="sessions"
              name="Sessions"
              stroke={CHART_COLORS.sessions}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <ChartEmpty title="No daily trend data" />
      )}
    </AnalyticsChartCard>
  );
}

export function TopPagesBarChart({
  pages,
  heightClassName,
}: {
  pages: AnalyticsTopPage[];
  heightClassName?: string;
}) {
  const chartData = pages.slice(0, 10).map((page) => ({
    ...page,
    label: truncateAnalyticsLabel(page.title || page.path, 28),
  }));

  return (
    <AnalyticsChartCard
      title="Top pages by page views"
      description="Most viewed public pages"
      heightClassName={heightClassName}
    >
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              type="number"
              tick={AXIS_TICK}
              tickFormatter={(value: number) => formatAnalyticsNumber(value)}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={120}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
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
        <ChartEmpty title="No top page data" />
      )}
    </AnalyticsChartCard>
  );
}

export function TrafficSourcesBarChart({
  sources,
  heightClassName,
}: {
  sources: AnalyticsTrafficSource[];
  heightClassName?: string;
}) {
  const chartData = sources.map((source) => ({
    ...source,
    label: truncateAnalyticsLabel(source.source, 22),
  }));

  return (
    <AnalyticsChartCard
      title="Traffic sources by sessions"
      description="Where visits come from"
      heightClassName={heightClassName}
    >
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 12, left: 0, bottom: 48 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              interval={0}
              angle={-28}
              height={56}
              textAnchor="end"
              minTickGap={0}
            />
            <YAxis
              tick={AXIS_TICK}
              width={48}
              tickFormatter={(value: number) => formatAnalyticsNumber(value)}
            />
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
        <ChartEmpty title="No traffic source data" />
      )}
    </AnalyticsChartCard>
  );
}

export function CountriesBarChart({
  countries,
  heightClassName,
}: {
  countries: AnalyticsCountry[];
  heightClassName?: string;
}) {
  const chartData = countries.map((country) => ({
    ...country,
    label: truncateAnalyticsLabel(
      formatAnalyticsCountryLabel(country.country),
      20,
    ),
  }));

  return (
    <AnalyticsChartCard
      title="Countries by active users"
      description="Geographic reach"
      heightClassName={heightClassName}
    >
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 12, left: 0, bottom: 48 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              interval={0}
              angle={-28}
              height={56}
              textAnchor="end"
              minTickGap={0}
            />
            <YAxis
              tick={AXIS_TICK}
              width={48}
              tickFormatter={(value: number) => formatAnalyticsNumber(value)}
            />
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
        <ChartEmpty title="No country data" />
      )}
    </AnalyticsChartCard>
  );
}
