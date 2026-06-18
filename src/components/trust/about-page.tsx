import Link from 'next/link';
import {
  ArrowRightIcon,
  CalculatorIcon,
  FileTextIcon,
  GraduationCapIcon,
  LandmarkIcon,
  LibraryIcon,
  BookOpenIcon,
  ScaleIcon,
  ShieldCheckIcon,
} from 'lucide-react';

import { CalculatorTrustIndicators } from '@/components/calculator/trust-indicators';
import { PageContainer, Section } from '@/components/layout/page-container';
import { SiteShell } from '@/components/layout/site-shell';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { Button } from '@/components/ui/button';
import { JsonLd } from '@/components/seo/json-ld';
import { authorityCopy, authorityRoutes } from '@/config/authority';
import {
  METHODOLOGY_LINK_HREF,
  METHODOLOGY_LINK_LABEL,
} from '@/config/related-content';
import { getTrustPageBySlug } from '@/config/trust-pages';
import { formatLegalOperatorLine } from '@/config/legal-entity';
import { site } from '@/config/site';
import { aboutAuthoritySections } from '@/lib/authority/about-authority-content';
import {
  formatLastReviewedLabel,
} from '@/lib/calculators/metadata-labels';
import {
  getLatestCalculatorReviewDate,
  getPrimaryTaxYear,
} from '@/lib/authority/review-dates';
import { buildTrustPageJsonLd } from '@/lib/seo/schema';

const taxYear = getPrimaryTaxYear();
const latestReview = getLatestCalculatorReviewDate();

const heroTrustItems = [
  authorityCopy.federalTaxYearCoverage(taxYear),
  authorityCopy.irsSourceDocumentation,
  authorityCopy.noSignupRequired,
  formatLastReviewedLabel(latestReview),
] as const;

const publishCards = [
  {
    title: 'Calculators',
    description:
      'Free federal tax calculators for self-employment, quarterly payments, entity comparisons, and related planning scenarios.',
    href: '/calculators',
    icon: CalculatorIcon,
  },
  {
    title: 'Resources',
    description:
      'Guides, deadline references, and educational articles based on documented federal tax rules and IRS primary sources.',
    href: '/resources',
    icon: LibraryIcon,
  },
  {
    title: 'Blog Articles',
    description:
      'Federal tax updates and planning explainers reviewed against public IRS sources where applicable.',
    href: '/blog',
    icon: FileTextIcon,
  },
  {
    title: 'Methodology',
    description:
      'How estimates are built, which IRS sources are used, and what each calculator intentionally excludes.',
    href: METHODOLOGY_LINK_HREF,
    icon: BookOpenIcon,
  },
] as const;

export function AboutPage() {
  const page = getTrustPageBySlug('about')!;
  const jsonLd = buildTrustPageJsonLd(page);

  return (
    <SiteShell>
      <JsonLd data={jsonLd} id="about" />

      <Section spacing="xs" className="border-b border-border bg-tc-slate-50/60">
        <PageContainer width="page">
          <header className="max-w-[56rem] space-y-3">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'About' },
              ]}
            />
            <div className="space-y-2">
              <p className="tc-overline">About TaxChecker</p>
              <h1 className="tc-heading-page text-foreground">About TaxChecker</h1>
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Federal tax calculators and educational resources built from documented IRS
                sources with tax year and last reviewed metadata on every ready calculator.
              </p>
            </div>
            <CalculatorTrustIndicators items={[...heroTrustItems]} />
            <p className="text-xs text-muted-foreground">
              Last updated {page.lastUpdated} · {formatLastReviewedLabel(latestReview)}
            </p>
          </header>
        </PageContainer>
      </Section>

      <Section spacing="sm">
        <PageContainer width="page" className="max-w-[56rem] space-y-8">
          <section className="space-y-3">
            <h2 className="tc-heading-subsection text-foreground">Mission</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              TaxChecker exists to help taxpayers understand federal tax mechanics before
              filing. We publish planning tools and educational content so you can see how
              self-employment tax, quarterly payments, and related federal rules may apply
              to your situation—before you rely on a return or a professional review.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4 shadow-tc-sm">
                <h3 className="text-sm font-semibold text-foreground">TaxChecker is</h3>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
                  <li>Planning-focused</li>
                  <li>Transparent about IRS sources and exclusions</li>
                  <li>Documented with tax year and last reviewed dates</li>
                </ul>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 shadow-tc-sm">
                <h3 className="text-sm font-semibold text-foreground">TaxChecker is not</h3>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
                  <li>Tax filing software</li>
                  <li>Tax preparation software</li>
                  <li>A CPA or enrolled agent service</li>
                  <li>A legal service</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="tc-heading-subsection text-foreground">What we publish</h2>
              <p className="text-sm text-muted-foreground">
                Four content types, each tied to documented federal tax methodology.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {publishCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.title}
                    href={card.href}
                    className="group rounded-xl border border-border bg-card p-4 no-underline shadow-tc-sm transition-all hover:border-tc-brand/25 hover:shadow-tc-md"
                  >
                    <span className="flex size-9 items-center justify-center rounded-lg border border-tc-brand/15 bg-tc-brand/5 text-tc-brand">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <h3 className="mt-3 text-base font-semibold text-foreground group-hover:text-tc-link">
                      {card.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {card.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>

          {aboutAuthoritySections.map((section) => (
            <section key={section.id} id={section.id} className="space-y-3">
              <h2 className="tc-heading-subsection text-foreground">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-sm leading-relaxed text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}
              {section.list ? (
                <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {section.href && section.linkLabel ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={section.href}>
                    {section.linkLabel}
                    <ArrowRightIcon data-icon="inline-end" />
                  </Link>
                </Button>
              ) : null}
            </section>
          ))}

          <section className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-tc-brand/15 bg-tc-brand/5 text-tc-brand">
                <ScaleIcon className="size-4" aria-hidden />
              </span>
              <div className="space-y-2">
                <h2 className="tc-heading-subsection text-foreground">Independence</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  TaxChecker is not affiliated with the IRS, tax preparation companies, or
                  CPA firms. We do not accept payment for calculator placement, sponsored
                  rankings, or paid editorial coverage. Calculator order and featured
                  placement reflect editorial relevance—not advertising relationships.
                </p>
                <ul className="grid gap-2 sm:grid-cols-3">
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <LandmarkIcon className="size-3.5 shrink-0 text-tc-brand" aria-hidden />
                    Not affiliated with the IRS
                  </li>
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheckIcon className="size-3.5 shrink-0 text-tc-brand" aria-hidden />
                    No sponsored rankings
                  </li>
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <GraduationCapIcon className="size-3.5 shrink-0 text-tc-brand" aria-hidden />
                    Estimate-only positioning
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-tc-brand/15 bg-tc-brand/5 p-5">
            <h2 className="text-base font-semibold text-foreground">Questions?</h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Reach us about the website, calculators, methodology, or source documentation.
              We cannot provide individualized tax advice through contact inquiries.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/contact">Contact TaxChecker</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={authorityRoutes.sources}>View sources</Link>
              </Button>
            </div>
          </section>

          <p className="border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
            {formatLegalOperatorLine()}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {METHODOLOGY_LINK_LABEL}:{' '}
            <Link href={METHODOLOGY_LINK_HREF} className="text-tc-link no-underline hover:underline">
              {METHODOLOGY_LINK_HREF}
            </Link>
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">{site.disclaimer}</p>
        </PageContainer>
      </Section>
    </SiteShell>
  );
}
