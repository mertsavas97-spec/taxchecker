import { ResourceArticleLayout } from '@/components/resources/resource-article-layout';
import {
  ResourceList,
  ResourceParagraph,
  ResourceProse,
  ResourceSection,
} from '@/components/resources/resource-section';
import {
  BracketTable,
  StandardDeductionTable,
} from '@/components/resources/resource-tables';
import {
  getTaxBrackets2025Faqs,
  getTaxBrackets2025SourceNotice,
  getTaxBrackets2025Sources,
} from '@/lib/resources/content/tax-brackets-2025';
import { getFilingStatusLabel } from '@/lib/resources/filing-status-labels';
import {
  getBracketTableRows,
  getStandardDeductionRows,
} from '@/lib/resources/reference-data';
import { createResourcePageMetadata } from '@/lib/resources/create-resource-page';
import { renderPublishedCmsResourcePageIfPresent } from '@/lib/resources/cms-resource-page';
import { FILING_STATUSES, taxYear2025 } from '@/lib/tax-engine';

const SLUG = 'tax-brackets-2025';

export async function generateMetadata() {
  return createResourcePageMetadata(SLUG);
}

export default async function TaxBrackets2025Page() {
  const cmsPage = await renderPublishedCmsResourcePageIfPresent(SLUG);
  if (cmsPage) return cmsPage;

  const faqs = getTaxBrackets2025Faqs();
  const sources = getTaxBrackets2025Sources();
  const standardDeductionRows = getStandardDeductionRows(taxYear2025);

  return (
    <ResourceArticleLayout
      slug={SLUG}
      faqs={faqs}
      sources={sources}
      sourceNotice={getTaxBrackets2025SourceNotice()}
    >
      <ResourceSection title="2025 federal income tax bracket overview">
        <ResourceProse>
          <ResourceParagraph>
            Federal income tax uses seven marginal rates for 2025 ordinary income:
            10%, 12%, 22%, 24%, 32%, 35%, and 37%. Thresholds vary by filing
            status and come from IRS Revenue Procedure 2024-40—the same source
            documented in TaxChecker&apos;s 2025 tax year configuration.
          </ResourceParagraph>
          <ResourceParagraph>
            Tables below are generated directly from that configuration, not
            manually re-entered. Taxable income equals adjusted gross income minus
            deductions (standard or itemized).
          </ResourceParagraph>
        </ResourceProse>
      </ResourceSection>

      <ResourceSection
        title="2025 standard deduction"
        description="Amounts by filing status from TaxChecker constants documented from IRS publications."
      >
        <StandardDeductionTable rows={standardDeductionRows} />
      </ResourceSection>

      <ResourceSection
        title="Bracket tables by filing status"
        description="Taxable income ranges and marginal rates for each supported filing status."
      >
        <div className="space-y-4">
          {FILING_STATUSES.map((status) => (
            <BracketTable
              key={status}
              title={getFilingStatusLabel(status)}
              rows={getBracketTableRows(taxYear2025, status)}
            />
          ))}
        </div>
      </ResourceSection>

      <ResourceSection title="Progressive taxation">
        <ResourceProse>
          <ResourceParagraph>
            Progressive taxation means higher portions of taxable income may be taxed
            at higher rates. Crossing into a higher bracket affects only income
            within that bracket—not your entire income.
          </ResourceParagraph>
          <ResourceParagraph>
            Example: If taxable income spans the 22% and 24% brackets, dollars
            inside each range use that bracket&apos;s rate. Your overall or
            effective rate is a weighted average across brackets.
          </ResourceParagraph>
        </ResourceProse>
      </ResourceSection>

      <ResourceSection title="Marginal rate vs effective rate">
        <ResourceProse>
          <ResourceParagraph>
            <strong className="font-medium text-foreground">Marginal rate</strong>{' '}
            is the rate on the next dollar of taxable income in the current
            bracket. TaxChecker may show this for planning when income changes.
          </ResourceParagraph>
          <ResourceParagraph>
            <strong className="font-medium text-foreground">Effective rate</strong>{' '}
            is total federal income tax divided by taxable income (or total
            income)—a blended percentage that is usually lower than the top
            marginal rate when multiple brackets apply.
          </ResourceParagraph>
        </ResourceProse>
      </ResourceSection>

      <ResourceSection title="How calculators use these brackets">
        <ResourceProse>
          <ResourceParagraph>
            TaxChecker applies these bracket thresholds when estimating federal
            income tax on taxable income after the standard deduction (unless a
            calculator accepts different assumptions). Self-employment tax,
            payroll tax, and entity comparisons use separate engine modules.
          </ResourceParagraph>
        </ResourceProse>
      </ResourceSection>

      <ResourceSection title="What these tables do not include">
        <ResourceList
          items={[
            'Capital gains or qualified dividend preferential rates',
            'Alternative minimum tax (AMT)',
            'Credits such as Child Tax Credit or EITC',
            'State or local income tax brackets',
            'Itemized deduction phase-outs not modeled in calculators',
          ]}
        />
      </ResourceSection>
    </ResourceArticleLayout>
  );
}
