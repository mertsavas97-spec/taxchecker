import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { cn } from '@/lib/utils';

export function SiteShell({
  children,
  className,
  mainClassName,
}: {
  children: React.ReactNode;
  className?: string;
  mainClassName?: string;
}) {
  return (
    <div className={cn('flex min-h-full flex-col', className)}>
      <a href="#main-content" className="tc-skip-link tc-focus-ring">
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content" className={cn('flex-1', mainClassName)}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
