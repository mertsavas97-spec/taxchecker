import type { Metadata } from 'next';

import { CalculatorDiscoveryBlock } from '@/components/calculator/calculator-discovery-block';
import { CalculatorPageFooter } from '@/components/calculator/calculator-page-footer';
import {
  CalculatorShell,
  CalculatorSection,
} from '@/components/calculator/calculator-shell';
import { QuarterlyWorkedExampleCards } from '@/components/calculator/quarterly-worked-example-cards';
import { QuarterlyTaxCalculator } from '@/components/calculators/quarterly-tax-calculator';
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
  buildQuarterlyWorkedExamples,
  getHowCalculatorEstimatesPoints,
  getHowQuarterlyTaxesWorkPoints,
  getQuarterlyDueDateRows,
  getQuarterlyIrsSources,
  getQuarterlyTaxFaqs,
  getSafeHarborExplanationPoints,
  QUARTERLY_TAX_SLUG,
} from '@/lib/calculators/quarterly-tax-page';
import { buildCalculatorMetadata } from '@/lib/seo/metadata';
import {
  buildCalculatorBreadcrumbs,
  buildCalculatorSchema,
  buildFaqSchema,
} from '@/lib/seo/schema';
import { formatIrsVerificationNotice } from '@/lib/calculators/irs-verification-notice';
import { taxYear2025 } from '@/lib/tax-engine';

const calculator = getCalculatorBySlug(QUARTERLY_TAX_SLUG)!;

export function generateMetadata(): Metadata {
  return buildCalculatorMetadata(calculator);
}

export default function QuarterlyTaxPage() {
  const faqs = getQuarterlyTaxFaqs(taxYear2025);
  const howQuarterlyTaxesWork = getHowQuarterlyTaxesWorkPoints();
  const howCalculatorEstimates = getHowCalculatorEstimatesPoints(taxYear2025);
  const dueDateRows = getQuarterlyDueDateRows(taxYear2025);
  const safeHarborPoints = getSafeHarborExplanationPoints(taxYear2025);
  const sources = getQuarterlyIrsSources(taxYear2025);
  const workedExamples = buildQuarterlyWorkedExamples('single');

  const faqSchema = buildFaqSchema(faqs);
  const jsonLd: Record<string, unknown>[] = [
    buildCalculatorBreadcrumbs(calculator.shortTitle, calculator.route),
    buildCalculatorSchema(calculator),
    ...(faqSchema ? [faqSchema] : []),
  ];

  return (
    <SiteShell>
      <JsonLd data={jsonLd} id="quarterly-tax" />

      <CalculatorShell
        eyebrow={`${calculator.taxYear} federal estimate`}
        iconSlug={calculator.slug}
        title="Quarterly Tax Calculator"
        description="Estimate your quarterly federal tax payments for self-employment income using documented 2025 federal tax rules from IRS publications, Form 1040-ES due dates, and safe harbor estimates."
        trustIndicators={[
          `${calculator.taxYear} Form 1040-ES due dates`,
          'Safe harbor estimates',
          'Federal estimate only',
          'No signup required',
        ]}
        authority={{
          taxYear: calculator.taxYear,
          lastReviewed: calculator.lastReviewed,
        }}
      >
        <QuarterlyTaxCalculator />
      </CalculatorShell>

      <Section spacing="sm" className="border-t border-border bg-card/40">
        <PageContainer width="calculator" className="space-y-8">
          <MethodologyBlock
            title="How quarterly taxes work"
            description="Federal estimated tax helps self-employed taxpayers pay income and self-employment tax throughout the year instead of only at filing time."
            points={howQuarterlyTaxesWork}
          />

          <MethodologyBlock
            title="How this calculator estimates payments"
            description="A simplified federal model based on annualized self-employment income, optional prior-year safe harbor inputs, and Form 1040-ES planning mechanics."
            points={howCalculatorEstimates}
            footer={site.disclaimer}
          />

          <CalculatorSection
            title={`${calculator.taxYear} quarterly tax due dates`}
            description="IRS Form 1040-ES payment schedule used in this calculator. Due dates may move to the next business day when they fall on a weekend or holiday."
          >
            <Card className="shadow-tc-sm">
              <CardContent className="p-0">
                <dl className="divide-y divide-border">
                  {dueDateRows.map((row) => (
                    <div
                      key={row.quarter}
                      className="flex items-center justify-between gap-4 px-6 py-4"
                    >
                      <dt className="text-sm font-medium text-foreground">
                        {row.quarter}
                      </dt>
                      <dd className="tc-tabular text-sm text-muted-foreground">
                        {row.dueDate}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          </CalculatorSection>

          <MethodologyBlock
            title="Safe harbor explanation"
            description="Paying enough federal tax during the year through withholding and estimated payments can help avoid underpayment penalties."
            points={safeHarborPoints}
          />

          <CalculatorSection
            title="Worked examples"
            description="Single filer, no other income, no estimated payments, no prior-year safe harbor inputs. Computed with the same tax engine as the calculator above."
          >
            <QuarterlyWorkedExampleCards examples={workedExamples} />
          </CalculatorSection>

          <FaqBlock items={faqs} defaultOpenIndexes={[0, 1]} />

          <IrsSourceBlock
            sources={sources}
            notice={formatIrsVerificationNotice(taxYear2025.verifiedAt)}
          />

          <CalculatorDiscoveryBlock journeyId="quarterly-tax" />

          <CalculatorPageFooter calculator={calculator} />
        </PageContainer>
      </Section>
    </SiteShell>
  );
}
