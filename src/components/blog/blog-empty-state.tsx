import Link from 'next/link';
import { ArrowRightIcon, BookOpenIcon, CalculatorIcon, FileTextIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function BlogEmptyState() {
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-border bg-card px-6 py-12 text-center shadow-tc-sm sm:px-10">
      <span className="mx-auto flex size-14 items-center justify-center rounded-xl border border-border bg-tc-slate-50 text-tc-brand">
        <FileTextIcon className="size-7" aria-hidden />
      </span>
      <p className="tc-overline mt-5 text-tc-brand">TaxChecker Blog</p>
      <h2 className="tc-heading-subsection mt-2 text-foreground">Articles coming soon</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
        We&apos;re preparing federal tax updates, freelancer planning notes, and
        IRS-related explainers. In the meantime, explore our reviewed guides and
        free calculators.
      </p>
      <div className="mt-6 flex flex-col items-stretch gap-2 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/resources">
            <BookOpenIcon data-icon="inline-start" />
            Explore Resources
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/calculators">
            <CalculatorIcon data-icon="inline-start" />
            Browse Calculators
          </Link>
        </Button>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Draft posts are managed in admin and are not shown here until published.
      </p>
    </div>
  );
}

export function BlogFilterEmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-center">
      <p className="text-sm text-muted-foreground">
        No blog posts match your search. Try a different keyword or category.
      </p>
      <Link
        href="/resources"
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-tc-link no-underline hover:underline"
      >
        Explore resources instead
        <ArrowRightIcon className="size-3.5" aria-hidden />
      </Link>
    </div>
  );
}
