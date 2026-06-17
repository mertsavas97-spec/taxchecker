import { AuthorityBar } from '@/components/calculator/authority-bar';
import { CalculatorTopicIcon } from '@/components/calculator/calculator-topic-icon';
import { CalculatorTrustIndicators } from '@/components/calculator/trust-indicators';
import { ContentWidth, PageContainer, Section } from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { cn } from '@/lib/utils';

export function CalculatorShell({
  title,
  description,
  eyebrow,
  iconSlug,
  trustIndicators,
  authority,
  children,
  sidebar,
  className,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  iconSlug?: string;
  trustIndicators?: string[];
  authority: {
    taxYear: number;
    lastReviewed: string;
  };
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}) {
  return (
    <Section spacing="xs" className={cn('border-b border-border/60 bg-card/30', className)}>
      <PageContainer width="calculator">
        <header className="mb-3 max-w-3xl space-y-2">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Calculators', href: '/calculators' },
              { label: title },
            ]}
          />
          {eyebrow ? <p className="tc-overline">{eyebrow}</p> : null}
          <div className="flex items-start gap-3">
            {iconSlug ? <CalculatorTopicIcon slug={iconSlug} size="lg" className="mt-0.5" /> : null}
            <div className="min-w-0 space-y-1">
              <h1 className="tc-heading-page text-foreground">{title}</h1>
              {description ? (
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          {trustIndicators && trustIndicators.length > 0 ? (
            <CalculatorTrustIndicators items={trustIndicators} className="pt-0.5" />
          ) : null}
          <AuthorityBar
            taxYear={authority.taxYear}
            lastReviewed={authority.lastReviewed}
          />
        </header>

        <div
          className={cn(
            'grid gap-5',
            sidebar ? 'lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]' : '',
          )}
        >
          <div className="min-w-0 space-y-5">{children}</div>
          {sidebar ? (
            <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
              {sidebar}
            </aside>
          ) : null}
        </div>
      </PageContainer>
    </Section>
  );
}

export function CalculatorSection({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('space-y-4', className)}>
      {title ? (
        <div className="space-y-0.5">
          <h2 className="tc-heading-subsection">{title}</h2>
          {description ? <p className="tc-caption">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function CalculatorProse({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ContentWidth variant="prose" className={cn('tc-body space-y-3', className)}>
      {children}
    </ContentWidth>
  );
}
