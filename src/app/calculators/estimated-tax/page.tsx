import type { Metadata } from 'next';

import { EstimatedWorkedExampleCards } from '@/components/calculator/estimated-worked-example-cards';
import { CalculatorDiscoveryBlock } from '@/components/calculator/calculator-discovery-block';
import { CalculatorPageFooter } from '@/components/calculator/calculator-page-footer';
import {
  CalculatorShell,
  CalculatorSection,
} from '@/components/calculator/calculator-shell';
import { EstimatedTaxCalculator } from '@/components/calculators/estimated-tax-calculator';
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
  buildEstimatedWorkedExamples,
  ESTIMATED_TAX_SLUG,
  getEstimatedIrsSources,
  getEstimatedSafeHarborPoints,
  getEstimatedTaxFaqs,
  getEstimatedVsQuarterlyTaxPoints,
  getHowEstimatedTaxCalculatorWorksPoints,
  getWhatEstimatedTaxMeansPoints,
} from '@/lib/calculators/estimated-tax-page';
import { buildCalculatorMetadata } from '@/lib/seo/metadata';
import {
  buildCalculatorBreadcrumbs,
  buildCalculatorSchema,
  buildFaqSchema,
} from '@/lib/seo/schema';
import { formatIrsVerificationNotice } from '@/lib/calculators/irs-verification-notice';
import { taxYear2025 } from '@/lib/tax-engine';

const calculator = getCalculatorBySlug(ESTIMATED_TAX_SLUG)!;

export function generateMetadata(): Metadata {
  return buildCalculatorMetadata(calculator);
}

export default function EstimatedTaxPage() {
  const faqs = getEstimatedTaxFaqs(taxYear2025);
  const whatEstimatedTaxMeans = getWhatEstimatedTaxMeansPoints();
  const howCalculatorWorks = getHowEstimatedTaxCalculatorWorksPoints(taxYear2025);
  const estimatedVsQuarterly = getEstimatedVsQuarterlyTaxPoints();
  const safeHarborPoints = getEstimatedSafeHarborPoints(taxYear2025);
  const sources = getEstimatedIrsSources(taxYear2025);
  const workedExamples = buildEstimatedWorkedExamples('single');

  const faqSchema = buildFaqSchema(faqs);
  const jsonLd: Record<string, unknown>[] = [
    buildCalculatorBreadcrumbs(calculator.shortTitle, calculator.route),
    buildCalculatorSchema(calculator),
    ...(faqSchema ? [faqSchema] : []),
  ];

  return (
    <SiteShell>
      <JsonLd data={jsonLd} id="estimated-tax" />

      <CalculatorShell
        eyebrow={`${calculator.taxYear} federal estimate`}
        iconSlug={calculator.slug}
        title="Estimated Tax Calculator"
        description="Estimate your annual federal tax liability, remaining tax, safe harbor target, and payment schedule using documented 2025 federal tax rules from IRS publications."
        trustIndicators={[
          authorityCopy.federalConstantsFromPublications(calculator.taxYear),
          'Safe harbor estimates',
          'Federal estimate only',
          'No signup required',
        ]}
        authority={{
          taxYear: calculator.taxYear,
          lastReviewed: calculator.lastReviewed,
        }}
      >
        <EstimatedTaxCalculator />
      </CalculatorShell>

      <Section spacing="sm" className="border-t border-border bg-card/40">
        <PageContainer width="calculator" className="space-y-8">
          <MethodologyBlock
            title="What estimated tax means"
            description="Federal estimated tax helps taxpayers pay income and self-employment tax during the year when paycheck withholding will not cover the full liability."
            points={whatEstimatedTaxMeans}
          />

          <MethodologyBlock
            title="How this calculator estimates annual federal tax"
            description="A simplified IRS Form 1040-ES worksheet using annualized income, withholding, estimated payments, and optional prior-year safe harbor inputs."
            points={howCalculatorWorks}
            footer={site.disclaimer}
          />

          <MethodologyBlock
            title="Estimated tax vs quarterly tax"
            description="Both tools use the same federal tax engine. The difference is which planning questions they emphasize."
            points={estimatedVsQuarterly}
          />

          <MethodologyBlock
            title="Safe harbor rules"
            description="Paying enough federal tax during the year through withholding and estimated payments can help avoid underpayment penalties."
            points={safeHarborPoints}
          />

          <CalculatorSection
            title="Worked examples"
            description="Single filer, no withholding, no estimated payments, no prior-year safe harbor inputs. Computed with the same tax engine as the calculator above."
          >
            <EstimatedWorkedExampleCards examples={workedExamples} />
          </CalculatorSection>

          <FaqBlock items={faqs} defaultOpenIndexes={[0, 1]} />

          <IrsSourceBlock
            sources={sources}
            notice={formatIrsVerificationNotice(taxYear2025.verifiedAt)}
          />

          <CalculatorDiscoveryBlock journeyId="estimated-tax" />

          <CalculatorPageFooter calculator={calculator} />
        </PageContainer>
      </Section>
    </SiteShell>
  );
}
