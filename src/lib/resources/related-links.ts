import { getCalculatorBySlug } from '@/config/calculators';
import { getResourceBySlug } from '@/config/resources';
import type { NavLink } from '@/config/site-navigation';
import {
  buildReadyCalculatorNavLinks,
  buildRelatedGuideLinks,
  type GuideLink,
} from '@/lib/calculators/related-links';
import { getPublishedResourceDefinitionBySlugPublic } from '@/lib/cms/public-read';

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

export async function getPublishedResourceOrThrow(slug: string) {
  const published = await getPublishedResourceDefinitionBySlugPublic(slug);
  if (published) return published;

  const resource = getResourceBySlug(slug);
  if (!resource) {
    throw new Error(`Unknown resource slug: ${slug}`);
  }
  return resource;
}

/** Static registry lookup — prefer getPublishedResourceOrThrow for public pages. */
export function getResourceOrThrow(slug: string) {
  const resource = getResourceBySlug(slug);
  if (!resource) {
    throw new Error(`Unknown resource slug: ${slug}`);
  }
  return resource;
}

export function getCalculatorNavLink(slug: string): NavLink | undefined {
  const calculator = getCalculatorBySlug(slug);
  if (!calculator || calculator.status !== 'ready') return undefined;
  return {
    label: calculator.shortTitle,
    href: calculator.route,
  };
}
