/** Layout */
export { PageContainer, ContentWidth, Section } from '@/components/layout/page-container';
export { SiteHeader } from '@/components/layout/site-header';
export { SiteFooter } from '@/components/layout/site-footer';
export { SiteShell } from '@/components/layout/site-shell';
export { MobileNav } from '@/components/layout/mobile-nav';

/** Brand */
export { Logo } from '@/components/brand/logo';

/** Navigation */
export { CalculatorsDropdown } from '@/components/navigation/calculators-dropdown';

/** Calculator */
export {
  CalculatorShell,
  CalculatorSection,
  CalculatorProse,
} from '@/components/calculator/calculator-shell';
export { ResultPanel } from '@/components/calculator/result-panel';
export { PrimaryResults } from '@/components/calculator/primary-results';
export { BreakdownResults } from '@/components/calculator/breakdown-results';
export { WorkedExampleCards } from '@/components/calculator/worked-example-cards';
export { Tax1099WorkedExampleCards } from '@/components/calculator/1099-worked-example-cards';
export { QuarterlyWorkedExampleCards } from '@/components/calculator/quarterly-worked-example-cards';
export { EstimatedWorkedExampleCards } from '@/components/calculator/estimated-worked-example-cards';
export { W2Vs1099WorkedExampleCards } from '@/components/calculator/w2-vs-1099-worked-example-cards';
export { SCorpWorkedExampleCards } from '@/components/calculator/s-corp-worked-example-cards';
export { LlcVsScorpWorkedExampleCards } from '@/components/calculator/llc-vs-scorp-worked-example-cards';
export { HsaWorkedExampleCards } from '@/components/calculator/hsa-worked-example-cards';
export { WarningPanel } from '@/components/calculator/warning-panel';
export { DisclaimerPanel } from '@/components/calculator/disclaimer-panel';
export { InfoCallout } from '@/components/calculator/info-callout';
export {
  SourceSection,
  type SourceReferenceItem,
} from '@/components/calculator/source-section';

/** Content / SEO */
export { FaqBlock, type FaqItem } from '@/components/content/faq-block';
export { IrsSourceBlock } from '@/components/content/irs-source-block';
export {
  MethodologyBlock,
  type MethodologyPoint,
} from '@/components/content/methodology-block';
export { RelatedCalculatorsBlock } from '@/components/content/related-calculators-block';
export {
  RelatedContentBlock,
  RelatedContentFlatList,
} from '@/components/content/related-content-block';
export {
  RelatedGuidesBlock,
  type GuideLink,
} from '@/components/content/related-guides-block';
export { NextStepsPanel } from '@/components/calculator/next-steps-panel';
export { CalculatorDiscoveryBlock } from '@/components/calculator/calculator-discovery-block';

/** SEO */
export { JsonLd, serializeJsonLd, type JsonLdProps } from '@/components/seo/json-ld';
