import type { Metadata } from 'next';

import { SelfEmployedTaxCalculator } from '@/components/calculators/self-employed-tax-calculator';
import {
  CalculatorShell,
  CalculatorSection,
} from '@/components/calculator/calculator-shell';
import { CalculatorDiscoveryBlock } from '@/components/calculator/calculator-discovery-block';
import { CalculatorPageFooter } from '@/components/calculator/calculator-page-footer';
import { WorkedExampleCards } from '@/components/calculator/worked-example-cards';
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
  buildWorkedExamples,
  getIrsSources,
  getMethodologyPoints,
  getSelfEmployedTaxFaqs,
  SELF_EMPLOYED_TAX_SLUG,
} from '@/lib/calculators/self-employed-tax-page';
import { buildCalculatorMetadata } from '@/lib/seo/metadata';
import {
  buildCalculatorBreadcrumbs,
  buildCalculatorSchema,
  buildFaqSchema,
} from '@/lib/seo/schema';
import { formatIrsVerificationNotice } from '@/lib/calculators/irs-verification-notice';
import { taxYear2025 } from '@/lib/tax-engine';

const calculator = getCalculatorBySlug(SELF_EMPLOYED_TAX_SLUG)!;

export function generateMetadata(): Metadata {
  return buildCalculatorMetadata(calculator);
}

export default function SelfEmployedTaxPage() {
  const faqs = getSelfEmployedTaxFaqs(taxYear2025);
  const methodologyPoints = getMethodologyPoints(taxYear2025);
  const sources = getIrsSources(taxYear2025);
  const workedExamples = buildWorkedExamples('single');

  const faqSchema = buildFaqSchema(faqs);
  const jsonLd: Record<string, unknown>[] = [
    buildCalculatorBreadcrumbs(calculator.shortTitle, calculator.route),
    buildCalculatorSchema(calculator),
    ...(faqSchema ? [faqSchema] : []),
  ];

  return (
    <SiteShell>
      <JsonLd data={jsonLd} id="self-employed-tax" />

      <CalculatorShell
        eyebrow={`${calculator.taxYear} federal estimate`}
        iconSlug={calculator.slug}
        title="Self-Employed Tax Calculator"
        description="Estimate your federal self-employment tax, income tax, quarterly payment, and monthly tax reserve using documented 2025 federal tax rules from IRS publications."
        trustIndicators={[
          authorityCopy.federalConstantsFromPublications(calculator.taxYear),
          'Federal estimate only',
          'No signup required',
          'State taxes excluded',
        ]}
        authority={{
          taxYear: calculator.taxYear,
          lastReviewed: calculator.lastReviewed,
        }}
      >
        <SelfEmployedTaxCalculator />
      </CalculatorShell>

      <Section spacing="sm" className="border-t border-border bg-card/40">
        <PageContainer width="calculator" className="space-y-8">
          <MethodologyBlock
            title="How this estimate works"
            description="A simplified federal model based on IRS Schedule SE and Form 1040 mechanics. Your actual tax return may differ."
            points={methodologyPoints}
            footer={site.disclaimer}
          />

          <CalculatorSection
            title="Worked examples"
            description="Single filer, no other income, no estimated payments. Computed with the same tax engine as the calculator above."
          >
            <WorkedExampleCards examples={workedExamples} />
          </CalculatorSection>

          <FaqBlock items={faqs} defaultOpenIndexes={[0, 1]} />

          <IrsSourceBlock
            sources={sources}
            notice={formatIrsVerificationNotice(taxYear2025.verifiedAt)}
          />

          <CalculatorDiscoveryBlock journeyId="self-employed-tax" />

          <CalculatorPageFooter calculator={calculator} />
        </PageContainer>
      </Section>
    </SiteShell>
  );
}
