import { site } from '@/config/site';
import { absoluteUrl } from '@/lib/seo/urls';

export interface ArticleSchemaInput {
  title: string;
  description: string;
  path: string;
  publishedAt: string;
  modifiedAt?: string;
  authorName?: string;
  imagePath?: string;
}

function buildArticleLikeSchema(
  type: 'Article' | 'BlogPosting',
  article: ArticleSchemaInput,
) {
  const url = absoluteUrl(article.path);

  return {
    '@context': 'https://schema.org',
    '@type': type,
    headline: article.title,
    description: article.description,
    url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    datePublished: article.publishedAt,
    dateModified: article.modifiedAt ?? article.publishedAt,
    author: {
      '@type': 'Organization',
      name: article.authorName ?? site.organization.name,
      url: site.organization.url,
    },
    publisher: {
      '@type': 'Organization',
      name: site.organization.name,
      url: site.organization.url,
      logo: {
        '@type': 'ImageObject',
        url: site.organization.logo,
      },
    },
    image: article.imagePath ? absoluteUrl(article.imagePath) : absoluteUrl(site.defaultOgImage),
    isAccessibleForFree: true,
    genre: 'Educational',
    about: {
      '@type': 'Thing',
      name: 'United States federal tax',
    },
    inLanguage: site.defaultLocale.replace('_', '-'),
  };
}

export function buildArticleSchema(article: ArticleSchemaInput) {
  return buildArticleLikeSchema('Article', article);
}

export function buildBlogPostingSchema(article: ArticleSchemaInput) {
  return buildArticleLikeSchema('BlogPosting', article);
}
