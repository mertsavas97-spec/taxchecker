import Link from 'next/link';
import { ArrowRightIcon, BookOpenIcon, ClockIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getResourceCategoryLabel } from '@/config/resource-hub';
import {
  isResourcePublished,
  type ResourceDefinition,
} from '@/config/resources';
import {
  formatLastReviewedLabel,
  formatTaxYearLabel,
} from '@/lib/calculators/metadata-labels';
import {
  formatResourceStatusLabel,
} from '@/lib/resources/metadata-labels';
import { cn } from '@/lib/utils';

const statusStyles = {
  published: 'border-tc-savings/30 bg-tc-savings-muted/50 text-tc-savings',
  coming_soon: 'border-border bg-muted/80 text-muted-foreground',
} as const;

function ResourceCardContent({
  resource,
  showReadAction = true,
}: {
  resource: ResourceDefinition;
  showReadAction?: boolean;
}) {
  const categoryLabel = getResourceCategoryLabel(resource.category);
  const published = isResourcePublished(resource);

  return (
    <Card
      size="sm"
      className={cn(
        'flex h-full flex-col border-border bg-card py-0 shadow-tc-sm transition-all',
        published && 'group-hover:border-tc-brand/30 group-hover:shadow-tc-md',
        !published && 'opacity-95',
      )}
    >
      <CardHeader className="gap-2 border-b border-border/60 bg-muted/20 pb-3">
        <div className="flex items-center justify-between gap-2">
          <p className="tc-overline text-tc-brand">{categoryLabel}</p>
          {!published ? (
            <Badge
              variant="outline"
              className={cn(
                'shrink-0 text-[10px] font-semibold uppercase tracking-wide',
                statusStyles.coming_soon,
              )}
            >
              {formatResourceStatusLabel(resource.status)}
            </Badge>
          ) : (
            <span className="flex size-7 items-center justify-center rounded-md border border-tc-brand/15 bg-tc-brand/5 text-tc-brand">
              <BookOpenIcon className="size-3.5" aria-hidden />
            </span>
          )}
        </div>
        <CardTitle
          className={cn(
            'text-base leading-snug font-semibold tracking-tight',
            published
              ? 'text-foreground group-hover:text-tc-link'
              : 'text-muted-foreground',
          )}
        >
          {resource.shortTitle}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 pt-3">
        <p className="line-clamp-3 flex-1 text-xs leading-relaxed text-muted-foreground">
          {resource.description}
        </p>
        <dl className="grid gap-1.5 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ClockIcon className="size-3 shrink-0" aria-hidden />
            <dt className="sr-only">Reading time</dt>
            <dd>{resource.readingTime}</dd>
          </div>
          <div>
            <dt className="sr-only">Last reviewed</dt>
            <dd>{formatLastReviewedLabel(resource.lastReviewed)}</dd>
          </div>
          {resource.taxYear !== undefined ? (
            <div>
              <dt className="sr-only">Tax year</dt>
              <dd>{formatTaxYearLabel(resource.taxYear)}</dd>
            </div>
          ) : null}
        </dl>
      </CardContent>

      {published && showReadAction ? (
        <CardFooter className="border-t border-border/60 pt-3 pb-3">
          <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-tc-brand/20 bg-tc-brand/5 px-3 py-2 text-xs font-semibold text-tc-link transition-colors group-hover:border-tc-brand/35 group-hover:bg-tc-brand/10">
            Read article
            <ArrowRightIcon
              className="size-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        </CardFooter>
      ) : null}
    </Card>
  );
}

export function ResourceCard({
  resource,
  className,
  showReadAction = true,
}: {
  resource: ResourceDefinition;
  className?: string;
  showReadAction?: boolean;
}) {
  if (isResourcePublished(resource)) {
    return (
      <Link
        href={resource.route}
        className={cn('group block h-full no-underline', className)}
      >
        <ResourceCardContent resource={resource} showReadAction={showReadAction} />
      </Link>
    );
  }

  return (
    <div
      className={cn('block h-full', className)}
      aria-label={`${resource.title} — coming soon`}
    >
      <ResourceCardContent resource={resource} showReadAction={false} />
    </div>
  );
}

export function ResourcePreviewCard({
  resource,
  className,
}: {
  resource: ResourceDefinition;
  className?: string;
}) {
  const categoryLabel = getResourceCategoryLabel(resource.category);
  const published = isResourcePublished(resource);

  if (!published) return null;

  return (
    <Card
      size="sm"
      className={cn(
        'flex h-full flex-col border-border bg-card shadow-tc-sm',
        className,
      )}
    >
      <CardHeader className="gap-2 pb-2">
        <p className="tc-overline text-tc-brand">{categoryLabel}</p>
        <CardTitle className="text-base font-semibold tracking-tight">
          {resource.shortTitle}
        </CardTitle>
        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
          {resource.description}
        </p>
      </CardHeader>
      <CardContent className="mt-auto space-y-3 pt-0">
        <p className="text-[11px] text-muted-foreground">
          {resource.readingTime} · {formatLastReviewedLabel(resource.lastReviewed)}
        </p>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={resource.route}>
            Read article
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
