'use client';

import Link from 'next/link';
import { MenuIcon } from 'lucide-react';
import { useState } from 'react';

import { Logo } from '@/components/brand/logo';
import {
  aboutNavLink,
  allCalculators,
  blogNavLink,
  calculatorsHubLink,
  footerNav,
  guidesNavLink,
  methodologyNavLink,
} from '@/config/site-navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

function MobileNavSection({
  title,
  links,
  onNavigate,
}: {
  title: string;
  links: readonly { label: string; href: string; description?: string }[];
  onNavigate: () => void;
}) {
  return (
    <div className="space-y-2">
      <p className="tc-overline px-1">{title}</p>
      <ul className="space-y-1">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={onNavigate}
              className="block rounded-md px-2 py-2 text-sm font-medium text-foreground no-underline hover:bg-muted"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MobileNav({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn('lg:hidden', className)}
          aria-label="Open navigation menu"
        >
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-sm overflow-y-auto">
        <SheetHeader className="border-b pb-4 text-left">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Logo />
        </SheetHeader>
        <nav className="flex flex-col gap-6 py-6" aria-label="Mobile">
          <MobileNavSection
            title="Calculators"
            links={[calculatorsHubLink, ...allCalculators]}
            onNavigate={() => setOpen(false)}
          />
          <Separator />
          <MobileNavSection
            title="Site"
            links={[guidesNavLink, blogNavLink, aboutNavLink]}
            onNavigate={() => setOpen(false)}
          />
          <Separator />
          <MobileNavSection
            title="Resources"
            links={[guidesNavLink, methodologyNavLink]}
            onNavigate={() => setOpen(false)}
          />
          <Separator />
          <MobileNavSection
            title="Company"
            links={footerNav.company}
            onNavigate={() => setOpen(false)}
          />
          <Separator />
          <MobileNavSection
            title="Legal"
            links={footerNav.legal}
            onNavigate={() => setOpen(false)}
          />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
