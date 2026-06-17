import { BlogManager } from '@/components/admin/blog-manager';
import { contentRegistry } from '@/lib/admin/content/registry';

export default async function AdminBlogPage() {
  const posts = await contentRegistry.getBlogPosts();
  return <BlogManager posts={posts} />;
}
