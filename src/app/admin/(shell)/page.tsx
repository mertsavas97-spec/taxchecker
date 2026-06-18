import { AdminEmptyState } from '@/components/admin/admin-empty-state';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminRecentList } from '@/components/admin/admin-recent-list';
import { AdminStatCard } from '@/components/admin/admin-stat-card';
import { AdminStatusBadge } from '@/components/admin/admin-status-badge';
import { SeedSyncPanel } from '@/components/admin/seed-sync-panel';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { contentRegistry } from '@/lib/admin/content/registry';
import { getConfiguredStoreDriver, getStoreDriverLabel } from '@/lib/admin/content/storage';

export default async function AdminDashboardPage() {
  const stats = await contentRegistry.getDashboardStats();
  const recent = await contentRegistry.getRecentContent(8);
  const recentResources = (await contentRegistry.getResources())
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      type: 'resource' as const,
      title: item.title,
      status: item.status,
      updatedAt: item.updatedAt,
      href: `/admin/resources/${item.id}`,
    }));
  const recentBlog = (await contentRegistry.getBlogPosts())
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      type: 'blog' as const,
      title: item.title,
      status: item.status,
      updatedAt: item.updatedAt,
      href: `/admin/blog/${item.id}`,
    }));

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Content operations overview for TaxChecker.app. Store mode is shown in the header badge."
      />

      <SeedSyncPanel storeLabel={getStoreDriverLabel(getConfiguredStoreDriver())} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AdminStatCard label="Total calculators" value={stats.totalCalculators} />
        <AdminStatCard
          label="Published resources"
          value={stats.publishedResources}
        />
        <AdminStatCard label="Draft resources" value={stats.draftResources} />
        <AdminStatCard
          label="Published blog posts"
          value={stats.publishedBlogPosts}
        />
        <AdminStatCard label="Draft blog posts" value={stats.draftBlogPosts} />
        <AdminStatCard
          label="Last content update"
          value={stats.lastContentUpdate ?? '—'}
        />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Recent Content
        </h2>
        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-tc-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="p-0">
                    <AdminEmptyState
                      title="No recent content"
                      description="Create or update a blog post or resource to see activity here."
                      className="border-0 shadow-none"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                recent.map((item) => (
                  <TableRow key={`${item.type}-${item.id}`}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">
                      {item.type}
                    </TableCell>
                    <TableCell>
                      <AdminStatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.updatedAt}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <AdminRecentList
          title="Recently Updated Resources"
          items={recentResources}
          emptyTitle="No resources yet"
        />
        <AdminRecentList
          title="Recently Updated Blog Posts"
          items={recentBlog}
          emptyTitle="No blog posts yet"
        />
      </div>
    </div>
  );
}
