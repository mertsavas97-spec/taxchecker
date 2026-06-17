'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { AdminBrandMark } from '@/components/admin/admin-layout';
import { adminNavItems, isAdminNavActive } from '@/lib/admin/navigation';
import { cn } from '@/lib/utils';

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 bg-tc-brand md:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="border-b border-white/10 px-4 py-4">
          <AdminBrandMark inverse />
          <p className="mt-1 text-[11px] text-tc-brand-foreground/70">
            Content operations
          </p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Admin">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const active = isAdminNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm no-underline transition-colors',
                  active
                    ? 'bg-white/12 font-medium text-tc-brand-foreground'
                    : 'text-tc-brand-foreground/75 hover:bg-white/8 hover:text-tc-brand-foreground',
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          <Link
            href="/"
            className="block rounded-md px-3 py-2 text-xs text-tc-brand-foreground/75 no-underline hover:bg-white/8 hover:text-tc-brand-foreground"
          >
            ← Back to site
          </Link>
        </div>
      </div>
    </aside>
  );
}
