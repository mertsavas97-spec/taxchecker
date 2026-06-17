'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { adminNavItems, isAdminNavActive } from '@/lib/admin/navigation';
import { cn } from '@/lib/utils';

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-border bg-card px-3 py-2 md:hidden"
      aria-label="Admin navigation"
    >
      {adminNavItems.map((item) => {
        const active = isAdminNavActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1 text-xs font-medium no-underline transition-colors',
              active
                ? 'border-tc-brand/30 bg-tc-brand/10 text-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-muted',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
