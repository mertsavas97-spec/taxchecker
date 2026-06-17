import { calculators, getCalculatorBySlug } from '@/config/calculators';
import { getResourceBySlug } from '@/config/resources';
import type { CmsBlogPost } from '@/lib/admin/content/types';
import { getBlogPostPath } from '@/lib/blog/paths';
import type {
  JourneyLinkRef,
  RelatedContentKind,
  RelatedContentLink,
} from '@/lib/conversion/types';

function resolveCalculator(slug: string) {
  return (
    getCalculatorBySlug(slug) ??
    calculators.find(
      (calculator) =>
        calculator.engineId === slug ||
        calculator.route === `/calculators/${slug}`,
    )
  );
}

function calculatorLink(slug: string): RelatedContentLink | undefined {
  const calculator = resolveCalculator(slug);
  if (!calculator || calculator.status !== 'ready') return undefined;

  return {
    kind: 'calculator',
    title: calculator.shortTitle,
    href: calculator.route,
    description: calculator.description,
  };
}

function resourceLink(slug: string): RelatedContentLink | undefined {
  const resource = getResourceBySlug(slug);
  if (!resource || resource.status !== 'published') return undefined;

  return {
    kind: 'resource',
    title: resource.shortTitle,
    href: resource.route,
    description: resource.description,
    readingTime: resource.readingTime,
  };
}

function articleLink(post: CmsBlogPost): RelatedContentLink {
  return {
    kind: 'article',
    title: post.title,
    href: getBlogPostPath(post.slug),
    description: post.excerpt,
    readingTime: post.readingTime,
  };
}

function articleLinkBySlug(
  slug: string,
  publishedPosts: CmsBlogPost[],
): RelatedContentLink | undefined {
  const post = publishedPosts.find((item) => item.slug === slug);
  if (!post || post.status !== 'published') return undefined;
  return articleLink(post);
}

function dedupeLinks(links: RelatedContentLink[]): RelatedContentLink[] {
  const seen = new Set<string>();
  const result: RelatedContentLink[] = [];

  for (const link of links) {
    if (seen.has(link.href)) continue;
    seen.add(link.href);
    result.push(link);
  }

  return result;
}

export function buildCalculatorLinks(slugs: string[]): RelatedContentLink[] {
  return dedupeLinks(
    slugs
      .map((slug) => calculatorLink(slug))
      .filter((link): link is RelatedContentLink => link !== undefined),
  );
}

export function buildResourceLinks(slugs: string[]): RelatedContentLink[] {
  return dedupeLinks(
    slugs
      .map((slug) => resourceLink(slug))
      .filter((link): link is RelatedContentLink => link !== undefined),
  );
}

export function buildArticleLinks(
  slugs: string[],
  publishedPosts: CmsBlogPost[],
): RelatedContentLink[] {
  return dedupeLinks(
    slugs
      .map((slug) => articleLinkBySlug(slug, publishedPosts))
      .filter((link): link is RelatedContentLink => link !== undefined),
  );
}

export function buildJourneyLinks(
  refs: JourneyLinkRef[],
  publishedPosts: CmsBlogPost[] = [],
): RelatedContentLink[] {
  return dedupeLinks(
    refs
      .map((ref) => {
        if (ref.kind === 'calculator') return calculatorLink(ref.slug);
        if (ref.kind === 'resource') return resourceLink(ref.slug);
        return articleLinkBySlug(ref.slug, publishedPosts);
      })
      .filter((link): link is RelatedContentLink => link !== undefined),
  );
}

export function findRelatedArticlesByTags(
  post: CmsBlogPost,
  publishedPosts: CmsBlogPost[],
  limit = 3,
): RelatedContentLink[] {
  const tagSet = new Set(post.tags.map((tag) => tag.toLowerCase()));

  return dedupeLinks(
    publishedPosts
      .filter((candidate) => candidate.slug !== post.slug)
      .map((candidate) => {
        const overlap = candidate.tags.filter((tag) =>
          tagSet.has(tag.toLowerCase()),
        ).length;
        return { candidate, overlap };
      })
      .filter((item) => item.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap)
      .slice(0, limit)
      .map((item) => articleLink(item.candidate)),
  );
}

export function groupLinksByKind(links: RelatedContentLink[]) {
  return {
    calculators: links.filter((link) => link.kind === 'calculator'),
    resources: links.filter((link) => link.kind === 'resource'),
    articles: links.filter((link) => link.kind === 'article'),
  };
}

export function kindLabel(kind: RelatedContentKind): string {
  switch (kind) {
    case 'calculator':
      return 'Calculator';
    case 'resource':
      return 'Resource';
    case 'article':
      return 'Article';
  }
}
