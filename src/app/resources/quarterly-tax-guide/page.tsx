import { ResourceArticleLayout } from '@/components/resources/resource-article-layout';
import {
  ResourceList,
  ResourceParagraph,
  ResourceProse,
  ResourceSection,
} from '@/components/resources/resource-section';
import { DueDatesTable } from '@/components/resources/resource-tables';
import {
  getQuarterlyTaxGuideFaqs,
  getQuarterlyTaxGuideSafeHarbor,
  getQuarterlyTaxGuideSourceNotice,
  getQuarterlyTaxGuideSources,
} from '@/lib/resources/content/quarterly-tax-guide';
import {
  formatDollarsFromCents,
  formatPercentFromConfig,
  getQuarterlyDueDateRows,
} from '@/lib/resources/reference-data';
import { createResourcePageMetadata } from '@/lib/resources/create-resource-page';
import { renderPublishedCmsResourcePageIfPresent } from '@/lib/resources/cms-resource-page';
import { taxYear2025 } from '@/lib/tax-engine';

const SLUG = 'quarterly-tax-guide';

export async function generateMetadata() {
  return createResourcePageMetadata(SLUG);
}

export default async function QuarterlyTaxGuidePage() {
  const cmsPage = await renderPublishedCmsResourcePageIfPresent(SLUG);
  if (cmsPage) return cmsPage;

  const faqs = getQuarterlyTaxGuideFaqs();
  const sources = getQuarterlyTaxGuideSources();
  const safeHarbor = getQuarterlyTaxGuideSafeHarbor();
  const dueDates = getQuarterlyDueDateRows(taxYear2025);

  return (
    <ResourceArticleLayout
      slug={SLUG}
      faqs={faqs}
      sources={sources}
      sourceNotice={getQuarterlyTaxGuideSourceNotice()}
    >
      <ResourceSection title="What quarterly estimated taxes are">
        <ResourceProse>
          <ResourceParagraph>
            Quarterly estimated tax payments are federal payments made during the
            year toward your expected annual income tax and self-employment tax.
            They are commonly used when paycheck withholding will not cover your
            full federal liability—typical for many self-employed taxpayers.
          </ResourceParagraph>
          <ResourceParagraph>
            IRS Form 1040-ES provides vouchers and instructions for individuals.
            This guide explains general mechanics; it does not submit payments or
            determine your legal obligation to pay.
          </ResourceParagraph>
        </ResourceProse>
      </ResourceSection>

      <ResourceSection title="Who may need to pay estimated tax">
        <ResourceProse>
          <ResourceParagraph>
            You may need to consider estimated tax if you expect to owe a
            meaningful federal balance after withholding and credits. Common
            triggers include self-employment income, large capital gains, or
            insufficient W-2 withholding on combined income sources.
          </ResourceParagraph>
          <ResourceParagraph>
            IRS Publication 505 describes general requirements. TaxChecker does
            not evaluate whether you personally must pay—use this as educational
            context only.
          </ResourceParagraph>
        </ResourceProse>
      </ResourceSection>

      <ResourceSection title="2025 federal payment schedule">
        <ResourceProse>
          <ResourceParagraph>
            The documented 2025 federal due dates from TaxChecker&apos;s tax year
            configuration are shown below. Dates may shift when they fall on a
            weekend or federal holiday.
          </ResourceParagraph>
        </ResourceProse>
        <DueDatesTable rows={dueDates} />
      </ResourceSection>

      <ResourceSection title="Safe harbor overview">
        <ResourceProse>
          <ResourceParagraph>
            Safe harbor rules describe payment levels that may limit underpayment
            interest in many situations. TaxChecker summarizes the common federal
            framework for planning; IRS Publication 505 contains exceptions and
            full detail.
          </ResourceParagraph>
        </ResourceProse>
      </ResourceSection>

      <ResourceSection title="90%, 100%, and 110% rules explained">
        <ResourceProse>
          <ResourceParagraph>
            A widely cited planning framework (simplified):
          </ResourceParagraph>
          <ResourceList
            items={[
              `${formatPercentFromConfig(safeHarbor.safeHarborCurrentYearRate)} rule: Pay at least 90% of your current tax year expected liability through withholding plus estimated payments.`,
              `${formatPercentFromConfig(safeHarbor.safeHarborPriorYearRate)} rule: Pay at least 100% of your prior year total tax (110% if prior-year AGI exceeded ${formatDollarsFromCents(safeHarbor.safeHarborHighAGIThreshold)} for most filers, or ${formatDollarsFromCents(safeHarbor.safeHarborHighAGIThresholdMFS)} if married filing separately).`,
              `Meeting a safe harbor may reduce underpayment interest risk but does not guarantee zero balance due or a refund.`,
            ]}
          />
          <ResourceParagraph>
            TaxChecker&apos;s Quarterly Tax and Estimated Tax calculators apply
            these documented safe harbor rates for estimate-only outputs—they do not
            calculate penalties or tell you that you must pay a specific amount.
          </ResourceParagraph>
        </ResourceProse>
      </ResourceSection>

      <ResourceSection title="Estimated payments and self-employment income">
        <ResourceProse>
          <ResourceParagraph>
            Self-employment income often increases both SE tax and income tax
            without automatic withholding. Estimated payments spread that federal
            liability across the year instead of concentrating it at filing time.
          </ResourceParagraph>
          <ResourceParagraph>
            Many self-employed taxpayers pair quarterly payment planning with an
            annual self-employment tax estimate from Schedule SE mechanics.
          </ResourceParagraph>
        </ResourceProse>
      </ResourceSection>

      <ResourceSection title="When income changes mid-year">
        <ResourceProse>
          <ResourceParagraph>
            A mid-year contract, client loss, or large deduction may change your
            expected annual liability. Taxpayers often revisit estimated payments
            after material changes. TaxChecker calculators can produce updated
            planning estimates—you remain responsible for actual IRS payments and
            filing.
          </ResourceParagraph>
        </ResourceProse>
      </ResourceSection>

      <ResourceSection title="What this guide does not calculate">
        <ResourceList
          items={[
            'Underpayment penalties or interest amounts',
            'Whether you are legally required to pay estimated tax',
            'State estimated tax deadlines or amounts',
            'Corporation or trust estimated tax rules',
            'Payment processing or IRS account integration',
          ]}
        />
      </ResourceSection>
    </ResourceArticleLayout>
  );
}
