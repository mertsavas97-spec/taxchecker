import type {
  CmsBlogPost,
  CmsCalculatorRecord,
  CmsContentStatus,
  CmsFaqItem,
  CmsResource,
} from '@/lib/admin/content/types';
import { computeReadingTime } from '@/lib/blog/reading-time';

export interface DbCmsResource {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string | null;
  category: string;
  status: CmsContentStatus;
  reading_time: string | null;
  tax_year: number | null;
  last_reviewed: string | null;
  published_at: string | null;
  updated_at: string;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  og_image: string | null;
  related_calculators: string[] | null;
  related_resources: string[] | null;
  related_blog_slugs: string[] | null;
  source_ids: string[] | null;
  featured: boolean | null;
  route: string | null;
  short_title: string | null;
  created_by: string | null;
  updated_by: string | null;
  faqs?: unknown;
}

export interface DbCmsBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  category: string;
  tags: string[] | null;
  status: CmsContentStatus;
  author_id: string | null;
  author_name: string | null;
  published_at: string | null;
  updated_at: string;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  og_image: string | null;
  reading_time: string | null;
  featured: boolean | null;
  related_calculators: string[] | null;
  related_resources: string[] | null;
  related_blog_posts?: string[] | null;
  tax_year: number | null;
  revision: number | null;
  faqs?: unknown;
}

export interface DbCmsCalculatorMetadata {
  id: string;
  calculator_slug: string;
  title: string;
  tax_year: number | null;
  last_reviewed: string | null;
  featured_badge: string | null;
  status: 'ready' | 'planned' | 'archived';
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string;
}

function toDateString(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.slice(0, 10);
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function parseFaqsInput(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

export function mapDbFaqs(value: unknown): CmsFaqItem[] {
  const rows = parseFaqsInput(value);

  return rows.flatMap((row) => {
    if (typeof row !== 'object' || row === null || Array.isArray(row)) return [];
    const record = row as Record<string, unknown>;
    const question = typeof record.question === 'string' ? record.question : '';
    const answer = typeof record.answer === 'string' ? record.answer : '';
    return [{ question, answer }];
  });
}

export function mapDbResourceToCms(row: DbCmsResource): CmsResource {
  const route =
    row.route ??
    (row.slug === 'methodology' ? '/methodology' : `/resources/${row.slug}`);

  return {
    type: 'resource',
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortTitle: row.short_title ?? row.title,
    status: row.status,
    publishedAt: toDateString(row.published_at),
    updatedAt: toDateString(row.updated_at) ?? row.updated_at.slice(0, 10),
    seoTitle: row.seo_title ?? row.title,
    seoDescription: row.seo_description ?? row.description ?? '',
    taxYear: row.tax_year,
    category: row.category,
    route,
    featured: row.featured ?? false,
    relatedCalculatorSlugs: row.related_calculators ?? [],
    relatedResourceSlugs: row.related_resources ?? [],
    relatedBlogSlugs: row.related_blog_slugs ?? [],
    canonicalUrl: row.canonical_url,
    ogImage: row.og_image,
    description: row.description ?? undefined,
    content: row.content ?? undefined,
    readingTime: row.reading_time ?? undefined,
    lastReviewed: toDateString(row.last_reviewed),
    sourceIds: row.source_ids ?? [],
    faqs: mapDbFaqs(row.faqs),
  };
}

export function mapCmsResourceToDb(
  resource: CmsResource,
  actorId?: string | null,
): Partial<DbCmsResource> {
  return {
    id: isUuid(resource.id) ? resource.id : undefined,
    slug: resource.slug,
    title: resource.title,
    short_title: resource.shortTitle,
    description: resource.description ?? resource.seoDescription,
    content: resource.content ?? null,
    category: resource.category,
    status: resource.status,
    reading_time: resource.readingTime ?? null,
    tax_year: resource.taxYear,
    last_reviewed: resource.lastReviewed ?? null,
    published_at: resource.publishedAt,
    seo_title: resource.seoTitle,
    seo_description: resource.seoDescription,
    canonical_url: resource.canonicalUrl,
    og_image: resource.ogImage,
    related_calculators: resource.relatedCalculatorSlugs,
    related_resources: resource.relatedResourceSlugs,
    related_blog_slugs: resource.relatedBlogSlugs,
    source_ids: resource.sourceIds ?? [],
    featured: resource.featured,
    route: resource.route,
    updated_by: actorId ?? null,
    faqs: resource.faqs ?? [],
  };
}

export function mapDbBlogPostToCms(row: DbCmsBlogPost): CmsBlogPost {
  const content = row.content ?? '';
  return {
    type: 'blog',
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? '',
    content,
    status: row.status,
    category: row.category,
    tags: row.tags ?? [],
    authorId: row.author_id,
    authorName: row.author_name,
    publishedAt: toDateString(row.published_at),
    updatedAt: toDateString(row.updated_at) ?? row.updated_at.slice(0, 10),
    seoTitle: row.seo_title ?? '',
    seoDescription: row.seo_description ?? '',
    canonicalUrl: row.canonical_url,
    ogImage: row.og_image,
    taxYear: row.tax_year,
    readingTime: row.reading_time ?? computeReadingTime(content),
    featured: row.featured ?? false,
    relatedCalculators: row.related_calculators ?? [],
    relatedResources: row.related_resources ?? [],
    relatedBlogPosts: row.related_blog_posts ?? [],
    revision: row.revision ?? 1,
    faqs: mapDbFaqs(row.faqs),
  };
}

export function mapCmsBlogPostToDb(post: CmsBlogPost): Partial<DbCmsBlogPost> {
  return {
    id: isUuid(post.id) ? post.id : undefined,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    tags: post.tags,
    status: post.status,
    author_id: post.authorId,
    author_name: post.authorName,
    published_at: post.publishedAt,
    seo_title: post.seoTitle,
    seo_description: post.seoDescription,
    canonical_url: post.canonicalUrl,
    og_image: post.ogImage,
    reading_time: post.readingTime,
    featured: post.featured,
    related_calculators: post.relatedCalculators,
    related_resources: post.relatedResources,
    tax_year: post.taxYear,
    revision: post.revision,
    faqs: post.faqs ?? [],
  };
}

export function mapDbCalculatorToCms(
  row: DbCmsCalculatorMetadata,
  route: string,
  category: string,
): CmsCalculatorRecord {
  return {
    id: row.id,
    slug: row.calculator_slug,
    name: row.title,
    route,
    taxYear: row.tax_year ?? new Date().getFullYear(),
    lastReviewed: toDateString(row.last_reviewed) ?? toDateString(row.updated_at) ?? '',
    lastUpdated: toDateString(row.updated_at) ?? row.updated_at.slice(0, 10),
    featuredBadge: row.featured_badge,
    published: row.status === 'ready',
    category,
    seoTitle: row.seo_title ?? row.title,
    seoDescription: row.seo_description ?? '',
  };
}

export function mapCmsCalculatorToDb(record: CmsCalculatorRecord): Partial<DbCmsCalculatorMetadata> {
  return {
    id: isUuid(record.id) ? record.id : undefined,
    calculator_slug: record.slug,
    title: record.name,
    tax_year: record.taxYear,
    last_reviewed: record.lastReviewed || null,
    featured_badge: record.featuredBadge,
    status: record.published ? 'ready' : 'planned',
    seo_title: record.seoTitle,
    seo_description: record.seoDescription,
  };
}
