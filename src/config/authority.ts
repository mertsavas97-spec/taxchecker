/**
 * Shared authority and E-E-A-T copy used across homepage, calculators, and resources.
 */
export const authorityCopy = {
  irsSourceDocumentation: 'IRS documentation',
  sourceTraceability: 'Source traceability',
  federalEstimatesOnly: 'Federal estimates only',
  educationalReference: 'Planning reference',
  educationalEstimate: 'Planning estimate',
  noSignupRequired: 'No signup required',
  federalTaxYearCoverage: (taxYear: number) => `Federal tax year ${taxYear} coverage`,
  federalConstantsFromPublications: (taxYear: number) =>
    `${taxYear} federal constants from IRS publications`,
} as const;

export const authorityRoutes = {
  methodology: '/methodology',
  sources: '/sources',
  editorialStandards: '/editorial-standards',
  about: '/about',
} as const;
