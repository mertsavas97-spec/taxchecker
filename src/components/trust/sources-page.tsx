import Link from 'next/link';
import { BookOpenIcon, FileTextIcon, RefreshCwIcon } from 'lucide-react';

import { PageContainer, Section } from '@/components/layout/page-container';
import { SiteShell } from '@/components/layout/site-shell';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { JsonLd } from '@/components/seo/json-ld';
import { authorityRoutes } from '@/config/authority';
import { getTrustPageBySlug } from '@/config/trust-pages';
import { site } from '@/config/site';
import {
  getPublicSourceRegistry,
  getSourcesByCategory,
  sourceUpdatePolicy,
  type SourceCategory,
} from '@/lib/authority/source-registry';
import { buildTrustPageJsonLd } from '@/lib/seo/schema';

const categoryHeadings: Record<SourceCategory, string> = {
  publication: 'IRS publications',
  form: 'IRS forms',
  'revenue-procedure': 'Revenue procedures',
  notice: 'IRS notices',
  topic: 'IRS topics',
  guide: 'IRS guides',
};

const categoryOrder: SourceCategory[] = [
  'publication',
  'form',
  'revenue-procedure',
  'notice',
  'topic',
  'guide',
];

function SourceTable({ category }: { category: SourceCategory }) {
  const entries = getSourcesByCategory(category);
  if (entries.length === 0) return null;

  return (
    <section className="space-y-3" id={category}>
      <h2 className="tc-heading-subsection text-foreground">
        {categoryHeadings[category]}
      </h2>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b border-border bg-tc-slate-50/80 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">Source</th>
              <th className="px-4 py-2.5 font-medium">Tax year</th>
              <th className="px-4 py-2.5 font-medium">Date accessed</th>
              <th className="px-4 py-2.5 font-medium">Used for</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((entry) => (
              <tr key={entry.id} className="align-top">
                <td className="px-4 py-3">
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-tc-link no-underline hover:underline"
                  >
                    {entry.title}
                  </a>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{entry.taxYear}</td>
                <td className="px-4 py-3 text-muted-foreground">{entry.dateAccessed}</td>
                <td className="px-4 py-3 text-muted-foreground">{entry.usedFor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function SourcesPage() {
  const page = getTrustPageBySlug('sources')!;
  const jsonLd = buildTrustPageJsonLd(page);
  const totalSources = getPublicSourceRegistry().length;

  return (
    <SiteShell>
      <JsonLd data={jsonLd} id="sources" />

      <Section spacing="sm" className="border-b border-border bg-tc-slate-50/60">
        <PageContainer width="page">
          <header className="max-w-3xl space-y-2">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Sources' },
              ]}
            />
            <p className="tc-overline">Source documentation</p>
            <h1 className="tc-heading-page text-foreground">{page.shortTitle}</h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              {page.description}
            </p>
            <p className="text-xs text-muted-foreground">
              {totalSources} primary IRS references · Last reviewed{' '}
              {sourceUpdatePolicy.lastReviewed} · Tax year {sourceUpdatePolicy.taxYear}
            </p>
          </header>
        </PageContainer>
      </Section>

      <Section spacing="default">
        <PageContainer width="page">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <article className="min-w-0 space-y-8">
              <p className="tc-prose-compact">
                TaxChecker documents IRS primary sources used for federal tax constants,
                due dates, and educational explanations. Source traceability is not IRS
                certification, approval, or endorsement.
              </p>

              {categoryOrder.map((category) => (
                <SourceTable key={category} category={category} />
              ))}

              <section className="space-y-3" id="update-policy">
                <h2 className="tc-heading-subsection text-foreground">
                  Source update policy
                </h2>
                <p className="tc-prose-compact">
                  {sourceUpdatePolicy.summary}
                </p>
                <ol className="tc-prose-compact list-decimal space-y-2 pl-5">
                  {sourceUpdatePolicy.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </section>

              <section className="space-y-3" id="methodology-references">
                <h2 className="tc-heading-subsection text-foreground">
                  Methodology references
                </h2>
                <ul className="tc-prose-compact space-y-2">
                  <li>
                    <Link
                      href={authorityRoutes.methodology}
                      className="font-medium text-tc-link no-underline hover:underline"
                    >
                      Methodology
                    </Link>
                    {' — '}
                    how estimates are produced and what is excluded
                  </li>
                  <li>
                    <Link
                      href={authorityRoutes.editorialStandards}
                      className="font-medium text-tc-link no-underline hover:underline"
                    >
                      Editorial standards
                    </Link>
                    {' — '}
                    content, review, and correction policies
                  </li>
                  <li>
                    <Link
                      href={authorityRoutes.about}
                      className="font-medium text-tc-link no-underline hover:underline"
                    >
                      About
                    </Link>
                    {' — '}
                    mission, independence, and federal scope
                  </li>
                </ul>
              </section>

              <div className="space-y-2 border-t border-border pt-6">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {site.disclaimer}
                </p>
                <p className="text-xs text-muted-foreground">
                  Last updated {page.lastUpdated}
                </p>
              </div>
            </article>

            <aside className="space-y-4 lg:sticky lg:top-24">
              <div className="rounded-xl border border-border bg-card p-4 shadow-tc-sm">
                <div className="flex items-start gap-2.5">
                  <RefreshCwIcon
                    className="mt-0.5 size-4 shrink-0 text-tc-brand"
                    aria-hidden
                  />
                  <div className="space-y-2">
                    <h2 className="text-sm font-semibold text-foreground">
                      Last reviewed against IRS sources
                    </h2>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Tax year {sourceUpdatePolicy.taxYear} constants were last reviewed on{' '}
                      {sourceUpdatePolicy.lastReviewed}. Calculator and resource pages display
                      their own last reviewed dates when content changes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-tc-sm">
                <div className="flex items-start gap-2.5">
                  <FileTextIcon className="mt-0.5 size-4 shrink-0 text-tc-brand" aria-hidden />
                  <div className="space-y-2">
                    <h2 className="text-sm font-semibold text-foreground">
                      Report a source issue
                    </h2>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      If you believe a cited IRS source is outdated, contact us with the
                      publication, form, or notice you believe should apply.
                    </p>
                    <Link
                      href="/contact"
                      className="inline-block text-xs font-medium text-tc-link no-underline hover:underline"
                    >
                      Contact TaxChecker →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-tc-sm">
                <div className="flex items-start gap-2.5">
                  <BookOpenIcon className="mt-0.5 size-4 shrink-0 text-tc-brand" aria-hidden />
                  <div className="space-y-2">
                    <h2 className="text-sm font-semibold text-foreground">On-page sources</h2>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Individual calculator and resource pages cite the IRS references used for
                      that topic inline.
                    </p>
                    <Link
                      href="/calculators"
                      className="inline-block text-xs font-medium text-tc-link no-underline hover:underline"
                    >
                      Browse calculators →
                    </Link>
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
