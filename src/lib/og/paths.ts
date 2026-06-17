/**
 * Centralized Open Graph image route paths.
 * Served by dynamic route handlers under src/app/og/.
 */

export const ogPaths = {
  home: '/og/home',
  hubCalculators: '/og/hub/calculators',
  hubResources: '/og/hub/resources',
  hubBlog: '/og/hub/blog',
  calculator: (engineId: string) => `/og/calculators/${engineId}`,
  resource: (slug: string) => `/og/resources/${slug}`,
  blog: (slug: string) => `/og/blog/${slug}`,
  page: (slug: string) => `/og/pages/${slug}`,
} as const;

export type OgHubSlug = 'calculators' | 'resources' | 'blog';

const HUB_LABELS: Record<OgHubSlug, { title: string; badge: string }> = {
  calculators: {
    title: 'Federal Tax Calculators',
    badge: 'Calculator hub',
  },
  resources: {
    title: 'Federal Tax Guides & References',
    badge: 'Resource hub',
  },
  blog: {
    title: 'Federal Tax Education & Planning',
    badge: 'Blog',
  },
};

export function getHubOgContent(hub: string): { title: string; badge: string } | null {
  if (hub in HUB_LABELS) {
    return HUB_LABELS[hub as OgHubSlug];
  }
  return null;
}
