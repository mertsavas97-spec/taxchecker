import Link from 'next/link';

import { Logo } from '@/components/brand/logo';
import { PageContainer } from '@/components/layout/page-container';
import { Section } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { footerNav, POPULAR_CALCULATOR_CTA_LABEL, POPULAR_CALCULATOR_ROUTE, siteConfig } from '@/config/site-navigation';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div>
      <h2 className="tc-overline mb-3">{title}</h2>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={`${title}-${link.href}`}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground no-underline transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter({ className }: { className?: string }) {
  const year = new Date().getFullYear();
  const calculatorLinks = footerNav.calculators.filter(
    (link) => link.href !== '/calculators',
  );

  return (
    <footer className={cn('border-t border-border bg-tc-slate-50/80', className)}>
      <Section spacing="default">
        <PageContainer>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_repeat(4,minmax(0,0.75fr))]">
            <div className="space-y-4 border-l-4 border-tc-brand pl-4 lg:col-span-1">
              <Logo variant="footer" showTagline />
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                Federal tax estimates based on IRS publications. Free tools for
                self-employment, quarterly payments, and entity comparisons—not
                affiliated with the IRS.
              </p>
              <Button size="sm" variant="outline" asChild>
                <Link href={POPULAR_CALCULATOR_ROUTE}>{POPULAR_CALCULATOR_CTA_LABEL}</Link>
              </Button>
            </div>

            <FooterColumn
              title="Calculators"
              links={[
                { label: 'All Calculators', href: '/calculators' },
                ...calculatorLinks,
              ]}
            />
            <FooterColumn title="Resources" links={footerNav.resources} />
            <FooterColumn title="Company" links={footerNav.company} />
            <FooterColumn title="Legal" links={footerNav.legal} />
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="tc-caption">
              © {year} {siteConfig.name}. All rights reserved.
            </p>
            <p className="tc-caption max-w-xl">
              Estimates only — not tax advice. Consult a qualified tax
              professional for your situation.
            </p>
          </div>
        </PageContainer>
      </Section>
    </footer>
  );
}
