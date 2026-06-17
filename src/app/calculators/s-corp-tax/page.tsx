import type { Metadata } from 'next';

import { CalculatorDiscoveryBlock } from '@/components/calculator/calculator-discovery-block';
import { CalculatorPageFooter } from '@/components/calculator/calculator-page-footer';
import {
  CalculatorShell,
  CalculatorSection,
} from '@/components/calculator/calculator-shell';
import { SCorpWorkedExampleCards } from '@/components/calculator/s-corp-worked-example-cards';
import { SCorpTaxCalculator } from '@/components/calculators/s-corp-tax-calculator';
import { FaqBlock } from '@/components/content/faq-block';
import { IrsSourceBlock } from '@/components/content/irs-source-block';
import { MethodologyBlock } from '@/components/content/methodology-block';
import { PageContainer, Section } from '@/components/layout/page-container';
import { SiteShell } from '@/components/layout/site-shell';
import { JsonLd } from '@/components/seo/json-ld';
import { getCalculatorBySlug } from '@/config/calculators';
import { site } from '@/config/site';
import {
  buildSCorpWorkedExamples,
  getBreakEvenProfitExplanationPoints,
  getHowSCorpTaxWorksPoints,
  getReasonableCompensationPoints,
  getSalaryVsDistributionsPoints,
  getSCorpIrsSources,
  getSCorpTaxFaqs,
  getSCorpVsSolePropComparisonPoints,
  S_CORP_TAX_SLUG,
} from '@/lib/calculators/s-corp-tax-page';
import { buildCalculatorMetadata } from '@/lib/seo/metadata';
import {
  buildCalculatorBreadcrumbs,
  buildCalculatorSchema,
  buildFaqSchema,
} from '@/lib/seo/schema';
import { formatIrsVerificationNotice } from '@/lib/calculators/irs-verification-notice';
import { taxYear2025 } from '@/lib/tax-engine';

const calculator = getCalculatorBySlug(S_CORP_TAX_SLUG)!;

export function generateMetadata(): Metadata {
  return buildCalculatorMetadata(calculator);
}

export default function SCorpTaxPage() {
  const faqs = getSCorpTaxFaqs();
  const howSCorpWorks = getHowSCorpTaxWorksPoints();
  const salaryVsDistributions = getSalaryVsDistributionsPoints();
  const reasonableCompensation = getReasonableCompensationPoints();
  const comparison = getSCorpVsSolePropComparisonPoints();
  const breakEvenExplanation = getBreakEvenProfitExplanationPoints();
  const sources = getSCorpIrsSources(taxYear2025);
  const workedExamples = buildSCorpWorkedExamples('single');

  const faqSchema = buildFaqSchema(faqs);
  const jsonLd: Record<string, unknown>[] = [
    buildCalculatorBreadcrumbs(calculator.shortTitle, calculator.route),
    buildCalculatorSchema(calculator),
    ...(faqSchema ? [faqSchema] : []),
  ];

  return (
    <SiteShell>
      <JsonLd data={jsonLd} id="s-corp-tax" />

      <CalculatorShell
        eyebrow={`${calculator.taxYear} federal estimate`}
        iconSlug={calculator.slug}
        title="S Corp Tax Calculator"
        description="Estimate the potential federal tax difference between default self-employment treatment and an S corporation salary-plus-distribution model using your own salary and cost assumptions."
        trustIndicators={[
          'User-entered salary assumption',
          'Federal estimate only',
          'S Corp costs supported',
          'No signup required',
        ]}
        authority={{
          taxYear: calculator.taxYear,
          lastReviewed: calculator.lastReviewed,
        }}
      >
        <SCorpTaxCalculator />
      </CalculatorShell>

      <Section spacing="sm" className="border-t border-border bg-card/40">
        <PageContainer width="calculator" className="space-y-8">
          <MethodologyBlock
            title="How S Corp tax treatment works"
            description="A simplified federal model for pass-through income, owner W-2 salary, and distributions—not entity election advice."
            points={howSCorpWorks}
          />

          <MethodologyBlock
            title="Salary vs distributions explained"
            description="How business profit is split between payroll wages and distributions in this calculator."
            points={salaryVsDistributions}
          />

          <MethodologyBlock
            title="Why reasonable compensation matters"
            description="IRS expectations for owner-employee wages—and why this tool does not determine reasonable compensation."
            points={reasonableCompensation}
          />

          <MethodologyBlock
            title="How this calculator compares S Corp vs sole proprietor tax"
            description="Federal tax paths used for estimated savings based on your inputs."
            points={comparison}
            footer={site.disclaimer}
          />

          <MethodologyBlock
            title="Break-even profit explanation"
            description="The profit level where estimated S corporation net value matches the sole proprietor baseline for your salary and cost assumptions."
            points={breakEvenExplanation}
          />

          <CalculatorSection
            title="Worked examples"
            description="Single filer, no optional compliance costs or other income. Computed with the same tax engine as the calculator above."
          >
            <SCorpWorkedExampleCards examples={workedExamples} />
          </CalculatorSection>

          <FaqBlock items={faqs} defaultOpenIndexes={[0, 1]} />

          <IrsSourceBlock
            sources={sources}
            notice={formatIrsVerificationNotice(taxYear2025.verifiedAt)}
          />

          <CalculatorDiscoveryBlock journeyId="s-corp-tax" />

          <CalculatorPageFooter calculator={calculator} />
        </PageContainer>
      </Section>
    </SiteShell>
  );
}
