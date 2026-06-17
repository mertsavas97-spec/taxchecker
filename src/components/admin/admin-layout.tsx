import Link from 'next/link';

import { AdminHeader } from '@/components/admin/admin-header';
import { AdminMobileNav } from '@/components/admin/admin-mobile-nav';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import type { AdminContentStoreDriver } from '@/lib/admin/content/storage/types';
import { cn } from '@/lib/utils';

export function AdminLayout({
  children,
  storeDriver,
  className,
}: {
  children: React.ReactNode;
  storeDriver: AdminContentStoreDriver;
  className?: string;
}) {
  return (
    <div className={cn('min-h-screen bg-tc-slate-50/80', className)}>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader storeDriver={storeDriver} />
          <AdminMobileNav />
          <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function AdminAuthLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex min-h-screen items-center justify-center bg-tc-slate-50/80 px-4',
        className,
      )}
    >
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

export function AdminBrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/admin" className="no-underline">
      <span
        className={
          inverse
            ? 'text-sm font-semibold text-tc-brand-foreground'
            : 'text-sm font-semibold text-foreground'
        }
      >
        TaxChecker
      </span>
      <span
        className={
          inverse
            ? 'ml-1.5 text-xs font-medium text-tc-brand-foreground/70'
            : 'ml-1.5 text-xs font-medium text-muted-foreground'
        }
      >
        Admin
      </span>
    </Link>
  );
}
