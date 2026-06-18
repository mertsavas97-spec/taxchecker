import type { SourceReferenceItem } from '@/components/calculator/source-section';
import type { FaqItem } from '@/components/content/faq-block';
import { PageContainer, Section } from '@/components/layout/page-container';
import { SiteShell } from '@/components/layout/site-shell';
import { RelatedContentBlock } from '@/components/content/related-content-block';
import { ResourceFaq } from '@/components/resources/resource-faq';
import { ResourceHero, ResourceMetadataBar } from '@/components/resources/resource-hero';
import { ResourceArticleDetails, ResourceSidebar } from '@/components/resources/resource-sidebar';
import { ResourceSources } from '@/components/resources/resource-sources';
import { ResourceTocSection } from '@/components/resources/resource-section';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import {
  MobileTableOfContents,
  TableOfContents,
} from '@/components/resources/table-of-contents';
import { JsonLd } from '@/components/seo/json-ld';
import { site } from '@/config/site';
import { getPublishedBlogPostsPublic } from '@/lib/cms/public-read';
import { buildRelatedContentForResource } from '@/lib/conversion/related-content';
import { buildResourcePageJsonLd, resolvePublishedResourceFaqs } from '@/lib/resources/create-resource-page';
import { getPublishedResourceOrThrow } from '@/lib/resources/related-links';
import { formatResourceMetadataLine } from '@/lib/resources/metadata-labels';

export async function ResourceArticleLayout({
  slug,
  children,
  faqs,
  sources,
  sourceNotice,
}: {
  slug: string;
  children: React.ReactNode;
  faqs: FaqItem[];
  sources: SourceReferenceItem[];
  sourceNotice?: string;
}) {
  const resource = await getPublishedResourceOrThrow(slug);
  const publishedPosts = await getPublishedBlogPostsPublic();
  const related = buildRelatedContentForResource(slug, publishedPosts, resource);
  const resolvedFaqs = await resolvePublishedResourceFaqs(slug, faqs);
  const jsonLd = await buildResourcePageJsonLd(slug, faqs);

  return (
    <SiteShell>
      <JsonLd data={jsonLd} id={slug} />

      <Section spacing="xs" className="border-b border-border bg-tc-slate-50/60">
        <PageContainer width="page">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Resources', href: '/resources' },
              { label: resource.title },
            ]}
            className="mb-2"
          />
          <ResourceHero resource={resource} />
          <ResourceMetadataBar resource={resource} className="mt-3" />
        </PageContainer>
      </Section>

      <Section spacing="sm">
        <PageContainer width="page">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <article
              id="resource-article-main"
              className="min-w-0 space-y-6"
            >
              <MobileTableOfContents />

              <div className="lg:hidden">
                <ResourceArticleDetails resource={resource} />
              </div>

              <div className="space-y-6">{children}</div>

              <RelatedContentBlock
                title="Related content"
                description="Calculators, guides, and articles connected to this topic."
                variant="inline"
                calculators={related.calculators}
                resources={related.resources}
                articles={related.articles}
              />

              <ResourceTocSection id="faq" label="FAQ" className="space-y-4">
                <ResourceFaq items={resolvedFaqs} />
              </ResourceTocSection>

              <ResourceTocSection id="sources" label="Sources" className="space-y-4">
                <ResourceSources sources={sources} notice={sourceNotice} />
              </ResourceTocSection>

              <div className="space-y-2 border-t border-border/70 pt-4">
                <p className="tc-caption">{formatResourceMetadataLine(resource)}</p>
                <p className="tc-caption">{site.disclaimer}</p>
              </div>
            </article>

            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-3">
                <TableOfContents />
                <ResourceSidebar
                  resource={resource}
                  relatedCalculators={related.calculators}
                  relatedResources={related.resources}
                  relatedArticles={related.articles}
                />
              </div>
            </div>
          </div>
        </PageContainer>
      </Section>
    </SiteShell>
  );
}
