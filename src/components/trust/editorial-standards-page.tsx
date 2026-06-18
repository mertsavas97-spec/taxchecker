import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';

import { PageContainer, Section } from '@/components/layout/page-container';
import { SiteShell } from '@/components/layout/site-shell';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { JsonLd } from '@/components/seo/json-ld';
import { getTrustPageBySlug } from '@/config/trust-pages';
import { editorialStandardsContent } from '@/lib/authority/editorial-standards-content';
import { buildTrustPageJsonLd } from '@/lib/seo/schema';

export function EditorialStandardsPage() {
  const page = getTrustPageBySlug('editorial-standards')!;
  const content = editorialStandardsContent;
  const jsonLd = buildTrustPageJsonLd(page);

  return (
    <SiteShell>
      <JsonLd data={jsonLd} id="editorial-standards" />

      <Section spacing="sm" className="border-b border-border bg-tc-slate-50/60">
        <PageContainer width="page">
          <header className="max-w-3xl space-y-2">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Editorial Standards' },
              ]}
            />
            <p className="tc-overline">{content.eyebrow}</p>
            <h1 className="tc-heading-page text-foreground">{content.title}</h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              {content.summary}
            </p>
          </header>
        </PageContainer>
      </Section>

      <Section spacing="default">
        <PageContainer width="page">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <article className="min-w-0 space-y-8">
              {content.sections.map((section) => (
                <section key={section.id} id={section.id} className="space-y-3">
                  <h2 className="tc-heading-subsection text-foreground">
                    {section.heading}
                  </h2>
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="tc-prose-compact"
                    >
                      {paragraph}
                    </p>
                  ))}
                  {section.list ? (
                    <ul className="tc-prose-compact list-disc space-y-2 pl-5">
                      {section.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}

              <div className="space-y-2 border-t border-border pt-6">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {content.footer}
                </p>
                <p className="text-xs text-muted-foreground">
                  Last updated {page.lastUpdated}
                </p>
              </div>
            </article>

            <aside className="space-y-4 lg:sticky lg:top-24">
              <nav
                aria-label="Related authority pages"
                className="rounded-xl border border-border bg-card p-4 shadow-tc-sm"
              >
                <h2 className="text-sm font-semibold text-foreground">Related pages</h2>
                <ul className="mt-3 space-y-2">
                  {content.relatedLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex items-center gap-1 text-xs font-medium text-tc-link no-underline hover:underline"
                      >
                        {link.label}
                        <ArrowRightIcon className="size-3" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          </div>
        </PageContainer>
      </Section>
    </SiteShell>
  );
}
