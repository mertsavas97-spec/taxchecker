import { BlogManager } from '@/components/admin/blog-manager';
import { SeedSyncPanel } from '@/components/admin/seed-sync-panel';
import { contentRegistry } from '@/lib/admin/content/registry';
import { getConfiguredStoreDriver, getStoreDriverLabel } from '@/lib/admin/content/storage';

export default async function AdminBlogPage() {
  const posts = await contentRegistry.getBlogPosts();

  return (
    <div>
      <SeedSyncPanel storeLabel={getStoreDriverLabel(getConfiguredStoreDriver())} />
      <BlogManager posts={posts} />
    </div>
  );
}
