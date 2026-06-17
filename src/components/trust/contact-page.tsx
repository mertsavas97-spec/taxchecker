import Link from 'next/link';
import { AlertTriangleIcon } from 'lucide-react';

import { PageContainer, Section } from '@/components/layout/page-container';
import { SiteShell } from '@/components/layout/site-shell';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { ContactForm } from '@/components/trust/contact-form';
import { JsonLd } from '@/components/seo/json-ld';
import { getTrustPageBySlug } from '@/config/trust-pages';
import { buildStaticPageBreadcrumbs } from '@/lib/seo/schema';

export function ContactPage() {
  const page = getTrustPageBySlug('contact')!;
  const jsonLd = buildStaticPageBreadcrumbs(page.shortTitle, page.route);

  return (
    <SiteShell>
      <JsonLd data={jsonLd} id="contact" />

      <Section spacing="xs" className="border-b border-border bg-tc-slate-50/60">
        <PageContainer width="page">
          <header className="max-w-[56rem] space-y-2">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Contact' },
              ]}
            />
            <p className="tc-overline">Contact</p>
            <h1 className="tc-heading-page text-foreground">Contact TaxChecker</h1>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Questions about calculators, methodology, or the website? Use the form below.
              We do not publish a public support email address.
            </p>
          </header>
        </PageContainer>
      </Section>

      <Section spacing="sm">
        <PageContainer width="page">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-8">
            <div className="max-w-[56rem] rounded-xl border border-border bg-card p-5 shadow-tc-sm sm:p-6">
              <ContactForm />
            </div>

            <aside className="space-y-4">
              <div className="rounded-xl border border-tc-warning/25 bg-tc-warning-muted/30 p-4">
                <div className="flex items-start gap-2.5">
                  <AlertTriangleIcon
                    className="mt-0.5 size-4 shrink-0 text-tc-warning"
                    aria-hidden
                  />
                  <div className="space-y-2">
                    <h2 className="text-sm font-semibold text-foreground">
                      What we cannot provide
                    </h2>
                    <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                      <li>Individual tax advice or filing recommendations</li>
                      <li>Review of your personal tax situation or return</li>
                      <li>Worker classification or entity election guidance</li>
                      <li>Responses to IRS notices or audit matters</li>
                    </ul>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Contact is for general website, calculator, and methodology support only.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-tc-sm">
                <h2 className="text-sm font-semibold text-foreground">Helpful links</h2>
                <ul className="mt-2 space-y-2 text-xs">
                  <li>
                    <Link href="/methodology" className="font-medium text-tc-link no-underline hover:underline">
                      Methodology
                    </Link>
                  </li>
                  <li>
                    <Link href="/disclaimer" className="font-medium text-tc-link no-underline hover:underline">
                      Disclaimer
                    </Link>
                  </li>
                  <li>
                    <Link href="/calculators" className="font-medium text-tc-link no-underline hover:underline">
                      Calculators
                    </Link>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </PageContainer>
      </Section>
    </SiteShell>
  );
}
