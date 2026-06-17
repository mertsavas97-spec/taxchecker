import { ResourceArticleLayout } from '@/components/resources/resource-article-layout';
import {
  ResourceList,
  ResourceParagraph,
  ResourceProse,
  ResourceSection,
} from '@/components/resources/resource-section';
import { DueDatesTable } from '@/components/resources/resource-tables';
import {
  getQuarterlyTaxDueDates2025Faqs,
  getQuarterlyTaxDueDates2025SourceNotice,
  getQuarterlyTaxDueDates2025Sources,
} from '@/lib/resources/content/quarterly-tax-due-dates-2025';
import { getQuarterlyDueDateRows } from '@/lib/resources/reference-data';
import { createResourcePageMetadata } from '@/lib/resources/create-resource-page';
import { taxYear2025 } from '@/lib/tax-engine';

const SLUG = 'quarterly-tax-due-dates-2025';

export function generateMetadata() {
  return createResourcePageMetadata(SLUG);
}

export default async function QuarterlyTaxDueDates2025Page() {
  const faqs = getQuarterlyTaxDueDates2025Faqs();
  const sources = getQuarterlyTaxDueDates2025Sources();
  const dueDates = getQuarterlyDueDateRows(taxYear2025);

  return (
    <ResourceArticleLayout
      slug={SLUG}
      faqs={faqs}
      sources={sources}
      sourceNotice={getQuarterlyTaxDueDates2025SourceNotice()}
    >
      <ResourceSection title="2025 federal quarterly estimated tax due dates">
        <ResourceProse>
          <ResourceParagraph>
            The table below lists 2025 federal Form 1040-ES payment due dates from
            TaxChecker&apos;s 2025 tax year configuration from IRS publications. Each row ties a
            calendar payment period to the IRS due date for income earned in that
            period.
          </ResourceParagraph>
        </ResourceProse>
        <DueDatesTable rows={dueDates} />
      </ResourceSection>

      <ResourceSection title="Payment periods explained">
        <ResourceProse>
          <ResourceParagraph>
            Form 1040-ES uses four annual payment periods rather than strict
            calendar quarters:
          </ResourceParagraph>
          <ResourceList
            items={dueDates.map(
              (row) =>
                `${row.quarter}: income earned ${row.incomePeriod.toLowerCase()} — due ${row.dueDateLabel}`,
            )}
          />
        </ResourceProse>
      </ResourceSection>

      <ResourceSection title="Weekend and holiday adjustments">
        <ResourceProse>
          <ResourceParagraph>
            When a statutory due date falls on a Saturday, Sunday, or federal
            holiday, the IRS may move the deadline to the next business day. The
            June 2025 payment illustrates this: the documented due date is June 16,
            2025 rather than June 15.
          </ResourceParagraph>
          <ResourceParagraph>
            Always confirm current-year dates on the IRS-published Form 1040-ES
            instructions before sending a payment.
          </ResourceParagraph>
        </ResourceProse>
      </ResourceSection>

      <ResourceSection title="State deadlines may differ">
        <ResourceProse>
          <ResourceParagraph>
            This page covers federal Form 1040-ES due dates only. Many states
            publish separate estimated tax schedules, thresholds, and due dates.
            Check your state revenue department for state-specific requirements.
          </ResourceParagraph>
        </ResourceProse>
      </ResourceSection>

      <ResourceSection title="Planning with TaxChecker calculators">
        <ResourceProse>
          <ResourceParagraph>
            Due dates are only one part of estimated tax planning. Amounts depend
            on expected annual liability, withholding, and safe harbor rules.
            TaxChecker&apos;s Quarterly Tax Calculator and Estimated Tax Calculator
            can produce federal planning estimates using these published dates—they
            do not calculate penalties or process payments.
          </ResourceParagraph>
        </ResourceProse>
      </ResourceSection>

      <ResourceSection title="What this page does not provide">
        <ResourceList
          items={[
            'Payment amount calculations or penalty estimates',
            'IRS Direct Pay or EFTPS integration',
            'Email or calendar reminders',
            'State estimated tax due dates',
            'Corporate estimated tax (Form 1120-W) schedules',
          ]}
        />
      </ResourceSection>
    </ResourceArticleLayout>
  );
}
