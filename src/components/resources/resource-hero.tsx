import Link from 'next/link';
import {
  BookOpenIcon,
  CalendarIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
} from 'lucide-react';

import { authorityCopy, authorityRoutes } from '@/config/authority';
import { getResourceCategoryLabel } from '@/config/resource-hub';
import type { ResourceDefinition } from '@/config/resources';
import {
  formatLastReviewedLabel,
  formatTaxYearLabel,
} from '@/lib/calculators/metadata-labels';
import { cn } from '@/lib/utils';

export function ResourceHero({ resource }: { resource: ResourceDefinition }) {
  const categoryLabel = getResourceCategoryLabel(resource.category);

  return (
    <header className="max-w-3xl space-y-1.5">
      <p className="tc-overline">{categoryLabel}</p>
      <h1 className="tc-heading-page text-foreground">{resource.title}</h1>
      <p className="text-base leading-relaxed text-muted-foreground">
        {resource.description}
      </p>
    </header>
  );
}

export function ResourceMetadataBar({
  resource,
  className,
}: {
  resource: ResourceDefinition;
  className?: string;
}) {
  return (
    <div
      className={cn('tc-trust-bar', className)}
      aria-label="Resource review and reference details"
    >
      <Link
        href={authorityRoutes.sources}
        className="tc-focus-ring inline-flex items-center gap-1.5 rounded-sm no-underline transition-colors hover:text-tc-link"
      >
        <BookOpenIcon className="size-3.5 shrink-0 text-tc-brand" aria-hidden />
        <span className="font-medium text-foreground">
          {authorityCopy.irsSourceDocumentation}
        </span>
      </Link>
      <span className="inline-flex items-center gap-1.5">
        <ShieldCheckIcon className="size-3.5 shrink-0 text-tc-brand" aria-hidden />
        <span className="font-medium text-foreground">
          {authorityCopy.educationalReference}
        </span>
      </span>
      {resource.taxYear ? (
        <span className="inline-flex items-center gap-1.5">
          <CalendarIcon className="size-3.5 shrink-0 text-tc-brand" aria-hidden />
          <span>{formatTaxYearLabel(resource.taxYear)}</span>
        </span>
      ) : null}
      <span className="inline-flex items-center gap-1.5">
        <RefreshCwIcon className="size-3.5 shrink-0 text-tc-brand" aria-hidden />
        <span>{formatLastReviewedLabel(resource.lastReviewed)}</span>
      </span>
    </div>
  );
}
