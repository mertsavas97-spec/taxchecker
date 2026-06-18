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
  archiveResourceAction,
  draftResourceAction,
  publishResourceAction,
} from '@/lib/admin/content/actions';
import type { CmsResource } from '@/lib/admin/content/types';

const ALL = '__all__';

export function ResourceManager({ resources }: { resources: CmsResource[] }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL);
  const [pending, startTransition] = useTransition();

  const categories = useMemo(
    () => [...new Set(resources.map((item) => item.category))].sort(),
    [resources],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return resources.filter((item) => {
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
  }, [resources, query, statusFilter, categoryFilter]);

  function runAction(action: (id: string) => Promise<void>, id: string) {
    startTransition(async () => {
      await action(id);
    });
  }

  return (
    <div>
      <AdminPageHeader
        title="Resources"
        description="Manage resource article metadata and publishing status."
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
        emptyTitle="No resources match your filters"
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
                  <Link href={`/admin/resources/${row.id}`}>Edit</Link>
                </Button>
                {row.status !== 'published' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() => runAction(publishResourceAction, row.id)}
                  >
                    Publish
                  </Button>
                ) : null}
                {row.status !== 'archived' ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={() => runAction(archiveResourceAction, row.id)}
                  >
                    Archive
                  </Button>
                ) : null}
                {row.status === 'archived' ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={() => runAction(draftResourceAction, row.id)}
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
