import { notFound } from 'next/navigation';

import { BlogEditor } from '@/components/admin/blog-editor';
import { contentRegistry } from '@/lib/admin/content/registry';

export default async function AdminBlogEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await contentRegistry.getBlogPostById(id);

  if (!post) {
    notFound();
  }

  return <BlogEditor post={post} mode="edit" />;
}
