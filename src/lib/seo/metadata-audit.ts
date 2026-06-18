import type { Metadata } from 'next';

import { calculators, getReadyCalculators } from '@/config/calculators';
import { resources } from '@/config/resources';
import { site } from '@/config/site';
import type { TrustPageSlug } from '@/config/trust-pages';
import { trustPages } from '@/config/trust-pages';
import { getLaunchBlogPosts } from '@/lib/blog/launch-articles';
import {
  buildBlogHubMetadata,
  buildCalculatorsHubMetadata,
  buildHomeMetadata,
  buildResourcesHubMetadata,
  buildStaticPageMetadata,
} from '@/lib/seo/metadata';

export type MetadataAuditEntry = {
  path: string;
  pageType: string;
  title: string;
  description: string;
};

const TRUST_SLUGS: TrustPageSlug[] = [
  'about',
  'sources',
  'editorial-standards',
  'methodology',
];

function metadataRecord(metadata: Metadata): { title: string; description: string } {
  const rawTitle = metadata.title;
  let title: string = site.defaultTitle;

  if (typeof rawTitle === 'string') {
    title = rawTitle;
  } else if (rawTitle && typeof rawTitle === 'object') {
    if ('absolute' in rawTitle && typeof rawTitle.absolute === 'string') {
      title = rawTitle.absolute;
    } else if ('default' in rawTitle && typeof rawTitle.default === 'string') {
      title = rawTitle.default;
    }
  }

  return {
    title,
    description: metadata.description ?? '',
  };
}

/** Collect indexable page titles and descriptions for CTR / duplicate audits. */
export function collectMetadataAuditEntries(): MetadataAuditEntry[] {
  const entries: MetadataAuditEntry[] = [];

  const home = metadataRecord(buildHomeMetadata());
  entries.push({
    path: '/',
    pageType: 'homepage',
    ...home,
  });

  const calculatorsHub = metadataRecord(buildCalculatorsHubMetadata());
  entries.push({
    path: '/calculators',
    pageType: 'hub',
    ...calculatorsHub,
  });

  const resourcesHub = metadataRecord(buildResourcesHubMetadata());
  entries.push({
    path: '/resources',
    pageType: 'hub',
    ...resourcesHub,
  });

  const blogHub = metadataRecord(buildBlogHubMetadata());
  entries.push({
    path: '/blog',
    pageType: 'hub',
    ...blogHub,
  });

  for (const calculator of getReadyCalculators()) {
    entries.push({
      path: calculator.route,
      pageType: 'calculator',
      title: calculator.title,
      description: calculator.description,
    });
  }

  for (const resource of resources.filter((item) => item.status === 'published')) {
    if (resource.route === '/methodology') continue;
    entries.push({
      path: resource.route,
      pageType: 'resource',
      title: resource.title,
      description: resource.description,
    });
  }

  for (const post of getLaunchBlogPosts()) {
    entries.push({
      path: `/blog/${post.slug}`,
      pageType: 'blog',
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
    });
  }

  for (const slug of TRUST_SLUGS) {
    const page = trustPages.find((item) => item.slug === slug);
    if (!page) continue;
    const metadata = metadataRecord(buildStaticPageMetadata(page));
    entries.push({
      path: page.route,
      pageType: 'trust',
      ...metadata,
    });
  }

  return entries;
}

export function findDuplicateTitles(
  entries: MetadataAuditEntry[] = collectMetadataAuditEntries(),
): Array<{ title: string; paths: string[] }> {
  const byTitle = new Map<string, string[]>();

  for (const entry of entries) {
    const normalized = entry.title.trim().toLowerCase();
    const paths = byTitle.get(normalized) ?? [];
    paths.push(entry.path);
    byTitle.set(normalized, paths);
  }

  return [...byTitle.entries()]
    .filter(([, paths]) => paths.length > 1)
    .map(([title, paths]) => ({ title, paths }));
}

export function findDuplicateDescriptions(
  entries: MetadataAuditEntry[] = collectMetadataAuditEntries(),
): Array<{ description: string; paths: string[] }> {
  const byDescription = new Map<string, string[]>();

  for (const entry of entries) {
    const normalized = entry.description.trim().toLowerCase();
    if (!normalized) continue;
    const paths = byDescription.get(normalized) ?? [];
    paths.push(entry.path);
    byDescription.set(normalized, paths);
  }

  return [...byDescription.entries()]
    .filter(([, paths]) => paths.length > 1)
    .map(([description, paths]) => ({ description, paths }));
}

export function summarizeMetadataAudit(
  entries: MetadataAuditEntry[] = collectMetadataAuditEntries(),
) {
  return {
    totalPages: entries.length,
    duplicateTitles: findDuplicateTitles(entries).length,
    duplicateDescriptions: findDuplicateDescriptions(entries).length,
    averageTitleLength: Math.round(
      entries.reduce((sum, entry) => sum + entry.title.length, 0) / entries.length,
    ),
    averageDescriptionLength: Math.round(
      entries.reduce((sum, entry) => sum + entry.description.length, 0) /
        entries.length,
    ),
  };
}
