import { ResourceArticleLayout } from '@/components/resources/resource-article-layout';
import {
  ResourceList,
  ResourceParagraph,
  ResourceProse,
  ResourceSection,
} from '@/components/resources/resource-section';
import {
  getSelfEmploymentTaxGuideFaqs,
  getSelfEmploymentTaxGuideRates,
  getSelfEmploymentTaxGuideSourceNotice,
  getSelfEmploymentTaxGuideSources,
} from '@/lib/resources/content/self-employment-tax-guide';
import {
  formatDollarsFromCents,
  formatPercentFromConfig,
} from '@/lib/resources/reference-data';
import { createResourcePageMetadata } from '@/lib/resources/create-resource-page';
import { renderPublishedCmsResourcePageIfPresent } from '@/lib/resources/cms-resource-page';

const SLUG = 'self-employment-tax-guide';

export async function generateMetadata() {
  return createResourcePageMetadata(SLUG);
}

export default async function SelfEmploymentTaxGuidePage() {
  const cmsPage = await renderPublishedCmsResourcePageIfPresent(SLUG);
  if (cmsPage) return cmsPage;

  const rates = getSelfEmploymentTaxGuideRates();
  const faqs = getSelfEmploymentTaxGuideFaqs();
  const sources = getSelfEmploymentTaxGuideSources();

  return (
    <ResourceArticleLayout
      slug={SLUG}
      faqs={faqs}
      sources={sources}
      sourceNotice={getSelfEmploymentTaxGuideSourceNotice()}
    >
      <ResourceSection title="What self-employment tax is">
        <ResourceProse>
          <ResourceParagraph>
            Self-employment (SE) tax funds Social Security and Medicare through
            the self-employed taxpayer&apos;s version of FICA. For many freelancers,
            sole proprietors, and independent contractors, it applies to net profit
            from a trade or business—not to W-2 wages, which use payroll withholding
            instead.
          </ResourceParagraph>
          <ResourceParagraph>
            On a federal return, SE tax is generally computed on Schedule SE and
            reported with Form 1040. It is separate from federal income tax, though
            the two interact when calculating adjusted gross income.
          </ResourceParagraph>
        </ResourceProse>
      </ResourceSection>

      <ResourceSection title="Who may pay self-employment tax">
        <ResourceProse>
          <ResourceParagraph>
            IRS rules may require SE tax when net earnings from self-employment
            reach {formatDollarsFromCents(rates.minimumThreshold)} or more in a
            tax year. Common situations include Schedule C profit, many
            single-member LLC owners treated as sole proprietors, and certain
            partnership or LLC profits subject to SE rules.
          </ResourceParagraph>
          <ResourceList
            items={[
              'Freelancers and independent contractors with net profit',
              'Sole proprietors filing Schedule C',
              'Many owners of disregarded single-member LLCs',
              'Some partners and LLC members (entity rules vary)',
            ]}
          />
          <ResourceParagraph>
            Entity classification, passive income, and S corporation W-2 wages
            follow different rules not fully covered here.
          </ResourceParagraph>
        </ResourceProse>
      </ResourceSection>

      <ResourceSection title="2025 self-employment tax rate">
        <ResourceProse>
          <ResourceParagraph>
            For 2025, the combined SE tax rate is{' '}
            {formatPercentFromConfig(rates.combinedRate)} on net earnings from
            self-employment after the Schedule SE adjustment:
          </ResourceParagraph>
          <ResourceList
            items={[
              `Social Security portion: ${formatPercentFromConfig(rates.socialSecurityRate)}`,
              `Medicare portion: ${formatPercentFromConfig(rates.medicareRate)}`,
            ]}
          />
          <ResourceParagraph>
            TaxChecker uses these documented rates in its Self-Employed Tax and 1099
            Tax calculators. Your actual liability may differ if IRS caps, additional
            Medicare tax, or other return items apply.
          </ResourceParagraph>
        </ResourceProse>
      </ResourceSection>

      <ResourceSection title="The 92.35% net earnings factor">
        <ResourceProse>
          <ResourceParagraph>
            Schedule SE does not multiply SE tax by 100% of Schedule C net profit.
            Instead, net earnings from self-employment use a{' '}
            {formatPercentFromConfig(rates.netEarningsFactor)} factor—commonly
            described as the 92.35% adjustment—before applying Social Security and
            Medicare rates.
          </ResourceParagraph>
          <ResourceParagraph>
            Example for planning: $100,000 Schedule C net profit × 92.35% ≈ $92,350
            net earnings base before rate application (simplified illustration only).
          </ResourceParagraph>
        </ResourceProse>
      </ResourceSection>

      <ResourceSection title="Social Security wage base">
        <ResourceProse>
          <ResourceParagraph>
            Social Security tax applies only up to the annual wage base. For 2025,
            that cap is {formatDollarsFromCents(rates.wageBase)} of combined wages
            and net self-employment earnings. Medicare tax generally continues above
            the cap; high earners may also owe additional Medicare tax under
            separate thresholds.
          </ResourceParagraph>
        </ResourceProse>
      </ResourceSection>

      <ResourceSection title="Deductible half of SE tax">
        <ResourceProse>
          <ResourceParagraph>
            Federal income tax allows a deduction for approximately{' '}
            {formatPercentFromConfig(rates.deductibleRate)} of SE tax—the
            employer-equivalent share—when calculating adjusted gross income. This
            may reduce income tax but does not remove the SE tax itself.
          </ResourceParagraph>
        </ResourceProse>
      </ResourceSection>

      <ResourceSection title="How SE tax interacts with federal income tax">
        <ResourceProse>
          <ResourceParagraph>
            A simplified federal planning flow looks like this:
          </ResourceParagraph>
          <ResourceList
            items={[
              'Start with net business profit (Schedule C or equivalent)',
              'Compute SE tax on adjusted net earnings (Schedule SE)',
              'Deduct the employer-equivalent portion of SE tax for AGI',
              'Subtract standard or itemized deductions to reach taxable income',
              'Apply federal income tax brackets to taxable income',
            ]}
          />
          <ResourceParagraph>
            TaxChecker models this sequence for estimate-only planning. Credits,
            other income, alternative minimum tax, and state taxes are outside
            scope.
          </ResourceParagraph>
        </ResourceProse>
      </ResourceSection>

      <ResourceSection title="What this guide does not cover">
        <ResourceList
          items={[
            'State or local self-employment taxes',
            'S corporation reasonable salary and payroll tax allocation',
            'Passive activity, rental, or material participation rules',
            'Additional Medicare tax computation details',
            'Quarterly payment penalty calculations',
            'Whether your specific activity is subject to SE tax',
          ]}
        />
      </ResourceSection>
    </ResourceArticleLayout>
  );
}
