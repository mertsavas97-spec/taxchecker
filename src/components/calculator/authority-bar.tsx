import Link from 'next/link';
import {
  BookOpenIcon,
  CalendarIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
} from 'lucide-react';

import { authorityCopy, authorityRoutes } from '@/config/authority';
import {
  formatLastReviewedLabel,
  formatTaxYearLabel,
} from '@/lib/calculators/metadata-labels';
import { cn } from '@/lib/utils';

export interface AuthorityBarProps {
  taxYear: number;
  lastReviewed: string;
  className?: string;
}

export function AuthorityBar({
  taxYear,
  lastReviewed,
  className,
}: AuthorityBarProps) {
  return (
    <div
      className={cn('tc-trust-bar', className)}
      aria-label="Calculator authority and review details"
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
          {authorityCopy.federalEstimatesOnly}
        </span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <CalendarIcon className="size-3.5 shrink-0 text-tc-brand" aria-hidden />
        <span>{formatTaxYearLabel(taxYear)}</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <RefreshCwIcon className="size-3.5 shrink-0 text-tc-brand" aria-hidden />
        <span>{formatLastReviewedLabel(lastReviewed)}</span>
      </span>
    </div>
  );
}
