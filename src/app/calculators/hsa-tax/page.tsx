import type { Metadata } from 'next';

import { CalculatorDiscoveryBlock } from '@/components/calculator/calculator-discovery-block';
import { CalculatorPageFooter } from '@/components/calculator/calculator-page-footer';
import {
  CalculatorShell,
  CalculatorSection,
} from '@/components/calculator/calculator-shell';
import { HsaWorkedExampleCards } from '@/components/calculator/hsa-worked-example-cards';
import { HsaTaxCalculator } from '@/components/calculators/hsa-tax-calculator';
import { FaqBlock } from '@/components/content/faq-block';
import { IrsSourceBlock } from '@/components/content/irs-source-block';
import { MethodologyBlock } from '@/components/content/methodology-block';
import { PageContainer, Section } from '@/components/layout/page-container';
import { SiteShell } from '@/components/layout/site-shell';
import { JsonLd } from '@/components/seo/json-ld';
import { Card, CardContent } from '@/components/ui/card';
import { getCalculatorBySlug } from '@/config/calculators';
import { site } from '@/config/site';
import {
  buildHsaWorkedExamples,
  getEmployerContributionPoints,
  getExcessContributionPoints,
  getHowHsaTaxSavingsWorkPoints,
  getHsaIrsSources,
  getHsaLimitRows,
  getHsaTaxFaqs,
  getPayrollDeductedHsaPoints,
  HSA_TAX_SLUG,
} from '@/lib/calculators/hsa-tax-page';
import { buildCalculatorMetadata } from '@/lib/seo/metadata';
import {
  buildCalculatorBreadcrumbs,
  buildCalculatorSchema,
  buildFaqSchema,
} from '@/lib/seo/schema';
import { formatIrsVerificationNotice } from '@/lib/calculators/irs-verification-notice';
import { taxYear2025 } from '@/lib/tax-engine';

const calculator = getCalculatorBySlug(HSA_TAX_SLUG)!;

export function generateMetadata(): Metadata {
  return buildCalculatorMetadata(calculator);
}

export default function HsaTaxPage() {
  const faqs = getHsaTaxFaqs(taxYear2025);
  const howSavingsWork = getHowHsaTaxSavingsWorkPoints();
  const limitRows = getHsaLimitRows(taxYear2025);
  const employerContributions = getEmployerContributionPoints();
  const payrollDeducted = getPayrollDeductedHsaPoints();
  const excessContribution = getExcessContributionPoints();
  const sources = getHsaIrsSources(taxYear2025);
  const workedExamples = buildHsaWorkedExamples(taxYear2025);

  const faqSchema = buildFaqSchema(faqs);
  const jsonLd: Record<string, unknown>[] = [
    buildCalculatorBreadcrumbs(calculator.shortTitle, calculator.route),
    buildCalculatorSchema(calculator),
    ...(faqSchema ? [faqSchema] : []),
  ];

  return (
    <SiteShell>
      <JsonLd data={jsonLd} id="hsa-tax" />

      <CalculatorShell
        eyebrow={`${calculator.taxYear} federal estimate`}
        iconSlug={calculator.slug}
        title="HSA Tax Savings Calculator"
        description="Estimate federal income tax savings, optional payroll tax savings, contribution room, and excess contribution risk for a 2025 HSA contribution."
        trustIndicators={[
          `${calculator.taxYear} HSA limits`,
          'Employer contributions supported',
          'Federal estimate only',
          'No signup required',
        ]}
        authority={{
          taxYear: calculator.taxYear,
          lastReviewed: calculator.lastReviewed,
        }}
      >
        <HsaTaxCalculator />
      </CalculatorShell>

      <Section spacing="sm" className="border-t border-border bg-card/40">
        <PageContainer width="calculator" className="space-y-8">
          <MethodologyBlock
            title="How HSA tax savings work"
            description="Federal income tax savings from deductible contributions—and optional payroll FICA savings when contributions are payroll-deducted."
            points={howSavingsWork}
          />

          <CalculatorSection
            title={`${calculator.taxYear} HSA contribution limits`}
            description="IRS-published annual limits used in this calculator before catch-up and partial-year adjustments."
          >
            <Card className="shadow-tc-sm">
              <CardContent className="p-0">
                <dl className="divide-y divide-border">
                  {limitRows.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-4 px-6 py-4"
                    >
                      <dt className="text-sm font-medium text-foreground">
                        {row.label}
                      </dt>
                      <dd className="tc-tabular text-sm text-muted-foreground">
                        {row.amount}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          </CalculatorSection>

          <MethodologyBlock
            title="Employer contributions and remaining room"
            description="How employer HSA funding affects your remaining contribution room."
            points={employerContributions}
          />

          <MethodologyBlock
            title="Payroll-deducted HSA contributions"
            description="When payroll deduction may change estimated FICA savings in this model."
            points={payrollDeducted}
          />

          <MethodologyBlock
            title="Excess contribution warning"
            description="Why contributing above remaining room can create IRS tax and penalty risk."
            points={excessContribution}
            footer={site.disclaimer}
          />

          <CalculatorSection
            title="Worked examples"
            description="Single filer, $85,000 annual income, no employer contribution, not payroll-deducted, 12 eligible months. Computed with the same tax engine as the calculator above."
          >
            <HsaWorkedExampleCards examples={workedExamples} />
          </CalculatorSection>

          <FaqBlock items={faqs} defaultOpenIndexes={[0, 1]} />

          <IrsSourceBlock
            sources={sources}
            notice={formatIrsVerificationNotice(taxYear2025.verifiedAt)}
          />

          <CalculatorDiscoveryBlock journeyId="hsa-tax" />

          <CalculatorPageFooter calculator={calculator} />
        </PageContainer>
      </Section>
    </SiteShell>
  );
}
