import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';

import { CalculatorTopicIcon } from '@/components/calculator/calculator-topic-icon';
import type { HubCategory } from '@/config/calculator-hub';
import { getCalculatorsForHubCategory } from '@/config/calculator-hub';
import type { HubCategoryId } from '@/config/calculator-hub';
import { cn } from '@/lib/utils';

const categoryDescriptions: Record<HubCategoryId, string> = {
  'self-employment':
    'SE tax, 1099 income, quarterly payments, and annual estimated tax.',
  'business-structures':
    'Compare S corporation salary splits and LLC vs S Corp federal taxes.',
  'health-savings':
    'Model HSA contribution limits and federal tax savings.',
  employment: 'Compare W-2 employee vs 1099 contractor take-home value.',
};

export function CategoryCard({
  category,
  className,
}: {
  category: HubCategory;
  className?: string;
}) {
  const calculators = getCalculatorsForHubCategory(category.id);
  const count = calculators.length;
  const leadSlug = category.slugs[0];

  return (
    <Link
      href={`/calculators?category=${category.id}`}
      className={cn(
        'group flex h-full flex-col rounded-lg border border-border bg-card p-3.5 no-underline shadow-tc-sm transition-all hover:border-tc-brand/25 hover:shadow-tc-md sm:p-4',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <CalculatorTopicIcon
          slug={leadSlug}
          size="sm"
          className="transition-colors group-hover:bg-tc-brand/10"
        />
        <span className="rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {count} {count === 1 ? 'calculator' : 'calculators'}
        </span>
      </div>

      <h3 className="mt-2.5 text-base font-semibold tracking-tight text-foreground group-hover:text-tc-link">
        {category.label}
      </h3>
      <p className="mt-1 flex-1 text-xs leading-snug text-muted-foreground sm:text-sm">
        {categoryDescriptions[category.id]}
      </p>

      <span className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-tc-link sm:text-sm">
        Browse category
        <ArrowRightIcon
          className="size-3 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </Link>
  );
}
