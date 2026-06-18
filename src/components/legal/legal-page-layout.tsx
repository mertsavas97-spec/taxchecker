import Link from 'next/link';

import { PageContainer, Section } from '@/components/layout/page-container';
import { SiteShell } from '@/components/layout/site-shell';
import {
  LegalDesktopToc,
  LegalMobileToc,
} from '@/components/legal/legal-table-of-contents';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { JsonLd } from '@/components/seo/json-ld';
import type { TrustPageDefinition } from '@/config/trust-pages';
import { formatLegalOperatorLine } from '@/config/legal-entity';
import {
  METHODOLOGY_LINK_HREF,
  METHODOLOGY_LINK_LABEL,
} from '@/config/related-content';
import type { LegalPageContent, LegalRelatedLink } from '@/lib/legal/types';
import { buildTrustPageJsonLd } from '@/lib/seo/schema';

const DEFAULT_RELATED_LINKS: LegalRelatedLink[] = [
  { label: 'Methodology', href: METHODOLOGY_LINK_HREF, description: METHODOLOGY_LINK_LABEL },
  { label: 'Disclaimer', href: '/disclaimer', description: 'Estimate-only limitations' },
  { label: 'Contact', href: '/contact', description: 'Website and methodology inquiries' },
];

function LegalSectionBlock({ section }: { section: LegalPageContent['sections'][number] }) {
  return (
    <section id={section.id} className="scroll-mt-24 space-y-3">
      <h2 className="tc-heading-subsection text-foreground">{section.heading}</h2>
      {section.paragraphs.map((paragraph) => (
        <p key={paragraph} className="tc-prose-compact">
          {paragraph}
        </p>
      ))}
      {section.list && section.list.length > 0 ? (
        <ul className="tc-prose-compact list-disc space-y-2 pl-5">
          {section.list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function LegalPageLayout({
  page,
  content,
  relatedLinks = DEFAULT_RELATED_LINKS,
}: {
  page: TrustPageDefinition;
  content: LegalPageContent;
  relatedLinks?: LegalRelatedLink[];
}) {
  const jsonLd = buildTrustPageJsonLd(page);
  const sectionCount = content.sections.length;

  return (
    <SiteShell>
      <JsonLd data={jsonLd} id={page.slug} />

      <Section spacing="xs" className="border-b border-border bg-tc-slate-50/60">
        <PageContainer width="page">
          <header className="max-w-[56rem] space-y-3">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: page.shortTitle },
              ]}
            />
            {content.eyebrow ? <p className="tc-overline">{content.eyebrow}</p> : null}
            <h1 className="tc-heading-page text-foreground">{page.shortTitle}</h1>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {content.summary}
            </p>
            <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground">
              {formatLegalOperatorLine()}
            </p>
            <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <div>
                <dt className="sr-only">Last updated</dt>
                <dd>
                  <span className="font-medium text-foreground">Last updated:</span>{' '}
                  {page.lastUpdated}
                </dd>
              </div>
              <div>
                <dt className="sr-only">Review date</dt>
                <dd>
                  <span className="font-medium text-foreground">Review date:</span>{' '}
                  {page.lastUpdated}
                </dd>
              </div>
              <div>
                <dt className="sr-only">Sections</dt>
                <dd>
                  <span className="font-medium text-foreground">Sections:</span> {sectionCount}
                </dd>
              </div>
            </dl>
          </header>
        </PageContainer>
      </Section>

      <Section spacing="sm">
        <PageContainer width="page">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:gap-8">
            <article className="min-w-0 max-w-[56rem] space-y-6">
              <LegalMobileToc sections={content.sections} />

              <div className="space-y-6">
                {content.sections.map((section) => (
                  <LegalSectionBlock key={section.id} section={section} />
                ))}
              </div>

              {content.footer ? (
                <p className="border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
                  {content.footer}
                </p>
              ) : null}

              <div className="lg:hidden">
                <LegalRelatedLinks links={relatedLinks} />
              </div>
            </article>

            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-3">
                <LegalDesktopToc sections={content.sections} />
                <LegalRelatedLinks links={relatedLinks} />
              </div>
            </aside>
          </div>
        </PageContainer>
      </Section>
    </SiteShell>
  );
}

function LegalRelatedLinks({ links }: { links: LegalRelatedLink[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-tc-sm">
      <p className="tc-overline mb-2">Related</p>
      <ul className="space-y-1">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="tc-focus-ring block rounded-md px-2 py-1.5 no-underline transition-colors hover:bg-muted"
            >
              <span className="text-xs font-medium text-tc-link">{link.label}</span>
              {link.description ? (
                <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                  {link.description}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
