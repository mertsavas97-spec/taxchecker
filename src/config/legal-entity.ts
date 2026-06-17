import { site } from '@/config/site';

/**
 * Central legal identity for Terms, Privacy, Disclaimer, and operator disclosures.
 * Replace placeholders with counsel-approved values before production launch.
 */
export const legalEntity = {
  legalName: '[Legal Entity Name Placeholder]',
  operatingName: site.siteName,
  contactAddress: '[Business Address Placeholder]',
  jurisdiction: '[State of Formation Placeholder]',
  governingLawState: '[Governing Law State Placeholder]',
  venue: '[County, State Placeholder]',
} as const;

export type LegalEntityConfig = typeof legalEntity;

/** Single-line operator disclosure for legal pages and About. */
export function formatLegalOperatorLine(): string {
  return `${legalEntity.operatingName} is operated by ${legalEntity.legalName} (${legalEntity.jurisdiction}). Mailing address: ${legalEntity.contactAddress}.`;
}
