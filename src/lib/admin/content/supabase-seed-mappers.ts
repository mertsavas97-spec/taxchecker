import {
  mapCmsBlogPostToDb,
  mapCmsCalculatorToDb,
  mapCmsResourceToDb,
} from '@/lib/admin/content/storage/mappers';
import type { CmsBlogPost, CmsCalculatorRecord, CmsResource } from '@/lib/admin/content/types';

function toTimestamptz(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.includes('T')) return value;
  return `${value}T12:00:00.000Z`;
}

/** Omits columns that are not present in the current Supabase schema. */
export function mapCmsBlogPostToDbForSeed(post: CmsBlogPost) {
  const { related_blog_posts: _relatedBlogPosts, ...payload } =
    mapCmsBlogPostToDb(post) as ReturnType<typeof mapCmsBlogPostToDb> & {
      related_blog_posts?: string[];
    };

  return {
    ...payload,
    published_at: toTimestamptz(post.publishedAt),
    updated_at: new Date().toISOString(),
    revision: post.revision ?? 1,
  };
}

export function mapCmsResourceToDbForSeed(resource: CmsResource) {
  return {
    ...mapCmsResourceToDb(resource),
    published_at: toTimestamptz(resource.publishedAt),
    updated_at: new Date().toISOString(),
  };
}

export function mapCmsCalculatorToDbForSeed(record: CmsCalculatorRecord) {
  return {
    ...mapCmsCalculatorToDb(record),
    updated_at: new Date().toISOString(),
  };
}
