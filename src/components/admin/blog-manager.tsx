'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';

import { AdminDataTable } from '@/components/admin/admin-data-table';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminStatusBadge } from '@/components/admin/admin-status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  archiveBlogPostAction,
  draftBlogPostAction,
  publishBlogPostAction,
} from '@/lib/admin/content/actions';
import type { CmsBlogPost } from '@/lib/admin/content/types';

const ALL = '__all__';

export function BlogManager({ posts }: { posts: CmsBlogPost[] }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL);
  const [pending, startTransition] = useTransition();

  const categories = useMemo(
    () => [...new Set(posts.map((item) => item.category))].sort(),
    [posts],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return posts.filter((item) => {
      const matchesQuery =
        !normalized ||
        item.title.toLowerCase().includes(normalized) ||
        item.slug.toLowerCase().includes(normalized);
      const matchesStatus =
        statusFilter === ALL || item.status === statusFilter;
      const matchesCategory =
        categoryFilter === ALL || item.category === categoryFilter;
      return matchesQuery && matchesStatus && matchesCategory;
    });
  }, [posts, query, statusFilter, categoryFilter]);

  function runAction(action: (id: string) => Promise<void>, id: string) {
    startTransition(async () => {
      await action(id);
    });
  }

  return (
    <div>
      <AdminPageHeader
        title="Blog"
        description="Manage blog post metadata and publishing workflow."
        actions={
          <>
            <Button size="sm" asChild>
              <Link href="/admin/blog/new">Create post</Link>
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Input
          placeholder="Search by title or slug…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AdminDataTable
        rows={filtered}
        emptyTitle="No blog posts match your filters"
        columns={[
          {
            key: 'title',
            header: 'Title',
            render: (row) => (
              <div>
                <p className="font-medium">{row.title}</p>
                <p className="text-xs text-muted-foreground">{row.slug}</p>
              </div>
            ),
          },
          {
            key: 'category',
            header: 'Category',
            render: (row) => row.category,
          },
          {
            key: 'status',
            header: 'Status',
            render: (row) => <AdminStatusBadge status={row.status} />,
          },
          {
            key: 'updated',
            header: 'Updated',
            render: (row) => (
              <span className="text-muted-foreground">{row.updatedAt}</span>
            ),
          },
          {
            key: 'actions',
            header: 'Actions',
            className: 'text-right',
            render: (row) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/blog/${row.id}`}>Edit</Link>
                </Button>
                {row.status !== 'published' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() => runAction(publishBlogPostAction, row.id)}
                  >
                    Publish
                  </Button>
                ) : null}
                {row.status !== 'archived' ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={() => runAction(archiveBlogPostAction, row.id)}
                  >
                    Archive
                  </Button>
                ) : null}
                {row.status === 'archived' ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={() => runAction(draftBlogPostAction, row.id)}
                  >
                    Restore
                  </Button>
                ) : null}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
