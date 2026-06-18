import Link from 'next/link';
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  BookOpenIcon,
  ScaleIcon,
} from 'lucide-react';

import { HeroPreviewCard } from '@/components/home/hero-preview-card';
import { CategoryCard } from '@/components/hub/category-card';
import { CalculatorCard } from '@/components/hub/calculator-card';
import { ResourcePreviewCard } from '@/components/hub/resource-card';
import { CalculatorTrustIndicators } from '@/components/calculator/trust-indicators';
import { PageContainer, Section } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import {
  calculatorHubCategories,
  getAllHubCalculators,
} from '@/config/calculator-hub';
import { getLatestResources } from '@/config/resource-hub';
import { site } from '@/config/site';
import { cn } from '@/lib/utils';

const heroTrustItems = [
  'Federal rules from IRS publications',
  'Federal estimate only',
  'No signup required',
  'Runs locally in your browser',
] as const;

const popularPaths = [
  { label: 'Self-employed tax', href: '/calculators/self-employed-tax' },
  { label: 'Quarterly payments', href: '/calculators/quarterly-tax' },
  { label: '1099 contractor tax', href: '/calculators/1099-tax' },
  { label: 'LLC vs S Corp', href: '/calculators/llc-vs-scorp' },
] as const;

const popularGuides = [
  { label: 'Self-employment tax guide', href: '/resources/self-employment-tax-guide' },
  { label: 'Quarterly due dates', href: '/resources/quarterly-tax-due-dates-2025' },
  { label: '2025 tax brackets', href: '/resources/tax-brackets-2025' },
] as const;

export function HomeHero() {
  return (
    <Section spacing="xs" className="border-b border-border bg-tc-slate-50/60">
      <PageContainer width="page">
        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8">
          <div className="space-y-4">
            <p className="tc-overline">Federal tax estimates</p>
            <h1 className="tc-heading-page text-foreground">
              Federal tax estimates you can verify.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
              Free calculators and planning tools built from IRS publications.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button asChild>
                <Link href="/calculators">
                  Browse Calculators
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/resources">Browse resources</Link>
              </Button>
            </div>
            <CalculatorTrustIndicators items={[...heroTrustItems]} />
          </div>
          <HeroPreviewCard className="lg:max-w-md lg:justify-self-end lg:w-full" />
        </div>
      </PageContainer>
    </Section>
  );
}

export function HomeCategories() {
  return (
    <Section spacing="sm" id="categories">
      <PageContainer width="page" className="space-y-4">
        <div className="max-w-2xl space-y-1">
          <h2 className="tc-heading-section">Calculator categories</h2>
          <p className="text-sm text-muted-foreground">
            Jump into the area that matches your tax question.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {calculatorHubCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </PageContainer>
    </Section>
  );
}

export function HomeFeaturedCalculators() {
  const calculators = getAllHubCalculators();

  return (
    <Section spacing="sm" className="border-y border-border bg-muted/15">
      <PageContainer width="page" className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-1">
            <h2 className="tc-heading-section">Featured calculators</h2>
            <p className="text-sm text-muted-foreground">
              Eight free tools for self-employment, quarterly payments, entity
              comparisons, HSA savings, and employment scenarios.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/calculators">View all calculators</Link>
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {calculators.map((calculator) => (
            <CalculatorCard key={calculator.slug} calculator={calculator} />
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Popular paths:{' '}
          {popularPaths.map((path, index) => (
            <span key={path.href}>
              {index > 0 ? ' · ' : null}
              <Link
                href={path.href}
                className="font-medium text-tc-link no-underline hover:underline"
              >
                {path.label}
              </Link>
            </span>
          ))}
        </p>
      </PageContainer>
    </Section>
  );
}

export function HomeLatestResources() {
  const resources = getLatestResources(4);

  return (
    <Section spacing="sm">
      <PageContainer width="page" className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-1">
            <h2 className="tc-heading-section">Latest resources</h2>
            <p className="text-sm text-muted-foreground">
              Guides and reference articles from IRS publications for self-employment,
              quarterly payments, and federal tax planning.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/resources">Browse all resources</Link>
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {resources.map((resource) => (
            <ResourcePreviewCard key={resource.slug} resource={resource} />
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Start with:{' '}
          {popularGuides.map((guide, index) => (
            <span key={guide.href}>
              {index > 0 ? ' · ' : null}
              <Link
                href={guide.href}
                className="font-medium text-tc-link no-underline hover:underline"
              >
                {guide.label}
              </Link>
            </span>
          ))}
        </p>
      </PageContainer>
    </Section>
  );
}

const whyItems = [
  {
    title: 'Independent',
    description: 'Not affiliated with the IRS or any tax prep chain.',
    icon: ScaleIcon,
  },
  {
    title: 'IRS Documentation',
    description: 'Federal constants traced to IRS publications and forms.',
    icon: BadgeCheckIcon,
  },
  {
    title: 'Planning Focused',
    description: 'Planning estimates — not individualized tax advice.',
    icon: BookOpenIcon,
  },
] as const;

export function HomeWhyTaxChecker() {
  return (
    <Section spacing="sm" id="why-taxchecker">
      <PageContainer width="page" className="space-y-4">
        <div className="max-w-2xl space-y-1">
          <h2 className="tc-heading-section">Why TaxChecker</h2>
          <p className="text-sm text-muted-foreground">
            Built for planning clarity—not filing returns or replacing a CPA.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {whyItems.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-xl border border-border bg-card p-5 text-center shadow-tc-sm"
              >
                <span className="mx-auto flex size-10 items-center justify-center rounded-lg border border-tc-brand/15 bg-tc-brand/5 text-tc-brand">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-3 text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </PageContainer>
    </Section>
  );
}

const methodologyPoints = [
  {
    title: 'IRS documentation',
    description:
      'Constants come from IRS publications, forms, and revenue procedures.',
  },
  {
    title: 'Annual updates',
    description:
      'Each calculator shows its tax year and last reviewed date.',
  },
  {
    title: 'Known exclusions',
    description:
      'State taxes, many credits, AMT, and complex return items are out of scope.',
  },
  {
    title: 'Estimate-only philosophy',
    description:
      'Results are planning estimates—review with a tax professional before filing.',
  },
] as const;

export function HomeMethodology() {
  return (
    <Section spacing="sm" className="border-t border-border bg-gradient-to-b from-card/40 to-tc-slate-50/40">
      <PageContainer width="page" className="space-y-4">
        <div className="max-w-2xl space-y-1">
          <h2 className="tc-heading-section">Methodology</h2>
          <p className="text-sm text-muted-foreground">
            How estimates are built—and what they intentionally omit.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-tc-sm">
          <ol className="grid gap-3 md:grid-cols-2">
            {methodologyPoints.map((point, index) => (
              <li key={point.title} className="flex gap-2.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-tc-brand text-[11px] font-semibold text-tc-brand-foreground">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {point.title}
                  </h3>
                  <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                    {point.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <Button variant="outline" size="sm" asChild>
            <Link href="/methodology">View methodology</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/resources">Browse resources</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/sources">View sources</Link>
          </Button>
        </div>

        <p className={cn('tc-caption max-w-3xl border-t border-border/70 pt-3')}>
          {site.disclaimer}
        </p>
      </PageContainer>
    </Section>
  );
}
