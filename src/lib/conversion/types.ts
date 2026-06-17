export type RelatedContentKind = 'calculator' | 'resource' | 'article';

export interface RelatedContentLink {
  kind: RelatedContentKind;
  title: string;
  href: string;
  description?: string;
  readingTime?: string;
}

export type CalculatorJourneyId =
  | 'self-employed-tax'
  | '1099-tax'
  | 'quarterly-tax'
  | 'estimated-tax'
  | 'w2-vs-1099'
  | 's-corp-tax'
  | 'llc-vs-scorp'
  | 'hsa-tax';

export interface JourneyLinkRef {
  kind: RelatedContentKind;
  slug: string;
}

export interface CalculatorConversionJourney {
  id: CalculatorJourneyId;
  /** Contextual copy shown under the Next Steps heading */
  summary: string;
  /** Ordered contextual recommendations shown immediately after calculator results */
  nextSteps: JourneyLinkRef[];
  /** Fuller related sets for page-level discovery blocks */
  related: {
    calculators: string[];
    resources: string[];
    articles: string[];
  };
}
