import type { ResourceDefinition } from '@/config/resources';
import {
  formatLastReviewedLabel,
  formatTaxYearLabel,
} from '@/lib/calculators/metadata-labels';

export function formatResourceStatusLabel(
  status: ResourceDefinition['status'],
): string {
  return status === 'published' ? 'Published' : 'Coming Soon';
}

export function formatResourceMetadataLine(
  resource: Pick<ResourceDefinition, 'lastReviewed' | 'readingTime' | 'taxYear'>,
): string {
  const parts = [
    formatLastReviewedLabel(resource.lastReviewed),
    resource.readingTime,
  ];

  if (resource.taxYear !== undefined) {
    parts.push(formatTaxYearLabel(resource.taxYear));
  }

  return parts.join(' · ');
}
