'use server';

import { revalidatePath } from 'next/cache';

import { requireAdminSession } from '@/lib/admin/auth/server';
import { contentRegistry } from '@/lib/admin/content/registry';
import type { BlogPostInput, CmsContentStatus } from '@/lib/admin/content/types';

async function assertAdmin() {
  await requireAdminSession();
}

function revalidateBlogPaths(slug?: string) {
  revalidatePath('/admin/blog');
  revalidatePath('/admin');
  revalidatePath('/admin/seo');
  revalidatePath('/blog');
  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
}

function revalidateResourcePaths() {
  revalidatePath('/admin/resources');
  revalidatePath('/admin');
  revalidatePath('/admin/seo');
  revalidatePath('/resources');
}

export async function publishResourceAction(id: string) {
  await assertAdmin();
  await contentRegistry.updateResourceStatus(id, 'published');
  revalidateResourcePaths();
}

export async function archiveResourceAction(id: string) {
  await assertAdmin();
  await contentRegistry.updateResourceStatus(id, 'archived');
  revalidateResourcePaths();
}

export async function draftResourceAction(id: string) {
  await assertAdmin();
  await contentRegistry.updateResourceStatus(id, 'draft');
  revalidateResourcePaths();
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

export type { CmsContentStatus };
