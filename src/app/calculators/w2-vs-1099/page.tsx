import type { Metadata } from 'next';

import { CalculatorDiscoveryBlock } from '@/components/calculator/calculator-discovery-block';
import { CalculatorPageFooter } from '@/components/calculator/calculator-page-footer';
import {
  CalculatorShell,
  CalculatorSection,
} from '@/components/calculator/calculator-shell';
import { W2Vs1099WorkedExampleCards } from '@/components/calculator/w2-vs-1099-worked-example-cards';
import { W2Vs1099Calculator } from '@/components/calculators/w2-vs-1099-calculator';
import { FaqBlock } from '@/components/content/faq-block';
import { IrsSourceBlock } from '@/components/content/irs-source-block';
import { MethodologyBlock } from '@/components/content/methodology-block';
import { PageContainer, Section } from '@/components/layout/page-container';
import { SiteShell } from '@/components/layout/site-shell';
import { JsonLd } from '@/components/seo/json-ld';
import { getCalculatorBySlug } from '@/config/calculators';
import { site } from '@/config/site';
import {
  buildW2Vs1099WorkedExamples,
  getBreakEvenRateExplanationPoints,
  getContractorCostsToConsiderPoints,
  getHowW2Vs1099ComparesPoints,
  getW2Vs1099ExplainedPoints,
  getW2Vs1099Faqs,
  getW2Vs1099IrsSources,
  W2_VS_1099_SLUG,
} from '@/lib/calculators/w2-vs-1099-page';
import { buildCalculatorMetadata } from '@/lib/seo/metadata';
import {
  buildCalculatorBreadcrumbs,
  buildCalculatorSchema,
  buildFaqSchema,
} from '@/lib/seo/schema';
import { formatIrsVerificationNotice } from '@/lib/calculators/irs-verification-notice';
import { taxYear2025 } from '@/lib/tax-engine';

const calculator = getCalculatorBySlug(W2_VS_1099_SLUG)!;

export function generateMetadata(): Metadata {
  return buildCalculatorMetadata(calculator);
}

export default function W2Vs1099Page() {
  const faqs = getW2Vs1099Faqs();
  const explained = getW2Vs1099ExplainedPoints();
  const howCompares = getHowW2Vs1099ComparesPoints();
  const contractorCosts = getContractorCostsToConsiderPoints();
  const breakEvenExplanation = getBreakEvenRateExplanationPoints();
  const sources = getW2Vs1099IrsSources(taxYear2025);
  const workedExamples = buildW2Vs1099WorkedExamples('single');

  const faqSchema = buildFaqSchema(faqs);
  const jsonLd: Record<string, unknown>[] = [
    buildCalculatorBreadcrumbs(calculator.shortTitle, calculator.route),
    buildCalculatorSchema(calculator),
    ...(faqSchema ? [faqSchema] : []),
  ];

  return (
    <SiteShell>
      <JsonLd data={jsonLd} id="w2-vs-1099" />

      <CalculatorShell
        eyebrow={`${calculator.taxYear} federal comparison`}
        iconSlug={calculator.slug}
        title="W-2 vs 1099 Calculator"
        description="Compare a W-2 salary with 1099 contractor income after federal taxes, FICA, self-employment tax, benefits, expenses, and extra contractor costs."
        trustIndicators={[
          'Federal estimate only',
          'Benefits and expenses supported',
          'Break-even contractor rate',
          'No signup required',
        ]}
        authority={{
          taxYear: calculator.taxYear,
          lastReviewed: calculator.lastReviewed,
        }}
      >
        <W2Vs1099Calculator />
      </CalculatorShell>

      <Section spacing="sm" className="border-t border-border bg-card/40">
        <PageContainer width="calculator" className="space-y-8">
          <MethodologyBlock
            title="W-2 vs 1099 explained"
            description="A side-by-side federal tax comparison between employee wages and independent contractor income—not worker classification advice."
            points={explained}
          />

          <MethodologyBlock
            title="How this calculator compares W-2 and contractor income"
            description="Simplified federal models for each path using the salary, contractor income, benefits, and costs you provide."
            points={howCompares}
            footer={site.disclaimer}
          />

          <MethodologyBlock
            title="What costs 1099 contractors should consider"
            description="Contractor gross income is only the starting point. Expenses, self-employment tax, and non-deductible costs affect total value."
            points={contractorCosts}
          />

          <MethodologyBlock
            title="Break-even contractor rate explanation"
            description="The break-even gross income and hourly rate show where estimated 1099 total value matches estimated W-2 total value for your inputs."
            points={breakEvenExplanation}
          />

          <CalculatorSection
            title="Worked examples"
            description="Single filer, 2,000 hours per year, no W-2 withholding, no benefits or extra costs. Business expenses are 10% of contractor gross. Computed with the same tax engine as the calculator above."
          >
            <W2Vs1099WorkedExampleCards examples={workedExamples} />
          </CalculatorSection>

          <FaqBlock items={faqs} defaultOpenIndexes={[0, 1]} />

          <IrsSourceBlock
            sources={sources}
            notice={formatIrsVerificationNotice(taxYear2025.verifiedAt)}
          />

          <CalculatorDiscoveryBlock journeyId="w2-vs-1099" />

          <CalculatorPageFooter calculator={calculator} />
        </PageContainer>
      </Section>
    </SiteShell>
  );
}
