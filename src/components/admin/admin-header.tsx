'use client';

import { useRouter } from 'next/navigation';

import { AdminStoreBadge } from '@/components/admin/admin-store-badge';
import type { AdminContentStoreDriver } from '@/lib/admin/content/storage/types';
import { Button } from '@/components/ui/button';

export function AdminHeader({ storeDriver }: { storeDriver: AdminContentStoreDriver }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <header className="flex h-14 items-center justify-between gap-3 border-b border-border bg-card px-4 md:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <p className="truncate text-sm text-muted-foreground md:hidden">TaxChecker Admin</p>
        <AdminStoreBadge driver={storeDriver} className="hidden sm:inline" />
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden text-xs text-muted-foreground lg:inline">
          Internal CMS — not indexed
        </span>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
