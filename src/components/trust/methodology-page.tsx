import Link from 'next/link';
import { BookOpenIcon, ShieldAlertIcon } from 'lucide-react';

import { PageContainer, Section } from '@/components/layout/page-container';
import { SiteShell } from '@/components/layout/site-shell';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { JsonLd } from '@/components/seo/json-ld';
import { getTrustPageBySlug } from '@/config/trust-pages';
import { site } from '@/config/site';
import { getTrustPageContent } from '@/lib/content/trust-page-content';
import { buildTrustPageJsonLd } from '@/lib/seo/schema';

const knownExclusions = [
  'Many tax credits and above-the-line adjustments',
  'Alternative minimum tax (AMT)',
  'Qualified Business Income (Section 199A) deduction',
  'Underpayment penalties (Form 2210)',
  'Complex multi-state or multi-entity situations',
] as const;

export function MethodologyPage() {
  const page = getTrustPageBySlug('methodology')!;
  const content = getTrustPageContent('methodology');
  const jsonLd = buildTrustPageJsonLd(page);

  return (
    <SiteShell>
      <JsonLd data={jsonLd} id="methodology" />

      <Section spacing="sm" className="border-b border-border bg-tc-slate-50/60">
        <PageContainer width="page">
          <header className="max-w-3xl space-y-2">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Methodology' },
              ]}
            />
            <p className="tc-overline">{content.eyebrow}</p>
            <h1 className="tc-heading-page text-foreground">{page.shortTitle}</h1>
            <p className="text-base leading-relaxed text-muted-foreground">{content.intro}</p>
          </header>
        </PageContainer>
      </Section>

      <Section spacing="default">
        <PageContainer width="page">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <article className="min-w-0 space-y-6">
              <ol className="space-y-5">
                {content.sections.map((section, index) => (
                  <li key={section.heading ?? index} className="flex gap-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-tc-brand text-sm font-semibold text-tc-brand-foreground">
                      {index + 1}
                    </span>
                    <div className="min-w-0 space-y-2 pt-0.5">
                      {section.heading ? (
                        <h2 className="text-base font-semibold text-foreground">
                          {section.heading}
                        </h2>
                      ) : null}
                      {section.paragraphs.map((paragraph) => (
                        <p
                          key={paragraph}
                          className="tc-prose-compact"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>

              <div className="space-y-2 border-t border-border pt-6">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {content.footer ?? site.disclaimer}
                </p>
                <p className="text-xs text-muted-foreground">
                  Last updated {page.lastUpdated}
                </p>
              </div>
            </article>

            <aside className="space-y-4 lg:sticky lg:top-24">
              <div className="rounded-xl border border-border bg-card p-4 shadow-tc-sm">
                <div className="flex items-start gap-2.5">
                  <BookOpenIcon className="mt-0.5 size-4 shrink-0 text-tc-brand" aria-hidden />
                  <div className="space-y-2">
                    <h2 className="text-sm font-semibold text-foreground">
                      IRS source documentation
                    </h2>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Rates, brackets, deductions, and limits are traced to IRS publications,
                      forms, notices, and revenue procedures for the labeled tax year.
                    </p>
                    <Link
                      href="/sources"
                      className="inline-block text-xs font-medium text-tc-link no-underline hover:underline"
                    >
                      View sources appendix →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-tc-warning/25 bg-tc-warning-muted/30 p-4 shadow-tc-sm">
                <div className="flex items-start gap-2.5">
                  <ShieldAlertIcon
                    className="mt-0.5 size-4 shrink-0 text-tc-warning"
                    aria-hidden
                  />
                  <div className="space-y-2">
                    <h2 className="text-sm font-semibold text-foreground">Known exclusions</h2>
                    <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                      {knownExclusions.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="text-tc-warning" aria-hidden>
                            ·
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </PageContainer>
      </Section>
    </SiteShell>
  );
}
