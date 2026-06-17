import type { Metadata } from 'next';

import { CalculatorDiscoveryBlock } from '@/components/calculator/calculator-discovery-block';
import { CalculatorPageFooter } from '@/components/calculator/calculator-page-footer';
import {
  CalculatorShell,
  CalculatorSection,
} from '@/components/calculator/calculator-shell';
import { LlcVsScorpWorkedExampleCards } from '@/components/calculator/llc-vs-scorp-worked-example-cards';
import { LlcVsScorpCalculator } from '@/components/calculators/llc-vs-scorp-calculator';
import { FaqBlock } from '@/components/content/faq-block';
import { IrsSourceBlock } from '@/components/content/irs-source-block';
import { MethodologyBlock } from '@/components/content/methodology-block';
import { PageContainer, Section } from '@/components/layout/page-container';
import { SiteShell } from '@/components/layout/site-shell';
import { JsonLd } from '@/components/seo/json-ld';
import { getCalculatorBySlug } from '@/config/calculators';
import { site } from '@/config/site';
import {
  buildLlcVsScorpWorkedExamples,
  getDefaultLlcTaxationPoints,
  getHowLlcVsScorpComparesPoints,
  getLlcVsScorpFaqs,
  getLlcVsScorpIrsSources,
  getLlcVsScorpReasonableCompensationPoints,
  getLlcVsScorpTreatmentPoints,
  getScorpSalaryDistributionPoints,
  LLC_VS_SCORP_SLUG,
} from '@/lib/calculators/llc-vs-scorp-page';
import { buildCalculatorMetadata } from '@/lib/seo/metadata';
import {
  buildCalculatorBreadcrumbs,
  buildCalculatorSchema,
  buildFaqSchema,
} from '@/lib/seo/schema';
import { formatIrsVerificationNotice } from '@/lib/calculators/irs-verification-notice';
import { taxYear2025 } from '@/lib/tax-engine';

const calculator = getCalculatorBySlug(LLC_VS_SCORP_SLUG)!;

export function generateMetadata(): Metadata {
  return buildCalculatorMetadata(calculator);
}

export default function LlcVsScorpPage() {
  const faqs = getLlcVsScorpFaqs();
  const treatment = getLlcVsScorpTreatmentPoints();
  const defaultLlc = getDefaultLlcTaxationPoints();
  const salaryDistributions = getScorpSalaryDistributionPoints();
  const reasonableCompensation = getLlcVsScorpReasonableCompensationPoints();
  const howCompares = getHowLlcVsScorpComparesPoints();
  const sources = getLlcVsScorpIrsSources(taxYear2025);
  const workedExamples = buildLlcVsScorpWorkedExamples('single');

  const faqSchema = buildFaqSchema(faqs);
  const jsonLd: Record<string, unknown>[] = [
    buildCalculatorBreadcrumbs(calculator.shortTitle, calculator.route),
    buildCalculatorSchema(calculator),
    ...(faqSchema ? [faqSchema] : []),
  ];

  return (
    <SiteShell>
      <JsonLd data={jsonLd} id="llc-vs-scorp" />

      <CalculatorShell
        eyebrow={`${calculator.taxYear} federal comparison`}
        iconSlug={calculator.slug}
        title="LLC vs S Corp Calculator"
        description="Compare default LLC self-employment tax treatment with an S corporation salary-plus-distribution model using your own salary and cost assumptions."
        trustIndicators={[
          'Comparison only',
          'User-entered salary assumption',
          'Federal estimate only',
          'No signup required',
        ]}
        authority={{
          taxYear: calculator.taxYear,
          lastReviewed: calculator.lastReviewed,
        }}
      >
        <LlcVsScorpCalculator />
      </CalculatorShell>

      <Section spacing="sm" className="border-t border-border bg-card/40">
        <PageContainer width="calculator" className="space-y-8">
          <MethodologyBlock
            title="LLC vs S Corp tax treatment explained"
            description="A simplified federal comparison between default LLC pass-through treatment and an S corporation salary-plus-distribution model."
            points={treatment}
          />

          <MethodologyBlock
            title="How default LLC taxation works"
            description="The LLC baseline in this calculator uses sole proprietor self-employment tax on net business profit."
            points={defaultLlc}
          />

          <MethodologyBlock
            title="How S Corp salary and distributions work"
            description="How business profit is split and taxed in the S corporation path for this comparison."
            points={salaryDistributions}
          />

          <MethodologyBlock
            title="Why reasonable compensation matters"
            description="IRS expectations for S corporation owner wages—and why this tool does not determine reasonable compensation."
            points={reasonableCompensation}
          />

          <MethodologyBlock
            title="How this calculator compares both paths"
            description="Federal tax paths, after-tax value difference, and break-even profit under your assumptions."
            points={howCompares}
            footer={site.disclaimer}
          />

          <CalculatorSection
            title="Worked examples"
            description="Single filer, LLC and S Corp profit equal, no optional compliance costs or other income. Computed with the same tax engine as the calculator above."
          >
            <LlcVsScorpWorkedExampleCards examples={workedExamples} />
          </CalculatorSection>

          <FaqBlock items={faqs} defaultOpenIndexes={[0, 1]} />

          <IrsSourceBlock
            sources={sources}
            notice={formatIrsVerificationNotice(taxYear2025.verifiedAt)}
          />

          <CalculatorDiscoveryBlock journeyId="llc-vs-scorp" />

          <CalculatorPageFooter calculator={calculator} />
        </PageContainer>
      </Section>
    </SiteShell>
  );
}
