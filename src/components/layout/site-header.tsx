import Link from 'next/link';

import { Logo } from '@/components/brand/logo';
import { MobileNav } from '@/components/layout/mobile-nav';
import { PageContainer } from '@/components/layout/page-container';
import { CalculatorsDropdown } from '@/components/navigation/calculators-dropdown';
import { Button } from '@/components/ui/button';
import {
  aboutNavLink,
  blogNavLink,
  guidesNavLink,
  POPULAR_CALCULATOR_CTA_LABEL,
  POPULAR_CALCULATOR_ROUTE,
} from '@/config/site-navigation';
import { cn } from '@/lib/utils';

export function SiteHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm',
        className,
      )}
    >
      <PageContainer
        as="div"
        className="flex h-14 items-center justify-between gap-4 lg:h-16"
      >
        <Logo />

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Primary"
        >
          <CalculatorsDropdown />
          <Button variant="ghost" size="sm" asChild>
            <Link href={guidesNavLink.href}>{guidesNavLink.label}</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={blogNavLink.href}>{blogNavLink.label}</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={aboutNavLink.href}>{aboutNavLink.label}</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="hidden sm:inline-flex"
            asChild
          >
            <Link href={POPULAR_CALCULATOR_ROUTE}>{POPULAR_CALCULATOR_CTA_LABEL}</Link>
          </Button>
          <MobileNav />
        </div>
      </PageContainer>
    </header>
  );
}
