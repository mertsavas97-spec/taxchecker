'use client';

import { ExternalLinkIcon } from 'lucide-react';

import { AdminEmptyState } from '@/components/admin/admin-empty-state';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { isInternalAnalyticsPath } from '@/lib/analytics/filters';
import {
  formatAnalyticsCountryLabel,
  formatAnalyticsNumber,
  formatAnalyticsTableDate,
  truncateAnalyticsLabel,
} from '@/lib/analytics/format';
import type {
  AnalyticsCountry,
  AnalyticsDailyPoint,
  AnalyticsTopPage,
  AnalyticsTrafficSource,
} from '@/lib/analytics/types';

function AnalyticsTableSection({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions}
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-tc-sm">
        {children}
      </div>
    </section>
  );
}

function StickyTableHeader({ children }: { children: React.ReactNode }) {
  return (
    <TableHeader className="sticky top-0 z-10 bg-card">
      {children}
    </TableHeader>
  );
}

export function InternalTrafficToggle({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
      <input
        type="checkbox"
        className="size-3.5 rounded border-border accent-primary"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
      />
      <Label className="cursor-pointer text-xs font-normal text-muted-foreground">
        Include internal/admin traffic
      </Label>
    </label>
  );
}

export function DailyPerformanceTable({ daily }: { daily: AnalyticsDailyPoint[] }) {
  const rows = [...daily].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <AnalyticsTableSection
      title="Daily performance"
      description="Day-by-day metrics for the selected range"
    >
      {rows.length > 0 ? (
        <div className="max-h-[32rem] overflow-auto">
          <Table>
            <StickyTableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Page views</TableHead>
                <TableHead className="text-right">Active users</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
              </TableRow>
            </StickyTableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.date}>
                  <TableCell className="font-medium">
                    {formatAnalyticsTableDate(row.date)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatAnalyticsNumber(row.pageViews)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatAnalyticsNumber(row.activeUsers)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatAnalyticsNumber(row.sessions)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <AdminEmptyState title="No daily data" className="border-0 shadow-none" />
      )}
    </AnalyticsTableSection>
  );
}

export function TopPagesTable({
  pages,
  compact = false,
}: {
  pages: AnalyticsTopPage[];
  compact?: boolean;
}) {
  const visiblePages = compact ? pages.slice(0, 5) : pages;

  return (
    <AnalyticsTableSection
      title={compact ? 'Top pages' : 'Top pages'}
      description={
        compact
          ? 'Most viewed pages in this period'
          : 'Page titles, paths, and engagement'
      }
    >
      {visiblePages.length > 0 ? (
        <div className={compact ? undefined : 'max-h-[32rem] overflow-auto'}>
          <Table>
            <StickyTableHeader>
              <TableRow>
                <TableHead>Page title</TableHead>
                <TableHead>Path</TableHead>
                <TableHead className="text-right">Page views</TableHead>
                <TableHead className="text-right">Active users</TableHead>
                {!compact ? <TableHead className="w-16 text-right">Open</TableHead> : null}
              </TableRow>
            </StickyTableHeader>
            <TableBody>
              {visiblePages.map((page) => {
                const fullTitle = page.title || page.path;
                const canOpen = !isInternalAnalyticsPath(page.path);

                return (
                  <TableRow key={`${page.path}-${page.title}`}>
                    <TableCell className="max-w-[16rem] font-medium">
                      <span className="block truncate" title={fullTitle}>
                        {truncateAnalyticsLabel(fullTitle, 48)}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[12rem] text-muted-foreground">
                      <span className="block truncate font-mono text-xs" title={page.path}>
                        {page.path}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatAnalyticsNumber(page.pageViews)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatAnalyticsNumber(page.activeUsers)}
                    </TableCell>
                    {!compact ? (
                      <TableCell className="text-right">
                        {canOpen ? (
                          <a
                            href={page.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-muted-foreground transition-colors hover:text-foreground"
                            aria-label={`Open ${fullTitle}`}
                          >
                            <ExternalLinkIcon className="size-3.5" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    ) : null}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <AdminEmptyState title="No top pages" className="border-0 shadow-none" />
      )}
    </AnalyticsTableSection>
  );
}

export function TrafficSourcesTable({
  sources,
  compact = false,
}: {
  sources: AnalyticsTrafficSource[];
  compact?: boolean;
}) {
  const visibleSources = compact ? sources.slice(0, 5) : sources;

  return (
    <AnalyticsTableSection
      title="Traffic sources"
      description={compact ? 'Top acquisition channels' : 'Sessions and users by source'}
    >
      {visibleSources.length > 0 ? (
        <div className={compact ? undefined : 'max-h-[24rem] overflow-auto'}>
          <Table>
            <StickyTableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
                <TableHead className="text-right">Active users</TableHead>
              </TableRow>
            </StickyTableHeader>
            <TableBody>
              {visibleSources.map((source) => (
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
        </div>
      ) : (
        <AdminEmptyState
          title="No traffic sources"
          className="border-0 shadow-none"
        />
      )}
    </AnalyticsTableSection>
  );
}

export function CountriesTable({
  countries,
  compact = false,
}: {
  countries: AnalyticsCountry[];
  compact?: boolean;
}) {
  const visibleCountries = compact ? countries.slice(0, 5) : countries;

  return (
    <AnalyticsTableSection
      title="Countries"
      description={compact ? 'Top countries by users' : 'Geographic breakdown'}
    >
      {visibleCountries.length > 0 ? (
        <div className={compact ? undefined : 'max-h-[24rem] overflow-auto'}>
          <Table>
            <StickyTableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Active users</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
              </TableRow>
            </StickyTableHeader>
            <TableBody>
              {visibleCountries.map((country) => (
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
        </div>
      ) : (
        <AdminEmptyState title="No country data" className="border-0 shadow-none" />
      )}
    </AnalyticsTableSection>
  );
}
