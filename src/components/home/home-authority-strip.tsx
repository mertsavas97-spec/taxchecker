import Link from 'next/link';
import {
  BookOpenIcon,
  CalendarIcon,
  RefreshCwIcon,
  UserXIcon,
} from 'lucide-react';

import { PageContainer } from '@/components/layout/page-container';
import { authorityCopy, authorityRoutes } from '@/config/authority';
import {
  formatLastReviewedLabel,
} from '@/lib/calculators/metadata-labels';
import {
  getLatestCalculatorReviewDate,
  getPrimaryTaxYear,
} from '@/lib/authority/review-dates';
import { cn } from '@/lib/utils';

const taxYear = getPrimaryTaxYear();
const latestReview = getLatestCalculatorReviewDate();

const stripItems = [
  {
    icon: CalendarIcon,
    label: authorityCopy.federalTaxYearCoverage(taxYear),
  },
  {
    icon: BookOpenIcon,
    label: authorityCopy.irsSourceDocumentation,
    href: authorityRoutes.sources,
  },
  {
    icon: UserXIcon,
    label: authorityCopy.noSignupRequired,
  },
  {
    icon: RefreshCwIcon,
    label: formatLastReviewedLabel(latestReview),
    href: authorityRoutes.editorialStandards,
  },
] as const;

export function HomeAuthorityStrip({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'border-b border-border bg-card/80',
        className,
      )}
    >
      <PageContainer width="page" className="py-3">
        <ul className="flex items-center gap-x-5 gap-y-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
          {stripItems.map((item) => {
            const Icon = item.icon;
            const content = (
              <>
                <Icon className="size-3.5 shrink-0 text-tc-brand" aria-hidden />
                <span className="font-medium text-foreground">{item.label}</span>
              </>
            );

            return (
              <li key={item.label}>
                {'href' in item && item.href ? (
                  <Link
                    href={item.href}
                    className="tc-focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-sm text-xs text-muted-foreground no-underline transition-colors hover:text-tc-link"
                  >
                    {content}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    {content}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </PageContainer>
    </div>
  );
}
