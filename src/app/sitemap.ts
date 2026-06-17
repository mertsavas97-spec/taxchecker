import type { MetadataRoute } from 'next';

import { getReadyCalculators } from '@/config/calculators';
import { getSitemapTrustPages } from '@/config/trust-pages';
import { getPublishedBlogPosts } from '@/lib/blog/public';
import { getSitemapResourcesPublic } from '@/lib/cms/public-read';
import { absoluteUrl } from '@/lib/seo/urls';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const homepage: MetadataRoute.Sitemap[number] = {
    url: absoluteUrl('/'),
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1,
  };

  const calculatorHub: MetadataRoute.Sitemap[number] = {
    url: absoluteUrl('/calculators'),
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.95,
  };

  const resourcesHub: MetadataRoute.Sitemap[number] = {
    url: absoluteUrl('/resources'),
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  };

  const blogHub: MetadataRoute.Sitemap[number] = {
    url: absoluteUrl('/blog'),
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  };

  const calculatorEntries: MetadataRoute.Sitemap = getReadyCalculators().map(
    (calculator) => ({
      url: absoluteUrl(calculator.route),
      lastModified: new Date(calculator.lastUpdated),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    }),
  );

  const trustPageEntries: MetadataRoute.Sitemap = getSitemapTrustPages().map(
    (page) => ({
      url: absoluteUrl(page.route),
      lastModified: new Date(page.lastUpdated),
      changeFrequency: 'monthly' as const,
      priority: page.sitemapPriority,
    }),
  );

  const resourceEntries: MetadataRoute.Sitemap = (
    await getSitemapResourcesPublic()
  ).map((resource) => ({
    url: absoluteUrl(resource.route),
    lastModified: new Date(resource.lastUpdated),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const blogEntries: MetadataRoute.Sitemap = (await getPublishedBlogPosts()).map(
    (post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.65,
    }),
  );

  return [
    homepage,
    calculatorHub,
    resourcesHub,
    blogHub,
    ...calculatorEntries,
    ...trustPageEntries,
    ...resourceEntries,
    ...blogEntries,
  ];
}
