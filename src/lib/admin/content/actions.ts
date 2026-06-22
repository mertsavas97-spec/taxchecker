'use server';

import { revalidatePath } from 'next/cache';

import { isAdminAuthenticated } from '@/lib/admin/auth/server';
import { contentRegistry } from '@/lib/admin/content/registry';
import { isSupabaseStoreActive } from '@/lib/admin/content/storage';
import {
  syncSupabaseCmsSeed,
  type SeedSyncResult,
} from '@/lib/admin/content/supabase-seed';
import type { BlogPostInput, CmsBlogPost, ResourceInput } from '@/lib/admin/content/types';

async function assertAdmin() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    throw new Error('Admin authentication required.');
  }
}

function revalidateBlogPaths(slug?: string) {
  revalidatePath('/admin/blog', 'layout');
  revalidatePath('/admin', 'layout');
  revalidatePath('/admin/seo', 'layout');
  revalidatePath('/admin/content', 'layout');
  revalidatePath('/blog', 'page');
  revalidatePath('/sitemap.xml', 'page');
  if (slug) {
    revalidatePath(`/blog/${slug}`, 'page');
  }
}

export type SaveBlogPostResult = {
  post: CmsBlogPost;
  revalidationWarning?: string;
};

function runBlogRevalidation(slug: string, adminPostId?: string) {
  revalidateBlogPaths(slug);
  if (adminPostId) {
    revalidatePath(`/admin/blog/${adminPostId}`);
  }
}

function revalidateResourcePaths(slug?: string, previousSlug?: string) {
  revalidatePath('/admin/resources', 'layout');
  revalidatePath('/admin', 'layout');
  revalidatePath('/admin/seo', 'layout');
  revalidatePath('/admin/content', 'layout');
  revalidatePath('/resources', 'page');
  revalidatePath('/sitemap.xml', 'page');
  if (slug) {
    const route =
      slug === 'taxchecker-methodology' ? '/methodology' : `/resources/${slug}`;
    revalidatePath(route, 'page');
  }
  if (previousSlug && previousSlug !== slug) {
    const previousRoute =
      previousSlug === 'taxchecker-methodology'
        ? '/methodology'
        : `/resources/${previousSlug}`;
    revalidatePath(previousRoute, 'page');
  }
}

export async function syncSeedContentAction(force = false): Promise<SeedSyncResult> {
  await assertAdmin();

  if (!isSupabaseStoreActive()) {
    throw new Error('Seed sync is only available when Supabase CMS storage is active.');
  }

  const result = await syncSupabaseCmsSeed({ force });

  revalidatePath('/admin');
  revalidatePath('/admin/content');
  revalidatePath('/admin/calculators');
  revalidatePath('/admin/resources');
  revalidatePath('/admin/blog');
  revalidatePath('/admin/seo');
  revalidatePath('/blog');
  revalidatePath('/resources');
  revalidatePath('/sitemap.xml');

  return result;
}

export async function publishResourceAction(id: string) {
  await assertAdmin();
  const resource = await contentRegistry.updateResourceStatus(id, 'published');
  revalidateResourcePaths(resource?.slug);
}

export async function archiveResourceAction(id: string) {
  await assertAdmin();
  const resource = await contentRegistry.updateResourceStatus(id, 'archived');
  revalidateResourcePaths(resource?.slug);
}

export async function draftResourceAction(id: string) {
  await assertAdmin();
  const resource = await contentRegistry.updateResourceStatus(id, 'draft');
  revalidateResourcePaths(resource?.slug);
}

export async function publishBlogPostAction(id: string) {
  await assertAdmin();
  const post = await contentRegistry.updateBlogPostStatus(id, 'published');
  revalidateBlogPaths(post?.slug);
}

export async function archiveBlogPostAction(id: string) {
  await assertAdmin();
  const post = await contentRegistry.updateBlogPostStatus(id, 'archived');
  revalidateBlogPaths(post?.slug);
}

export async function draftBlogPostAction(id: string) {
  await assertAdmin();
  const post = await contentRegistry.updateBlogPostStatus(id, 'draft');
  revalidateBlogPaths(post?.slug);
}

export async function createBlogPostAction(input: {
  title: string;
  slug: string;
  category: string;
}) {
  await assertAdmin();
  const post = await contentRegistry.createBlogPost(input);
  revalidateBlogPaths(post.slug);
  return post;
}

export async function saveBlogPostAction(
  input: BlogPostInput,
): Promise<SaveBlogPostResult> {
  await assertAdmin();
  const post = await contentRegistry.upsertBlogPost(input);

  let revalidationWarning: string | undefined;
  try {
    runBlogRevalidation(post.slug, post.id);
  } catch (error) {
    revalidationWarning =
      error instanceof Error ? error.message : 'Cache revalidation failed.';
  }

  return { post, revalidationWarning };
}

export async function createResourceAction(input: {
  title: string;
  slug: string;
  category: string;
}) {
  await assertAdmin();
  const resource = await contentRegistry.createResource(input);
  revalidateResourcePaths(resource.slug);
  return resource;
}

export async function saveResourceAction(input: ResourceInput) {
  await assertAdmin();
  const existing = input.id ? await contentRegistry.getResourceById(input.id) : undefined;
  const previousSlug = existing?.slug;
  const resource = await contentRegistry.upsertResource(input);
  revalidateResourcePaths(resource.slug, previousSlug);
  if (input.id) {
    revalidatePath(`/admin/resources/${input.id}`);
  }
  return resource;
}
