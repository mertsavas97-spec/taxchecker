import { getCalculatorBySlug } from '@/config/calculators';
import { getResourceBySlug } from '@/config/resources';
import type { NavLink } from '@/config/site-navigation';
import {
  buildReadyCalculatorNavLinks,
  buildRelatedGuideLinks,
  type GuideLink,
} from '@/lib/calculators/related-links';

export function buildRelatedCalculatorsForResource(slug: string): NavLink[] {
  const resource = getResourceBySlug(slug);
  if (!resource) return [];

  return buildReadyCalculatorNavLinks(resource.relatedCalculatorSlugs);
}

export function buildRelatedResourcesForResource(slug: string): GuideLink[] {
  const resource = getResourceBySlug(slug);
  if (!resource) return [];

  return buildRelatedGuideLinks(
    resource.relatedResourceSlugs.filter((relatedSlug) => relatedSlug !== slug),
  );
}

export function getResourceOrThrow(slug: string) {
  const resource = getResourceBySlug(slug);
  if (!resource) {
    throw new Error(`Unknown resource slug: ${slug}`);
  }
  return resource;
}
