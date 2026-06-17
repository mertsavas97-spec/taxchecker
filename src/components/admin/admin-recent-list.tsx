import Link from 'next/link';

import { AdminEmptyState } from '@/components/admin/admin-empty-state';
import { AdminStatusBadge } from '@/components/admin/admin-status-badge';
import type { CmsContentStatus } from '@/lib/admin/content/types';

export interface AdminRecentItem {
  id: string;
  type: 'resource' | 'blog';
  title: string;
  status: CmsContentStatus;
  updatedAt: string;
  href: string;
}

export function AdminRecentList({
  title,
  items,
  emptyTitle,
}: {
  title: string;
  items: AdminRecentItem[];
  emptyTitle: string;
}) {
  return (
    <section className="rounded-lg border border-border bg-card shadow-tc-sm">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      {items.length === 0 ? (
        <div className="p-4">
          <AdminEmptyState title={emptyTitle} />
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex items-center justify-between gap-3 px-4 py-3 no-underline transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.type === 'resource' ? 'Resource' : 'Blog'} ·{' '}
                    {item.updatedAt}
                  </p>
                </div>
                <AdminStatusBadge status={item.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
