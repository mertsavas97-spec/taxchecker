import { PageContainer, Section } from '@/components/layout/page-container';
import { SiteShell } from '@/components/layout/site-shell';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { JsonLd } from '@/components/seo/json-ld';
import type { TrustPageDefinition } from '@/config/trust-pages';
import type { StaticPageContent } from '@/lib/content/trust-page-content';
import { buildTrustPageJsonLd } from '@/lib/seo/schema';

function StaticPageSectionBlock({
  section,
}: {
  section: StaticPageContent['sections'][number];
}) {
  return (
    <section className="space-y-3">
      {section.heading ? (
        <h2 className="tc-heading-subsection text-foreground">{section.heading}</h2>
      ) : null}
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

export function StaticPageLayout({
  page,
  content,
  children,
}: {
  page: TrustPageDefinition;
  content: StaticPageContent;
  children?: React.ReactNode;
}) {
  const jsonLd = buildTrustPageJsonLd(page);

  return (
    <SiteShell>
      <JsonLd data={jsonLd} id={page.slug} />

      <Section spacing="sm" className="border-b border-border bg-tc-slate-50/60">
        <PageContainer width="page">
          <header className="max-w-3xl space-y-2">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: page.shortTitle },
              ]}
            />
            {content.eyebrow ? <p className="tc-overline">{content.eyebrow}</p> : null}
            <h1 className="tc-heading-page text-foreground">{page.shortTitle}</h1>
            <p className="text-base leading-relaxed text-muted-foreground">{content.intro}</p>
            {page.placeholder ? (
              <p className="inline-flex rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                Content expanding — calculators available now
              </p>
            ) : null}
          </header>
        </PageContainer>
      </Section>

      <Section spacing="default">
        <PageContainer width="page">
          <article className="tc-reading-width space-y-8 border-t border-border pt-8">
            {content.sections.map((section) => (
              <StaticPageSectionBlock key={section.heading ?? section.paragraphs[0]} section={section} />
            ))}
            {children}
            {content.footer ? (
              <p className="border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
                {content.footer}
              </p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              Last updated {page.lastUpdated}
            </p>
          </article>
        </PageContainer>
      </Section>
    </SiteShell>
  );
}
