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
import { isSupabaseStoreActive } from '@/lib/admin/content/storage';
import {
  shouldUseRemotePublishedFallback,
} from '@/lib/admin/content/supabase-seed-policy';
import type { CmsBlogPost, CmsResource } from '@/lib/admin/content/types';
import { createAdminClient, isSupabaseAdminConfigured } from '@/lib/supabase/admin';
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

async function fetchPublishedBlogPostsFromSupabase(): Promise<CmsBlogPost[] | null> {
  noStore();

  try {
    const supabase = await getPublishedCmsClient();
    const { data, error } = await supabase
      .from('cms_blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) return null;
    return ((data ?? []) as DbCmsBlogPost[]).map(mapDbBlogPostToCms);
  } catch {
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
    return mapDbBlogPostToCms(data as DbCmsBlogPost);
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

export async function getPublishedBlogPostsPublic(): Promise<CmsBlogPost[]> {
  if (isSupabaseStoreActive()) {
    try {
      const remote = await fetchPublishedBlogPostsFromSupabase();
      if (shouldUseRemotePublishedFallback(remote)) {
        return remote;
      }
    } catch {
      // Fall through to registry/static fallback.
    }
  }

  const posts = await contentRegistry.getBlogPosts();
  const publishedFromStore = posts
    .filter((post) => post.status === 'published')
    .sort((a, b) => {
      const aDate = a.publishedAt ?? a.updatedAt;
      const bDate = b.publishedAt ?? b.updatedAt;
      return bDate.localeCompare(aDate);
    });

  if (publishedFromStore.length > 0) {
    return publishedFromStore;
  }

  if (isSupabaseStoreActive()) {
    return [];
  }

  return seedCmsBlogPosts()
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
  if (isSupabaseStoreActive()) {
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
  if (isSupabaseStoreActive()) {
    try {
      const remote = await fetchPublishedResourcesFromSupabase();
      if (shouldUseRemotePublishedFallback(remote)) {
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

  if (isSupabaseStoreActive()) {
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
  if (isSupabaseStoreActive()) {
    try {
      const remote = await fetchPublishedResourcesFromSupabase();
      if (shouldUseRemotePublishedFallback(remote)) {
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

  if (isSupabaseStoreActive()) {
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
