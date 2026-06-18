import { ResourceArticleLayout } from '@/components/resources/resource-article-layout';
import {
  ResourceParagraph,
  ResourceProse,
  ResourceSection,
} from '@/components/resources/resource-section';
import { ResourceSources } from '@/components/resources/resource-sources';
import { BlogContentParagraph, renderBlogContentParagraphs } from '@/lib/blog/content';
import type { CmsResource } from '@/lib/admin/content/types';
import { getPublishedResourceBySlugPublic } from '@/lib/cms/public-read';
import { hasCmsResourceBody } from '@/lib/resources/public-definition';
import { resolveSourceReferences } from '@/lib/resources/source-references';

export async function getPublishedCmsResourceForSlug(
  slug: string,
): Promise<CmsResource | undefined> {
  const resource = await getPublishedResourceBySlugPublic(slug);
  if (!resource || resource.status !== 'published') return undefined;
  return resource;
}

export function CmsResourceArticleBody({ content }: { content: string }) {
  const paragraphs = renderBlogContentParagraphs(content);

  if (paragraphs.length === 0) {
    return null;
  }

  return (
    <ResourceSection title="Overview">
      <ResourceProse>
        {paragraphs.map((paragraph, index) => (
          <ResourceParagraph key={index}>
            <BlogContentParagraph text={paragraph} />
          </ResourceParagraph>
        ))}
      </ResourceProse>
    </ResourceSection>
  );
}

export async function CmsResourceArticlePage({
  slug,
  resource,
}: {
  slug: string;
  resource: CmsResource;
}) {
  const sources = resolveSourceReferences(resource.sourceIds ?? []);

  return (
    <ResourceArticleLayout
      slug={slug}
      faqs={[]}
      sources={sources}
      sourceNotice="Sources cited in this resource reference public IRS publications and TaxChecker methodology where applicable."
    >
      {hasCmsResourceBody(resource) ? (
        <CmsResourceArticleBody content={resource.content ?? ''} />
      ) : (
        <ResourceSection title="Overview">
          <ResourceProse>
            <ResourceParagraph>
              {resource.description || resource.seoDescription}
            </ResourceParagraph>
          </ResourceProse>
        </ResourceSection>
      )}
    </ResourceArticleLayout>
  );
}

export async function renderPublishedCmsResourcePageIfPresent(slug: string) {
  const resource = await getPublishedCmsResourceForSlug(slug);
  if (!resource || !hasCmsResourceBody(resource)) {
    return null;
  }

  return <CmsResourceArticlePage slug={slug} resource={resource} />;
}

export async function renderPublishedCmsResourcePage(slug: string) {
  const resource = await getPublishedCmsResourceForSlug(slug);
  if (!resource) return null;

  return <CmsResourceArticlePage slug={slug} resource={resource} />;
}
