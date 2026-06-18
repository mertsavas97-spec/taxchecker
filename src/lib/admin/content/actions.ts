'use server';

import { revalidatePath } from 'next/cache';

import { isAdminAuthenticated } from '@/lib/admin/auth/server';
import { contentRegistry } from '@/lib/admin/content/registry';
import { isSupabaseStoreActive } from '@/lib/admin/content/storage';
import {
  syncSupabaseCmsSeed,
  type SeedSyncResult,
} from '@/lib/admin/content/supabase-seed';
import type { BlogPostInput } from '@/lib/admin/content/types';

async function assertAdmin() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    throw new Error('Admin authentication required.');
  }
}

function revalidateBlogPaths(slug?: string) {
  revalidatePath('/admin/blog');
  revalidatePath('/admin');
  revalidatePath('/admin/seo');
  revalidatePath('/admin/content');
  revalidatePath('/blog');
  revalidatePath('/sitemap.xml');
  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
}

function revalidateResourcePaths(slug?: string) {
  revalidatePath('/admin/resources');
  revalidatePath('/admin');
  revalidatePath('/admin/seo');
  revalidatePath('/admin/content');
  revalidatePath('/resources');
  revalidatePath('/sitemap.xml');
  if (slug) {
    const route =
      slug === 'methodology' ? '/methodology' : `/resources/${slug}`;
    revalidatePath(route);
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

export async function saveBlogPostAction(input: BlogPostInput) {
  await assertAdmin();
  const post = await contentRegistry.upsertBlogPost(input);
  revalidateBlogPaths(post.slug);
  if (input.id) {
    revalidatePath(`/admin/blog/${input.id}`);
  }
  return post;
}
