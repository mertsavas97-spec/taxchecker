import Link from 'next/link';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminStatusBadge } from '@/components/admin/admin-status-badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { contentRegistry } from '@/lib/admin/content/registry';

export default async function AdminContentPage() {
  const resources = await contentRegistry.getResources();
  const blogPosts = await contentRegistry.getBlogPosts();

  const rows = [
    ...resources.map((item) => ({
      id: item.id,
      type: 'Resource' as const,
      title: item.title,
      status: item.status,
      updatedAt: item.updatedAt,
      href: `/admin/resources/${item.id}`,
    })),
    ...blogPosts.map((item) => ({
      id: item.id,
      type: 'Blog' as const,
      title: item.title,
      status: item.status,
      updatedAt: item.updatedAt,
      href: `/admin/blog/${item.id}`,
    })),
  ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <div>
      <AdminPageHeader
        title="Content"
        description="Unified view of all CMS-managed content types."
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/resources">Resources</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/blog">Blog</Link>
            </Button>
          </>
        }
      />

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-tc-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={`${row.type}-${row.id}`}>
                <TableCell className="font-medium">{row.title}</TableCell>
                <TableCell className="text-muted-foreground">{row.type}</TableCell>
                <TableCell>
                  <AdminStatusBadge status={row.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {row.updatedAt}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={row.href}>Edit</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
