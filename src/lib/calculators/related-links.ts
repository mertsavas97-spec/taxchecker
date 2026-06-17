import type { NavLink } from '@/config/site-navigation';
import { getCalculatorBySlug } from '@/config/calculators';
import { getResourceBySlug } from '@/config/resources';

export interface GuideLink {
  title: string;
  href: string;
  description?: string;
  readingTime?: string;
  comingSoon?: boolean;
}

export const RELATED_RESOURCES_DESCRIPTION =
  'Planning guides and reference pages reviewed against IRS sources.';

export function buildReadyCalculatorNavLinks(slugs: string[]): NavLink[] {
  const seen = new Set<string>();
  const links: NavLink[] = [];

  for (const slug of slugs) {
    if (seen.has(slug)) continue;
    seen.add(slug);

    const calculator = getCalculatorBySlug(slug);
    if (!calculator || calculator.status !== 'ready') continue;

    links.push({
      label: calculator.shortTitle,
      href: calculator.route,
      description: calculator.description,
    });
  }

  return links;
}

export function buildRelatedGuideLinks(slugs: string[]): GuideLink[] {
  return slugs
    .map((slug) => getResourceBySlug(slug))
    .filter(
      (item): item is NonNullable<typeof item> =>
        item !== undefined && item.status === 'published',
    )
    .map((item) => ({
      title: item.shortTitle,
      href: item.route,
      description: item.description,
      comingSoon: false,
      readingTime: item.readingTime,
    }));
}

/** @deprecated Use RELATED_RESOURCES_DESCRIPTION */
export const RELATED_GUIDES_DESCRIPTION = RELATED_RESOURCES_DESCRIPTION;
