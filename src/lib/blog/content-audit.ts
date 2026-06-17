import { blogTaxonomy } from '@/config/blog-taxonomy';
import { getLaunchBlogPosts } from '@/lib/blog/launch-articles';
import { buildRelatedContentForBlogPost } from '@/lib/conversion/related-content';
import { getBlogPostPath } from '@/lib/blog/paths';

export interface BlogContentAuditReport {
  articleCount: number;
  publishedArticleCount: number;
  categoryCount: number;
  categoriesWithArticles: string[];
  orphanArticles: string[];
  articlesMissingCalculatorLinks: string[];
  articlesMissingResourceLinks: string[];
  articlesMissingArticleLinks: string[];
  totalInternalLinks: number;
  topicalCoverage: Array<{ category: string; articleCount: number }>;
}

export function runBlogContentAudit(): BlogContentAuditReport {
  const posts = getLaunchBlogPosts();
  const published = posts.filter((post) => post.status === 'published');

  const inboundCounts = new Map<string, number>();
  for (const post of published) {
    inboundCounts.set(post.slug, 0);
  }

  let totalInternalLinks = 0;
  const missingCalculator: string[] = [];
  const missingResource: string[] = [];
  const missingArticle: string[] = [];

  for (const post of published) {
    const related = buildRelatedContentForBlogPost(post, published);

    if (related.calculators.length < 2) {
      missingCalculator.push(post.slug);
    }
    if (related.resources.length < 2) {
      missingResource.push(post.slug);
    }
    if (related.articles.length < 2) {
      missingArticle.push(post.slug);
    }

    for (const link of [
      ...related.calculators,
      ...related.resources,
      ...related.articles,
    ]) {
      totalInternalLinks += 1;
      if (link.kind === 'article') {
        const slug = link.href.replace('/blog/', '');
        inboundCounts.set(slug, (inboundCounts.get(slug) ?? 0) + 1);
      }
    }

    for (const slug of post.relatedBlogPosts) {
      inboundCounts.set(slug, (inboundCounts.get(slug) ?? 0) + 1);
    }
  }

  const categoryCounts = new Map<string, number>();
  for (const post of published) {
    categoryCounts.set(post.category, (categoryCounts.get(post.category) ?? 0) + 1);
  }

  const orphanArticles = published
    .filter((post) => (inboundCounts.get(post.slug) ?? 0) === 0 && !post.featured)
    .map((post) => post.slug);

  return {
    articleCount: posts.length,
    publishedArticleCount: published.length,
    categoryCount: blogTaxonomy.length,
    categoriesWithArticles: [...categoryCounts.keys()].sort(),
    orphanArticles,
    articlesMissingCalculatorLinks: missingCalculator,
    articlesMissingResourceLinks: missingResource,
    articlesMissingArticleLinks: missingArticle,
    totalInternalLinks,
    topicalCoverage: blogTaxonomy.map((category) => ({
      category: category.label,
      articleCount: categoryCounts.get(category.label) ?? 0,
    })),
  };
}

export function formatBlogContentAuditReport(report: BlogContentAuditReport): string {
  return [
    '# Blog Content Audit',
    '',
    `Articles (published): ${report.publishedArticleCount}`,
    `Categories defined: ${report.categoryCount}`,
    `Total related internal links: ${report.totalInternalLinks}`,
    '',
    '## Topical coverage',
    ...report.topicalCoverage.map(
      (row) => `- ${row.category}: ${row.articleCount} article(s)`,
    ),
    '',
    '## Orphan articles (no inbound article links, excluding featured)',
    ...(report.orphanArticles.length > 0
      ? report.orphanArticles.map((slug) => `- /blog/${slug}`)
      : ['- None']),
    '',
    '## Link minimum violations',
    `Missing calculator links: ${report.articlesMissingCalculatorLinks.length}`,
    `Missing resource links: ${report.articlesMissingResourceLinks.length}`,
    `Missing article links: ${report.articlesMissingArticleLinks.length}`,
  ].join('\n');
}

export function getLaunchArticlePaths(): string[] {
  return getLaunchBlogPosts().map((post) => getBlogPostPath(post.slug));
}
