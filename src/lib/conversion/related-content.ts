import { getCalculatorJourney } from '@/config/calculator-journeys';
import { getResourceBySlug } from '@/config/resources';
import type { CmsBlogPost } from '@/lib/admin/content/types';
import {
  buildArticleLinks,
  buildCalculatorLinks,
  buildJourneyLinks,
  buildResourceLinks,
  findRelatedArticlesByTags,
} from '@/lib/conversion/build-links';
import type {
  CalculatorJourneyId,
  RelatedContentLink,
} from '@/lib/conversion/types';

export interface RelatedContentGroups {
  calculators: RelatedContentLink[];
  resources: RelatedContentLink[];
  articles: RelatedContentLink[];
}

export function buildNextStepLinks(
  journeyId: CalculatorJourneyId,
  publishedPosts: CmsBlogPost[] = [],
): RelatedContentLink[] {
  const journey = getCalculatorJourney(journeyId);
  return buildJourneyLinks(journey.nextSteps, publishedPosts);
}

export function buildCalculatorPageRelatedContent(
  journeyId: CalculatorJourneyId,
  publishedPosts: CmsBlogPost[] = [],
): RelatedContentGroups {
  const journey = getCalculatorJourney(journeyId);

  return {
    calculators: buildCalculatorLinks(journey.related.calculators),
    resources: buildResourceLinks(journey.related.resources),
    articles: buildArticleLinks(journey.related.articles, publishedPosts),
  };
}

export function buildRelatedContentForResource(
  slug: string,
  publishedPosts: CmsBlogPost[] = [],
): RelatedContentGroups {
  const resource = getResourceBySlug(slug);
  if (!resource) {
    return { calculators: [], resources: [], articles: [] };
  }

  const relatedBlogSlugs = resource.relatedBlogSlugs ?? [];

  return {
    calculators: buildCalculatorLinks(resource.relatedCalculatorSlugs),
    resources: buildResourceLinks(
      resource.relatedResourceSlugs.filter((relatedSlug) => relatedSlug !== slug),
    ),
    articles: buildArticleLinks(relatedBlogSlugs, publishedPosts),
  };
}

export function buildRelatedContentForBlogPost(
  post: CmsBlogPost,
  publishedPosts: CmsBlogPost[],
): RelatedContentGroups {
  const explicitArticles = buildArticleLinks(
    post.relatedBlogPosts ?? [],
    publishedPosts,
  );
  const tagArticles =
    explicitArticles.length > 0
      ? []
      : findRelatedArticlesByTags(post, publishedPosts);

  return {
    calculators: buildCalculatorLinks(post.relatedCalculators),
    resources: buildResourceLinks(post.relatedResources),
    articles: dedupeArticleLinks([...explicitArticles, ...tagArticles]),
  };
}

function dedupeArticleLinks(links: RelatedContentLink[]): RelatedContentLink[] {
  const seen = new Set<string>();
  return links.filter((link) => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}
