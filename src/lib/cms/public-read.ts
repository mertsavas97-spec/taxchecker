import 'server-only';

import type { ResourceDefinition } from '@/config/resources';
import {
  getPublishedResources as getStaticPublishedResources,
  getResourceBySlug,
  resources as staticResources,
} from '@/config/resources';
import { getAllHubResources } from '@/config/resource-hub';
import { contentRegistry } from '@/lib/admin/content/registry';
import {
  mapDbBlogPostToCms,
  mapDbResourceToCms,
  type DbCmsBlogPost,
  type DbCmsResource,
} from '@/lib/admin/content/storage/mappers';
import { isSupabaseStoreActive } from '@/lib/admin/content/storage';
import type { CmsBlogPost, CmsResource } from '@/lib/admin/content/types';
import { createClient } from '@/lib/supabase/server';

function cmsResourceToDefinition(resource: CmsResource): ResourceDefinition {
  const staticResource = getResourceBySlug(resource.slug);

  if (staticResource) {
    return {
      ...staticResource,
      title: resource.title,
      shortTitle: resource.shortTitle,
      description: resource.seoDescription || resource.description || staticResource.description,
      status: resource.status === 'published' ? 'published' : 'coming_soon',
      lastUpdated: resource.updatedAt,
      lastReviewed: resource.lastReviewed ?? staticResource.lastReviewed,
      featured: resource.featured,
      relatedCalculatorSlugs: resource.relatedCalculatorSlugs,
      relatedResourceSlugs: resource.relatedResourceSlugs,
      relatedBlogSlugs:
        resource.relatedBlogSlugs ?? staticResource.relatedBlogSlugs,
      route: resource.route,
      taxYear: resource.taxYear ?? staticResource.taxYear,
      readingTime: resource.readingTime ?? staticResource.readingTime,
    };
  }

  return {
    slug: resource.slug,
    title: resource.title,
    shortTitle: resource.shortTitle,
    description: resource.seoDescription || resource.description || '',
    category: 'guides',
    status: 'published',
    readingTime: resource.readingTime ?? '5 min read',
    lastReviewed: resource.lastReviewed ?? resource.updatedAt,
    lastUpdated: resource.updatedAt,
    taxYear: resource.taxYear ?? undefined,
    featured: resource.featured,
    relatedCalculatorSlugs: resource.relatedCalculatorSlugs,
    relatedResourceSlugs: resource.relatedResourceSlugs,
    relatedBlogSlugs: resource.relatedBlogSlugs ?? [],
    primaryKeyword: resource.title,
    secondaryKeywords: [],
    route: resource.route,
    sourceIds: resource.sourceIds ?? [],
  };
}

async function fetchPublishedBlogPostsFromSupabase(): Promise<CmsBlogPost[] | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cms_blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) return null;
  return ((data ?? []) as DbCmsBlogPost[]).map(mapDbBlogPostToCms);
}

async function fetchPublishedResourcesFromSupabase(): Promise<CmsResource[] | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cms_resources')
    .select('*')
    .eq('status', 'published')
    .order('updated_at', { ascending: false });

  if (error) return null;
  return ((data ?? []) as DbCmsResource[]).map(mapDbResourceToCms);
}

export async function getPublishedBlogPostsPublic(): Promise<CmsBlogPost[]> {
  if (isSupabaseStoreActive()) {
    try {
      const remote = await fetchPublishedBlogPostsFromSupabase();
      if (remote) return remote;
    } catch {
      // Fall through to registry/static fallback.
    }
  }

  const posts = await contentRegistry.getBlogPosts();
  return posts
    .filter((post) => post.status === 'published')
    .sort((a, b) => {
      const aDate = a.publishedAt ?? a.updatedAt;
      const bDate = b.publishedAt ?? b.updatedAt;
      return bDate.localeCompare(aDate);
    });
}

export async function getPublishedBlogPostBySlugPublic(
  slug: string,
): Promise<CmsBlogPost | undefined> {
  const posts = await getPublishedBlogPostsPublic();
  return posts.find((post) => post.slug === slug);
}

export async function getFeaturedPublishedBlogPostPublic(): Promise<CmsBlogPost | undefined> {
  const posts = await getPublishedBlogPostsPublic();
  return posts.find((post) => post.featured);
}

export async function getHubResourcesPublic(): Promise<ResourceDefinition[]> {
  const staticAll = getAllHubResources();

  try {
    const cms = await contentRegistry.getResources();
    if (cms.length === 0) return staticAll;

    const cmsBySlug = new Map(cms.map((resource) => [resource.slug, resource]));
    return staticAll.map((resource) => {
      const cmsRow = cmsBySlug.get(resource.slug);
      return cmsRow ? cmsResourceToDefinition(cmsRow) : resource;
    });
  } catch {
    return staticAll;
  }
}

export async function getPublishedResourcesPublic(): Promise<ResourceDefinition[]> {
  if (isSupabaseStoreActive()) {
    try {
      const remote = await fetchPublishedResourcesFromSupabase();
      if (remote && remote.length > 0) {
        return remote.map(cmsResourceToDefinition);
      }
    } catch {
      // Fall through to static fallback.
    }
  }

  const cmsResources = await contentRegistry.getResources();
  const cmsPublished = cmsResources
    .filter((resource) => resource.status === 'published')
    .map(cmsResourceToDefinition);

  if (cmsPublished.length > 0) {
    const cmsSlugs = new Set(cmsPublished.map((resource) => resource.slug));
    const staticPublished = getStaticPublishedResources().filter(
      (resource) => !cmsSlugs.has(resource.slug),
    );
    return [...cmsPublished, ...staticPublished];
  }

  return getStaticPublishedResources();
}

export async function getSitemapResourcesPublic(): Promise<ResourceDefinition[]> {
  const published = await getPublishedResourcesPublic();
  return published.filter((resource) => resource.route.startsWith('/resources/'));
}

export function getStaticResourceCatalog(): ResourceDefinition[] {
  return staticResources;
}
