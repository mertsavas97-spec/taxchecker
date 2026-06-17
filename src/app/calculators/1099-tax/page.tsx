import type { Metadata } from 'next';

import { Tax1099WorkedExampleCards } from '@/components/calculator/1099-worked-example-cards';
import { CalculatorDiscoveryBlock } from '@/components/calculator/calculator-discovery-block';
import { CalculatorPageFooter } from '@/components/calculator/calculator-page-footer';
import {
  CalculatorShell,
  CalculatorSection,
} from '@/components/calculator/calculator-shell';
import { Tax1099Calculator } from '@/components/calculators/1099-tax-calculator';
import { FaqBlock } from '@/components/content/faq-block';
import { IrsSourceBlock } from '@/components/content/irs-source-block';
import { MethodologyBlock } from '@/components/content/methodology-block';
import { PageContainer, Section } from '@/components/layout/page-container';
import { SiteShell } from '@/components/layout/site-shell';
import { JsonLd } from '@/components/seo/json-ld';
import { authorityCopy } from '@/config/authority';
import { getCalculatorBySlug } from '@/config/calculators';
import { site } from '@/config/site';
import {
  build1099WorkedExamples,
  get1099IrsSources,
  get1099MethodologyPoints,
  get1099TaxFaqs,
  TAX_1099_SLUG,
} from '@/lib/calculators/1099-tax-page';
import { buildCalculatorMetadata } from '@/lib/seo/metadata';
import {
  buildCalculatorBreadcrumbs,
  buildCalculatorSchema,
  buildFaqSchema,
} from '@/lib/seo/schema';
import { formatIrsVerificationNotice } from '@/lib/calculators/irs-verification-notice';
import { taxYear2025 } from '@/lib/tax-engine';

const calculator = getCalculatorBySlug(TAX_1099_SLUG)!;

export function generateMetadata(): Metadata {
  return buildCalculatorMetadata(calculator);
}

export default function Tax1099Page() {
  const faqs = get1099TaxFaqs(taxYear2025);
  const methodologyPoints = get1099MethodologyPoints(taxYear2025);
  const sources = get1099IrsSources(taxYear2025);
  const workedExamples = build1099WorkedExamples('single');

  const faqSchema = buildFaqSchema(faqs);
  const jsonLd: Record<string, unknown>[] = [
    buildCalculatorBreadcrumbs(calculator.shortTitle, calculator.route),
    buildCalculatorSchema(calculator),
    ...(faqSchema ? [faqSchema] : []),
  ];

  return (
    <SiteShell>
      <JsonLd data={jsonLd} id="1099-tax" />

      <CalculatorShell
        eyebrow={`${calculator.taxYear} federal estimate`}
        iconSlug={calculator.slug}
        title="1099 Tax Calculator"
        description="Estimate your federal tax on 1099 income after business expenses, including self-employment tax, income tax, quarterly payments, and monthly tax reserve."
        trustIndicators={[
          authorityCopy.federalConstantsFromPublications(calculator.taxYear),
          'Business expenses supported',
          'Federal estimate only',
          'No signup required',
        ]}
        authority={{
          taxYear: calculator.taxYear,
          lastReviewed: calculator.lastReviewed,
        }}
      >
        <Tax1099Calculator />
      </CalculatorShell>

      <Section spacing="sm" className="border-t border-border bg-card/40">
        <PageContainer width="calculator" className="space-y-8">
          <MethodologyBlock
            title="How this estimate works"
            description="A simplified federal model for 1099 contractor income: gross income minus expenses, then Schedule SE and Form 1040 mechanics. Your actual tax return may differ."
            points={methodologyPoints}
            footer={site.disclaimer}
          />

          <CalculatorSection
            title="Worked examples"
            description="Single filer, no other income, no estimated payments. Computed with the same tax engine as the calculator above."
          >
            <Tax1099WorkedExampleCards examples={workedExamples} />
          </CalculatorSection>

          <FaqBlock items={faqs} defaultOpenIndexes={[0, 1]} />

          <IrsSourceBlock
            sources={sources}
            notice={formatIrsVerificationNotice(taxYear2025.verifiedAt)}
          />

          <CalculatorDiscoveryBlock journeyId="1099-tax" />

          <CalculatorPageFooter calculator={calculator} />
        </PageContainer>
      </Section>
    </SiteShell>
  );
}
