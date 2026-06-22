import 'server-only';

import { unstable_noStore as noStore } from 'next/cache';

import type { ResourceDefinition } from '@/config/resources';
import {
  getPublishedResources as getStaticPublishedResources,
  getResourceBySlug,
  resources as staticResources,
} from '@/config/resources';
import { getAllHubResources } from '@/config/resource-hub';
import { contentRegistry } from '@/lib/admin/content/registry';
import {
  seedCmsBlogPosts,
  seedCmsResources,
} from '@/lib/admin/content/seed';
import {
  mapDbBlogPostToCms,
  mapDbResourceToCms,
  type DbCmsBlogPost,
  type DbCmsResource,
} from '@/lib/admin/content/storage/mappers';
import { getConfiguredStoreDriver, isSupabaseStoreActive } from '@/lib/admin/content/storage';
import type { BlogPostsPublicSource } from '@/lib/blog/hub-listing';
import type { CmsBlogPost, CmsResource } from '@/lib/admin/content/types';
import { createAdminClient, isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import { isSupabasePublicReadConfigured } from '@/lib/supabase/public-read';
import { createClient } from '@/lib/supabase/server';

import {
  cmsResourceToPublicDefinition,
} from '@/lib/resources/public-definition';

async function getPublishedCmsClient() {
  if (isSupabaseAdminConfigured()) {
    return createAdminClient();
  }

  return createClient();
}

function sortPublishedBlogPosts(posts: CmsBlogPost[]): CmsBlogPost[] {
  return [...posts].sort((a, b) => {
    const aDate = a.publishedAt ?? a.updatedAt;
    const bDate = b.publishedAt ?? b.updatedAt;
    return bDate.localeCompare(aDate);
  });
}

function isDisplayablePublishedBlogPost(post: CmsBlogPost): boolean {
  return (
    post.status === 'published' &&
    Boolean(post.slug?.trim()) &&
    Boolean(post.title?.trim())
  );
}

function normalizePublishedBlogPosts(posts: CmsBlogPost[]): CmsBlogPost[] {
  return sortPublishedBlogPosts(posts.filter(isDisplayablePublishedBlogPost));
}

async function fetchPublishedBlogPostsFromSupabase(): Promise<CmsBlogPost[] | null> {
  noStore();

  try {
    const supabase = await getPublishedCmsClient();
    const { data, error } = await supabase
      .from('cms_blog_posts')
      .select('*')
      .eq('status', 'published')
      .not('slug', 'is', null)
      .not('title', 'is', null)
      .order('published_at', { ascending: false });

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[blog-hub] Supabase published blog fetch failed:', error.message);
      }
      return null;
    }

    return normalizePublishedBlogPosts(
      ((data ?? []) as DbCmsBlogPost[]).map(mapDbBlogPostToCms),
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[blog-hub] Supabase published blog fetch threw:', error);
    }
    return null;
  }
}

async function fetchPublishedBlogPostBySlugFromSupabase(
  slug: string,
): Promise<CmsBlogPost | undefined> {
  noStore();

  try {
    const supabase = await getPublishedCmsClient();
    const { data, error } = await supabase
      .from('cms_blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error || !data) return undefined;
    const post = mapDbBlogPostToCms(data as DbCmsBlogPost);
    return isDisplayablePublishedBlogPost(post) ? post : undefined;
  } catch {
    return undefined;
  }
}

async function fetchPublishedResourcesFromSupabase(): Promise<CmsResource[] | null> {
  noStore();

  try {
    const supabase = await getPublishedCmsClient();
    const { data, error } = await supabase
      .from('cms_resources')
      .select('*')
      .eq('status', 'published')
      .order('updated_at', { ascending: false });

    if (error) return null;
    return ((data ?? []) as DbCmsResource[]).map(mapDbResourceToCms);
  } catch {
    return null;
  }
}

export interface ResolvedPublishedBlogPosts {
  posts: CmsBlogPost[];
  source: BlogPostsPublicSource;
}

export async function resolvePublishedBlogPosts(): Promise<ResolvedPublishedBlogPosts> {
  if (isSupabasePublicReadConfigured()) {
    const remote = await fetchPublishedBlogPostsFromSupabase();
    if (remote !== null) {
      return { posts: remote, source: 'supabase' };
    }
  }

  const posts = await contentRegistry.getBlogPosts();
  const publishedFromStore = normalizePublishedBlogPosts(posts);

  if (publishedFromStore.length > 0) {
    return { posts: publishedFromStore, source: 'registry' };
  }

  if (isSupabasePublicReadConfigured()) {
    return { posts: [], source: 'supabase' };
  }

  return {
    posts: normalizePublishedBlogPosts(seedCmsBlogPosts()),
    source: 'seed',
  };
}

export async function getPublishedBlogPostsPublic(): Promise<CmsBlogPost[]> {
  const resolved = await resolvePublishedBlogPosts();
  return resolved.posts;
}

export async function getPublishedBlogPostBySlugPublic(
  slug: string,
): Promise<CmsBlogPost | undefined> {
  if (isSupabasePublicReadConfigured()) {
    const direct = await fetchPublishedBlogPostBySlugFromSupabase(slug);
    if (direct) {
      return direct;
    }
  }

  const posts = await getPublishedBlogPostsPublic();
  return posts.find((post) => post.slug === slug);
}

function cmsResourceToDefinition(resource: CmsResource): ResourceDefinition {
  return cmsResourceToPublicDefinition(resource);
}

export async function getPublishedResourceBySlugPublic(
  slug: string,
): Promise<CmsResource | undefined> {
  if (isSupabasePublicReadConfigured()) {
    try {
      const remote = await fetchPublishedResourcesFromSupabase();
      if (remote !== null) {
        return remote.find((resource) => resource.slug === slug);
      }
    } catch {
      // Fall through to registry/static fallback.
    }
  } else if (isSupabaseStoreActive()) {
    try {
      const remote = await fetchPublishedResourcesFromSupabase();
      if (remote !== null) {
        return remote.find((resource) => resource.slug === slug);
      }
    } catch {
      // Fall through to registry/static fallback.
    }
  }

  const cmsResources = await contentRegistry.getResources();
  const published = cmsResources.filter((resource) => resource.status === 'published');
  const match = published.find((resource) => resource.slug === slug);
  if (match) return match;

  if (isSupabasePublicReadConfigured() || isSupabaseStoreActive()) {
    return undefined;
  }

  const seeded = seedCmsResources()
    .filter((resource) => resource.status === 'published')
    .find((resource) => resource.slug === slug);

  return seeded;
}

export async function getPublishedResourceDefinitionBySlugPublic(
  slug: string,
): Promise<ResourceDefinition | undefined> {
  const cmsResource = await getPublishedResourceBySlugPublic(slug);
  if (cmsResource) {
    return cmsResourceToDefinition(cmsResource);
  }

  const staticResource = getStaticPublishedResources().find(
    (resource) => resource.slug === slug,
  );
  return staticResource;
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
    const merged = staticAll.map((resource) => {
      const cmsRow = cmsBySlug.get(resource.slug);
      return cmsRow ? cmsResourceToDefinition(cmsRow) : resource;
    });

    const staticSlugs = new Set(staticAll.map((resource) => resource.slug));
    const cmsOnlyPublished = cms
      .filter((resource) => resource.status === 'published' && !staticSlugs.has(resource.slug))
      .map(cmsResourceToDefinition);

    return [...merged, ...cmsOnlyPublished].sort((left, right) =>
      left.title.localeCompare(right.title),
    );
  } catch {
    return staticAll;
  }
}

export async function getPublishedResourcesPublic(): Promise<ResourceDefinition[]> {
  if (isSupabasePublicReadConfigured()) {
    try {
      const remote = await fetchPublishedResourcesFromSupabase();
      if (remote !== null) {
        return remote.map(cmsResourceToDefinition);
      }
    } catch {
      // Fall through to static fallback.
    }
  } else if (isSupabaseStoreActive()) {
    try {
      const remote = await fetchPublishedResourcesFromSupabase();
      if (remote !== null) {
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

  if (isSupabasePublicReadConfigured() || isSupabaseStoreActive()) {
    return getStaticPublishedResources();
  }

  const seededPublished = seedCmsResources()
    .filter((resource) => resource.status === 'published')
    .map(cmsResourceToDefinition);

  if (seededPublished.length > 0) {
    return seededPublished;
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

export function getBlogHubStoreDriverLabel(): string {
  return getConfiguredStoreDriver();
}
